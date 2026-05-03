import clsx from "clsx";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryRouteId,
  describeGitHubError,
  fetchGitHubCommitHistory,
  fetchGitHubViewerRepositories,
  formatGitHubDateTime,
  parseRepositoryRouteId,
  type GitHubCommitHistoryRepository,
  type GitHubViewerRepository,
} from "../app/github.ts";
import {
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const REPOSITORY_PAGE_SIZE = 12;
const HISTORY_PAGE_SIZE = 20;
const TAG_PAGE_SIZE = 5;
const BAR_DAYS = 30;

type GitHubCommitTarget = NonNullable<
  NonNullable<GitHubCommitHistoryRepository["defaultBranchRef"]>["target"]
>;
type GitHubCommitHistoryTarget = Extract<GitHubCommitTarget, { __typename: "Commit" }>;
type GitHubHistoryCommit = NonNullable<NonNullable<GitHubCommitHistoryTarget["history"]["nodes"]>[number]>;
type GitHubTagRef = NonNullable<
  NonNullable<NonNullable<GitHubCommitHistoryRepository["refs"]>["nodes"]>[number]
>;

function getCommitTarget(
  repository: GitHubCommitHistoryRepository | null | undefined,
): GitHubCommitHistoryTarget | null {
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
  };
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
  if (value === undefined || value === null || value.length === 0) {
    return "－";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(value));
}

function buildCommitBars(
  commits: ReadonlyArray<GitHubHistoryCommit>,
): Array<{ readonly label: string; readonly count: number }> {
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
    .sort((left, right) => right.count - left.count || left.author.localeCompare(right.author))
    .slice(0, 5);
}

