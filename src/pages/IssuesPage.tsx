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
  type GitHubViewerIssuesConnection,
  type GitHubViewerIssue,
} from "../app/github.ts";
import { ViewerIssuesDocument } from "../gql/graphql.ts";
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
const issueStateOptions = ["all", "OPEN", "CLOSED"] as const;

const issueFilterFieldValidators = {
  query: z.string(),
  state: z.enum(issueStateOptions),
  assignee: z.string(),
  pageSize: z.enum(pageSizeOptions),
} as const;

type IssueFilterValues = {
  query: string;
  state: (typeof issueStateOptions)[number];
  assignee: string;
  pageSize: (typeof pageSizeOptions)[number];
};

const initialIssueFilterValues: IssueFilterValues = {
  query: "",
  state: "all",
  assignee: "",
  pageSize: "10",
};

function getIssueState(issue: GitHubViewerIssue): {
  readonly tone: "pending" | "done";
  readonly label: string;
} {
  if (issue.state === "OPEN") {
    return { tone: "pending", label: "オープン" };
  }

  switch (issue.stateReason) {
    case "COMPLETED":
      return { tone: "done", label: "クローズ" };
    case "DUPLICATE":
      return { tone: "done", label: "重複" };
    case "NOT_PLANNED":
      return { tone: "done", label: "対応予定なし" };
    case "REOPENED":
      return { tone: "pending", label: "再オープン" };
    default:
      return { tone: "done", label: "クローズ" };
  }
}

function getAssigneeSummary(issue: GitHubViewerIssue): string {
  const assignees = (issue.assignees.nodes ?? []).flatMap((assignee) =>
    assignee?.login === undefined ? [] : [assignee.login],
  );

  if (assignees.length === 0) {
    return "未割当";
  }

  if (assignees.length === 1) {
    return assignees[0] ?? "未割当";
  }

  return `${assignees[0] ?? "担当者"} +${assignees.length - 1}`;
}

function renderLabelSummary(issue: GitHubViewerIssue): JSX.Element {
  const labels = (issue.labels?.nodes ?? []).filter((label) => label !== null);

  if (labels.length === 0) {
    return <span className="text-slate-500">－</span>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {labels.map((label) => (
        <span
          key={label.id}
          className="inline-flex rounded-sm border px-1 py-0.5 text-xs font-bold"
          style={{ borderColor: `#${label.color}`, color: `#${label.color}` }}
        >
          {label.name}
        </span>
      ))}
      {(issue.labels?.totalCount ?? 0) > labels.length ? (
        <span className={clsx("text-xs text-slate-500", MONO_CLASS)}>
          +{(issue.labels?.totalCount ?? 0) - labels.length}
        </span>
      ) : null}
    </div>
  );
}

function hasActiveIssueFilters(filters: IssueFilterValues): boolean {
  return filters.query.trim().length > 0 || filters.state !== "all" || filters.assignee.trim().length > 0;
}

function hasClientSideIssueFilters(filters: IssueFilterValues): boolean {
  return filters.query.trim().length > 0 || filters.assignee.trim().length > 0;
}

function getIssueQueryStates(state: IssueFilterValues["state"]): Array<"OPEN" | "CLOSED"> {
  switch (state) {
    case "OPEN":
    case "CLOSED":
      return [state];
    default:
      return ["OPEN", "CLOSED"];
  }
}

