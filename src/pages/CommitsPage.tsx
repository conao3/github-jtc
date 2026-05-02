import { useState } from "react";

import { JtcSelect } from "../app/components/JtcSelect.tsx";
import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { commits } from "../data/mockData.ts";

export default function CommitsPage(): JSX.Element {
  const [risk, setRisk] = useState("all");

  const filteredCommits = commits.filter((commit) => risk === "all" || commit.risk === risk);

  return (
    <div className="space-y-4">
      <PageHeader
        title="コミット履歴 / 監査証跡"
        summary="GitHub の commit log を、日本企業の監査台帳・証跡ダウンロード画面に寄せて表示しています。"
        breadcrumbs={[{ label: "履歴監査", to: "/" }, { label: "コミット履歴" }]}
      />

      <Panel title="集計条件">
        <div className="jtc-filter-grid">
          <JtcSelect
            label="リスク区分"
            selectedKey={risk}
            onSelectionChange={setRisk}
            options={[
              { id: "all", label: "すべて" },
              { id: "高", label: "高" },
              { id: "中", label: "中" },
              { id: "低", label: "低" },
            ]}
          />
        </div>
      </Panel>

      <Panel title={`監査対象コミット ${String(filteredCommits.length)} 件`}>
        <table className="jtc-table">
          <thead>
            <tr>
              <th>SHA</th>
              <th>リポジトリ</th>
              <th>コミット内容</th>
              <th>担当者</th>
              <th>日時</th>
              <th>リスク</th>
              <th>関連票</th>
            </tr>
          </thead>
          <tbody>
            {filteredCommits.map((commit) => (
              <tr key={commit.sha}>
                <td className="font-mono">{commit.sha}</td>
                <td>{commit.repositoryId}</td>
                <td>{commit.message}</td>
                <td>{commit.author}</td>
                <td>{commit.date}</td>
                <td>
                  <StatusBadge tone={commit.risk === "高" ? "danger" : commit.risk === "中" ? "warn" : "ok"}>
                    {commit.risk}
                  </StatusBadge>
                </td>
                <td>{commit.ticket}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
