import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryPath,
  describeGitHubError,
  fetchGitHubCommitDiff,
  formatGitHubDateTime,
  formatGitHubFileChangeType,
  parseRepositoryRouteId,
} from "../app/github.ts";
import {
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

async function copyRevertCommand(oid: string): Promise<void> {
  if (typeof navigator.clipboard?.writeText !== "function") {
    return;
  }

  await navigator.clipboard.writeText(`git revert ${oid}`);
}

export function CommitDiffScreen({
  repoId = "conao3/github-jtc",
  commitRef = "",
}: {
  readonly repoId?: string;
  readonly commitRef?: string;
}): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryRouteId(repoId);
  const commitQuery = useQuery({
    queryKey: ["github", "commit-diff", coordinates?.owner, coordinates?.name, commitRef],
    enabled: accessToken !== undefined && coordinates !== null && commitRef.length > 0,
    queryFn: () =>
      fetchGitHubCommitDiff(accessToken ?? "", {
        owner: coordinates?.owner ?? "",
        name: coordinates?.name ?? "",
        ref: commitRef,
      }),
  });
  const commit = commitQuery.data;
  const files = commit?.files ?? [];
  const [selectedPath, setSelectedPath] = useState("");

  useEffect(() => {
    if (selectedPath.length === 0 && files[0] !== undefined) {
      setSelectedPath(files[0].filename);
    }
  }, [files, selectedPath]);

  const selectedFile = files.find((file) => file.filename === selectedPath) ?? files[0] ?? null;
  const commitLabel = commit?.sha.slice(0, 12) ?? (commitRef.length > 0 ? commitRef : "コミット未指定");

  return (
    <JtcChrome
      screenId="JTC-CMT-002"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "コミット履歴", to: "/commits" },
        { label: "差分表示" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="コミット履歴"
      rightColumn={
        <>
          <Panel title="変更ファイル" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {files.length === 0 ? (
                <li className={TODO_LIST_ITEM_CLASS}>
                  <span>ファイルなし</span>
                  <span className={clsx("text-xs", MONO_CLASS)}>0</span>
                </li>
              ) : (
                files.map((file) => (
                  <li
                    key={file.filename}
                    className={clsx(
                      TODO_LIST_ITEM_CLASS,
                      file.filename === selectedFile?.filename && "bg-amber-100 font-bold",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left"
                      onClick={() => setSelectedPath(file.filename)}
                    >
                      {file.filename}
                    </button>
                    <span className={clsx("text-xs", MONO_CLASS)}>
                      +{file.additions} -{file.deletions}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel title="コミット情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>コミットID</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{commit?.sha.slice(0, 12) ?? "－"}</td>
                </tr>
                <tr>
                  <th>作成者</th>
                  <td>{commit?.author?.login ?? commit?.commit.author.name ?? "不明"}</td>
                </tr>
                <tr>
                  <th>日時</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>
                    {formatGitHubDateTime(commit?.commit.author.date)}
                  </td>
                </tr>
                <tr>
                  <th>変更量</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>
                    <span className="text-green-700">+{commit?.stats.additions ?? 0}</span> /{" "}
                    <span className="text-red-700">-{commit?.stats.deletions ?? 0}</span> / 合計{" "}
                    {commit?.stats.total ?? 0}
                  </td>
                </tr>
                <tr>
                  <th>親コミット</th>
                  <td>{commit?.parents.length ?? 0}件</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="操作">
            <div className="flex flex-col gap-1">
              <a
                href={commit?.html_url}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
              >
                GitHubの差分を開く
              </a>
              <button
                type="button"
                className={buttonClassName()}
                disabled={commit === undefined}
                onClick={() => {
                  if (commit === undefined) {
                    return;
                  }

                  void copyRevertCommand(commit.sha);
                }}
              >
                `git revert` をコピー
              </button>
              {coordinates === null ? null : (
                <Link
                  to={`/repositories/${createRepositoryPath({
                    owner: coordinates.owner,
                    name: coordinates.name,
                  })}`}
                  className={buttonClassName({ className: "inline-flex justify-center no-underline" })}
                >
                  リポジトリ詳細
                </Link>
              )}
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title={`差分表示 ${commitLabel} ／ ${selectedFile?.filename ?? "ファイル未選択"}`}
        action={<span>表示モード：Unified diff</span>}
        bodyClassName="p-0"
      >
        {coordinates === null ? (
          <GitHubInlineState
            tone="error"
            title="対象リポジトリを解釈できませんでした。"
            detail="コミット履歴一覧から対象コミットを選び直してください。"
            className="py-8"
          />
        ) : commitRef.length === 0 ? (
          <GitHubInlineState
            tone="error"
            title="コミット識別子がありません。"
            detail="一覧画面から対象コミットを選び直してください。"
            className="py-8"
          />
        ) : commitQuery.isPending ? (
          <div className="py-8 text-center text-slate-600">GitHub からコミット差分を取得しています。</div>
        ) : commitQuery.isError ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(commitQuery.error, "コミット差分の取得に失敗しました。")}
          />
        ) : commit === undefined || selectedFile === null ? (
          <GitHubInlineState
            tone="empty"
            title="表示できる差分データがありません。"
            detail="対象コミットに取得可能な変更ファイルがありません。"
            className="py-8"
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
              <label>ファイル：</label>
              <select
                className="min-w-72 border border-slate-400 px-1 py-0.5"
                value={selectedFile.filename}
                onChange={(event) => setSelectedPath(event.target.value)}
              >
                {files.map((file, index) => (
                  <option key={file.filename} value={file.filename}>
                    ({index + 1}/{files.length}) {file.filename}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-600">
                追加：<b className="text-green-700">+{selectedFile.additions}行</b> 削除：
                <b className="text-red-700">-{selectedFile.deletions}行</b>
              </span>
            </div>

            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>変更種別</th>
                  <td>{formatGitHubFileChangeType(selectedFile.status)}</td>
                  <th>変更量</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{selectedFile.changes}行</td>
                </tr>
                <tr>
                  <th>リポジトリ</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>
                    {coordinates.owner}/{coordinates.name}
                  </td>
                  <th>コミットID</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{commit.sha}</td>
                </tr>
                <tr>
                  <th>前ファイル名</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{selectedFile.previous_filename ?? "－"}</td>
                  <th>Blob</th>
                  <td>
                    {selectedFile.blob_url === null ? (
                      "－"
                    ) : (
                      <a
                        href={selectedFile.blob_url}
                        target="_blank"
                        rel="noreferrer"
                        className={TEXT_LINK_CLASS}
                      >
                        表示
                      </a>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-t-slate-300 bg-slate-50 p-2">
              {selectedFile.patch === undefined ? (
                <GitHubInlineState
                  tone="empty"
                  title="このファイルのパッチ本文は取得できませんでした。"
                  detail="バイナリファイル、または GitHub がパッチ生成対象外とした変更の可能性があります。"
                  className="border border-slate-300 bg-white p-4 text-xs"
                />
              ) : (
                <pre
                  className={clsx(
                    "h-96 overflow-auto border border-slate-300 bg-white p-3 text-xs whitespace-pre-wrap",
                    MONO_CLASS,
                  )}
                >
                  {selectedFile.patch}
                </pre>
              )}
            </div>
          </>
        )}
      </Panel>

      <Panel title="コミットメッセージ / 親コミット" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <tbody>
            {commit === undefined ? (
              <GitHubTableStateRow
                colSpan={2}
                tone="empty"
                title="コミット情報の取得後に表示します。"
                detail="GitHub から差分とメタ情報を取得しています。"
              />
            ) : (
              <>
                <tr>
                  <th className="w-36">メッセージ</th>
                  <td className="whitespace-pre-wrap">{commit.commit.message}</td>
                </tr>
                <tr>
                  <th>親コミット</th>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {commit.parents.length === 0 ? (
                        <span>－</span>
                      ) : (
                        commit.parents.map((parent) => (
                          <a
                            key={parent.sha}
                            href={parent.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className={clsx(TEXT_LINK_CLASS, MONO_CLASS)}
                          >
                            {parent.sha.slice(0, 12)}
                          </a>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function CommitDiffPage(): JSX.Element {
  const { owner, name, commitRef } = useParams();
  const repoId = owner === undefined || name === undefined ? "conao3/github-jtc" : `${owner}/${name}`;

  return <CommitDiffScreen repoId={repoId} commitRef={commitRef ?? ""} />;
}