export function CommitsScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const repositoriesQuery = useQuery({
    queryKey: ["github", "viewer-repositories", "commits", REPOSITORY_PAGE_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () =>
      fetchGitHubViewerRepositories(accessToken ?? "", {
        first: REPOSITORY_PAGE_SIZE,
        after: null,
      }),
  });
  const repositories = (repositoriesQuery.data?.nodes ?? []).filter((repository) => repository !== null);
  const [selectedRepoId, setSelectedRepoId] = useState("");

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

  const selectedCoordinates = parseRepositoryRouteId(selectedRepoId);
  const selectedRepositoryMeta =
    selectedCoordinates === null
      ? null
      : (repositories.find(
          (repository) =>
            repository.owner.login === selectedCoordinates.owner &&
            repository.name === selectedCoordinates.name,
        ) ?? null);
  const commitHistoryQuery = useQuery({
    queryKey: ["github", "commit-history", selectedCoordinates?.owner, selectedCoordinates?.name],
    enabled: accessToken !== undefined && selectedCoordinates !== null,
    queryFn: () =>
      fetchGitHubCommitHistory(accessToken ?? "", {
        owner: selectedCoordinates?.owner ?? "",
        name: selectedCoordinates?.name ?? "",
        historyFirst: HISTORY_PAGE_SIZE,
        historyAfter: null,
        tagsFirst: TAG_PAGE_SIZE,
      }),
  });
  const repository = commitHistoryQuery.data;
  const commitTarget = getCommitTarget(repository);
  const history = commitTarget?.history ?? null;
  const commits = (history?.nodes ?? []).filter(
    (commit): commit is NonNullable<typeof commit> => commit !== null,
  );
  const tags = (repository?.refs?.nodes ?? []).filter((ref): ref is NonNullable<typeof ref> => ref !== null);
  const authorRanking = buildAuthorRanking(commits);
  const commitBars = buildCommitBars(commits);
  const defaultBranchName =
    repository?.defaultBranchRef?.name ?? selectedRepositoryMeta?.defaultBranchRef?.name ?? "－";
  const commitsUrl =
    repository?.url === undefined || defaultBranchName === "－"
      ? "https://github.com"
      : `${repository.url}/commits/${encodeURIComponent(defaultBranchName)}`;

  return (
    <JtcChrome
      screenId="JTC-CMT-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "コミット履歴" }]}
      activeTopMenu="開発管理"
      activeSideItem="コミット履歴"
      rightColumn={
        <>
          <Panel title="作成者別ランキング" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <thead>
                <tr>
                  <th>作成者</th>
                  <th className="w-12">件数</th>
                </tr>
              </thead>
              <tbody>
                {authorRanking.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="作成者別ランキングはありません。"
                    detail="表示対象のコミット履歴がまだありません。"
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
                    detail="タグ参照に表示可能なデータがありません。"
                    className="w-full py-1 text-xs"
                  />
                </li>
              ) : (
                tags.map((ref) => (
                  <li key={ref.id} className={TODO_LIST_ITEM_CLASS}>
                    <span className={MONO_CLASS}>{ref.name}</span>
                    <span className={clsx("text-xs", MONO_CLASS)}>
                      {formatGitHubDateTime(getTagDate(ref))}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel title="検索条件" bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <label>リポジトリ：</label>
          <select
            className="border border-slate-400 px-1 py-0.5"
            value={selectedRepoId}
            onChange={(event) => setSelectedRepoId(event.target.value)}
            disabled={repositoriesQuery.isPending || repositories.length === 0}
          >
            {repositories.length === 0 ? (
              <option value="">取得中</option>
            ) : (
              repositories.map((repositoryOption: GitHubViewerRepository) => (
                <option
                  key={repositoryOption.id}
                  value={createRepositoryRouteId({
                    owner: repositoryOption.owner.login,
                    name: repositoryOption.name,
                  })}
                >
                  {repositoryOption.nameWithOwner}
                </option>
              ))
            )}
          </select>
          <label>ブランチ：</label>
          <select className="border border-slate-400 px-1 py-0.5" value={defaultBranchName} disabled>
            <option>{defaultBranchName}</option>
          </select>
          <span className={clsx("text-xs text-slate-600", MONO_CLASS)}>既定ブランチの履歴を表示</span>
          <a
            href={commitsUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
          >
            GitHubで履歴表示
          </a>
        </div>
      </Panel>

      <Panel
        title={`コミット履歴一覧（${repository?.nameWithOwner ?? selectedRepositoryMeta?.nameWithOwner ?? "未選択"}）`}
        action={
          <span className={MUTED_CLASS}>
            {commitHistoryQuery.isPending
              ? "GitHub から読込中..."
              : `履歴 ${history?.totalCount ?? commits.length}件 ／ ${commits.length}件表示`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-6"> </th>
              <th className="w-24">コミットID</th>
              <th>コミットメッセージ</th>
              <th className="w-24">ブランチ</th>
              <th className="w-24">作成者</th>
              <th className="w-28">日時</th>
              <th className="w-28">変更</th>
              <th className="w-20">関連</th>
              <th className="w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {selectedCoordinates === null ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="error"
                title="対象リポジトリを解釈できませんでした。"
                detail="一覧画面から対象リポジトリを選び直してください。"
              />
            ) : commitHistoryQuery.isPending ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-slate-600">
                  GitHub から既定ブランチの履歴を取得しています。
                </td>
              </tr>
            ) : commitHistoryQuery.isError ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="error"
                {...describeGitHubError(commitHistoryQuery.error, "コミット履歴の取得に失敗しました。")}
              />
            ) : repository === null || repository === undefined ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title={`${selectedCoordinates.owner}/${selectedCoordinates.name} は参照できません。`}
                detail="リポジトリが存在しないか、利用者権限が不足しています。"
              />
            ) : commitTarget === null ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title="既定ブランチのコミット履歴を取得できませんでした。"
                detail="既定ブランチが未設定か、対象参照がコミットを指していません。"
              />
            ) : commits.length === 0 ? (
              <GitHubTableStateRow
                colSpan={9}
                tone="empty"
                title="コミットはありません。"
                detail="既定ブランチ上に表示対象のコミット履歴がありません。"
              />
            ) : (
              commits.map((commit) => {
                const relatedPullRequest = getCommitRelatedPullRequest(commit);
                const changedFiles = commit.changedFilesIfAvailable ?? 0;
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
                    <td>{commit.messageHeadline}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{defaultBranchName}</td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      {getCommitAuthorLabel(commit)}
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {formatGitHubDateTime(commit.committedDate)}
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      <span className="text-green-700">+{commit.additions}</span> /{" "}
                      <span className="text-red-700">-{commit.deletions}</span> ({changedFiles}件)
                    </td>
                    <td className="text-center">
                      {relatedPullRequest === null ? (
                        "－"
                      ) : (
                        <a
                          href={relatedPullRequest.url}
                          target="_blank"
                          rel="noreferrer"
                          className={clsx(TEXT_LINK_CLASS, MONO_CLASS, "text-xs")}
                        >
                          {relatedPullRequest.label}
                        </a>
                      )}
                    </td>
                    <td className="text-center">
                      <a href={commit.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                        GitHub
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Panel>

      <Panel title="日別コミット数（直近30日）">
        {commits.length === 0 ? (
          <GitHubInlineState
            tone="empty"
            title="履歴取得後にグラフを表示します。"
            detail="コミット履歴が空のため、日別集計は表示されません。"
            className="px-3 py-6"
          />
        ) : (
          <div className={clsx("p-2 text-xs", MONO_CLASS)}>
            <div className="flex h-24 items-end gap-0.5 border-b border-b-slate-400 border-l border-l-slate-400 px-1">
              {commitBars.map((bar, index) => (
                <div
                  key={`${bar.label}:${index}`}
                  className="flex-1 border border-blue-900 bg-gradient-to-t from-blue-900 to-blue-500"
                  style={{ height: `${Math.max(bar.count, 1) * 10}px` }}
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
          </div>
        )}
      </Panel>

      {selectedRepositoryMeta === null ? null : (
        <Panel title="関連導線">
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/repositories/${createRepositoryRouteId({
                owner: selectedRepositoryMeta.owner.login,
                name: selectedRepositoryMeta.name,
              })}`}
              className={buttonClassName({ className: "inline-flex justify-center" })}
            >
              リポジトリ詳細
            </Link>
            <Link
              to="/pull-requests"
              className={buttonClassName({ className: "inline-flex justify-center" })}
            >
              プルリクエスト一覧
            </Link>
          </div>
        </Panel>
      )}
    </JtcChrome>
  );
}

export default function CommitsPage(): JSX.Element {
  return <CommitsScreen />;
}
