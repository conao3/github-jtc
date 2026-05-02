import { useParams } from "react-router-dom";

import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { JtcTabs } from "../app/components/JtcTabs.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { getPullRequestById, getRepositoryById } from "../data/mockData.ts";

export default function PullRequestDetailPage(): JSX.Element {
  const { prId } = useParams();
  const pullRequest = prId === undefined ? undefined : getPullRequestById(prId);

  if (pullRequest === undefined) {
    return (
      <Panel title="対象データなし">
        <p>指定されたプルリクエストは存在しません。</p>
      </Panel>
    );
  }

  const repository = getRepositoryById(pullRequest.repositoryId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`変更申請詳細: ${pullRequest.id}`}
        summary={pullRequest.summary}
        breadcrumbs={[
          { label: "変更申請", to: "/" },
          { label: "プルリクエスト一覧", to: "/pull-requests" },
          { label: pullRequest.id },
        ]}
        actions={
          <>
            <StatusBadge
              tone={
                pullRequest.status === "差戻し" ? "danger" : pullRequest.status === "承認待ち" ? "warn" : "ok"
              }
            >
              {pullRequest.status}
            </StatusBadge>
            <StatusBadge tone="info">{pullRequest.priority}</StatusBadge>
          </>
        }
      />

      <Panel title="申請概要">
        <table className="jtc-table jtc-table-compact">
          <tbody>
            <tr>
              <th>件名</th>
              <td>{pullRequest.title}</td>
              <th>対象リポジトリ</th>
              <td>{repository?.name ?? pullRequest.repositoryId}</td>
            </tr>
            <tr>
              <th>起票者</th>
              <td>{pullRequest.author}</td>
              <th>提出日時</th>
              <td>{pullRequest.submittedAt}</td>
            </tr>
            <tr>
              <th>変更元</th>
              <td>{pullRequest.sourceBranch}</td>
              <th>反映先</th>
              <td>{pullRequest.targetBranch}</td>
            </tr>
            <tr>
              <th>変更件数</th>
              <td>{pullRequest.changedFiles} files</td>
              <th>コメント件数</th>
              <td>{pullRequest.comments} 件</td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="承認フロー">
          <table className="jtc-table">
            <thead>
              <tr>
                <th>工程</th>
                <th>担当</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {pullRequest.workflow.map((step) => (
                <tr key={step.step}>
                  <td>{step.step}</td>
                  <td>{step.owner}</td>
                  <td>
                    <StatusBadge
                      tone={
                        step.status === "却下"
                          ? "danger"
                          : step.status === "対応中"
                            ? "warn"
                            : step.status === "未着手"
                              ? "neutral"
                              : "ok"
                      }
                    >
                      {step.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <JtcTabs
          label="変更申請詳細タブ"
          tabs={[
            {
              id: "points",
              label: "審査観点",
              content: (
                <ul className="jtc-bullet-list">
                  {pullRequest.reviewPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ),
            },
            {
              id: "diff",
              label: "変更対象",
              content: (
                <table className="jtc-table">
                  <thead>
                    <tr>
                      <th>区分</th>
                      <th>内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>UI</td>
                      <td>緊急お知らせ枠、承認フロー表示、監査ラベル出し分け</td>
                    </tr>
                    <tr>
                      <td>文言</td>
                      <td>申請説明文、配布時間帯、注意喚起メッセージを更新</td>
                    </tr>
                    <tr>
                      <td>影響範囲</td>
                      <td>トップページ、右ペイン、承認一覧、監査 CSV 表示列</td>
                    </tr>
                  </tbody>
                </table>
              ),
            },
            {
              id: "comments",
              label: "コメントログ",
              content: (
                <div className="space-y-3 text-sm">
                  <div className="rounded border border-slate-300 bg-white p-3">
                    <div className="font-bold">高橋 主任</div>
                    <div>緊急お知らせ枠は ToDo より先頭固定としてください。</div>
                  </div>
                  <div className="rounded border border-slate-300 bg-white p-3">
                    <div className="font-bold">品質保証G</div>
                    <div>スマホ時の縦積み順を確認中です。結果は本日 14:00 までに返信予定。</div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
