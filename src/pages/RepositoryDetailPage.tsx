import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { getCachedQueryFetchPolicy } from "../app/apollo.ts";
import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryPath,
  createRepositoryRouteId,
  createRepositoryScopedNumberRouteId,
  describeGitHubError,
  formatGitHubByteSize,
  formatGitHubDate,
  formatGitHubDateTime,
  formatGitHubIssueState,
  formatGitHubPermission,
  formatGitHubReviewDecision,
  formatGitHubVisibility,
  parseRepositoryRouteId,
  sumLanguageSizes,
} from "../app/github.ts";
import {
  CommitHistoryDocument,
  RepositoryBranchesDocument,
  RepositoryDetailDocument,
  RepositoryFileBrowserDocument,
  RepositoryIssuesDocument,
  RepositoryLanguagesDocument,
  RepositoryPullRequestsDocument,
  RepositoryTagsDocument,
  type PullRequestState,
} from "../gql/graphql.ts";
import {
  MONO_CLASS,
  MUTED_CLASS,
  DATE_CELL_CLASS,
  PAGER_CLASS,
  PAGER_LINK_ACTIVE_CLASS,
  PAGER_LINK_CLASS,
  TABLE_CLASS,
  TABS_ROW_CLASS,
  TAB_ACTIVE_CLASS,
  TAB_BADGE_CLASS,
  TAB_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

type RepositoryDetailTab = "files" | "commits" | "issues" | "pullRequests" | "refs";
type PullRequestStateFilter = "open" | "all" | "merged" | "closed";
const REPOSITORY_DETAIL_COMMIT_PAGE_SIZE = 10;
const REPOSITORY_DETAIL_ISSUE_PAGE_SIZE = 20;
const REPOSITORY_DETAIL_PULL_REQUEST_PAGE_SIZE = 20;
const REPOSITORY_DETAIL_BRANCH_PAGE_SIZE = 10;
const REPOSITORY_DETAIL_TAG_PAGE_SIZE = 10;
const REPOSITORY_DETAIL_LANGUAGE_PAGE_SIZE = 6;

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getEntryKindLabel(value: string): string {
  switch (value) {
    case "tree":
      return "ディレクトリ";
    case "blob":
      return "ファイル";
    case "commit":
      return "サブモジュール";
    default:
      return value;
  }
}

function getOwnerLabel(
  owner: { readonly __typename: string; readonly login: string; readonly name?: string | null } | undefined,
): string {
  if (owner === undefined) {
    return "－";
  }

  return owner.name ?? owner.login;
}

function getTagDate(
  ref:
    | {
        readonly target:
          | { readonly __typename: "Commit"; readonly committedDate: string }
          | {
              readonly __typename: "Tag";
              readonly target:
                | { readonly __typename: "Commit"; readonly committedDate: string }
                | { readonly __typename: string };
            }
          | { readonly __typename: string }
          | null;
      }
    | null
    | undefined,
): string | null {
  const target = ref?.target;

  if (target === undefined || target === null) {
    return null;
  }

  if (target.__typename === "Commit" && "committedDate" in target) {
    return target.committedDate;
  }

  if (target.__typename === "Tag" && "target" in target) {
    const nestedTarget = target.target;
    if (nestedTarget.__typename === "Commit" && "committedDate" in nestedTarget) {
      return nestedTarget.committedDate;
    }
  }

  return null;
}

function getPullRequestStatusLabel(pullRequest: {
  readonly isDraft?: boolean | null;
  readonly reviewDecision?: string | null;
  readonly state?: string | null;
}): string {
  if (pullRequest.isDraft) {
    return "下書き";
  }

  if (pullRequest.state === "MERGED") {
    return "マージ済み";
  }

  if (pullRequest.state === "CLOSED") {
    return "クローズ";
  }

  if (pullRequest.reviewDecision !== null) {
    return formatGitHubReviewDecision(pullRequest.reviewDecision);
  }

  if (pullRequest.state === "OPEN") {
    return "オープン";
  }

  return pullRequest.state ?? "－";
}

function getIssueStatus(issue: { readonly state: string }): {
  readonly tone: "pending" | "done";
  readonly label: string;
} {
  if (issue.state === "OPEN") {
    return { tone: "pending", label: "オープン" };
  }

  return { tone: "done", label: formatGitHubIssueState(issue.state) };
}

function getPullRequestStates(value: PullRequestStateFilter): PullRequestState[] {
  switch (value) {
    case "all":
      return ["OPEN", "CLOSED", "MERGED"];
    case "merged":
      return ["MERGED"];
    case "closed":
      return ["CLOSED"];
    case "open":
    default:
      return ["OPEN"];
  }
}

function isRepositoryDetailTab(value: string | null): value is RepositoryDetailTab {
  return (
    value === "files" ||
    value === "commits" ||
    value === "issues" ||
    value === "pullRequests" ||
    value === "refs"
  );
}

function isPullRequestStateFilter(value: string | null): value is PullRequestStateFilter {
  return value === "open" || value === "all" || value === "merged" || value === "closed";
}

function parseRepositoryDetailTab(
  tabValue: string | null,
  pullRequestStateValue: string | null,
): RepositoryDetailTab {
  if (isRepositoryDetailTab(tabValue)) {
    return tabValue;
  }

  if (isPullRequestStateFilter(pullRequestStateValue)) {
    return "pullRequests";
  }

  return "files";
}

function parsePullRequestStateFilter(value: string | null): PullRequestStateFilter {
  return isPullRequestStateFilter(value) ? value : "open";
}

function parseCommitCursorHistory(searchParams: URLSearchParams): Array<string | null> {
  return [null, ...searchParams.getAll("commitCursor").filter((value) => value.length > 0)];
}

function parsePositivePage(value: string | null): number {
  if (value === null) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseCommitPage(searchParams: URLSearchParams): number {
  const page = parsePositivePage(searchParams.get("commitPage"));
  const availablePageCount = parseCommitCursorHistory(searchParams).length;
  return Math.min(page, availablePageCount);
}

function normalizeRepositoryBrowserPath(value: string | null): string {
  const segments: string[] = [];

  for (const rawSegment of (value ?? "").split("/")) {
    const segment = rawSegment.trim();

    if (segment.length === 0 || segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  return segments.join("/");
}

function buildRepositoryObjectExpression(path: string): string {
  return path.length === 0 ? "HEAD:" : `HEAD:${path}`;
}

function getRepositoryBrowserPathSegments(path: string): string[] {
  return path.length === 0 ? [] : path.split("/");
}

function getRepositoryBrowserParentPath(path: string): string {
  const segments = getRepositoryBrowserPathSegments(path);
  return segments.slice(0, -1).join("/");
}

export function RepositoryDetailScreen({
  repoId = "payment-system-core",
}: {
  readonly repoId?: string;
}): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<RepositoryDetailTab>(() =>
    parseRepositoryDetailTab(searchParams.get("tab"), searchParams.get("prState")),
  );
  const [pullRequestStateFilter, setPullRequestStateFilter] = useState<PullRequestStateFilter>(() =>
    parsePullRequestStateFilter(searchParams.get("prState")),
  );
  const [commitCursorHistory, setCommitCursorHistory] = useState<Array<string | null>>(() =>
    parseCommitCursorHistory(searchParams),
  );
  const [commitPage, setCommitPage] = useState<number>(() => parseCommitPage(searchParams));
  const issuesPager = useCursorPagerState();
  const pullRequestsPager = useCursorPagerState();
  const branchesPager = useCursorPagerState();
  const tagsPager = useCursorPagerState();
  const languagesPager = useCursorPagerState();
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryRouteId(repoId);
  const currentCommitCursor = commitCursorHistory[commitPage - 1] ?? null;
  const browserPath = normalizeRepositoryBrowserPath(searchParams.get("path"));
  const repositoryVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    readmeExpression: "HEAD:README.md",
  };
  const issuesVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    first: REPOSITORY_DETAIL_ISSUE_PAGE_SIZE,
    after: issuesPager.currentCursor,
  };
  const pullRequestsVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    first: REPOSITORY_DETAIL_PULL_REQUEST_PAGE_SIZE,
    after: pullRequestsPager.currentCursor,
    states: getPullRequestStates(pullRequestStateFilter),
  };
  const branchesVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    first: REPOSITORY_DETAIL_BRANCH_PAGE_SIZE,
    after: branchesPager.currentCursor,
  };
  const tagsVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    first: REPOSITORY_DETAIL_TAG_PAGE_SIZE,
    after: tagsPager.currentCursor,
  };
  const languagesVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    first: REPOSITORY_DETAIL_LANGUAGE_PAGE_SIZE,
    after: languagesPager.currentCursor,
  };
  const commitHistoryVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    historyFirst: REPOSITORY_DETAIL_COMMIT_PAGE_SIZE,
    historyAfter: currentCommitCursor,
    tagsFirst: 1,
  };
  const fileBrowserVariables = {
    owner: coordinates?.owner ?? "",
    name: coordinates?.name ?? "",
    expression: buildRepositoryObjectExpression(browserPath),
  };
  const shouldSkipRepositoryQuery = accessToken === undefined || coordinates === null;
  const shouldSkipIssuesQuery = shouldSkipRepositoryQuery || activeTab !== "issues";
  const shouldSkipPullRequestsQuery = shouldSkipRepositoryQuery || activeTab !== "pullRequests";
  const shouldSkipBranchesQuery = shouldSkipRepositoryQuery || activeTab !== "refs";
  const shouldSkipTagsQuery = shouldSkipRepositoryQuery || activeTab !== "refs";
  const shouldSkipCommitHistoryQuery = shouldSkipRepositoryQuery || activeTab !== "commits";
  const shouldSkipFileBrowserQuery = shouldSkipRepositoryQuery || activeTab !== "files";
  const repositoryQuery = useQuery(RepositoryDetailDocument, {
    skip: shouldSkipRepositoryQuery,
    variables: repositoryVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      RepositoryDetailDocument,
      repositoryVariables,
      shouldSkipRepositoryQuery,
    ),
  });
  const issuesQuery = useQuery(RepositoryIssuesDocument, {
    skip: shouldSkipIssuesQuery,
    variables: issuesVariables,
    fetchPolicy: getCachedQueryFetchPolicy(RepositoryIssuesDocument, issuesVariables, shouldSkipIssuesQuery),
  });
  const pullRequestsQuery = useQuery(RepositoryPullRequestsDocument, {
    skip: shouldSkipPullRequestsQuery,
    variables: pullRequestsVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      RepositoryPullRequestsDocument,
      pullRequestsVariables,
      shouldSkipPullRequestsQuery,
    ),
  });
  const branchesQuery = useQuery(RepositoryBranchesDocument, {
    skip: shouldSkipBranchesQuery,
    variables: branchesVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      RepositoryBranchesDocument,
      branchesVariables,
      shouldSkipBranchesQuery,
    ),
  });
  const tagsQuery = useQuery(RepositoryTagsDocument, {
    skip: shouldSkipTagsQuery,
    variables: tagsVariables,
    fetchPolicy: getCachedQueryFetchPolicy(RepositoryTagsDocument, tagsVariables, shouldSkipTagsQuery),
  });
  const languagesQuery = useQuery(RepositoryLanguagesDocument, {
    skip: shouldSkipRepositoryQuery,
    variables: languagesVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      RepositoryLanguagesDocument,
      languagesVariables,
      shouldSkipRepositoryQuery,
    ),
  });
  const commitHistoryQuery = useQuery(CommitHistoryDocument, {
    skip: shouldSkipCommitHistoryQuery,
    variables: commitHistoryVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      CommitHistoryDocument,
      commitHistoryVariables,
      shouldSkipCommitHistoryQuery,
    ),
  });
  const fileBrowserQuery = useQuery(RepositoryFileBrowserDocument, {
    skip: shouldSkipFileBrowserQuery,
    variables: fileBrowserVariables,
    fetchPolicy: getCachedQueryFetchPolicy(
      RepositoryFileBrowserDocument,
      fileBrowserVariables,
      shouldSkipFileBrowserQuery,
    ),
  });
  const repository = repositoryQuery.data?.repository ?? repositoryQuery.previousData?.repository;
  const latestCommit =
    repository?.defaultBranchRef?.target?.__typename === "Commit" ? repository.defaultBranchRef.target : null;
  const commitHistoryRepository =
    commitHistoryQuery.data?.repository ?? commitHistoryQuery.previousData?.repository;
  const commitHistoryTarget =
    commitHistoryRepository?.defaultBranchRef?.target?.__typename === "Commit"
      ? commitHistoryRepository.defaultBranchRef.target
      : null;
  const browserRepository = fileBrowserQuery.data?.repository ?? fileBrowserQuery.previousData?.repository;
  const browserObject = browserRepository?.fileObject;
  const browserEntries =
    browserObject?.__typename === "Tree" ? (browserObject.entries ?? []).filter(isPresent) : [];
  const browserBlob = browserObject?.__typename === "Blob" ? browserObject : null;
  const recentCommits = (commitHistoryTarget?.history.nodes ?? []).filter(isPresent);
  const issuesConnection =
    issuesQuery.data?.repository?.issues ?? issuesQuery.previousData?.repository?.issues;
  const recentIssues = (issuesConnection?.nodes ?? []).filter(isPresent);
  const pullRequestsConnection =
    pullRequestsQuery.data?.repository?.pullRequests ??
    pullRequestsQuery.previousData?.repository?.pullRequests;
  const recentPullRequests = (pullRequestsConnection?.nodes ?? []).filter(isPresent);
  const visiblePullRequests = recentPullRequests;
  const branchesConnection =
    branchesQuery.data?.repository?.refs ?? branchesQuery.previousData?.repository?.refs;
  const branchRefs = (branchesConnection?.nodes ?? []).filter(isPresent);
  const tagRefsConnection =
    tagsQuery.data?.repository?.tagRefs ?? tagsQuery.previousData?.repository?.tagRefs;
  const tagRefs = (tagRefsConnection?.nodes ?? []).filter(isPresent);
  const readmeText =
    repository?.readme?.__typename === "Blob" && !repository.readme.isBinary
      ? (repository.readme.text ?? null)
      : null;
  const languagesConnection =
    languagesQuery.data?.repository?.languages ?? languagesQuery.previousData?.repository?.languages;
  const languageEdges = languagesConnection?.edges ?? [];
  const totalLanguageSize = sumLanguageSizes(languageEdges);
  const repositoryPath =
    coordinates === null ? null : createRepositoryPath({ owner: coordinates.owner, name: coordinates.name });
  const combinedRefCount =
    (repository?.branchRefsSummary?.totalCount ?? 0) + (repository?.tagRefs?.totalCount ?? 0);
  const browserPathSegments = getRepositoryBrowserPathSegments(browserPath);

  useEffect(() => {
    setActiveTab(parseRepositoryDetailTab(searchParams.get("tab"), searchParams.get("prState")));
    setPullRequestStateFilter(parsePullRequestStateFilter(searchParams.get("prState")));
    setCommitCursorHistory(parseCommitCursorHistory(searchParams));
    setCommitPage(parseCommitPage(searchParams));
  }, [searchParams]);

  useEffect(() => {
    pullRequestsPager.resetPager();
  }, [pullRequestStateFilter]);

  function applyRepositoryDetailSearchParams(
    tab: RepositoryDetailTab,
    pullRequestState: PullRequestStateFilter,
    nextCommitPage: number,
    nextCommitCursorHistory: Array<string | null>,
  ): void {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tab === "files") {
      nextSearchParams.delete("tab");
    } else {
      nextSearchParams.set("tab", tab);
    }

    if (tab === "pullRequests" && pullRequestState !== "open") {
      nextSearchParams.set("prState", pullRequestState);
    } else {
      nextSearchParams.delete("prState");
    }

    nextSearchParams.delete("commitPage");
    nextSearchParams.delete("commitCursor");

    if (tab === "commits" && nextCommitPage > 1) {
      nextSearchParams.set("commitPage", String(nextCommitPage));

      for (const cursor of nextCommitCursorHistory.slice(1, nextCommitPage)) {
        if (cursor !== null) {
          nextSearchParams.append("commitCursor", cursor);
        }
      }
    }

    if (browserPath.length > 0) {
      nextSearchParams.set("path", browserPath);
    } else {
      nextSearchParams.delete("path");
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  function createFileBrowserSearch(nextPath: string): string {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "files");

    if (nextPath.length > 0) {
      nextSearchParams.set("path", nextPath);
    } else {
      nextSearchParams.delete("path");
    }

    const search = nextSearchParams.toString();
    return search.length === 0 ? "" : `?${search}`;
  }

  function updateTabSearchParams(tab: RepositoryDetailTab, pullRequestState: PullRequestStateFilter): void {
    applyRepositoryDetailSearchParams(tab, pullRequestState, commitPage, commitCursorHistory);
  }

  function goToPreviousCommitPage(): void {
    if (commitPage <= 1 || commitHistoryQuery.loading) {
      return;
    }

    applyRepositoryDetailSearchParams("commits", pullRequestStateFilter, commitPage - 1, commitCursorHistory);
  }

  function goToNextCommitPage(): void {
    if (commitHistoryQuery.loading) {
      return;
    }

    const endCursor = commitHistoryTarget?.history.pageInfo.endCursor;
    if (
      commitHistoryTarget?.history.pageInfo.hasNextPage !== true ||
      endCursor === null ||
      endCursor === undefined
    ) {
      return;
    }

    const nextCommitCursorHistory = [...commitCursorHistory.slice(0, commitPage), endCursor];
    applyRepositoryDetailSearchParams(
      "commits",
      pullRequestStateFilter,
      commitPage + 1,
      nextCommitCursorHistory,
    );
  }

  function renderCommitPagerButton(label: string, disabled: boolean, onClick: () => void): JSX.Element {
    return (
      <button
        type="button"
        className={clsx(PAGER_LINK_CLASS, disabled && "cursor-default text-slate-400")}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }

  function renderTabButton(tab: RepositoryDetailTab, label: string, badge?: number): JSX.Element {
    return (
      <button
        key={tab}
        type="button"
        className={clsx(TAB_CLASS, activeTab === tab && TAB_ACTIVE_CLASS)}
        onClick={() => updateTabSearchParams(tab, pullRequestStateFilter)}
      >
        {label}
        {badge === undefined ? null : <span className={TAB_BADGE_CLASS}>{badge}</span>}
      </button>
    );
  }

  function renderTabContent(): JSX.Element {
    if (activeTab === "files") {
      const parentBrowserPath = getRepositoryBrowserParentPath(browserPath);
      const sortedEntries = browserEntries.slice().sort((left, right) => {
        if (left.type === right.type) {
          return left.name.localeCompare(right.name);
        }

        if (left.type === "tree") {
          return -1;
        }

        if (right.type === "tree") {
          return 1;
        }

        return left.name.localeCompare(right.name);
      });

      return (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
            <label>パス：</label>
            <span className={MONO_CLASS}>
              <Link to={createFileBrowserSearch("")} className={TEXT_LINK_CLASS}>
                /
              </Link>
              {browserPathSegments.map((segment, index) => {
                const segmentPath = browserPathSegments.slice(0, index + 1).join("/");

                return (
                  <span key={segmentPath}>
                    {" / "}
                    <Link to={createFileBrowserSearch(segmentPath)} className={TEXT_LINK_CLASS}>
                      {segment}
                    </Link>
                  </span>
                );
              })}
            </span>
            <label>表示：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>全て</option>
            </select>
            <label>並び順：</label>
            <select className="border border-slate-400 px-1 py-0.5">
              <option>名前順</option>
            </select>
            <span className="text-xs text-slate-600">
              ※ {browserPath.length === 0 ? "ルート" : browserPath} の実データを表示しています。
            </span>
          </div>

          {fileBrowserQuery.loading && browserObject == null ? (
            <div className="py-8 text-center text-slate-600">GitHub からファイル一覧を取得しています。</div>
          ) : fileBrowserQuery.error ? (
            <GitHubInlineState
              tone="error"
              className="py-8"
              {...describeGitHubError(fileBrowserQuery.error, "ファイル一覧の取得に失敗しました。")}
            />
          ) : browserObject == null ? (
            <GitHubInlineState
              tone="empty"
              title="指定されたパスを表示できません。"
              detail="対象のファイルまたはフォルダが存在しないか、このトークンでは参照できません。"
              className="py-8"
            />
          ) : browserBlob === null ? (
            <>
              <table className={TABLE_CLASS}>
                <thead>
                  <tr>
                    <th>名前</th>
                    <th className="w-24 whitespace-nowrap">種別</th>
                    <th className="w-20">サイズ</th>
                    <th className="w-16">モード</th>
                    <th className="w-32">オブジェクトID</th>
                  </tr>
                </thead>
                <tbody>
                  {browserPath.length === 0 ? null : (
                    <tr>
                      <td className={MONO_CLASS}>
                        <Link to={createFileBrowserSearch(parentBrowserPath)} className={TEXT_LINK_CLASS}>
                          ↩ ..
                        </Link>
                      </td>
                      <td className="text-center whitespace-nowrap">上位</td>
                      <td className={clsx("text-right", MONO_CLASS)}>－</td>
                      <td className={clsx("text-center", MONO_CLASS)}>－</td>
                      <td className={MONO_CLASS}>－</td>
                    </tr>
                  )}
                  {sortedEntries.length === 0 ? (
                    <GitHubTableStateRow
                      colSpan={5}
                      tone="empty"
                      title="表示可能なファイルがありません。"
                      detail="このフォルダは空か、このトークンではツリーを参照できません。"
                    />
                  ) : (
                    sortedEntries.map((entry) => {
                      const nextPath = browserPath.length === 0 ? entry.name : `${browserPath}/${entry.name}`;

                      return (
                        <tr key={entry.oid}>
                          <td className={MONO_CLASS}>
                            <span>{entry.type === "tree" ? "📁 " : "📄 "}</span>
                            <Link to={createFileBrowserSearch(nextPath)} className={TEXT_LINK_CLASS}>
                              {entry.name}
                            </Link>
                          </td>
                          <td className="text-center whitespace-nowrap">{getEntryKindLabel(entry.type)}</td>
                          <td className={clsx("text-right", MONO_CLASS)}>
                            {entry.object?.__typename === "Blob"
                              ? formatGitHubByteSize(entry.object.byteSize)
                              : "－"}
                          </td>
                          <td className={clsx("text-center", MONO_CLASS)}>{entry.mode}</td>
                          <td className={MONO_CLASS}>{entry.oid.slice(0, 12)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              <div className="border-t border-t-slate-300 bg-slate-50 px-1.5 py-1 text-xs text-slate-600">
                {browserPath.length === 0 ? "ルートツリー" : `${browserPath} フォルダ`}:{" "}
                {sortedEntries.length} 件を表示中
              </div>
            </>
          ) : (
            <>
              <table className={TABLE_CLASS}>
                <tbody>
                  <tr>
                    <th>ファイル名</th>
                    <td className={MONO_CLASS}>{browserPathSegments.at(-1) ?? "－"}</td>
                    <th>種別</th>
                    <td>ファイル</td>
                  </tr>
                  <tr>
                    <th>サイズ</th>
                    <td className={clsx("text-right", MONO_CLASS)}>
                      {formatGitHubByteSize(browserBlob.byteSize)}
                    </td>
                    <th>オブジェクトID</th>
                    <td className={MONO_CLASS}>{browserBlob.oid.slice(0, 12)}</td>
                  </tr>
                  <tr>
                    <th>戻る</th>
                    <td colSpan={3}>
                      <Link to={createFileBrowserSearch(parentBrowserPath)} className={TEXT_LINK_CLASS}>
                        {parentBrowserPath.length === 0 ? "ルートへ戻る" : `${parentBrowserPath} へ戻る`}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-t-slate-300 bg-slate-50 p-2">
                {browserBlob.isBinary ? (
                  <GitHubInlineState
                    tone="empty"
                    title="このファイルはバイナリ形式です。"
                    detail="テキストプレビューに対応していないため、GitHub 本体で確認してください。"
                    className="border border-slate-300 bg-white p-4 text-xs"
                  />
                ) : (
                  <pre
                    className={clsx(
                      "max-h-144 overflow-auto bg-white p-3 text-xs whitespace-pre-wrap",
                      MONO_CLASS,
                    )}
                  >
                    {browserBlob.text ?? ""}
                  </pre>
                )}
              </div>
            </>
          )}
        </>
      );
    }

    if (activeTab === "commits") {
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
            <span className="text-xs text-slate-600">
              既定ブランチ {repository?.defaultBranchRef?.name ?? "HEAD"} のコミット履歴 / ページ {commitPage}
            </span>
            {repositoryPath === null ? null : (
              <Link
                to={`/commits/${repositoryPath}`}
                className={buttonClassName({ size: "sm", className: "inline-flex no-underline" })}
              >
                履歴画面で開く
              </Link>
            )}
          </div>

          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-24">コミットID</th>
                <th>メッセージ</th>
                <th className="w-20">作成者</th>
                <th className="w-36">日時</th>
                <th className="w-20">関連</th>
              </tr>
            </thead>
            <tbody>
              {commitHistoryQuery.loading && recentCommits.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="コミット履歴を取得しています。"
                  detail="GitHub から既定ブランチの履歴を読み込んでいます。"
                />
              ) : commitHistoryQuery.error ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="error"
                  title="コミット履歴の取得に失敗しました。"
                  detail={describeGitHubError(commitHistoryQuery.error, "").detail}
                />
              ) : recentCommits.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="表示可能なコミット履歴はありません。"
                  detail="既定ブランチの履歴が空か、このトークンでは履歴を参照できません。"
                />
              ) : (
                recentCommits.map((commit) => {
                  const relatedPullRequest =
                    (commit.associatedPullRequests?.nodes ?? []).find(isPresent) ?? null;

                  return (
                    <tr key={commit.id}>
                      <td className={MONO_CLASS}>{commit.abbreviatedOid}</td>
                      <td>
                        {coordinates === null ? (
                          <a href={commit.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                            {commit.messageHeadline}
                          </a>
                        ) : (
                          <Link
                            to={`/commits/${createRepositoryRouteId({
                              owner: coordinates.owner,
                              name: coordinates.name,
                            })}/${commit.oid}/diff`}
                            className={TEXT_LINK_CLASS}
                          >
                            {commit.messageHeadline}
                          </Link>
                        )}
                      </td>
                      <td className="text-center">
                        {commit.author?.user?.login ?? commit.author?.name ?? "不明"}
                      </td>
                      <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(commit.committedDate)}</td>
                      <td className="text-center">
                        {relatedPullRequest === null ? (
                          "－"
                        ) : (
                          <a
                            href={relatedPullRequest.url}
                            target="_blank"
                            rel="noreferrer"
                            className={TEXT_LINK_CLASS}
                          >
                            #{relatedPullRequest.number}
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className={PAGER_CLASS}>
            <span className={MUTED_CLASS}>
              {commitHistoryQuery.loading
                ? `ページ ${commitPage} を取得中...`
                : `全 ${latestCommit?.history.totalCount ?? 0}件中 ページ ${commitPage} / 1ページ ${REPOSITORY_DETAIL_COMMIT_PAGE_SIZE}件`}
            </span>
            {renderCommitPagerButton("≪先頭", commitPage === 1 || commitHistoryQuery.loading, () =>
              applyRepositoryDetailSearchParams("commits", pullRequestStateFilter, 1, [null]),
            )}
            {renderCommitPagerButton(
              "＜前",
              commitPage === 1 || commitHistoryQuery.loading,
              goToPreviousCommitPage,
            )}
            <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>現在 {commitPage}</span>
            {renderCommitPagerButton(
              "次＞",
              commitHistoryTarget?.history.pageInfo.hasNextPage !== true || commitHistoryQuery.loading,
              goToNextCommitPage,
            )}
          </div>
        </>
      );
    }

    if (activeTab === "issues") {
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
            <span>更新日時の新しい順でチケット一覧を表示しています。</span>
            <span>取得済: {recentIssues.length}件</span>
          </div>

          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-16">番号</th>
                <th>件名</th>
                <th className="w-20">作成者</th>
                <th className="w-20">状態</th>
                <th className="w-16">コメント</th>
                <th className="w-36">更新日時</th>
              </tr>
            </thead>
            <tbody>
              {issuesQuery.loading && recentIssues.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="empty"
                  title="チケット一覧を取得しています。"
                  detail="GitHub からこのリポジトリのチケットを読み込んでいます。"
                />
              ) : issuesQuery.error ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="error"
                  {...describeGitHubError(issuesQuery.error, "チケット一覧の取得に失敗しました。")}
                />
              ) : recentIssues.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="empty"
                  title="表示可能なチケットはありません。"
                  detail="このリポジトリで参照できるチケットがありません。"
                />
              ) : (
                recentIssues.map((issue) => {
                  const state = getIssueStatus(issue);

                  return (
                    <tr key={issue.id}>
                      <td className={clsx("text-center", MONO_CLASS)}>#{issue.number}</td>
                      <td>
                        {coordinates === null ? (
                          <a href={issue.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                            {issue.title}
                          </a>
                        ) : (
                          <Link
                            to={`/issues/${createRepositoryScopedNumberRouteId({
                              owner: coordinates.owner,
                              name: coordinates.name,
                              number: issue.number,
                            })}`}
                            className={TEXT_LINK_CLASS}
                          >
                            {issue.title}
                          </Link>
                        )}
                      </td>
                      <td className="text-center">{issue.author?.login ?? "不明"}</td>
                      <td className="text-center">
                        <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                      </td>
                      <td className={clsx("text-center", MONO_CLASS)}>{issue.comments.totalCount}</td>
                      <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(issue.updatedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <CursorPager
            currentPage={issuesPager.currentPage}
            pageSize={REPOSITORY_DETAIL_ISSUE_PAGE_SIZE}
            visibleCount={recentIssues.length}
            totalCount={issuesConnection?.totalCount}
            hasNextPage={issuesConnection?.pageInfo.hasNextPage ?? false}
            isLoading={issuesQuery.loading}
            onFirstPage={issuesPager.goToFirstPage}
            onPreviousPage={issuesPager.goToPreviousPage}
            onNextPage={() => issuesPager.goToNextPage(issuesConnection?.pageInfo.endCursor)}
          />
        </>
      );
    }

    if (activeTab === "pullRequests") {
      return (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
            <label>状態：</label>
            <select
              className="min-w-24 border border-slate-400 px-1 py-0.5"
              value={pullRequestStateFilter}
              onChange={(event) =>
                updateTabSearchParams("pullRequests", event.target.value as PullRequestStateFilter)
              }
            >
              <option value="open">オープン（既定）</option>
              <option value="all">すべて</option>
              <option value="merged">マージ済み</option>
              <option value="closed">クローズ</option>
            </select>
            <span>
              最新 {recentPullRequests.length} 件を取得済みです。現在は{" "}
              {pullRequestStateFilter === "open"
                ? "オープン"
                : pullRequestStateFilter === "all"
                  ? "すべて"
                  : pullRequestStateFilter === "merged"
                    ? "マージ済み"
                    : "クローズ"}{" "}
              を表示しています。
            </span>
          </div>

          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th className="w-16">番号</th>
                <th>タイトル</th>
                <th className="w-20">作成者</th>
                <th className="w-20">状態</th>
                <th className="w-16">コメント</th>
                <th className="w-36">更新日時</th>
              </tr>
            </thead>
            <tbody>
              {pullRequestsQuery.loading && visiblePullRequests.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="empty"
                  title="プルリクエスト一覧を取得しています。"
                  detail="GitHub からこのリポジトリのプルリクエストを読み込んでいます。"
                />
              ) : pullRequestsQuery.error ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="error"
                  {...describeGitHubError(
                    pullRequestsQuery.error,
                    "プルリクエスト一覧の取得に失敗しました。",
                  )}
                />
              ) : visiblePullRequests.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={6}
                  tone="empty"
                  title="表示条件に一致するプルリクエストはありません。"
                  detail={
                    pullRequestStateFilter === "open"
                      ? "既定の絞り込みではオープン中のプルリクエストはありません。"
                      : "現在の絞り込み条件に一致するプルリクエストはありません。"
                  }
                />
              ) : (
                visiblePullRequests.map((pullRequest) => (
                  <tr key={pullRequest.id}>
                    <td className={clsx("text-center", MONO_CLASS)}>#{pullRequest.number}</td>
                    <td>
                      {coordinates === null || pullRequest.number === undefined ? (
                        <a
                          href={pullRequest.url}
                          target="_blank"
                          rel="noreferrer"
                          className={TEXT_LINK_CLASS}
                        >
                          {pullRequest.title}
                        </a>
                      ) : (
                        <Link
                          to={`/pull-requests/${createRepositoryScopedNumberRouteId({
                            owner: coordinates.owner,
                            name: coordinates.name,
                            number: pullRequest.number,
                          })}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {pullRequest.title}
                        </Link>
                      )}
                    </td>
                    <td className="text-center">{pullRequest.author?.login ?? "不明"}</td>
                    <td className="text-center">{getPullRequestStatusLabel(pullRequest)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {pullRequest.comments?.totalCount ?? 0}
                    </td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(pullRequest.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <CursorPager
            currentPage={pullRequestsPager.currentPage}
            pageSize={REPOSITORY_DETAIL_PULL_REQUEST_PAGE_SIZE}
            visibleCount={visiblePullRequests.length}
            totalCount={pullRequestsConnection?.totalCount}
            hasNextPage={pullRequestsConnection?.pageInfo?.hasNextPage ?? false}
            isLoading={pullRequestsQuery.loading}
            onFirstPage={pullRequestsPager.goToFirstPage}
            onPreviousPage={pullRequestsPager.goToPreviousPage}
            onNextPage={() => pullRequestsPager.goToNextPage(pullRequestsConnection?.pageInfo?.endCursor)}
          />
        </>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 p-2 lg:grid-cols-2">
        <Panel title={`ブランチ一覧 (${repository?.branchRefsSummary?.totalCount ?? 0})`} bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th>ブランチ名</th>
                <th className="w-40">最終コミット日時</th>
              </tr>
            </thead>
            <tbody>
              {branchesQuery.loading && branchRefs.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="empty"
                  title="ブランチ一覧を取得しています。"
                  detail="GitHub からブランチ一覧を読み込んでいます。"
                />
              ) : branchesQuery.error ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="error"
                  {...describeGitHubError(branchesQuery.error, "ブランチ一覧の取得に失敗しました。")}
                />
              ) : branchRefs.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="empty"
                  title="ブランチはありません。"
                  detail="参照可能なブランチ情報がありません。"
                />
              ) : (
                branchRefs.map((branch) =>
                  branch.target?.__typename === "Commit" ? (
                    <tr key={branch.id}>
                      <td className={MONO_CLASS}>{branch.name}</td>
                      <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(branch.target.committedDate)}</td>
                    </tr>
                  ) : null,
                )
              )}
            </tbody>
          </table>
          <CursorPager
            currentPage={branchesPager.currentPage}
            pageSize={REPOSITORY_DETAIL_BRANCH_PAGE_SIZE}
            visibleCount={branchRefs.length}
            totalCount={branchesConnection?.totalCount}
            hasNextPage={branchesConnection?.pageInfo.hasNextPage ?? false}
            isLoading={branchesQuery.loading}
            onFirstPage={branchesPager.goToFirstPage}
            onPreviousPage={branchesPager.goToPreviousPage}
            onNextPage={() => branchesPager.goToNextPage(branchesConnection?.pageInfo.endCursor)}
          />
        </Panel>

        <Panel title={`タグ一覧 (${repository?.tagRefs?.totalCount ?? 0})`} bodyClassName="p-0">
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th>タグ名</th>
                <th className="w-40">対象日時</th>
              </tr>
            </thead>
            <tbody>
              {tagsQuery.loading && tagRefs.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="empty"
                  title="タグ一覧を取得しています。"
                  detail="GitHub からタグ一覧を読み込んでいます。"
                />
              ) : tagsQuery.error ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="error"
                  {...describeGitHubError(tagsQuery.error, "タグ一覧の取得に失敗しました。")}
                />
              ) : tagRefs.length === 0 ? (
                <GitHubTableStateRow
                  colSpan={2}
                  tone="empty"
                  title="タグはありません。"
                  detail="参照可能なタグ情報がありません。"
                />
              ) : (
                tagRefs.map((tag) => (
                  <tr key={tag.id}>
                    <td className={MONO_CLASS}>{tag.name}</td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(getTagDate(tag))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <CursorPager
            currentPage={tagsPager.currentPage}
            pageSize={REPOSITORY_DETAIL_TAG_PAGE_SIZE}
            visibleCount={tagRefs.length}
            totalCount={tagRefsConnection?.totalCount}
            hasNextPage={tagRefsConnection?.pageInfo.hasNextPage ?? false}
            isLoading={tagsQuery.loading}
            onFirstPage={tagsPager.goToFirstPage}
            onPreviousPage={tagsPager.goToPreviousPage}
            onNextPage={() => tagsPager.goToNextPage(tagRefsConnection?.pageInfo.endCursor)}
          />
        </Panel>
      </div>
    );
  }

  return (
    <JtcChrome
      screenId="JTC-RPO-002"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "リポジトリ一覧", to: "/repositories" },
        { label: "リポジトリ詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ一覧"
      rightColumn={
        <>
          <Panel title="権限情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>あなたの権限</th>
                  <td>
                    <b>{formatGitHubPermission(repository?.viewerPermission)}</b>
                  </td>
                </tr>
                <tr>
                  <th>公開範囲</th>
                  <td>{formatGitHubVisibility(repository?.visibility)}</td>
                </tr>
                <tr>
                  <th>所有者</th>
                  <td className={MONO_CLASS}>{repository?.owner?.login ?? coordinates?.owner ?? "－"}</td>
                </tr>
                <tr>
                  <th>既定ブランチ</th>
                  <td className={MONO_CLASS}>{repository?.defaultBranchRef?.name ?? "－"}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="統計情報" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["総コミット数", String(latestCommit?.history?.totalCount ?? 0)],
                ["ブランチ数", String(repository?.branchRefsSummary?.totalCount ?? 0)],
                ["ウォッチャー数", String(repository?.watchers?.totalCount ?? 0)],
                ["スター数", String(repository?.stargazerCount ?? 0)],
                ["オープン中チケット", `${repository?.openIssues?.totalCount ?? 0} 件`],
                ["オープン中プルリクエスト", `${repository?.openPullRequests?.totalCount ?? 0} 件`],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-blue-900">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="ブランチ一覧" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {branchesQuery.loading && branchRefs.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="ブランチ一覧を取得しています。"
                    detail="GitHub からブランチ一覧を読み込んでいます。"
                  />
                ) : branchesQuery.error ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="error"
                    {...describeGitHubError(branchesQuery.error, "ブランチ一覧の取得に失敗しました。")}
                  />
                ) : branchRefs.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="ブランチはありません。"
                    detail="参照可能なブランチ情報がありません。"
                  />
                ) : (
                  branchRefs.map((branch) =>
                    branch.target?.__typename === "Commit" ? (
                      <tr key={branch.id}>
                        <td className={MONO_CLASS}>{branch.name}</td>
                        <td className="text-center">{formatGitHubDate(branch.target.committedDate)}</td>
                      </tr>
                    ) : null,
                  )
                )}
              </tbody>
            </table>
            <CursorPager
              currentPage={branchesPager.currentPage}
              pageSize={REPOSITORY_DETAIL_BRANCH_PAGE_SIZE}
              visibleCount={branchRefs.length}
              totalCount={branchesConnection?.totalCount}
              hasNextPage={branchesConnection?.pageInfo.hasNextPage ?? false}
              isLoading={branchesQuery.loading}
              onFirstPage={branchesPager.goToFirstPage}
              onPreviousPage={branchesPager.goToPreviousPage}
              onNextPage={() => branchesPager.goToNextPage(branchesConnection?.pageInfo.endCursor)}
            />
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="リポジトリ基本情報"
        action={
          <span className={MUTED_CLASS}>
            {repository == null
              ? "リポジトリ未検出"
              : `最終更新：${formatGitHubDateTime(repository.updatedAt)}`}
          </span>
        }
        bodyClassName="p-0"
      >
        {coordinates === null ? (
          <GitHubInlineState
            tone="error"
            title="リポジトリ識別子を解釈できませんでした。"
            detail="一覧画面から対象リポジトリを選び直してください。"
            className="py-8"
          />
        ) : repositoryQuery.loading && repository == null ? (
          <div className="py-8 text-center text-slate-600">GitHub からリポジトリ詳細を取得しています。</div>
        ) : repositoryQuery.error ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(repositoryQuery.error, "リポジトリ詳細の取得に失敗しました。")}
          />
        ) : repository == null ? (
          <GitHubInlineState
            tone="empty"
            title="対象リポジトリを表示できません。"
            detail={`${coordinates.owner}/${coordinates.name} は存在しないか、現在のトークンでは参照できません。`}
            className="py-8"
          />
        ) : (
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>
                  リポジトリ名<span className="font-bold text-red-700">※</span>
                </th>
                <td className={MONO_CLASS}>
                  <b>{repository.nameWithOwner}</b>
                </td>
                <th>URL</th>
                <td className={MONO_CLASS}>
                  <a href={repository.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                    開く
                  </a>
                </td>
              </tr>
              <tr>
                <th>所有者</th>
                <td>{getOwnerLabel(repository?.owner)}</td>
                <th>主要言語</th>
                <td>{repository.primaryLanguage?.name ?? "未設定"}</td>
              </tr>
              <tr>
                <th>公開範囲</th>
                <td>{formatGitHubVisibility(repository.visibility)}</td>
                <th>利用者権限</th>
                <td>{formatGitHubPermission(repository.viewerPermission)}</td>
              </tr>
              <tr>
                <th>説明</th>
                <td colSpan={3}>{repository.description ?? "説明は設定されていません。"}</td>
              </tr>
              <tr>
                <th>ホームページ</th>
                <td className={MONO_CLASS}>{repository.homepageUrl ?? "未設定"}</td>
                <th>既定ブランチ</th>
                <td className={MONO_CLASS}>{repository.defaultBranchRef?.name ?? "－"}</td>
              </tr>
              <tr>
                <th>作成日</th>
                <td className={MONO_CLASS}>{formatGitHubDate(repository.createdAt)}</td>
                <th>最終プッシュ</th>
                <td className={MONO_CLASS}>{formatGitHubDateTime(repository.pushedAt)}</td>
              </tr>
              <tr>
                <th>最新コミット</th>
                <td colSpan={3}>
                  <div className="font-bold">{latestCommit?.messageHeadline ?? "情報なし"}</div>
                  <div className="text-slate-600">
                    {latestCommit?.author?.user?.login ?? latestCommit?.author?.name ?? "不明"} ／{" "}
                    {formatGitHubDateTime(latestCommit?.committedDate)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Panel>

      <Panel
        title="リポジトリ内容"
        action={
          <span>
            ブランチ：
            <span className="inline-flex min-w-24 items-center border border-slate-400 bg-white px-1.5 py-0.5">
              {repository?.defaultBranchRef?.name ?? "HEAD"} ▼
            </span>
            <span className="px-1" />
            <button type="button" className={buttonClassName({ size: "sm" })}>
              更新
            </button>
            <span className="px-1" />
            <a
              href={repository?.url}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ size: "sm", tone: "primary", className: "inline-flex" })}
            >
              GitHubで開く
            </a>
          </span>
        }
        bodyClassName="p-0"
      >
        <div className={TABS_ROW_CLASS}>
          {renderTabButton("files", "ファイル一覧")}
          {renderTabButton("commits", "コミット履歴", latestCommit?.history?.totalCount ?? 0)}
          {renderTabButton("issues", "チケット一覧", repository?.allIssues?.totalCount ?? 0)}
          {renderTabButton("pullRequests", "プルリクエスト", repository?.allPullRequests?.totalCount ?? 0)}
          {renderTabButton("refs", "ブランチ／タグ", combinedRefCount)}
        </div>

        {coordinates === null ? (
          <GitHubInlineState
            tone="error"
            title="対象リポジトリを解釈できませんでした。"
            detail="一覧画面から対象リポジトリを選び直してください。"
            className="py-8"
          />
        ) : repositoryQuery.loading && repository == null ? (
          <div className="py-8 text-center text-slate-600">GitHub からタブ内容を取得しています。</div>
        ) : repositoryQuery.error ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(repositoryQuery.error, "リポジトリ内容の取得に失敗しました。")}
          />
        ) : repository == null ? (
          <GitHubInlineState
            tone="empty"
            title="リポジトリ内容を表示できません。"
            detail="対象リポジトリの情報がありません。"
            className="py-8"
          />
        ) : (
          renderTabContent()
        )}
      </Panel>

      <Panel title="README プレビュー">
        <div className={clsx("min-h-32 bg-amber-50 p-3 text-xs whitespace-pre-wrap", MONO_CLASS)}>
          {readmeText === null || readmeText.length === 0 ? (
            <GitHubInlineState
              tone="empty"
              title="README をプレビューできません。"
              detail="README.md が存在しないか、バイナリ / 非対応形式です。"
              className="py-10"
            />
          ) : (
            readmeText
          )}
        </div>
      </Panel>

      <Panel title="言語構成" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th>言語</th>
              <th className="w-20">サイズ</th>
              <th className="w-16">比率</th>
            </tr>
          </thead>
          <tbody>
            {languageEdges.length === 0 ? (
              languagesQuery.loading ? (
                <GitHubTableStateRow
                  colSpan={3}
                  tone="empty"
                  title="言語情報を取得しています。"
                  detail="GitHub から言語構成を読み込んでいます。"
                />
              ) : languagesQuery.error ? (
                <GitHubTableStateRow
                  colSpan={3}
                  tone="error"
                  {...describeGitHubError(languagesQuery.error, "言語情報の取得に失敗しました。")}
                />
              ) : (
                <GitHubTableStateRow
                  colSpan={3}
                  tone="empty"
                  title="言語情報がありません。"
                  detail="GitHub 側で言語構成がまだ集計されていない可能性があります。"
                />
              )
            ) : (
              languageEdges.map((edge) =>
                edge?.node === null || edge?.node === undefined ? null : (
                  <tr key={edge.node.id}>
                    <td>{edge.node.name}</td>
                    <td className={clsx("text-right", MONO_CLASS)}>{formatGitHubByteSize(edge.size)}</td>
                    <td className={clsx("text-right", MONO_CLASS)}>
                      {totalLanguageSize === 0
                        ? "0%"
                        : `${Math.round((edge.size / totalLanguageSize) * 100)}%`}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={languagesPager.currentPage}
          pageSize={REPOSITORY_DETAIL_LANGUAGE_PAGE_SIZE}
          visibleCount={
            languageEdges.filter((edge) => edge?.node !== null && edge?.node !== undefined).length
          }
          hasNextPage={languagesConnection?.pageInfo.hasNextPage ?? false}
          isLoading={languagesQuery.loading}
          onFirstPage={languagesPager.goToFirstPage}
          onPreviousPage={languagesPager.goToPreviousPage}
          onNextPage={() => languagesPager.goToNextPage(languagesConnection?.pageInfo.endCursor)}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoryDetailPage(): JSX.Element {
  const { owner, name } = useParams();

  return (
    <RepositoryDetailScreen
      repoId={owner === undefined || name === undefined ? "payment-system-core" : `${owner}/${name}`}
    />
  );
}
