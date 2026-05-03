import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  describeGitHubError,
  formatGitHubDateTime,
  formatGitHubIssueState,
  formatGitHubIssueStateReason,
  parseRepositoryScopedNumberRouteId,
  type GitHubIssueDetail,
} from "../app/github.ts";
import { IssueDetailDocument, IssueTimelineDocument, type IssueTimelineQuery } from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  buttonClassName,
} from "../app/styles.ts";

function getIssueState(issue: GitHubIssueDetail): {
  readonly tone: "pending" | "done";
  readonly label: string;
} {
  if (issue.state === "OPEN") {
    return { tone: "pending", label: "オープン" };
  }

  switch (issue.stateReason) {
    case "COMPLETED":
      return { tone: "done", label: "完了" };
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

function getIssueStateReasonLabel(stateReason: GitHubIssueDetail["stateReason"] | null | undefined): string {
  return formatGitHubIssueStateReason(stateReason);
}

function getAssigneeLabels(issue: GitHubIssueDetail): string[] {
  return (issue.assignees.nodes ?? []).flatMap((assignee) =>
    assignee?.login === undefined ? [] : [assignee.login],
  );
}

function renderLabelChip(id: string, name: string, color: string): JSX.Element {
  return (
    <span
      key={id}
      className="inline-flex rounded-sm border px-1 py-0.5 text-xs font-bold"
      style={{ borderColor: `#${color}`, color: `#${color}` }}
    >
      {name}
    </span>
  );
}

type IssueTimelineNode = NonNullable<
  NonNullable<
    NonNullable<NonNullable<IssueTimelineQuery["repository"]>["issue"]>["timelineItems"]["nodes"]
  >[number]
>;

function buildTimelineRows(
  issue: GitHubIssueDetail,
  timelineNodes: ReadonlyArray<IssueTimelineNode | null> | null | undefined,
): Array<{
  readonly id: string;
  readonly date: string | null;
  readonly actor: string;
  readonly tone: "new" | "pending" | "done" | "review" | "confirmed";
  readonly label: string;
  readonly body: string;
}> {
  const rows: Array<{
    readonly id: string;
    readonly date: string | null;
    readonly actor: string;
    readonly tone: "new" | "pending" | "done" | "review" | "confirmed";
    readonly label: string;
    readonly body: string;
  }> = [
    {
      id: `created:${issue.id}`,
      date: issue.createdAt,
      actor: issue.author?.login ?? "不明",
      tone: "new" as const,
      label: "作成",
      body: issue.title,
    },
  ];

  for (const item of timelineNodes ?? []) {
    if (item === null) {
      continue;
    }

    switch (item.__typename) {
      case "IssueComment":
        rows.push({
          id: item.id,
          date: item.publishedAt ?? null,
          actor: item.author?.login ?? "不明",
          tone: "review",
          label: "コメント",
          body: item.bodyText.length > 200 ? `${item.bodyText.slice(0, 200)}…` : item.bodyText,
        });
        break;
      case "ClosedEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "done",
          label: "クローズ",
          body: `状態理由: ${getIssueStateReasonLabel(item.stateReason)}`,
        });
        break;
      case "ReopenedEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "pending",
          label: "再オープン",
          body: `状態理由: ${getIssueStateReasonLabel(item.stateReason)}`,
        });
        break;
      case "AssignedEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "confirmed",
          label: "割当",
          body: `担当者: ${item.assignee?.login ?? "不明"}`,
        });
        break;
      case "UnassignedEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "confirmed",
          label: "解除",
          body: `担当者: ${item.assignee?.login ?? "不明"}`,
        });
        break;
      case "LabeledEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "confirmed",
          label: "ラベル追加",
          body: item.label.name,
        });
        break;
      case "UnlabeledEvent":
        rows.push({
          id: item.id,
          date: item.createdAt,
          actor: item.actor?.login ?? "不明",
          tone: "confirmed",
          label: "ラベル解除",
          body: item.label.name,
        });
        break;
      default:
        break;
    }
  }

  return rows
    .slice()
    .sort((left, right) => (left.date ?? "").localeCompare(right.date ?? ""))
    .map((row, index) => ({ ...row, id: `${row.id}:${index}` }));
}

