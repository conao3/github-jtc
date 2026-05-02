import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";

import { JtcSelect } from "../app/components/JtcSelect.tsx";
import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { pullRequests } from "../data/mockData.ts";

export default function PullRequestsPage(): JSX.Element {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const deferredKeyword = useDeferredValue(keyword);

  const filteredItems = pullRequests.filter((item) => {
    const matchesKeyword =
      deferredKeyword.length === 0 ||
      item.title.includes(deferredKeyword) ||
      item.id.includes(deferredKeyword);
    const matchesStatus = status === "all" || item.status === status;

    return matchesKeyword && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="変更申請 / プルリクエスト一覧"
        summary="GitHub の Pull Request を、日本企業の稟議・承認フローとして再解釈した一覧画面です。"
        breadcrumbs={[{ label: "変更申請", to: "/" }, { label: "プルリクエスト一覧" }]}
      />

      <Panel title="照会条件">
        <div className="jtc-filter-grid">
          <label className="jtc-field">
            <span className="jtc-field-label">申請番号/件名</span>
            <input
              className="jtc-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="PR-24051 / 申請件名"
            />
          </label>
          <JtcSelect
            label="承認状態"
            selectedKey={status}
            onSelectionChange={setStatus}
            options={[
              { id: "all", label: "すべて" },
              { id: "承認待ち", label: "承認待ち" },
              { id: "差戻し", label: "差戻し" },
              { id: "承認済", label: "承認済" },
            ]}
          />
        </div>
      </Panel>

      <Panel title={`対象申請 ${String(filteredItems.length)} 件`}>
        <table className="jtc-table">
          <thead>
            <tr>
              <th>申請番号</th>
              <th>件名</th>
              <th>申請者</th>
              <th>優先</th>
              <th>状態</th>
              <th>提出日時</th>
              <th>変更</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/pull-requests/${item.id}`}>{item.id}</Link>
                </td>
                <td>{item.title}</td>
                <td>{item.author}</td>
                <td>
                  <StatusBadge
                    tone={item.priority === "高" ? "danger" : item.priority === "中" ? "warn" : "ok"}
                  >
                    {item.priority}
                  </StatusBadge>
                </td>
                <td>{item.status}</td>
                <td>{item.submittedAt}</td>
                <td>{item.changedFiles} files</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
