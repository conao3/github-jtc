import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  describeGitHubError,
  fetchGitHubPullRequestDetail,
  formatGitHubDateTime,
  parseRepositoryScopedNumberRouteId,
} from "../app/github.ts";
import {
  MONO_CLASS,
  TABLE_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

export function PullRequestDiffScreen({
  prId = "conao3:github-jtc:1",
}: {
  readonly prId?: string;
}): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryScopedNumberRouteId(prId, sessionQuery.data?.user.login);
  const detailQuery = useQuery({
    queryKey: ["github", "pull-request-diff", coordinates?.owner, coordinates?.name, coordinates?.number],
    enabled: accessToken !== undefined && coordinates !== null,
    queryFn: () =>
      fetchGitHubPullRequestDetail(accessToken ?? "", {
        owner: coordinates?.owner ?? "",
        name: coordinates?.name ?? "",
        number: coordinates?.number ?? 0,
        filesFirst: 50,
        reviewsFirst: 10,
        threadsFirst: 50,
        commitsFirst: 10,
      }),
  });
  const pullRequest = detailQuery.data;
  const files = (pullRequest?.files?.nodes ?? []).filter((file) => file !== null);
  const [selectedPath, setSelectedPath] = useState<string>("");

  useEffect(() => {
    if (selectedPath.length === 0 && files[0] !== undefined) {
      setSelectedPath(files[0].path);
    }
  }, [files, selectedPath]);

  const selectedFile = files.find((file) => file.path === selectedPath) ?? files[0] ?? null;
  const threadComments = useMemo(
    () =>
      (pullRequest?.reviewThreads?.nodes ?? [])
        .filter((thread) => thread !== null && thread.path === selectedFile?.path)
        .flatMap((thread) =>
          (thread?.comments.nodes ?? [])
            .filter((comment) => comment !== null)
            .map((comment) => ({
              id: comment.id,
              path: thread?.path ?? selectedFile?.path ?? "",
              body: comment.body,
              createdAt: comment.createdAt,
              diffHunk: comment.diffHunk,
              author: comment.author?.login ?? "unknown",
              resolved: thread?.isResolved ?? false,
              outdated: thread?.isOutdated ?? false,
            })),
        ),
    [pullRequest?.reviewThreads?.nodes, selectedFile?.path],
  );
  const commits = (pullRequest?.commits?.nodes ?? []).filter((commit) => commit !== null);
  const reviewChecklist = [
    { label: "対象ファイルを確認", checked: selectedFile !== null },
    { label: "viewerViewedState を確認", checked: selectedFile?.viewerViewedState === "VIEWED" },
    { label: "レビューコメントを確認", checked: threadComments.length > 0 },
    { label: "コミット履歴を確認", checked: commits.length > 0 },
  ] as const;

  return (
    <JtcChrome
      screenId="JTC-PR-004"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "プルリクエスト一覧", to: "/pull-requests" },
        { label: "プルリクエスト詳細", to: `/pull-requests/${prId}` },
        { label: "差分表示" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="プルリクエスト一覧"
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
                    key={file.path}
                    className={clsx(
                      TODO_LIST_ITEM_CLASS,
                      file.path === selectedFile?.path && "bg-amber-100 font-bold",
                    )}
                  >
                    <button type="button" className="text-left" onClick={() => setSelectedPath(file.path)}>
                      📄 {file.path}
                    </button>
                    <span className={clsx("text-xs", MONO_CLASS)}>
                      +{file.additions} -{file.deletions}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel title="レビューチェックリスト">
            <div className="space-y-1 text-xs">
              {reviewChecklist.map(({ label, checked }) => (
                <div key={label}>
                  <label>
                    <input type="checkbox" checked={checked} readOnly /> {label}
                  </label>
                </div>
              ))}
              <div className="pt-1 text-xs text-slate-600">
                ※ GraphQL では patch 本文は取得できないため GitHub 本体への遷移が必要です。
              </div>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title={`差分表示 PR #${coordinates?.number ?? "?"} ／ ${selectedFile?.path ?? "file not selected"}`}
        action={
          <span>
            表示モード：
            <select className="ml-1 border border-slate-400 px-1 py-0.5 text-xs">
              <option>ファイル要約</option>
            </select>
          </span>
        }
        bodyClassName="p-0"
      >
        {coordinates === null ? (
          <GitHubInlineState
            tone="error"
            title="PR 識別子を解釈できませんでした。"
            detail="一覧画面から対象 PR を選び直してください。"
            className="py-8"
          />
        ) : detailQuery.isPending ? (
          <div className="py-8 text-center text-slate-600">GitHub から差分情報を取得しています。</div>
        ) : detailQuery.isError ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(detailQuery.error, "差分情報の取得に失敗しました。")}
          />
        ) : pullRequest === null || pullRequest === undefined || selectedFile === null ? (
          <GitHubInlineState
            tone="empty"
            title="表示できる差分データがありません。"
            detail="対象 PR に取得可能な changed file がありません。"
            className="py-8"
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
              <label>ファイル：</label>
              <select
                className="min-w-72 border border-slate-400 px-1 py-0.5"
                value={selectedFile.path}
                onChange={(event) => setSelectedPath(event.target.value)}
              >
                {files.map((file, index) => (
                  <option key={file.path} value={file.path}>
                    ({index + 1}/{files.length}) {file.path}
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
                  <td>{selectedFile.changeType}</td>
                  <th>viewerViewedState</th>
                  <td>
                    <JtcStatusTag tone={selectedFile.viewerViewedState === "VIEWED" ? "done" : "confirmed"}>
                      {selectedFile.viewerViewedState}
                    </JtcStatusTag>
                  </td>
                </tr>
                <tr>
                  <th>PR</th>
                  <td className={MONO_CLASS}>#{pullRequest.number}</td>
                  <th>リポジトリ</th>
                  <td className={MONO_CLASS}>
                    {coordinates.owner}/{coordinates.name}
                  </td>
                </tr>
                <tr>
                  <th>最新更新</th>
                  <td className={MONO_CLASS}>{formatGitHubDateTime(pullRequest.updatedAt)}</td>
                  <th>レビューコメント数</th>
                  <td>{threadComments.length}</td>
                </tr>
              </tbody>
            </table>

            <div className="border-t border-t-slate-300 bg-slate-50 p-2 text-xs text-slate-700">
              GitHub GraphQL API では patch hunk 本文そのものは返らないため、この画面では
              <b>ファイル単位の差分メタデータ</b>と<b>レビューコメント</b>
              を表示しています。完全な unified / side-by-side diff は GitHub 本体で確認してください。
            </div>
          </>
        )}
      </Panel>

      <Panel title="レビューコメント / スレッド" action={<span>{threadComments.length}件</span>}>
        <div className="space-y-1.5 bg-slate-50 p-0.5">
          {threadComments.length === 0 ? (
            <GitHubInlineState
              tone="empty"
              title="このファイルのレビューコメントはありません。"
              detail="review thread は存在しないか、別ファイルに紐づいています。"
              className="border border-slate-300 bg-white p-3 text-xs"
            />
          ) : (
            threadComments.map((comment) => (
              <div key={comment.id} className="border border-slate-300 bg-white p-2 text-xs">
                <div className="mb-1 font-bold text-blue-900">
                  ● {comment.author}
                  <span className={clsx("ml-2 text-xs font-normal text-slate-600", MONO_CLASS)}>
                    {formatGitHubDateTime(comment.createdAt)}
                  </span>
                  <span className="ml-2">
                    <JtcStatusTag
                      tone={comment.resolved ? "done" : comment.outdated ? "confirmed" : "review"}
                    >
                      {comment.resolved ? "resolved" : comment.outdated ? "outdated" : "open"}
                    </JtcStatusTag>
                  </span>
                </div>
                <div className="mb-2 whitespace-pre-wrap">{comment.body}</div>
                {comment.diffHunk === null ? null : (
                  <pre
                    className={clsx(
                      "overflow-auto border border-slate-200 bg-slate-50 p-2 text-xs",
                      MONO_CLASS,
                    )}
                  >
                    {comment.diffHunk}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel title="関連コミット" action={<span>{commits.length}件</span>} bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-28">OID</th>
              <th>メッセージ</th>
              <th className="w-24">Author</th>
              <th className="w-28">日時</th>
            </tr>
          </thead>
          <tbody>
            {commits.length === 0 ? (
              <GitHubTableStateRow
                colSpan={4}
                tone="empty"
                title="関連コミットはありません。"
                detail="commits connection に表示可能なデータがありません。"
              />
            ) : (
              commits.map((commit) => {
                const author = (commit.commit.authors.nodes ?? [])[0];

                return (
                  <tr key={commit.id}>
                    <td className={MONO_CLASS}>{commit.commit.oid.slice(0, 12)}</td>
                    <td>{commit.commit.messageHeadline}</td>
                    <td className="text-center">{author?.user?.login ?? author?.name ?? "unknown"}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {formatGitHubDateTime(commit.commit.committedDate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Panel>

      <Panel title="GitHubで完全差分を開く">
        <div className="p-3 text-center">
          <a
            href={pullRequest?.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ tone: "primary", size: "lg", className: "inline-flex" })}
          >
            GitHubのDiffを開く
          </a>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestDiffPage(): JSX.Element {
  const { prId } = useParams();

  return <PullRequestDiffScreen prId={prId ?? "conao3:github-jtc:1"} />;
}
