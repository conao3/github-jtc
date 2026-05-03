import clsx from "clsx";
import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useAuthSession } from "../app/auth.tsx";
import { ClientPager } from "../app/components/ClientPager.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { zodValidators } from "../app/formValidation.ts";
import {
  createRepositoryScopedNumberRouteId,
  fetchGitHubViewerIssues,
  formatGitHubDateTime,
  type GitHubViewerIssue,
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
    return { tone: "pending", label: "Open" };
  }

  switch (issue.stateReason) {
    case "COMPLETED":
      return { tone: "done", label: "Closed" };
    case "DUPLICATE":
      return { tone: "done", label: "Duplicate" };
    case "NOT_PLANNED":
      return { tone: "done", label: "Not planned" };
    case "REOPENED":
      return { tone: "pending", label: "Reopened" };
    default:
      return { tone: "done", label: "Closed" };
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

  return `${assignees[0] ?? "assigned"} +${assignees.length - 1}`;
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
  const issuesQuery = useQuery({
    queryKey: ["github", "viewer-issues", QUERY_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () =>
      fetchGitHubViewerIssues(accessToken ?? "", {
        first: QUERY_SIZE,
        after: null,
        states: ["OPEN", "CLOSED"],
      }),
  });
  const issues = (issuesQuery.data?.nodes ?? []).filter((value) => value !== null);
  const [appliedFilters, setAppliedFilters] = useState<IssueFilterValues>(initialIssueFilterValues);
  const [currentPage, setCurrentPage] = useState(1);
  const form = useForm({
    defaultValues: initialIssueFilterValues,
    onSubmit: async ({ value }) => {
      setAppliedFilters(value);
      setCurrentPage(1);
    },
  });

  function applyPreset(next: IssueFilterValues): void {
    form.reset(next);
    setAppliedFilters(next);
    setCurrentPage(1);
  }

  const filteredIssues = filterIssues(issues, appliedFilters);
  const openCount = filteredIssues.filter((issue) => issue.state === "OPEN").length;
  const closedCount = filteredIssues.filter((issue) => issue.state === "CLOSED").length;
  const assignedCount = filteredIssues.filter((issue) => issue.assignees.totalCount > 0).length;
  const unlabeledCount = filteredIssues.filter((issue) => (issue.labels?.totalCount ?? 0) === 0).length;
  const pageSize = Number(appliedFilters.pageSize);
  const pageCount = Math.max(1, Math.ceil(Math.max(filteredIssues.length, 1) / pageSize));

  useEffect(() => {
    if (currentPage <= pageCount) {
      return;
    }

    setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedIssues = filteredIssues.slice(startIndex, startIndex + pageSize);

  return (
    <JtcChrome
      screenId="JTC-ISS-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "課題（Issue）一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="課題（Issue）一覧"
      rightColumn={
        <>
          <Panel title="課題サマリ" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["Open", `${openCount}件`],
                ["Closed", `${closedCount}件`],
                ["Assigned", `${assignedCount}件`],
                ["No labels", `${unlabeledCount}件`],
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
                GitHubでIssue作成
              </a>
              <button
                type="button"
                className={buttonClassName()}
                onClick={() => applyPreset({ ...initialIssueFilterValues, state: "OPEN" })}
              >
                Openのみ表示
              </button>
              <button type="button" className={buttonClassName()}>
                CSV出力
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
        action={<span className={MUTED_CLASS}>client-side filter / pagination</span>}
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
          <label>Issue番号/件名</label>
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
                className="border border-slate-400 px-1 py-0.5"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value as IssueFilterValues["state"])}
              >
                <option value="all">──全て──</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            )}
          </form.Field>
          <label>担当者</label>
          <form.Field name="assignee" validators={zodValidators(issueFilterFieldValidators.assignee)}>
            {(field) => (
              <input
                className="border border-slate-400 px-1.5 py-0.5"
                placeholder="assignee login"
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
        title="課題一覧"
        action={
          <span className={MUTED_CLASS}>
            {issuesQuery.isPending
              ? "GitHub から読込中..."
              : `絞込 ${filteredIssues.length}件 / 全 ${issuesQuery.data?.totalCount ?? issues.length}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-24">Issue</th>
              <th>件名</th>
              <th className="w-32">リポジトリ</th>
              <th className="w-24">状態</th>
              <th className="w-28">担当者</th>
              <th className="w-32">ラベル</th>
              <th className="w-24">更新日時</th>
              <th className="w-16">コメント</th>
            </tr>
          </thead>
          <tbody>
            {issuesQuery.isPending ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  GitHub から Issue 一覧を取得しています。
                </td>
              </tr>
            ) : issuesQuery.isError ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-red-800">
                  {issuesQuery.error instanceof Error
                    ? issuesQuery.error.message
                    : "Issue 一覧の取得に失敗しました。"}
                </td>
              </tr>
            ) : pagedIssues.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  {hasActiveIssueFilters(appliedFilters)
                    ? "条件に一致する Issue はありません。"
                    : "viewer に紐づく Issue はありません。"}
                </td>
              </tr>
            ) : (
              pagedIssues.map((issue) => {
                const routeId = createRepositoryScopedNumberRouteId({
                  owner: issue.repository.owner.login,
                  name: issue.repository.name,
                  number: issue.number,
                });
                const state = getIssueState(issue);

                return (
                  <tr key={issue.id}>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <Link to={`/issues/${routeId}`} className={TEXT_LINK_CLASS}>
                        #{issue.number}
                      </Link>
                    </td>
                    <td>
                      <div className="font-bold">{issue.title}</div>
                      <div className={clsx("text-xs text-slate-600", MONO_CLASS)}>{issue.url}</div>
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>
                      {issue.repository.nameWithOwner}
                    </td>
                    <td className="text-center">
                      <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                    </td>
                    <td className={clsx("text-center text-xs", MONO_CLASS)}>{getAssigneeSummary(issue)}</td>
                    <td className="text-center">{renderLabelSummary(issue)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {formatGitHubDateTime(issue.updatedAt)}
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>{issue.comments.totalCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <ClientPager
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={filteredIssues.length}
          onPageChange={setCurrentPage}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function IssuesPage(): JSX.Element {
  return <IssuesScreen />;
}
