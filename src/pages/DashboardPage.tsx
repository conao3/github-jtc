import { Link } from "react-router-dom";

import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { commits, dashboardMetrics, pullRequests, repositories } from "../data/mockData.ts";

export default function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-4">
      <PageHeader
        title="ポータルダッシュボード"
        summary="開発管理、変更申請、課題、監査の主要情報を 1 画面で俯瞰するためのトップページです。"
        breadcrumbs={[{ label: "ポータル" }, { label: "ダッシュボード" }]}
      />

      <section className="jtc-kpi-grid">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className="jtc-kpi-card">
            <div className="jtc-kpi-label">{metric.label}</div>
            <div className="jtc-kpi-value">{metric.value}</div>
            <div className="jtc-kpi-note">{metric.note}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="承認待ちプルリクエスト">
          <table className="jtc-table">
            <thead>
              <tr>
                <th>申請番号</th>
                <th>件名</th>
                <th>優先</th>
                <th>状態</th>
                <th>申請者</th>
              </tr>
            </thead>
            <tbody>
              {pullRequests.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/pull-requests/${item.id}`}>{item.id}</Link>
                  </td>
                  <td>{item.title}</td>
                  <td>
                    <StatusBadge
                      tone={item.priority === "高" ? "danger" : item.priority === "中" ? "warn" : "ok"}
                    >
                      {item.priority}
                    </StatusBadge>
                  </td>
                  <td>{item.status}</td>
                  <td>{item.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="重点管理リポジトリ">
          <table className="jtc-table">
            <thead>
              <tr>
                <th>リポジトリ</th>
                <th>担当</th>
                <th>PR</th>
                <th>課題</th>
                <th>監査</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repository) => (
                <tr key={repository.id}>
                  <td>
                    <Link to={`/repositories/${repository.id}`}>{repository.name}</Link>
                  </td>
                  <td>{repository.team}</td>
                  <td>{repository.openPrs}</td>
                  <td>{repository.openIssues}</td>
                  <td>{repository.compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="本日対応予定コミット">
          <table className="jtc-table">
            <thead>
              <tr>
                <th>SHA</th>
                <th>リポジトリ</th>
                <th>内容</th>
                <th>リスク</th>
              </tr>
            </thead>
            <tbody>
              {commits.map((commit) => (
                <tr key={commit.sha}>
                  <td className="font-mono">{commit.sha}</td>
                  <td>{commit.repositoryId}</td>
                  <td>{commit.message}</td>
                  <td>
                    <StatusBadge
                      tone={commit.risk === "高" ? "danger" : commit.risk === "中" ? "warn" : "ok"}
                    >
                      {commit.risk}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="運用メモ">
          <ul className="jtc-bullet-list">
            <li>レビュー会は毎日 16:00 開始です。高優先度 PR は 15:30 までに申請してください。</li>
            <li>月次監査提出期間のため、コミットメッセージには必ずチケット番号を付与してください。</li>
            <li>社内配布対象ブランチは `release` を基準とし、直接 push は原則禁止です。</li>
            <li>画面右上の文字サイズ切替により、一覧密度を変更できます。</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
