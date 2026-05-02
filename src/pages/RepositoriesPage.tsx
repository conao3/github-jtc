import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";

import { JtcSelect } from "../app/components/JtcSelect.tsx";
import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { repositories } from "../data/mockData.ts";

export default function RepositoriesPage(): JSX.Element {
  const [keyword, setKeyword] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [team, setTeam] = useState("all");
  const deferredKeyword = useDeferredValue(keyword);

  const filteredRepositories = repositories.filter((repository) => {
    const matchesKeyword =
      deferredKeyword.length === 0 ||
      repository.name.includes(deferredKeyword) ||
      repository.description.includes(deferredKeyword);
    const matchesVisibility = visibility === "all" || repository.visibility === visibility;
    const matchesTeam = team === "all" || repository.team === team;

    return matchesKeyword && matchesVisibility && matchesTeam;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="リポジトリ一覧"
        summary="GitHub 相当の基本情報を、申請・監査観点を含めた社内台帳風のレイアウトで一覧化しています。"
        breadcrumbs={[{ label: "開発管理", to: "/" }, { label: "リポジトリ一覧" }]}
      />

      <Panel title="検索条件">
        <div className="jtc-filter-grid">
          <label className="jtc-field">
            <span className="jtc-field-label">キーワード</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="jtc-input"
              placeholder="名称・説明文"
            />
          </label>
          <JtcSelect
            label="公開範囲"
            selectedKey={visibility}
            onSelectionChange={setVisibility}
            options={[
              { id: "all", label: "すべて" },
              { id: "社内限定", label: "社内限定" },
              { id: "部門限定", label: "部門限定" },
            ]}
          />
          <JtcSelect
            label="担当部門"
            selectedKey={team}
            onSelectionChange={setTeam}
            options={[
              { id: "all", label: "すべて" },
              { id: "第二システム部", label: "第二システム部" },
              { id: "業務改革室", label: "業務改革室" },
              { id: "情報システム監査室", label: "情報システム監査室" },
            ]}
          />
        </div>
      </Panel>

      <Panel title={`検索結果 ${String(filteredRepositories.length)} 件`}>
        <table className="jtc-table">
          <thead>
            <tr>
              <th>リポジトリ名</th>
              <th>担当部門</th>
              <th>言語</th>
              <th>PR</th>
              <th>Issue</th>
              <th>状態</th>
              <th>監査</th>
              <th>最終更新</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepositories.map((repository) => (
              <tr key={repository.id}>
                <td>
                  <Link to={`/repositories/${repository.id}`}>{repository.name}</Link>
                  <div className="text-[11px] text-slate-600">{repository.description}</div>
                </td>
                <td>{repository.team}</td>
                <td>{repository.language}</td>
                <td>{repository.openPrs}</td>
                <td>{repository.openIssues}</td>
                <td>{repository.status}</td>
                <td>
                  <StatusBadge
                    tone={
                      repository.compliance === "未対応"
                        ? "danger"
                        : repository.compliance === "対応中"
                          ? "warn"
                          : "ok"
                    }
                  >
                    {repository.compliance}
                  </StatusBadge>
                </td>
                <td>{repository.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