export function IssueDetailScreen({
  issueId = "conao3:github-jtc:1",
}: {
  readonly issueId?: string;
}): JSX.Element {
  const timelinePager = useCursorPagerState();
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryScopedNumberRouteId(issueId, sessionQuery.data?.user.login);
  const detailQuery = useQuery(IssueDetailDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      labelsFirst: 10,
      assigneesFirst: 10,
    },
    fetchPolicy: "network-only",
  });
  const timelineQuery = useQuery(IssueTimelineDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      timelineFirst: 20,
      timelineAfter: timelinePager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const issue = detailQuery.data?.repository?.issue ?? detailQuery.previousData?.repository?.issue;
  const state = issue === null || issue === undefined ? null : getIssueState(issue);
  const assignees = issue === null || issue === undefined ? [] : getAssigneeLabels(issue);
  const labels = (issue?.labels?.nodes ?? []).filter((label) => label !== null);
  const timelineIssue =
    timelineQuery.data?.repository?.issue ?? timelineQuery.previousData?.repository?.issue;
  const timelineRows =
    issue === null || issue === undefined ? [] : buildTimelineRows(issue, timelineIssue?.timelineItems.nodes);
  const timelineConnection = timelineIssue?.timelineItems;

  return (
    <JtcChrome
      screenId="JTC-ISS-004"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "チケット一覧", to: "/issues" },
        { label: "チケット詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="チケット一覧"
      rightColumn={
        <>
          <Panel title="担当 / 作成者" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>作成者</th>
                  <td className={MONO_CLASS}>{issue?.author?.login ?? "－"}</td>
                </tr>
                <tr>
                  <th>担当者</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>
                    {assignees.length === 0 ? "未割当" : assignees.join(", ")}
                  </td>
                </tr>
                <tr>
                  <th>参加者</th>
                  <td className={MONO_CLASS}>{issue?.participants.totalCount ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="チケットサマリ" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["状態", formatGitHubIssueState(issue?.state)],
                ["状態理由", getIssueStateReasonLabel(issue?.stateReason)],
                ["コメント", `${issue?.comments.totalCount ?? 0}`],
                ["ラベル", `${issue?.labels?.totalCount ?? 0}`],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className={clsx("text-xs", MONO_CLASS)}>{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="関連情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>リポジトリ</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{issue?.repository.nameWithOwner ?? "－"}</td>
                </tr>
                <tr>
                  <th>マイルストーン</th>
                  <td>{issue?.milestone?.title ?? "未設定"}</td>
                </tr>
                <tr>
                  <th>期限</th>
                  <td className={MONO_CLASS}>{formatGitHubDateTime(issue?.milestone?.dueOn)}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="操作">
            <div className="flex flex-col gap-1">
              <a
                href={issue?.url ?? "https://github.com/issues"}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
              >
                GitHubでチケットを開く
              </a>
              <a
                href={issue?.repository.url ?? "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ className: "inline-flex justify-center" })}
              >
                リポジトリを開く
              </a>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>参照専用：</b>この画面は GitHub GraphQL のチケット詳細を表示しています。ラベル変更・コメント投稿・
        クローズ操作は
        <span className={TEXT_LINK_CLASS}> GitHub 本体 </span>
        で実施してください。
      </div>

      <Panel
        title={`チケット基本情報 ${coordinates?.number ?? "?"}`}
        action={
          <span>
            {issue === undefined || issue === null
              ? "GitHub から読込中..."
              : `作成日：${formatGitHubDateTime(issue.createdAt)} ／ 更新日：${formatGitHubDateTime(issue.updatedAt)}`}
          </span>
        }
        bodyClassName="p-0"
      >
        {coordinates === null ? (
          <GitHubInlineState
            tone="error"
            title="チケット識別子を解釈できませんでした。"
            detail="一覧画面から対象チケットを選び直してください。"
            className="py-8"
          />
        ) : detailQuery.loading && issue == null ? (
          <div className="py-8 text-center text-slate-600">GitHub からチケット詳細を取得しています。</div>
        ) : detailQuery.error ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(detailQuery.error, "チケット詳細の取得に失敗しました。")}
          />
        ) : issue === null || issue === undefined ? (
          <GitHubInlineState
            tone="empty"
            title="対象チケットを表示できません。"
            detail={`${coordinates.owner}/${coordinates.name} のチケット #${coordinates.number} は存在しないか、現在のトークンでは参照できません。`}
            className="py-8"
          />
        ) : (
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>
                  件名<span className="font-bold text-red-700">※</span>
                </th>
                <td colSpan={3}>
                  <b>{issue.title}</b>
                </td>
              </tr>
              <tr>
                <th>リポジトリ</th>
                <td className={MONO_CLASS}>{issue.repository.nameWithOwner}</td>
                <th>状態</th>
                <td>
                  {state === null ? "－" : <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>}
                </td>
              </tr>
              <tr>
                <th>作成者</th>
                <td className={MONO_CLASS}>{issue.author?.login ?? "不明"}</td>
                <th>担当者</th>
                <td className={clsx("text-xs", MONO_CLASS)}>
                  {assignees.length === 0 ? "未割当" : assignees.join(", ")}
                </td>
              </tr>
              <tr>
                <th>コメント</th>
                <td className={MONO_CLASS}>{issue.comments.totalCount}</td>
                <th>ラベル</th>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {labels.length === 0 ? (
                      <span className="text-slate-500">未設定</span>
                    ) : (
                      labels.map((label) => renderLabelChip(label.id, label.name, label.color))
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <th>マイルストーン</th>
                <td>{issue.milestone?.title ?? "未設定"}</td>
                <th>期限</th>
                <td className={MONO_CLASS}>{formatGitHubDateTime(issue.milestone?.dueOn)}</td>
              </tr>
              <tr>
                <th>クローズ日時</th>
                <td className={MONO_CLASS}>{formatGitHubDateTime(issue.closedAt)}</td>
                <th>状態理由</th>
                <td className={MONO_CLASS}>{getIssueStateReasonLabel(issue.stateReason)}</td>
              </tr>
              <tr>
                <th>本文</th>
                <td colSpan={3}>
                  <div className="whitespace-pre-wrap">
                    {issue.bodyText.trim().length === 0 ? "本文なし" : issue.bodyText}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="対応進捗（タイムライン）" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th className="w-36">日時</th>
              <th className="w-24">対応者</th>
              <th className="w-24">区分</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            {coordinates === null ? (
              <GitHubTableStateRow
                colSpan={5}
                tone="error"
                title="チケット識別子を解釈できませんでした。"
                detail="一覧画面から対象チケットを選び直してください。"
              />
            ) : timelineQuery.loading && timelineRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-600">
                  GitHub から更新履歴を取得しています。
                </td>
              </tr>
            ) : timelineQuery.error ? (
              <GitHubTableStateRow
                colSpan={5}
                tone="error"
                {...describeGitHubError(timelineQuery.error, "更新履歴の取得に失敗しました。")}
              />
            ) : timelineRows.length === 0 ? (
              <GitHubTableStateRow
                colSpan={5}
                tone="empty"
                title="表示可能なタイムライン項目はありません。"
                detail="コメントや状態変更などの履歴がまだ投稿されていません。"
              />
            ) : (
              timelineRows.map((row, index) => (
                <tr key={row.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(row.date)}</td>
                  <td className="text-center">{row.actor}</td>
                  <td className="text-center">
                    <JtcStatusTag tone={row.tone}>{row.label}</JtcStatusTag>
                  </td>
                  <td>{row.body}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={timelinePager.currentPage}
          pageSize={20}
          visibleCount={timelineRows.length}
          hasNextPage={timelineConnection?.pageInfo.hasNextPage ?? false}
          isLoading={timelineQuery.loading}
          onFirstPage={timelinePager.goToFirstPage}
          onPreviousPage={timelinePager.goToPreviousPage}
          onNextPage={() => timelinePager.goToNextPage(timelineConnection?.pageInfo.endCursor)}
        />
      </Panel>
    </JtcChrome>
  );
}

export default function IssueDetailPage(): JSX.Element {
  const { issueId } = useParams();

  return <IssueDetailScreen issueId={issueId ?? "conao3:github-jtc:1"} />;
}
