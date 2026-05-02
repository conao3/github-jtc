import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";

import { JtcSelect } from "../app/components/JtcSelect.tsx";
import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import {
  FIELD_LABEL_CLASS,
  FIELD_STACK_CLASS,
  FILTER_GRID_CLASS,
  FILTER_INPUT_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
} from "../app/styles.ts";
import { issues } from "../data/mockData.ts";

export default function IssuesPage(): JSX.Element {
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = status === "all" || issue.status === status;
    const matchesKeyword =
      deferredKeyword.length === 0 ||
      issue.title.includes(deferredKeyword) ||
      issue.id.includes(deferredKeyword) ||
      issue.category.includes(deferredKeyword);

    return matchesStatus && matchesKeyword;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="課題 / Issue 一覧"
        summary="GitHub Issue を社内障害票・問い合わせ票の見た目に寄せて表示する PoC 画面です。"
        breadcrumbs={[{ label: "課題管理", to: "/" }, { label: "Issue 一覧" }]}
      />

      <Panel title="照会条件">
        <div className={FILTER_GRID_CLASS}>
          <label className={FIELD_STACK_CLASS}>
            <span className={FIELD_LABEL_CLASS}>課題番号/件名/区分</span>
            <input
              className={FILTER_INPUT_CLASS}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="ISS-1182 / 表示不具合"
            />
          </label>
          <JtcSelect
            label="対応状態"
            selectedKey={status}
            onSelectionChange={setStatus}
            options={[
              { id: "all", label: "すべて" },
              { id: "未対応", label: "未対応" },
              { id: "対応中", label: "対応中" },
              { id: "回答待ち", label: "回答待ち" },
              { id: "完了", label: "完了" },
            ]}
          />
        </div>
      </Panel>

      <Panel title={`該当課題 ${String(filteredIssues.length)} 件`}>
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th>課題番号</th>
              <th>件名</th>
              <th>区分</th>
              <th>状態</th>
              <th>担当者</th>
              <th>優先</th>
              <th>期限</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td>
                  <Link to={`/issues/${issue.id}`} className={TEXT_LINK_CLASS}>
                    {issue.id}
                  </Link>
                </td>
                <td>{issue.title}</td>
                <td>{issue.category}</td>
                <td>{issue.status}</td>
                <td>{issue.assignee}</td>
                <td>
                  <StatusBadge
                    tone={issue.priority === "S" ? "danger" : issue.priority === "A" ? "warn" : "ok"}
                  >
                    {issue.priority}
                  </StatusBadge>
                </td>
                <td>{issue.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
