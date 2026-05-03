import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  createRepositoryRouteId,
  createRepositoryScopedNumberRouteId,
  describeGitHubError,
  formatGitHubDateTime,
  formatJapaneseEraDate,
  parseRepositoryRouteId,
  type GitHubCommitHistoryRepository,
  type GitHubCommitHistoryPageRepository,
  type GitHubViewerRepository,
} from "../app/github.ts";
import {
  type CommitAuthor,
  CommitHistoryAuthorDocument,
  CommitHistoryDocument,
  CommitHistoryPageDocument,
  ViewerRepositoriesDocument,
} from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const REPOSITORY_PAGE_SIZE = 20;
const HISTORY_PAGE_SIZE = 100;
const TAG_PAGE_SIZE = 5;
const BAR_DAYS = 30;
const DISPLAY_PAGE_SIZE = 10;
const AUTHOR_RANKING_LIMIT = 5;

const commitFilterFieldValidators = {
  branch: z.string(),
  author: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  query: z.string(),
} as const;

type CommitFilterValues = {
  branch: string;
  author: string;
  fromDate: string;
  toDate: string;
  query: string;
};

const initialCommitFilterValues: CommitFilterValues = {
  branch: "",
  author: "",
  fromDate: "",
  toDate: "",
  query: "",
};

type GitHubCommitTarget = NonNullable<
  NonNullable<GitHubCommitHistoryRepository["defaultBranchRef"]>["target"]
>;
type GitHubCommitPageQueryTarget = NonNullable<
  NonNullable<GitHubCommitHistoryPageRepository["defaultBranchRef"]>["target"]
>;
type GitHubCommitHistoryTarget = Extract<GitHubCommitTarget, { __typename: "Commit" }>;
type GitHubCommitPageTarget = Extract<GitHubCommitPageQueryTarget, { __typename: "Commit" }>;
type GitHubHistoryCommit = NonNullable<NonNullable<GitHubCommitHistoryTarget["history"]["nodes"]>[number]>;
type GitHubTagRef = NonNullable<
  NonNullable<NonNullable<GitHubCommitHistoryRepository["refs"]>["nodes"]>[number]
>;

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getCommitTarget(
  repository: GitHubCommitHistoryRepository | null | undefined,
): GitHubCommitHistoryTarget | null {
  const target = repository?.defaultBranchRef?.target;

  if (target?.__typename !== "Commit") {
    return null;
  }

  return target;
}

function getCommitPageTarget(
  repository: GitHubCommitHistoryPageRepository | null | undefined,
): GitHubCommitPageTarget | null {
  const target = repository?.defaultBranchRef?.target;

  if (target?.__typename !== "Commit") {
    return null;
  }

  return target;
}

function getCommitAuthorLabel(commit: GitHubHistoryCommit): string {
  return commit.author?.user?.login ?? commit.author?.name ?? "不明";
}

function getCommitRelatedPullRequest(commit: GitHubHistoryCommit): {
  readonly label: string;
  readonly url: string;
  readonly number: number;
  readonly headRefName: string;
} | null {
  const pullRequest =
    (commit.associatedPullRequests?.nodes ?? []).find(
      (node): node is NonNullable<typeof node> => node !== null,
    ) ?? null;

  if (pullRequest === null) {
    return null;
  }

  return {
    label: `プルリクエスト #${pullRequest.number}`,
    url: pullRequest.url,
    number: pullRequest.number,
    headRefName: pullRequest.headRefName,
  };
}

function getCommitBranchLabel(commit: GitHubHistoryCommit, defaultBranchName: string): string {
  return getCommitRelatedPullRequest(commit)?.headRefName ?? defaultBranchName;
}

function getTagDate(ref: GitHubTagRef): string | null {
  const target = ref.target;

  if (target === null) {
    return null;
  }

  if (target.__typename === "Commit") {
    return target.committedDate;
  }

  if (target.__typename === "Tag" && target.target.__typename === "Commit") {
    return target.target.committedDate;
  }

  return null;
}

