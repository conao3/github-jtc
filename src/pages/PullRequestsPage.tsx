import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryScopedNumberRouteId,
  fetchGitHubViewerPullRequests,
  formatGitHubDateTime,
  type GitHubViewerPullRequest,
} from "../app/github.ts";
import {
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const PAGE_SIZE = 10;

function getPullRequestState(pullRequest: GitHubViewerPullRequest): {
  readonly tone: "new" | "review" | "pending" | "done" | "rejected";
  readonly label: string;
} {
  if (pullRequest.isDraft) {
    return { tone: "new", label: "下書き" };
  }

  if (pullRequest.state === "MERGED") {
    return { tone: "done", label: "マージ済" };
  }

  if (pullRequest.state === "CLOSED") {
    return { tone: "rejected", label: "クローズ" };
  }

  switch (pullRequest.reviewDecision) {
    case "APPROVED":
      return { tone: "done", label: "承認済" };
    case "CHANGES_REQUESTED":
      return { tone: "rejected", label: "差戻し" };
    case "REVIEW_REQUIRED":
      return { tone: "review", label: "レビュー中" };
    default:
      return { tone: "pending", label: "オープン" };
  }
}

function getPullRequestDelta(pullRequest: GitHubViewerPullRequest): string {
  return `${pullRequest.changedFiles}ファイル / +${pullRequest.additions} -${pullRequest.deletions}`;
}

export function PullRequestsScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const pullRequestsQuery = useQuery({
    queryKey: ["github", "viewer-pull-requests", PAGE_SIZE],
    enabled: accessToken !== undefined,
    queryFn: () =>
      fetchGitHubViewerPullRequests(accessToken ?? "", {
        first: PAGE_SIZE,
        after: null,
        states: ["OPEN", "MERGED", "CLOSED"],
      }),
  });
  const pullRequests = (pullRequestsQuery.data?.nodes ?? []).filter((value) => value !== null);
  const openCount = pullRequests.filter((pullRequest) => pullRequest.state === "OPEN").length;
  const mergedCount = pullRequests.filter((pullRequest) => pullRequest.state === "MERGED").length;
  const closedCount = pullRequests.filter((pullRequest) => pullRequest.state === "CLOSED").length;
  const draftCount = pullRequests.filter((pullRequest) => pullRequest.isDraft).length;

  return (
    <JtcChrome
      screenId="JTC-PR-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "プルリクエスト一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="プルリクエスト一覧"
      rightColumn={
        <>
          <Panel title="レビュー状況" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["Open", `${openCount}件`],
                ["Merged", `${mergedCount}件`],
                ["Closed", `${closedCount}件`],
                ["Draft", `${draftCount}件`],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-blue-900">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="よく使う操作">
            <div className="flex flex-col gap-1">
              <a
                href="https://github.com/pulls"
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ tone: "primary", className: "inline-flex justify-center" })}
              >
                GitHubでPR作成
              </a>
              <button type="button" className={buttonClassName()}>
                Openのみ表示
              </button>
              <button type="button" className={buttonClassName()}>
                CSV出力
              </button>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel title="照会条件" bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <label>PR番号/件名</label>
          <input className="border border-slate-400 px-1.5 py-0.5" placeholder="github-jtc #1" />
          <label>状態</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>──全て──</option>
            <option>Open</option>
            <option>Merged</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>
          <label>リポジトリ</label>
          <input className="border border-slate-400 px-1.5 py-0.5" placeholder="owner/repo" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()}>
            クリア
          </button>
        </div>
      </Panel>

      <Panel
        title="対象PR一覧"
        action={
          <span className={MUTED_CLASS}>
            {pullRequestsQuery.isPending
              ? "GitHub から読込中..."
              : `viewer.pullRequests ${pullRequestsQuery.data?.totalCount ?? pullRequests.length}件`}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-24">PR</th>
              <th>件名</th>
              <th className="w-32">リポジトリ</th>
              <th className="w-16">状態</th>
              <th className="w-24">更新日時</th>
              <th className="w-20">変更</th>
              <th className="w-16">コメント</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {pullRequestsQuery.isPending ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  GitHub から PR 一覧を取得しています。
                </td>
              </tr>
            ) : pullRequestsQuery.isError ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-red-800">
                  {pullRequestsQuery.error instanceof Error
                    ? pullRequestsQuery.error.message
                    : "PR 一覧の取得に失敗しました。"}
                </td>
              </tr>
            ) : pullRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-600">
                  viewer に紐づく PR はありません。
                </td>
              </tr>
            ) : (
              pullRequests.map((pullRequest) => {
                const state = getPullRequestState(pullRequest);
                const routeId = createRepositoryScopedNumberRouteId({
                  owner: pullRequest.repository.owner.login,
                  name: pullRequest.repository.name,
                  number: pullRequest.number,
                });

                return (
                  <tr key={pullRequest.id}>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <Link to={`/pull-requests/${routeId}`} className="text-blue-900 underline">
                        #{pullRequest.number}
                      </Link>
                    </td>
                    <td>
                      <div className="font-bold">{pullRequest.title}</div>
                      <div className={clsx("text-xs text-slate-600", MONO_CLASS)}>
                        author: {pullRequest.author?.login ?? "unknown"}
                      </div>
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {pullRequest.repository.nameWithOwner}
                    </td>
                    <td className="text-center">
                      <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      {formatGitHubDateTime(pullRequest.updatedAt)}
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>{getPullRequestDelta(pullRequest)}</td>
                    <td className={clsx("text-center", MONO_CLASS)}>{pullRequest.comments.totalCount}</td>
                    <td className="text-center">
                      <a
                        href={pullRequest.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-900 underline"
                      >
                        GitHub
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestsPage(): JSX.Element {
  return <PullRequestsScreen />;
}
