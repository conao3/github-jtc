import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  createRepositoryPath,
  createRepositoryScopedNumberRouteId,
  describeGitHubError,
  formatGitHubDateTime,
  type GitHubViewerPullRequestsConnection,
  type GitHubViewerPullRequest,
} from "../app/github.ts";
import { ViewerPullRequestsDocument } from "../gql/graphql.ts";
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

const QUERY_SIZE = 60;
const pageSizeOptions = ["10", "20", "50"] as const;
const pullRequestStateOptions = ["all", "OPEN", "MERGED", "CLOSED", "DRAFT"] as const;

const pullRequestFilterFieldValidators = {
  query: z.string(),
  state: z.enum(pullRequestStateOptions),
  repository: z.string(),
  pageSize: z.enum(pageSizeOptions),
} as const;

type PullRequestFilterValues = {
  query: string;
  state: (typeof pullRequestStateOptions)[number];
  repository: string;
  pageSize: (typeof pageSizeOptions)[number];
};

const initialPullRequestFilterValues: PullRequestFilterValues = {
  query: "",
  state: "all",
  repository: "",
  pageSize: "10",
};

function getPullRequestState(pullRequest: GitHubViewerPullRequest): {
  readonly tone: "new" | "review" | "pending" | "done" | "rejected";
  readonly label: string;
} {
  if (pullRequest.isDraft) {
    return { tone: "new", label: "下書き" };
  }

  if (pullRequest.state === "MERGED") {
    return { tone: "done", label: "マージ済" };
  }

  if (pullRequest.state === "CLOSED") {
    return { tone: "rejected", label: "クローズ" };
  }

  switch (pullRequest.reviewDecision) {
    case "APPROVED":
      return { tone: "done", label: "承認済" };
    case "CHANGES_REQUESTED":
      return { tone: "rejected", label: "差戻し" };
    case "REVIEW_REQUIRED":
      return { tone: "review", label: "レビュー中" };
    default:
      return { tone: "pending", label: "オープン" };
  }
}

function getPullRequestDelta(pullRequest: GitHubViewerPullRequest): string {
  return `${pullRequest.changedFiles}ファイル / +${pullRequest.additions} -${pullRequest.deletions}`;
}

function hasActivePullRequestFilters(filters: PullRequestFilterValues): boolean {
  return filters.query.trim().length > 0 || filters.state !== "all" || filters.repository.trim().length > 0;
}

function hasClientSidePullRequestFilters(filters: PullRequestFilterValues): boolean {
  return filters.query.trim().length > 0 || filters.repository.trim().length > 0 || filters.state === "DRAFT";
}

function getPullRequestQueryStates(
  state: PullRequestFilterValues["state"],
): Array<"OPEN" | "MERGED" | "CLOSED"> {
  switch (state) {
    case "OPEN":
    case "MERGED":
    case "CLOSED":
      return [state];
    case "DRAFT":
      return ["OPEN"];
    default:
      return ["OPEN", "MERGED", "CLOSED"];
  }
}