function filterIssues(issues: readonly GitHubViewerIssue[], filters: IssueFilterValues): GitHubViewerIssue[] {
  const query = filters.query.trim().toLowerCase();
  const assignee = filters.assignee.trim().toLowerCase();

  return issues.filter((issue) => {
    if (
      query.length > 0 &&
      !issue.title.toLowerCase().includes(query) &&
      !`${issue.number}`.includes(query) &&
      !issue.repository.nameWithOwner.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (filters.state !== "all" && issue.state !== filters.state) {
      return false;
    }

    if (assignee.length > 0) {
      const assignees = (issue.assignees.nodes ?? []).flatMap((node) =>
        node?.login === undefined ? [] : [node.login.toLowerCase()],
      );

      if (!assignees.some((login) => login.includes(assignee))) {
        return false;
      }
    }

    return true;
  });
}

export function IssuesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const [appliedFilters, setAppliedFilters] = useState<IssueFilterValues>(initialIssueFilterValues);
  const pageSize = Number(appliedFilters.pageSize);
  const pager = useCursorPagerState();
  const issuesQuery = useQuery(ViewerIssuesDocument, {
    skip: accessToken === undefined,
    variables: {
      first: Math.min(pageSize, QUERY_SIZE),
      after: pager.currentCursor,
      states: getIssueQueryStates(appliedFilters.state),
    },
    fetchPolicy: "network-only",
  });
  const issueConnection = (issuesQuery.data?.viewer?.issues ?? issuesQuery.previousData?.viewer?.issues) as
    | GitHubViewerIssuesConnection
    | undefined;
  const issues = (issueConnection?.nodes ?? []).filter((value) => value !== null);
  const form = useForm({
    defaultValues: initialIssueFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      pager.resetPager();
    },
  });

  function applyPreset(next: IssueFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
    pager.resetPager();
  }

  const filteredIssues = filterIssues(issues, appliedFilters);
  const openCount = filteredIssues.filter((issue) => issue.state === "OPEN").length;
  const closedCount = filteredIssues.filter((issue) => issue.state === "CLOSED").length;
  const assignedCount = filteredIssues.filter((issue) => issue.assignees.totalCount > 0).length;
  const unlabeledCount = filteredIssues.filter((issue) => (issue.labels?.totalCount ?? 0) === 0).length;
  const hasClientFilters = hasClientSideIssueFilters(appliedFilters);
  const totalIssueCount = issueConnection?.totalCount ?? issues.length;
  const pagerSummary = hasClientFilters
    ? `取得 ${issues.length}件中 ${filteredIssues.length}件を表示 / ページ ${pager.currentPage}`
    : undefined;

  return (
    <JtcChrome
      screenId="JTC-ISS-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "チケット一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="チケット一覧"
      rightColumn={
        <>
          <Panel title="チケットサマリ" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["オープン", `${openCount}件`],
                ["クローズ", `${closedCount}件`],
                ["担当あり", `${assignedCount}件`],
                ["ラベルなし", `${unlabeledCount}件`],
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
                href="https://github.com/issues"
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
              >
                GitHubでチケット作成
              </a>
              <button
                type="button"
                className={buttonClassName()}
                onClick={() => applyPreset({ ...initialIssueFilterValues, state: "OPEN" })}
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
          <label>チケット番号/件名</label>
          <form.Field name="query" validators={zodValidators(issueFilterFieldValidators.query)}>
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="repo #123"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>
          <label>状態</label>
          <form.Field name="state" validators={zodValidators(issueFilterFieldValidators.state)}>
            {(field) => (
              <select
                className="min-w-24 border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value as IssueFilterValues["state"])}
              >
                <option value="all">──全て──</option>
                <option value="OPEN">オープン</option>
                <option value="CLOSED">クローズ</option>
              </select>
            )}
          </form.Field>
          <label>担当者</label>
          <form.Field name="assignee" validators={zodValidators(issueFilterFieldValidators.assignee)}>
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="担当者ログインID"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>
          <label>表示件数</label>
          <form.Field name="pageSize" validators={zodValidators(issueFilterFieldValidators.pageSize)}>
            {(field) => (
              <select
                className="border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value as IssueFilterValues["pageSize"])}
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
            onClick={() => applyPreset(initialIssueFilterValues)}
          >
            クリア
          </button>
        </form>
      </Panel>

      <Panel
        title="チケット一覧"
        action={
          <span className={MUTED_CLASS}>
            {issuesQuery.loading
              ? "GitHub から読込中..."
              : `表示 ${filteredIssues.length}件 / 取得 ${issues.length}件 / 全 ${totalIssueCount}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-24">チケット</th>
              <th>件名</th>
              <th className="w-32">リポジトリ</th>
              <th className="w-24">状態</th>
              <th className="w-28">担当者</th>
              <th className="w-32">ラベル</th>
              <th className="w-36">更新日時</th>
              <th className="w-16">コメント</th>
            </tr>
          </thead>
          <tbody>
            {issuesQuery.loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  GitHub からチケット一覧を取得しています。
                </td>
              </tr>
            ) : issuesQuery.error ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="error"
                {...describeGitHubError(issuesQuery.error, "チケット一覧の取得に失敗しました。")}
              />
            ) : filteredIssues.length === 0 ? (
              <GitHubTableStateRow
                colSpan={8}
                tone="empty"
                title={
                  hasActiveIssueFilters(appliedFilters)
                    ? "条件に一致するチケットはありません。"
                    : "利用者に紐づくチケットはありません。"
                }
                detail={
                  hasActiveIssueFilters(appliedFilters)
                    ? "件名・担当者・状態を見直して再検索してください。"
                    : "利用者に関連するチケットが見つかりませんでした。"
                }
              />
            ) : (
              filteredIssues.map((issue) => {
                const routeId = createRepositoryScopedNumberRouteId({
                  owner: issue.repository.owner.login,
                  name: issue.repository.name,
                  number: issue.number,
                });
                const state = getIssueState(issue);

                return (
                  <tr key={issue.id}>
                    <td className={clsx("text-center", MONO_CLASS)}>#{issue.number}</td>
                    <td>
                      <Link to={`/issues/${routeId}`} className={clsx("font-bold", TEXT_LINK_CLASS)}>
                        {issue.title}
                      </Link>
                      <div className={clsx("text-xs text-slate-600", MONO_CLASS)}>{issue.url}</div>
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      <Link
                        to={`/repositories/${createRepositoryPath(issue.repository.nameWithOwner)}`}
                        className={TEXT_LINK_CLASS}
                      >
                        {issue.repository.nameWithOwner}
                      </Link>
                    </td>
                    <td className="text-center">
                      <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>{getAssigneeSummary(issue)}</td>
                    <td className="text-center">{renderLabelSummary(issue)}</td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(issue.updatedAt)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{issue.comments.totalCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={pager.currentPage}
          pageSize={pageSize}
          visibleCount={filteredIssues.length}
          totalCount={hasClientFilters ? undefined : totalIssueCount}
          summary={pagerSummary}
          hasNextPage={issueConnection?.pageInfo.hasNextPage ?? false}
          isLoading={issuesQuery.loading}
          onFirstPage={pager.goToFirstPage}
          onPreviousPage={pager.goToPreviousPage}
          onNextPage={() => pager.goToNextPage(issueConnection?.pageInfo.endCursor)}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function IssuesPage(): JSX.Element {
  return <IssuesScreen />;
}
