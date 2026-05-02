import { useParams } from "react-router-dom";

import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { JtcTabs } from "../app/components/JtcTabs.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { BULLET_LIST_CLASS, COMPACT_TABLE_CLASS, TABLE_CLASS } from "../app/styles.ts";
import { getIssueById, getRepositoryById } from "../data/mockData.ts";

export default function IssueDetailPage(): JSX.Element {
  const { issueId } = useParams();
  const issue = issueId === undefined ? undefined : getIssueById(issueId);

  if (issue === undefined) {
    return (
      <Panel title="対象データなし">
        <p>指定された Issue は存在しません。</p>
      </Panel>
    );
  }

  const repository = getRepositoryById(issue.repositoryId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`課題詳細: ${issue.id}`}
        summary={issue.title}
        breadcrumbs={[
          { label: "課題管理", to: "/" },
          { label: "Issue 一覧", to: "/issues" },
          { label: issue.id },
        ]}
        actions={
          <>
            <StatusBadge
              tone={issue.status === "未対応" ? "danger" : issue.status === "対応中" ? "warn" : "ok"}
            >
              {issue.status}
            </StatusBadge>
            <StatusBadge tone="info">{issue.priority}</StatusBadge>
          </>
        }
      />

      <Panel title="課題基本情報">
        <table className={COMPACT_TABLE_CLASS}>
          <tbody>
            <tr>
              <th>対象リポジトリ</th>
              <td>{repository?.name ?? issue.repositoryId}</td>
              <th>区分</th>
              <td>{issue.category}</td>
            </tr>
            <tr>
              <th>担当者</th>
              <td>{issue.assignee}</td>
              <th>期限</th>
              <td>{issue.dueDate}</td>
            </tr>
            <tr>
              <th>起票日時</th>
              <td>{issue.openedAt}</td>
              <th>状態</th>
              <td>{issue.status}</td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <JtcTabs
        label="課題詳細タブ"
        tabs={[
          {
            id: "detail",
            label: "起票内容",
            content: <p className="text-sm leading-7">{issue.description}</p>,
          },
          {
            id: "history",
            label: "対応履歴",
            content: (
              <table className={TABLE_CLASS}>
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>担当</th>
                    <th>内容</th>
                  </tr>
                </thead>
                <tbody>
                  {issue.history.map((entry) => (
                    <tr key={`${entry.date}:${entry.actor}`}>
                      <td>{entry.date}</td>
                      <td>{entry.actor}</td>
                      <td>{entry.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ),
          },
          {
            id: "policy",
            label: "処置方針",
            content: (
              <ul className={BULLET_LIST_CLASS}>
                <li>再現条件と業務影響を整理し、承認系・監査系のどちらに属するかを先に確定します。</li>
                <li>影響が帳票出力に及ぶ場合は、構成管理室への事前相談を必須とします。</li>
                <li>改修時は関連 PR に Issue 番号を付与し、監査証跡との紐付けを保持します。</li>
              </ul>
            ),
          },
        ]}
      />
    </div>
  );
}