function filterPullRequests(
  pullRequests: readonly GitHubViewerPullRequest[],
  filters: PullRequestFilterValues,
): GitHubViewerPullRequest[] {
  const query = filters.query.trim().toLowerCase();
  const repository = filters.repository.trim().toLowerCase();

  return pullRequests.filter((pullRequest) => {
    if (
      query.length > 0 &&
      !pullRequest.title.toLowerCase().includes(query) &&
      !`${pullRequest.number}`.includes(query) &&
      !pullRequest.repository.nameWithOwner.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (repository.length > 0 && !pullRequest.repository.nameWithOwner.toLowerCase().includes(repository)) {
      return false;
    }

    switch (filters.state) {
      case "OPEN":
        return pullRequest.state === "OPEN" && !pullRequest.isDraft;
      case "MERGED":
        return pullRequest.state === "MERGED";
      case "CLOSED":
        return pullRequest.state === "CLOSED";
      case "DRAFT":
        return pullRequest.isDraft;
      default:
        return true;
    }
  });
}

export function PullRequestsScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const [appliedFilters, setAppliedFilters] = useState<PullRequestFilterValues>(
    initialPullRequestFilterValues,
  );
  const pageSize = Number(appliedFilters.pageSize);
  const pager = useCursorPagerState();
  const pullRequestsQuery = useQuery(ViewerPullRequestsDocument, {
    skip: accessToken === undefined,
    variables: {
      first: Math.min(pageSize, QUERY_SIZE),
      after: pager.currentCursor,
      states: getPullRequestQueryStates(appliedFilters.state),
    },
    fetchPolicy: "network-only",
  });
  const pullRequestConnection = (pullRequestsQuery.data?.viewer?.pullRequests ??
    pullRequestsQuery.previousData?.viewer?.pullRequests) as GitHubViewerPullRequestsConnection | undefined;
  const pullRequests = (pullRequestConnection?.nodes ?? []).filter((value) => value !== null);
  const form = useForm({
    defaultValues: initialPullRequestFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      pager.resetPager();
    },
  });

  function applyPreset(next: PullRequestFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
    pager.resetPager();
  }

  const filteredPullRequests = filterPullRequests(pullRequests, appliedFilters);
  const openCount = filteredPullRequests.filter(
    (pullRequest) => pullRequest.state === "OPEN" && !pullRequest.isDraft,
  ).length;
  const mergedCount = filteredPullRequests.filter((pullRequest) => pullRequest.state === "MERGED").length;
  const closedCount = filteredPullRequests.filter((pullRequest) => pullRequest.state === "CLOSED").length;
  const draftCount = filteredPullRequests.filter((pullRequest) => pullRequest.isDraft).length;
  const hasClientFilters = hasClientSidePullRequestFilters(appliedFilters);
  const totalPullRequestCount = pullRequestConnection?.totalCount ?? pullRequests.length;
  const pagerSummary = hasClientFilters
    ? `取得 ${pullRequests.length}件中 ${filteredPullRequests.length}件を表示 / ページ ${pager.currentPage}`
    : undefined;

  return (
    <JtcChrome
      screenId="JTC-PR-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "プルリクエスト一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="プルリクエスト一覧"
      rightColumn={
        <>
          <Panel title="レビュー状況" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["オープン", `${openCount}件`],
                ["マージ済", `${mergedCount}件`],
                ["クローズ", `${closedCount}件`],
                ["下書き", `${draftCount}件`],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-blue-900">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="よく使う操作">
            <div className="flex flex-col gap-1">
              <a
                href="https://github.com/pulls"
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
              >
                GitHubでプルリクエスト作成
              </a>
              <button
                type="button"
                className={buttonClassName()}
                onClick={() => applyPreset({ ...initialPullRequestFilterValues, state: "OPEN" })}
              >
                オープンのみ表示
              </button>
              <button type="button" className={buttonClassName()}>
                一覧出力
              </button>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="照会条件"
        action={<span className={MUTED_CLASS}>画面内絞込 / ページ切替</span>}
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
          <label>プルリクエスト番号/件名</label>
          <form.Field name="query" validators={zodValidators(pullRequestFilterFieldValidators.query)}>
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="github-jtc #1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>
          <label>状態</label>
          <form.Field name="state" validators={zodValidators(pullRequestFilterFieldValidators.state)}>
            {(field) => (
              <select
                className="min-w-24 border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as PullRequestFilterValues["state"])
                }
              >
                <option value="all">──全て──</option>
                <option value="OPEN">オープン</option>
                <option value="MERGED">マージ済</option>
                <option value="CLOSED">クローズ</option>
                <option value="DRAFT">下書き</option>
              </select>
            )}
          </form.Field>
          <label>リポジトリ</label>
          <form.Field
            name="repository"
            validators={zodValidators(pullRequestFilterFieldValidators.repository)}
          >
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="owner/repo"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>
          <label>表示件数</label>
          <form.Field name="pageSize" validators={zodValidators(pullRequestFilterFieldValidators.pageSize)}>
            {(field) => (
              <select
                className="border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) =>
                  field.handleChange(event.target.value as PullRequestFilterValues["pageSize"])
                }
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </form.Field>
          <button type="submit" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button
            type="button"
            className={buttonClassName()}
            onClick={() => applyPreset(initialPullRequestFilterValues)}
          >
            クリア
          </button>
        </form>
      </Panel>

      <Panel
        title="対象プルリクエスト一覧"
        action={
          <span className={MUTED_CLASS}>
            {pullRequestsQuery.loading
              ? "GitHub から読込中..."
              : `表示 ${filteredPullRequests.length}件 / 取得 ${pullRequests.length}件 / 全 ${totalPullRequestCount}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-24">プルリクエスト</th>
              <th>件名</th>
              <th className="w-32">リポジトリ</th>
              <th className="w-20">状態</th>
              <th className="w-36">更新日時</th>
              <th className="w-20">変更</th>
              <th className="w-16">コメント</th>
            </tr>
          </thead>
          <tbody>
            {pullRequestsQuery.loading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-600">
                  GitHub からプルリクエスト一覧を取得しています。
                </td>
              </tr>
            ) : pullRequestsQuery.error ? (
              <GitHubTableStateRow
                colSpan={7}
                tone="error"
                {...describeGitHubError(pullRequestsQuery.error, "プルリクエスト一覧の取得に失敗しました。")}
              />
            ) : filteredPullRequests.length === 0 ? (
              <GitHubTableStateRow
                colSpan={7}
                tone="empty"
                title={
                  hasActivePullRequestFilters(appliedFilters)
                    ? "条件に一致するプルリクエストはありません。"
                    : "利用者に紐づくプルリクエストはありません。"
                }
                detail={
                  hasActivePullRequestFilters(appliedFilters)
                    ? "状態・リポジトリ条件を広げて再検索してください。"
                    : "利用者に関連するプルリクエストが見つかりませんでした。"
                }
              />
            ) : (
              filteredPullRequests.map((pullRequest) => {
                const state = getPullRequestState(pullRequest);
                const routeId = createRepositoryScopedNumberRouteId({
                  owner: pullRequest.repository.owner.login,
                  name: pullRequest.repository.name,
                  number: pullRequest.number,
                });

                return (
                  <tr key={pullRequest.id}>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <Link to={`/pull-requests/${routeId}`} className="text-blue-900 underline">
                        #{pullRequest.number}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/pull-requests/${routeId}`} className={clsx("font-bold", TEXT_LINK_CLASS)}>
                        {pullRequest.title}
                      </Link>
                      <div className={clsx("text-xs text-slate-600", MONO_CLASS)}>
                        作成者: {pullRequest.author?.login ?? "不明"}
                      </div>
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <Link
                        to={`/repositories/${createRepositoryPath(pullRequest.repository.nameWithOwner)}`}
                        className={TEXT_LINK_CLASS}
                      >
                        {pullRequest.repository.nameWithOwner}
                      </Link>
                    </td>
                    <td className="text-center">
                      <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                    </td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(pullRequest.updatedAt)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{getPullRequestDelta(pullRequest)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{pullRequest.comments.totalCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={pager.currentPage}
          pageSize={pageSize}
          visibleCount={filteredPullRequests.length}
          totalCount={hasClientFilters ? undefined : totalPullRequestCount}
          summary={pagerSummary}
          hasNextPage={pullRequestConnection?.pageInfo.hasNextPage ?? false}
          isLoading={pullRequestsQuery.loading}
          onFirstPage={pager.goToFirstPage}
          onPreviousPage={pager.goToPreviousPage}
          onNextPage={() => pager.goToNextPage(pullRequestConnection?.pageInfo.endCursor)}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestsPage(): JSX.Element {
  return <PullRequestsScreen />;
}
