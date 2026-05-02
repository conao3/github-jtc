import clsx from "clsx";
import { startTransition, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { JtcSelect } from "../app/components/JtcSelect.tsx";
import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { JtcTabs } from "../app/components/JtcTabs.tsx";
import { StatusBadge } from "../app/components/StatusBadge.tsx";
import { useUiPreferences } from "../app/state.tsx";
import {
  CODE_VIEW_CLASS,
  COMPACT_TABLE_CLASS,
  FILE_LIST_CLASS,
  FILE_ROW_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  THEME_CLASS,
} from "../app/styles.ts";
import { commits, getRepositoryById, pullRequests } from "../data/mockData.ts";

export default function RepositoryDetailPage(): JSX.Element {
  const { repoId } = useParams();
  const { theme } = useUiPreferences();
  const repository = repoId === undefined ? undefined : getRepositoryById(repoId);
  const [selectedBranch, setSelectedBranch] = useState(repository?.defaultBranch ?? "main");
  const [selectedFilePath, setSelectedFilePath] = useState(repository?.files[0]?.path ?? "");

  if (repository === undefined) {
    return (
      <Panel title="対象データなし">
        <p>指定されたリポジトリは存在しません。</p>
      </Panel>
    );
  }

  const selectedFile = repository.files.find((file) => file.path === selectedFilePath) ?? repository.files[0];
  const relatedPullRequests = pullRequests.filter(
    (pullRequest) => pullRequest.repositoryId === repository.id,
  );
  const relatedCommits = commits.filter((commit) => commit.repositoryId === repository.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`リポジトリ詳細: ${repository.name}`}
        summary="リポジトリ概要、申請状況、ファイル一覧、関連コミットを一体表示する JTC 風の詳細画面です。"
        breadcrumbs={[
          { label: "開発管理", to: "/" },
          { label: "リポジトリ一覧", to: "/repositories" },
          { label: repository.name },
        ]}
        actions={
          <>
            <StatusBadge tone="info">{repository.visibility}</StatusBadge>
            <StatusBadge tone="ok">{repository.status}</StatusBadge>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Panel title="管理台帳">
          <table className={COMPACT_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>担当部門</th>
                <td>{repository.team}</td>
                <th>標準ブランチ</th>
                <td>{repository.defaultBranch}</td>
              </tr>
              <tr>
                <th>審査責任者</th>
                <td>{repository.reviewLead}</td>
                <th>配布時間帯</th>
                <td>{repository.deploymentWindow}</td>
              </tr>
              <tr>
                <th>言語</th>
                <td>{repository.language}</td>
                <th>監査状態</th>
                <td>{repository.compliance}</td>
              </tr>
              <tr>
                <th>概要</th>
                <td colSpan={3}>{repository.description}</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="運用タブ">
          <JtcTabs
            label="リポジトリ運用タブ"
            tabs={[
              {
                id: "prs",
                label: "変更申請",
                content: (
                  <table className={TABLE_CLASS}>
                    <thead>
                      <tr>
                        <th>申請番号</th>
                        <th>件名</th>
                        <th>状態</th>
                        <th>提出日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedPullRequests.map((pullRequest) => (
                        <tr key={pullRequest.id}>
                          <td>
                            <Link to={`/pull-requests/${pullRequest.id}`} className={TEXT_LINK_CLASS}>
                              {pullRequest.id}
                            </Link>
                          </td>
                          <td>{pullRequest.title}</td>
                          <td>{pullRequest.status}</td>
                          <td>{pullRequest.submittedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ),
              },
              {
                id: "commits",
                label: "コミット履歴",
                content: (
                  <table className={TABLE_CLASS}>
                    <thead>
                      <tr>
                        <th>SHA</th>
                        <th>内容</th>
                        <th>担当</th>
                        <th>日時</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedCommits.map((commit) => (
                        <tr key={commit.sha}>
                          <td className="font-mono">{commit.sha}</td>
                          <td>{commit.message}</td>
                          <td>{commit.author}</td>
                          <td>{commit.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ),
              },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Panel
          title="ファイルブラウザ"
          action={
            <JtcSelect
              label="ブランチ"
              selectedKey={selectedBranch}
              onSelectionChange={setSelectedBranch}
              options={[
                { id: repository.defaultBranch, label: repository.defaultBranch },
                { id: "release", label: "release" },
                { id: "feature/temporary", label: "feature/temporary" },
              ]}
            />
          }
        >
          <ul className={FILE_LIST_CLASS}>
            {repository.files.map((file) => (
              <li key={file.path}>
                <button
                  type="button"
                  className={clsx(
                    FILE_ROW_CLASS,
                    file.path === selectedFile.path && THEME_CLASS[theme].fileActive,
                  )}
                  onClick={() => {
                    startTransition(() => {
                      setSelectedFilePath(file.path);
                    });
                  }}
                >
                  <span>{file.path}</span>
                  <span className="text-[11px] text-slate-600">{file.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={`プレビュー: ${selectedFile.path}`}>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-300 pb-2 text-xs text-slate-700">
            <span>種別: {selectedFile.kind}</span>
            <span>サイズ: {selectedFile.size}</span>
            <span>更新: {selectedFile.updatedAt}</span>
            <span>閲覧ブランチ: {selectedBranch}</span>
          </div>
          <pre className={CODE_VIEW_CLASS}>{selectedFile.preview}</pre>
        </Panel>
      </div>
    </div>
  );
}
