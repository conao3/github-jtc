import clsx from "clsx";
import { useQuery as useApolloQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  describeGitHubError,
  fetchGitHubPullRequestDiffFiles,
  formatGitHubDateTime,
  formatGitHubFileChangeType,
  formatGitHubViewedState,
  parseRepositoryScopedNumberRouteId,
} from "../app/github.ts";
import { PullRequestDetailDocument } from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

interface PullRequestDiffFileEntry {
  readonly path: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changes: number;
  readonly changeType: string;
  readonly viewerViewedState: string | null;
  readonly patch?: string;
  readonly blobUrl: string | null;
  readonly rawUrl: string | null;
  readonly previousFilename?: string;
}

const PULL_REQUEST_DIFF_COMMITS_PAGE_SIZE = 10;

export function PullRequestDiffScreen({
  prId = "conao3:github-jtc:1",
}: {
  readonly prId?: string;
}): JSX.Element {
  const commitsPager = useCursorPagerState();
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryScopedNumberRouteId(prId, sessionQuery.data?.user.login);
  const detailQuery = useApolloQuery(PullRequestDetailDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      filesFirst: 50,
      reviewsFirst: 10,
      threadsFirst: 50,
      commitsFirst: PULL_REQUEST_DIFF_COMMITS_PAGE_SIZE,
      commitsAfter: commitsPager.currentCursor,
      filesAfter: null,
      closingIssuesFirst: 5,
      closingIssuesAfter: null,
    },
    fetchPolicy: "network-only",
  });
  const restFilesQuery = useQuery({
    queryKey: [
      "github",
      "pull-request-diff-files",
      coordinates?.owner,
      coordinates?.name,
      coordinates?.number,
    ],
    enabled: accessToken !== undefined && coordinates !== null,
    queryFn: () =>
      fetchGitHubPullRequestDiffFiles(accessToken ?? "", {
        owner: coordinates?.owner ?? "",
        name: coordinates?.name ?? "",
        number: coordinates?.number ?? 0,
      }),
  });
  const pullRequest =
    detailQuery.data?.repository?.pullRequest ?? detailQuery.previousData?.repository?.pullRequest;
  const files = (pullRequest?.files?.nodes ?? []).filter((file) => file !== null);
  const restFiles = restFilesQuery.data ?? [];
  const [selectedPath, setSelectedPath] = useState<string>("");

  const fileEntries = useMemo(() => {
    const byPath = new Map<string, PullRequestDiffFileEntry>();

    for (const file of restFiles) {
      byPath.set(file.filename, {
        path: file.filename,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        changeType: file.status,
        patch: file.patch,
        blobUrl: file.blob_url,
        rawUrl: file.raw_url,
        previousFilename: file.previous_filename,
        viewerViewedState: null,
      });
    }

    for (const file of files) {
      const current = byPath.get(file.path);
      byPath.set(file.path, {
        path: file.path,
        additions: current?.additions ?? file.additions,
        deletions: current?.deletions ?? file.deletions,
        changes: current?.changes ?? file.additions + file.deletions,
        changeType: current?.changeType ?? file.changeType,
        patch: current?.patch,
        blobUrl: current?.blobUrl ?? null,
        rawUrl: current?.rawUrl ?? null,
        previousFilename: current?.previousFilename,
        viewerViewedState: file.viewerViewedState,
      });
    }

    return [...byPath.values()];
  }, [files, restFiles]);

  useEffect(() => {
    if (selectedPath.length === 0 && fileEntries[0] !== undefined) {
      setSelectedPath(fileEntries[0].path);
    }
  }, [fileEntries, selectedPath]);

  const selectedFile = fileEntries.find((file) => file.path === selectedPath) ?? fileEntries[0] ?? null;
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
              author: comment.author?.login ?? "不明",
              resolved: thread?.isResolved ?? false,
              outdated: thread?.isOutdated ?? false,
            })),
        ),
    [pullRequest?.reviewThreads?.nodes, selectedFile?.path],
  );
  const commits = (pullRequest?.commits?.nodes ?? []).filter((commit) => commit !== null);
  const reviewChecklist = [
    { label: "対象ファイルを確認", checked: selectedFile !== null },
    { label: "閲覧状態を確認", checked: selectedFile?.viewerViewedState === "VIEWED" },
    { label: "レビューコメントを確認", checked: threadComments.length > 0 },
    { label: "コミット履歴を確認", checked: commits.length > 0 },
  ] as const;
  const isPending = (detailQuery.loading && pullRequest == null) || restFilesQuery.isPending;
  const error = detailQuery.error ?? restFilesQuery.error;
  const isError = detailQuery.error !== undefined || restFilesQuery.isError;

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
              {fileEntries.length === 0 ? (
                <li className={TODO_LIST_ITEM_CLASS}>
                  <span>ファイルなし</span>
                  <span className={clsx("text-xs", MONO_CLASS)}>0</span>
                </li>
              ) : (
                fileEntries.map((file) => (
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
                ※ パッチ本文は GitHub REST API から取得しています。
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
        title={`差分表示 プルリクエスト #${coordinates?.number ?? "?"} ／ ${selectedFile?.path ?? "ファイル未選択"}`}
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
            title="プルリクエスト識別子を解釈できませんでした。"
            detail="一覧画面から対象プルリクエストを選び直してください。"
            className="py-8"
          />
        ) : isPending ? (
          <div className="py-8 text-center text-slate-600">GitHub から差分情報を取得しています。</div>
        ) : isError ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(error, "差分情報の取得に失敗しました。")}
          />
        ) : pullRequest === null || pullRequest === undefined || selectedFile === null ? (
          <GitHubInlineState
            tone="empty"
            title="表示できる差分データがありません。"
            detail="対象プルリクエストに取得可能な変更ファイルがありません。"
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
                {fileEntries.map((file, index) => (
                  <option key={file.path} value={file.path}>
                    ({index + 1}/{fileEntries.length}) {file.path}
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
                  <td>{formatGitHubFileChangeType(selectedFile.changeType)}</td>
                  <th>閲覧状態</th>
                  <td>
                    <JtcStatusTag tone={selectedFile.viewerViewedState === "VIEWED" ? "done" : "confirmed"}>
                      {formatGitHubViewedState(selectedFile.viewerViewedState)}
                    </JtcStatusTag>
                  </td>
                </tr>
                <tr>
                  <th>プルリクエスト</th>
                  <td className={MONO_CLASS}>#{pullRequest.number}</td>
                  <th>リポジトリ</th>
                  <td className={MONO_CLASS}>
                    {coordinates.owner}/{coordinates.name}
                  </td>
                </tr>
                <tr>
                  <th>最新更新</th>
                  <td className={MONO_CLASS}>{formatGitHubDateTime(pullRequest.updatedAt)}</td>
                  <th>変更量</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{selectedFile.changes}行</td>
                </tr>
                <tr>
                  <th>旧ファイル名</th>
                  <td className={clsx("text-xs", MONO_CLASS)}>{selectedFile.previousFilename ?? "－"}</td>
                  <th>レビューコメント数</th>
                  <td>{threadComments.length}</td>
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

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {selectedFile.blobUrl === null ? null : (
                  <a href={selectedFile.blobUrl} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                    Blobを開く
                  </a>
                )}
                {selectedFile.rawUrl === null ? null : (
                  <a href={selectedFile.rawUrl} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                    Rawを開く
                  </a>
                )}
              </div>
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
                      {comment.resolved ? "解決済" : comment.outdated ? "旧版" : "未解決"}
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
              <th className="w-24">作成者</th>
              <th className="w-36">日時</th>
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
                    <td className="text-center">{author?.user?.login ?? author?.name ?? "不明"}</td>
                    <td className={DATE_CELL_CLASS}>{formatGitHubDateTime(commit.commit.committedDate)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={commitsPager.currentPage}
          pageSize={PULL_REQUEST_DIFF_COMMITS_PAGE_SIZE}
          visibleCount={commits.length}
          totalCount={pullRequest?.commits?.totalCount}
          hasNextPage={pullRequest?.commits?.pageInfo.hasNextPage ?? false}
          isLoading={detailQuery.loading}
          onFirstPage={commitsPager.goToFirstPage}
          onPreviousPage={commitsPager.goToPreviousPage}
          onNextPage={() => commitsPager.goToNextPage(pullRequest?.commits?.pageInfo.endCursor)}
        />
      </Panel>

      <Panel title="GitHubで完全差分を開く">
        <div className="p-3 text-center">
          <a
            href={pullRequest?.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ tone: "primary", size: "lg", className: "inline-flex" })}
          >
            GitHubの差分を開く
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
