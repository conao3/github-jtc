import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
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

const PAGE_SIZE = 12;

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

export function IssuesScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const issuesQuery = useQuery({
    queryKey: ["github", "viewer-issues", PAGE_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () =>
      fetchGitHubViewerIssues(accessToken ?? "", {
        first: PAGE_SIZE,
        after: null,
        states: ["OPEN", "CLOSED"],
      }),
  });
  const issues = (issuesQuery.data?.nodes ?? []).filter((value) => value !== null);
  const openCount = issues.filter((issue) => issue.state === "OPEN").length;
  const closedCount = issues.filter((issue) => issue.state === "CLOSED").length;
  const assignedCount = issues.filter((issue) => issue.assignees.totalCount > 0).length;
  const unlabeledCount = issues.filter((issue) => (issue.labels?.totalCount ?? 0) === 0).length;

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
              <button type="button" className={buttonClassName()}>
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
        action={<span className={MUTED_CLASS}>※ 絞込 UI は次工程で client-side filter に接続予定</span>}
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <label>Issue番号/件名</label>
          <input className="border border-slate-400 px-1.5 py-0.5" placeholder="repo #123" />
          <label>状態</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>──全て──</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
          <label>担当者</label>
          <input className="border border-slate-400 px-1.5 py-0.5" placeholder="assignee login" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()}>
            クリア
          </button>
        </div>
      </Panel>

      <Panel
        title="課題一覧"
        action={
          <span className={MUTED_CLASS}>
            {issuesQuery.isPending
              ? "GitHub から読込中..."
              : `viewer.issues ${issuesQuery.data?.totalCount ?? issues.length}件`}
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
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  viewer に紐づく Issue はありません。
                </td>
              </tr>
            ) : (
              issues.map((issue) => {
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
      </Panel>
    </JtcChrome>
  );
}

export default function IssuesPage(): JSX.Element {
  return <IssuesScreen />;
}