function formatShortDate(value: string | null | undefined): string {
  return formatJapaneseEraDate(value);
}

function buildCommitBars(
  commits: ReadonlyArray<GitHubHistoryCommit>,
): Array<{ readonly label: string; readonly count: number }> {
  if (commits.length === 0) {
    return [];
  }

  const latestDate = commits[0]?.committedDate ?? new Date().toISOString();
  const end = new Date(latestDate);
  end.setHours(0, 0, 0, 0);

  const counts = new Map<string, number>();
  for (const commit of commits) {
    const current = new Date(commit.committedDate);
    current.setHours(0, 0, 0, 0);
    const key = current.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const bars: Array<{ readonly label: string; readonly count: number }> = [];
  for (let offset = BAR_DAYS - 1; offset >= 0; offset -= 1) {
    const current = new Date(end);
    current.setDate(end.getDate() - offset);
    const key = current.toISOString().slice(0, 10);
    bars.push({
      label: formatShortDate(current.toISOString()),
      count: counts.get(key) ?? 0,
    });
  }

  return bars;
}

function buildAuthorRanking(
  commits: ReadonlyArray<GitHubHistoryCommit>,
): Array<{ readonly author: string; readonly count: number }> {
  const counts = new Map<string, number>();

  for (const commit of commits) {
    const author = getCommitAuthorLabel(commit);
    counts.set(author, (counts.get(author) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([author, count]) => ({ author, count }))
    .sort((left, right) => right.count - left.count || left.author.localeCompare(right.author));
}

function hasActiveCommitFilters(filters: CommitFilterValues): boolean {
  return (
    filters.branch.trim().length > 0 ||
    filters.author.trim().length > 0 ||
    filters.fromDate.trim().length > 0 ||
    filters.toDate.trim().length > 0 ||
    filters.query.trim().length > 0
  );
}

function hasPageLocalCommitFilters(filters: CommitFilterValues): boolean {
  return filters.branch.trim().length > 0 || filters.query.trim().length > 0;
}

function parseDateInput(value: string, endOfDay: boolean): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed.getTime();
}

function toGitTimestamp(value: string, endOfDay: boolean): string | undefined {
  const timestamp = parseDateInput(value, endOfDay);

  if (timestamp === null) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}

function getAuthorLoginLookup(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.includes("@")) {
    return null;
  }

  return trimmed;
}

function filterCommits(
  commits: ReadonlyArray<GitHubHistoryCommit>,
  filters: CommitFilterValues,
  defaultBranchName: string,
): GitHubHistoryCommit[] {
  const branch = filters.branch.trim().toLowerCase();
  const query = filters.query.trim().toLowerCase();

  return commits.filter((commit) => {
    const commitBranch = getCommitBranchLabel(commit, defaultBranchName).toLowerCase();
    const relatedPullRequest = getCommitRelatedPullRequest(commit);

    if (branch.length > 0 && commitBranch !== branch) {
      return false;
    }

    if (
      query.length > 0 &&
      !commit.messageHeadline.toLowerCase().includes(query) &&
      !commit.abbreviatedOid.toLowerCase().includes(query) &&
      !commit.oid.toLowerCase().includes(query) &&
      !commitBranch.includes(query) &&
      !(relatedPullRequest?.label.toLowerCase().includes(query) ?? false)
    ) {
      return false;
    }

    return true;
  });
}

function escapeCsvCell(value: string | number): string {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function downloadCommitCsv(
  repositoryNameWithOwner: string,
  commits: ReadonlyArray<GitHubHistoryCommit>,
  defaultBranchName: string,
): void {
  const header = [
    "コミットID",
    "コミットメッセージ",
    "ブランチ",
    "作成者",
    "日時",
    "追加",
    "削除",
    "変更ファイル数",
    "関連",
  ];
  const rows = commits.map((commit) => {
    const relatedPullRequest = getCommitRelatedPullRequest(commit);

    return [
      commit.abbreviatedOid,
      commit.messageHeadline,
      getCommitBranchLabel(commit, defaultBranchName),
      getCommitAuthorLabel(commit),
      formatGitHubDateTime(commit.committedDate),
      commit.additions,
      commit.deletions,
      commit.changedFilesIfAvailable ?? 0,
      relatedPullRequest?.label ?? "－",
    ];
  });
  const csv = [header, ...rows].map((row) => row.map((value) => escapeCsvCell(value)).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `${repositoryNameWithOwner.replaceAll("/", "_")}_commit_history.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function copyRevertCommand(oid: string): Promise<void> {
  if (typeof navigator.clipboard?.writeText !== "function") {
    return;
  }

  await navigator.clipboard.writeText(`git revert ${oid}`);
}

export function CommitsScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const { owner: routeOwner, name: routeName } = useParams();
  const routeSelectedRepoId =
    routeOwner === undefined || routeName === undefined
      ? ""
      : createRepositoryRouteId({
          owner: routeOwner,
          name: routeName,
        });
  const repositoriesQuery = useQuery(ViewerRepositoriesDocument, {
    skip: accessToken === undefined,
    variables: {
      first: REPOSITORY_PAGE_SIZE,
      after: null,
    },
  });
  const repositoriesConnection = repositoriesQuery.data?.viewer.repositories;
  const repositories = (repositoriesConnection?.nodes ?? []).filter(isPresent);
  const [selectedRepoId, setSelectedRepoId] = useState(routeSelectedRepoId);
  const [appliedFilters, setAppliedFilters] = useState<CommitFilterValues>(initialCommitFilterValues);
  const commitPager = useCursorPagerState();
  const form = useForm({
    defaultValues: initialCommitFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      commitPager.resetPager();
    },
  });

  useEffect(() => {
    if (routeSelectedRepoId.length === 0 || routeSelectedRepoId === selectedRepoId) {
      return;
    }

    setSelectedRepoId(routeSelectedRepoId);
  }, [routeSelectedRepoId, selectedRepoId]);

  useEffect(() => {
    if (selectedRepoId.length > 0 || repositories.length === 0) {
      return;
    }

    const firstRepository = repositories[0];
    if (firstRepository === undefined) {
      return;
    }

    setSelectedRepoId(
      createRepositoryRouteId({
        owner: firstRepository.owner.login,
        name: firstRepository.name,
      }),
    );
  }, [repositories, selectedRepoId]);

  useEffect(() => {
    setAppliedFilters(initialCommitFilterValues);
    commitPager.resetPager();
    form.reset(initialCommitFilterValues);
  }, [selectedRepoId]);

  const selectedCoordinates = parseRepositoryRouteId(selectedRepoId);
  const selectedRepoListed = repositories.some(
    (repositoryOption) =>
      repositoryOption.owner.login === selectedCoordinates?.owner &&
      repositoryOption.name === selectedCoordinates?.name,
  );
  const selectedRepositoryMeta =
    selectedCoordinates === null
      ? null
      : (repositories.find(
          (repository) =>
            repository.owner.login === selectedCoordinates.owner &&
            repository.name === selectedCoordinates.name,
        ) ?? null);
  const authorInput = appliedFilters.author.trim();
  const authorLoginLookup = getAuthorLoginLookup(authorInput);
  const authorLookupQuery = useQuery(CommitHistoryAuthorDocument, {
    skip: accessToken === undefined || authorLoginLookup === null,
    variables: {
      login: authorLoginLookup ?? "",
    },
  });
  const historyAuthor: CommitAuthor | undefined =
    authorInput.length === 0
      ? undefined
      : authorInput.includes("@")
        ? { emails: [authorInput] }
        : authorLookupQuery.data?.user?.id === undefined
          ? undefined
          : { id: authorLookupQuery.data.user.id };
  const waitingForAuthorLookup = authorLoginLookup !== null && authorLookupQuery.loading;
  const unknownAuthor =
    authorLoginLookup !== null &&
    !authorLookupQuery.loading &&
    authorLookupQuery.error === undefined &&
    authorLookupQuery.data?.user === null;
  const historySince = toGitTimestamp(appliedFilters.fromDate, false);
  const historyUntil = toGitTimestamp(appliedFilters.toDate, true);
  const commitHistoryQuery = useQuery(CommitHistoryDocument, {
    skip:
      accessToken === undefined || selectedCoordinates === null || waitingForAuthorLookup || unknownAuthor,
    variables: {
      owner: selectedCoordinates?.owner ?? "",
      name: selectedCoordinates?.name ?? "",
      historyFirst: HISTORY_PAGE_SIZE,
      historyAfter: null,
      historyAuthor,
      historySince,
      historyUntil,
      tagsFirst: TAG_PAGE_SIZE,
    },
  });
  const commitHistoryPageQuery = useQuery(CommitHistoryPageDocument, {
    skip:
      accessToken === undefined || selectedCoordinates === null || waitingForAuthorLookup || unknownAuthor,
    variables: {
      owner: selectedCoordinates?.owner ?? "",
      name: selectedCoordinates?.name ?? "",
      historyFirst: DISPLAY_PAGE_SIZE,
      historyAfter: commitPager.currentCursor,
      historyAuthor,
      historySince,
      historyUntil,
    },
  });
  const repository = commitHistoryQuery.data?.repository ?? commitHistoryQuery.previousData?.repository;
  const commitPageRepository =
    commitHistoryPageQuery.data?.repository ?? commitHistoryPageQuery.previousData?.repository;
  const commitTarget = getCommitTarget(repository);
  const commitPageTarget = getCommitPageTarget(commitPageRepository);
  const history = commitTarget?.history ?? null;
  const commitPageHistory = commitPageTarget?.history ?? null;
  const commits = (history?.nodes ?? []).filter(isPresent);
  const pageCommits = (commitPageHistory?.nodes ?? []).filter(isPresent);
  const tags = (repository?.refs?.nodes ?? []).filter(isPresent);
  const defaultBranchName =
    repository?.defaultBranchRef?.name ??
    commitPageRepository?.defaultBranchRef?.name ??
    selectedRepositoryMeta?.defaultBranchRef?.name ??
    "main";
  const repositoryNameWithOwner =
    repository?.nameWithOwner ??
    commitPageRepository?.nameWithOwner ??
    selectedRepositoryMeta?.nameWithOwner ??
    "未選択";
  const filteredCommits = filterCommits(commits, appliedFilters, defaultBranchName);
  const filteredPageCommits = filterCommits(pageCommits, appliedFilters, defaultBranchName);
  const authorRanking = buildAuthorRanking(filteredCommits).slice(0, AUTHOR_RANKING_LIMIT);
  const commitBars = buildCommitBars(filteredCommits);
  const branchOptions = [
    defaultBranchName,
    ...new Set(commits.map((commit) => getCommitBranchLabel(commit, defaultBranchName))),
  ].filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
  const historyCount = commitPageHistory?.totalCount ?? history?.totalCount ?? commits.length;
  const barMax = Math.max(1, ...commitBars.map((bar) => bar.count));
  const hasActiveFilters = hasActiveCommitFilters(appliedFilters);
  const hasPageLocalFilters = hasPageLocalCommitFilters(appliedFilters);
  const pagerSummary = hasPageLocalFilters
    ? `取得 ${pageCommits.length}件中 ${filteredPageCommits.length}件を表示 / ページ ${commitPager.currentPage}`
    : undefined;

  function clearFilters(): void {
    form.reset(initialCommitFilterValues);
    setAppliedFilters(initialCommitFilterValues);
    commitPager.resetPager();
  }

  return (
    <JtcChrome
      screenId="JTC-CMT-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "コミット履歴" }]}
      activeTopMenu="開発管理"
      activeSideItem="コミット履歴"
      rightColumn={
        <>
          <Panel title="作成者別ランキング（上位5名）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <thead>
                <tr>
                  <th>作成者</th>
                  <th className="w-14">件数</th>
                </tr>
              </thead>
              <tbody>
                {authorRanking.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="作成者別ランキングはありません。"
                    detail="履歴取得後に上位 5 名を表示します。"
                  />
                ) : (
                  authorRanking.map(({ author, count }, index) => (
                    <tr key={author}>
                      <td className={clsx("text-xs", MONO_CLASS)}>
                        {index + 1}. {author}
                      </td>
                      <td className={clsx("text-right font-bold", MONO_CLASS)}>{count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>

          <Panel title="タグ一覧" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {tags.length === 0 ? (
                <li className={TODO_LIST_ITEM_CLASS}>
                  <GitHubInlineState
                    tone="empty"
                    title="タグはありません。"
                    detail="参照可能なタグ情報がまだありません。"
                    className="w-full py-1 text-xs"
                  />
                </li>
              ) : (
                tags.map((tag) => (
                  <li key={tag.id} className={TODO_LIST_ITEM_CLASS}>
                    <span className={MONO_CLASS}>{tag.name}</span>
                    <span className={clsx("text-xs", MONO_CLASS)}>
                      {formatGitHubDateTime(getTagDate(tag))}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Panel>
        </>
      }
    >
      <Panel
        title="検索条件"
        action={
          <span className={MUTED_CLASS}>
            作成者/期間は GitHub 全件絞込 / ブランチ/キーワードは表示中履歴絞込
          </span>
        }
        bodyClassName="p-0"
      >
        <form
          className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <label>リポジトリ：</label>
          <select
            className="border border-slate-400 px-1 py-0.5"
            value={selectedRepoId}
            onChange={(event) => setSelectedRepoId(event.target.value)}
            disabled={repositoriesQuery.loading || repositories.length === 0}
          >
            {repositories.length === 0 ? (
              <option value="">{repositoriesQuery.loading ? "取得中" : "対象なし"}</option>
            ) : (
              <>
                {selectedCoordinates !== null && !selectedRepoListed ? (
                  <option value={selectedRepoId}>
                    {repository?.nameWithOwner ?? `${selectedCoordinates.owner}/${selectedCoordinates.name}`}
                  </option>
                ) : null}
                {repositories.map((repositoryOption: GitHubViewerRepository) => (
                  <option
                    key={repositoryOption.id}
                    value={createRepositoryRouteId({
                      owner: repositoryOption.owner.login,
                      name: repositoryOption.name,
                    })}
                  >
                    {repositoryOption.nameWithOwner}
                  </option>
                ))}
              </>
            )}
          </select>

          <label>ページ内ブランチ：</label>
          <form.Field name="branch" validators={zodValidators(commitFilterFieldValidators.branch)}>
            {(field) => (
              <select
                className="border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              >
                <option value="">──全て──</option>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            )}
          </form.Field>

          <label>作成者：</label>
          <form.Field name="author" validators={zodValidators(commitFilterFieldValidators.author)}>
            {(field) => (
              <input
                className={clsx("border border-slate-400 px-1.5 py-0.5", MONO_CLASS)}
                placeholder="GitHubユーザーIDまたはメール"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>

          <label>期間：</label>
          <form.Field name="fromDate" validators={zodValidators(commitFilterFieldValidators.fromDate)}>
            {(field) => (
              <input
                className={clsx("w-28 border border-slate-400 px-1.5 py-0.5", MONO_CLASS)}
                placeholder="2026-04-01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>
          <span>～</span>
          <form.Field name="toDate" validators={zodValidators(commitFilterFieldValidators.toDate)}>
            {(field) => (
              <input
                className={clsx("w-28 border border-slate-400 px-1.5 py-0.5", MONO_CLASS)}
                placeholder="2026-05-03"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>

          <label>ページ内キーワード：</label>
          <form.Field name="query" validators={zodValidators(commitFilterFieldValidators.query)}>
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="取得済み行の絞込"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>

          <button type="submit" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()} onClick={clearFilters}>
            クリア
          </button>
          <button
            type="button"
            className={buttonClassName()}
            onClick={() => downloadCommitCsv(repositoryNameWithOwner, filteredCommits, defaultBranchName)}
          >
            CSV出力
          </button>
        </form>
      </Panel>

      <Panel
        title={`コミット履歴一覧（${repositoryNameWithOwner}）`}
        action={
          <span className={MUTED_CLASS}>
            {waitingForAuthorLookup
              ? "作成者を照会中..."
              : commitHistoryPageQuery.loading
                ? "GitHub から読込中..."
                : `表示 ${filteredPageCommits.length}件 / 取得 ${pageCommits.length}件 / 履歴総数 ${historyCount}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-8"> </th>
              <th className="w-24">コミットID</th>
              <th>コミットメッセージ</th>
              <th className="w-28">ブランチ</th>
              <th className="w-24">作成者</th>
              <th className="w-36">日時</th>
              <th className="w-28">変更</th>
              <th className="w-24">関連</th>
              <th className="w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {selectedCoordinates === null ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title="対象リポジトリを選択してください。"
                detail="一覧から参照対象のリポジトリを選ぶと履歴を表示します。"
              />
            ) : waitingForAuthorLookup ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-600">
                  指定された GitHub ユーザーID を照会しています。
                </td>
              </tr>
            ) : authorLookupQuery.error ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="error"
                {...describeGitHubError(authorLookupQuery.error, "作成者の照会に失敗しました。")}
              />
            ) : unknownAuthor ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title="指定された GitHub ユーザーID は見つかりません。"
                detail="メールアドレスか、存在する GitHub ユーザーID を指定してください。"
              />
            ) : commitHistoryPageQuery.loading && commitPageRepository === undefined ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-600">
                  GitHub からコミット履歴を取得しています。
                </td>
              </tr>
            ) : commitHistoryPageQuery.error ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="error"
                {...describeGitHubError(commitHistoryPageQuery.error, "コミット履歴の取得に失敗しました。")}
              />
            ) : commitPageRepository === null || commitPageRepository === undefined ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title={`${selectedCoordinates.owner}/${selectedCoordinates.name} は参照できません。`}
                detail="リポジトリが存在しないか、利用者権限が不足しています。"
              />
            ) : commitPageTarget === null ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title="既定ブランチの履歴を取得できませんでした。"
                detail="既定ブランチが未設定か、対象参照がコミットを指していません。"
              />
            ) : filteredPageCommits.length === 0 ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title={
                  hasActiveFilters
                    ? "条件に一致するコミットはありません。"
                    : "表示対象のコミット履歴はありません。"
                }
                detail={
                  hasActiveFilters
                    ? "検索条件を緩めて再確認してください。"
                    : "GitHub App が参照できる既定ブランチ履歴がありません。"
                }
              />
            ) : (
              filteredPageCommits.map((commit) => {
                const relatedPullRequest = getCommitRelatedPullRequest(commit);
                const changedFiles = commit.changedFilesIfAvailable ?? 0;
                const branchName = getCommitBranchLabel(commit, defaultBranchName);
                const isMergeCommit = commit.parents.totalCount > 1;

                return (
                  <tr key={commit.id}>
                    <td className="text-center">
                      <span
                        className={clsx(
                          "inline-block h-2 w-2 rounded-full",
                          isMergeCommit ? "bg-violet-700" : "bg-blue-900",
                        )}
                      />
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <a href={commit.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                        {commit.abbreviatedOid}
                      </a>
                    </td>
                    <td>
                      <Link to={`/commits/${selectedRepoId}/${commit.oid}/diff`} className={TEXT_LINK_CLASS}>
                        {commit.messageHeadline}
                      </Link>
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>{branchName}</td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      {getCommitAuthorLabel(commit)}
                    </td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(commit.committedDate)}</td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      <span className="text-green-700">+{commit.additions}</span> /{" "}
                      <span className="text-red-700">-{commit.deletions}</span> ({changedFiles}件)
                    </td>
                    <td className="text-center">
                      {relatedPullRequest === null ? (
                        "－"
                      ) : (
                        <Link
                          to={`/pull-requests/${createRepositoryScopedNumberRouteId({
                            owner: selectedCoordinates.owner,
                            name: selectedCoordinates.name,
                            number: relatedPullRequest.number,
                          })}`}
                          className={clsx(TEXT_LINK_CLASS, MONO_CLASS, "text-xs")}
                        >
                          {relatedPullRequest.label}
                        </Link>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Link
                          to={`/commits/${selectedRepoId}/${commit.oid}/diff`}
                          className={TEXT_LINK_CLASS}
                        >
                          差分
                        </Link>
                        <span className="text-slate-400">|</span>
                        <button
                          type="button"
                          className="cursor-pointer bg-transparent p-0 text-blue-700 underline underline-offset-2 hover:text-blue-900"
                          onClick={() => {
                            void copyRevertCommand(commit.oid);
                          }}
                        >
                          復元
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={commitPager.currentPage}
          pageSize={DISPLAY_PAGE_SIZE}
          visibleCount={filteredPageCommits.length}
          totalCount={hasPageLocalFilters ? undefined : historyCount}
          summary={pagerSummary}
          hasNextPage={commitPageHistory?.pageInfo.hasNextPage ?? false}
          isLoading={commitHistoryPageQuery.loading}
          onFirstPage={commitPager.goToFirstPage}
          onPreviousPage={commitPager.goToPreviousPage}
          onNextPage={() => commitPager.goToNextPage(commitPageHistory?.pageInfo.endCursor)}
        />
      </Panel>

      <Panel title="日別コミット数（直近30日）">
        {commitHistoryQuery.loading ? (
          <GitHubInlineState
            tone="empty"
            title="履歴取得後に日別集計を表示します。"
            detail="GitHub から履歴を読込中です。"
            className="px-3 py-6"
          />
        ) : commitBars.length === 0 ? (
          <GitHubInlineState
            tone="empty"
            title={
              hasActiveFilters
                ? "絞込結果が 0 件のため集計はありません。"
                : "履歴がないため集計はありません。"
            }
            detail="検索条件または GitHub 側の履歴状況を確認してください。"
            className="px-3 py-6"
          />
        ) : (
          <div className={clsx("p-2 text-xs", MONO_CLASS)}>
            <div className="flex h-24 items-end gap-0.5 border-l border-b border-slate-400 px-1">
              {commitBars.map((bar, index) => (
                <div
                  key={`${bar.label}:${index}`}
                  className="flex-1 border border-blue-900 bg-gradient-to-t from-blue-900 to-blue-500"
                  style={{
                    height:
                      bar.count === 0 ? "6px" : `${Math.max(14, Math.round((bar.count / barMax) * 88))}px`,
                  }}
                  title={`${bar.label}: ${bar.count}件`}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-slate-400">
              <span>{commitBars[0]?.label ?? "－"}</span>
              <span>{commitBars[7]?.label ?? "－"}</span>
              <span>{commitBars[14]?.label ?? "－"}</span>
              <span>{commitBars[21]?.label ?? "－"}</span>
              <span>{commitBars[29]?.label ?? "－"}</span>
            </div>
            <div className="mt-1 text-right text-slate-500">
              既定ブランチ {defaultBranchName} の取得済 {Math.min(historyCount, HISTORY_PAGE_SIZE)} 件を集計
            </div>
          </div>
        )}
      </Panel>
    </JtcChrome>
  );
}

export default function CommitsPage(): JSX.Element {
  return <CommitsScreen />;
}
