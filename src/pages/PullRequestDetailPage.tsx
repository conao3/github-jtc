import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

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
  type GitHubPullRequestDetail,
} from "../app/github.ts";
import {
  FLOW_STEP_META_CLASS,
  FLOW_STEP_NAME_CLASS,
  FLOW_STEP_NO_CLASS,
  FLOW_WRAP_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  buttonClassName,
  flowStepClassName,
} from "../app/styles.ts";

function getPullRequestState(pullRequest: GitHubPullRequestDetail): {
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

function getReviewState(
  review: NonNullable<NonNullable<NonNullable<GitHubPullRequestDetail["reviews"]>["nodes"]>[number]>,
): {
  readonly tone: "new" | "review" | "pending" | "done" | "rejected";
  readonly label: string;
} {
  switch (review.state) {
    case "APPROVED":
      return { tone: "done", label: "承認" };
    case "CHANGES_REQUESTED":
      return { tone: "rejected", label: "差戻し" };
    case "COMMENTED":
      return { tone: "review", label: "コメント" };
    case "DISMISSED":
      return { tone: "rejected", label: "却下" };
    case "PENDING":
      return { tone: "pending", label: "保留" };
    default:
      return { tone: "new", label: review.state };
  }
}

function getWorkflowSteps(pullRequest: GitHubPullRequestDetail) {
  const state = getPullRequestState(pullRequest);
  const latestReview = (pullRequest.reviews?.nodes ?? []).filter((review) => review !== null)[0] ?? null;
  const reviewRequestCount = pullRequest.reviewRequests?.totalCount ?? 0;

  return [
    {
      state: "done" as const,
      step: "STEP 1",
      title: "PR作成",
      meta: [
        `作成者：${pullRequest.author?.login ?? "unknown"}`,
        `作成日時：${formatGitHubDateTime(pullRequest.createdAt)}`,
      ],
      status: <JtcStatusTag tone="done">✓ 完了</JtcStatusTag>,
    },
    {
      state: reviewRequestCount > 0 ? ("done" as const) : ("current" as const),
      step: "STEP 2",
      title: "レビュー依頼",
      meta: [`依頼数：${reviewRequestCount}`, `コメント数：${pullRequest.comments.totalCount}`],
      status: (
        <JtcStatusTag tone={reviewRequestCount > 0 ? "done" : "pending"}>
          {reviewRequestCount > 0 ? "✓ 依頼済" : "依頼なし"}
        </JtcStatusTag>
      ),
    },
    {
      state:
        state.tone === "done"
          ? ("done" as const)
          : state.tone === "rejected" || state.tone === "review"
            ? ("current" as const)
            : ("future" as const),
      step: "STEP 3",
      title: "レビュー結果",
      meta: [
        `reviewDecision：${pullRequest.reviewDecision ?? "未判定"}`,
        `最新レビュー：${latestReview?.author?.login ?? "なし"}`,
      ],
      status: <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>,
    },
    {
      state: pullRequest.state === "MERGED" ? ("done" as const) : ("future" as const),
      step: "STEP 4",
      title: "マージ状態",
      meta: [`mergeable：${pullRequest.mergeable}`, `mergeStateStatus：${pullRequest.mergeStateStatus}`],
      status: (
        <JtcStatusTag tone={pullRequest.state === "MERGED" ? "done" : "required"}>
          {pullRequest.state === "MERGED" ? "✓ 完了" : "未マージ"}
        </JtcStatusTag>
      ),
    },
  ] as const;
}

export function PullRequestDetailScreen({
  prId = "conao3:github-jtc:1",
}: {
  readonly prId?: string;
}): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryScopedNumberRouteId(prId, sessionQuery.data?.user.login);
  const detailQuery = useQuery({
    queryKey: ["github", "pull-request-detail", coordinates?.owner, coordinates?.name, coordinates?.number],
    enabled: accessToken !== undefined && coordinates !== null,
    queryFn: () =>
      fetchGitHubPullRequestDetail(accessToken ?? "", {
        owner: coordinates?.owner ?? "",
        name: coordinates?.name ?? "",
        number: coordinates?.number ?? 0,
        filesFirst: 20,
        reviewsFirst: 10,
        threadsFirst: 20,
        commitsFirst: 10,
      }),
  });
  const pullRequest = detailQuery.data;
  const state = pullRequest === null || pullRequest === undefined ? null : getPullRequestState(pullRequest);
  const workflow = pullRequest === null || pullRequest === undefined ? [] : getWorkflowSteps(pullRequest);
  const files = (pullRequest?.files?.nodes ?? []).filter((file) => file !== null);
  const reviews = (pullRequest?.reviews?.nodes ?? []).filter((review) => review !== null);
  const closingIssues = (pullRequest?.closingIssuesReferences?.nodes ?? []).filter((issue) => issue !== null);
  const reviewerLabels = (pullRequest?.reviewRequests?.nodes ?? [])
    .filter((request) => request?.requestedReviewer !== null && request?.requestedReviewer !== undefined)
    .map((request) => {
      const reviewer = request?.requestedReviewer;

      switch (reviewer?.__typename) {
        case "User":
          return reviewer.login;
        case "Team":
          return reviewer.combinedSlug;
        case "Bot":
          return reviewer.login;
        case "Mannequin":
          return reviewer.login;
        default:
          return "unknown";
      }
    });

  return (
    <JtcChrome
      screenId="JTC-PR-003"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "プルリクエスト一覧", to: "/pull-requests" },
        { label: "プルリクエスト詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="プルリクエスト一覧"
      rightColumn={
        <>
          <Panel title="レビュー情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>reviewDecision</th>
                  <td>{pullRequest?.reviewDecision ?? "未判定"}</td>
                </tr>
                <tr>
                  <th>mergeable</th>
                  <td>{pullRequest?.mergeable ?? "UNKNOWN"}</td>
                </tr>
                <tr>
                  <th>レビュー依頼</th>
                  <td>{pullRequest?.reviewRequests?.totalCount ?? 0}</td>
                </tr>
                <tr>
                  <th>レビュー投稿</th>
                  <td>{pullRequest?.reviews?.totalCount ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="関連Issue" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {closingIssues.length === 0 ? (
                  <GitHubTableStateRow
                    colSpan={2}
                    tone="empty"
                    title="関連 Issue はありません。"
                    detail="closingIssuesReferences に紐づく Issue が見つかりません。"
                  />
                ) : (
                  closingIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className={MONO_CLASS}>#{issue.number}</td>
                      <td>{issue.title}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Panel>

          <Panel title="レビュー投稿一覧" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {reviews.length === 0 ? (
                <li className={TODO_LIST_ITEM_CLASS}>
                  <span>レビューなし</span>
                  <span className={clsx("text-xs", MONO_CLASS)}>0</span>
                </li>
              ) : (
                reviews.map((review) => {
                  const reviewState = getReviewState(review);

                  return (
                    <li key={review.id} className={TODO_LIST_ITEM_CLASS}>
                      <span>
                        <JtcStatusTag tone={reviewState.tone}>{reviewState.label}</JtcStatusTag>
                        <span className="ml-1">{review.author?.login ?? "unknown"}</span>
                      </span>
                      <span className={clsx("text-xs", MONO_CLASS)}>
                        {formatGitHubDateTime(review.submittedAt)}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>レビュー導線：</b>この画面は GitHub GraphQL の pull request
        詳細を表示しています。最終的な承認・マージ操作は
        <span className={TEXT_LINK_CLASS}> GitHub 本体 </span>
        で実施してください。
      </div>

      <Panel
        title={`プルリクエスト基本情報 ${coordinates?.number ?? "?"}`}
        action={
          <span className={MUTED_CLASS}>
            {pullRequest === undefined || pullRequest === null
              ? "GitHub から読込中..."
              : `更新日：${formatGitHubDateTime(pullRequest.updatedAt)}`}
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
          <div className="py-8 text-center text-slate-600">GitHub から PR 詳細を取得しています。</div>
        ) : detailQuery.isError ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(detailQuery.error, "PR 詳細の取得に失敗しました。")}
          />
        ) : pullRequest === null || pullRequest === undefined ? (
          <GitHubInlineState
            tone="empty"
            title="対象 PR を表示できません。"
            detail={`${coordinates.owner}/${coordinates.name} の PR #${coordinates.number} は存在しないか、現在の token では参照できません。`}
            className="py-8"
          />
        ) : (
          <table className={TABLE_CLASS}>
            <tbody>
              <tr>
                <th>
                  件名<span className="font-bold text-red-700">※</span>
                </th>
                <td colSpan={3}>
                  <b>{pullRequest.title}</b>
                </td>
              </tr>
              <tr>
                <th>リポジトリ</th>
                <td className={MONO_CLASS}>
                  {coordinates.owner}/{coordinates.name}
                </td>
                <th>状態</th>
                <td>
                  {state === null ? "－" : <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>}
                </td>
              </tr>
              <tr>
                <th>source</th>
                <td className={MONO_CLASS}>{pullRequest.headRefName}</td>
                <th>target</th>
                <td className={MONO_CLASS}>{pullRequest.baseRefName}</td>
              </tr>
              <tr>
                <th>作成者</th>
                <td>{pullRequest.author?.login ?? "unknown"}</td>
                <th>レビュー依頼先</th>
                <td>{reviewerLabels.length === 0 ? "なし" : reviewerLabels.join(" / ")}</td>
              </tr>
              <tr>
                <th>関連Issue</th>
                <td>
                  {closingIssues.length === 0
                    ? "なし"
                    : closingIssues.map((issue) => `#${issue.number}`).join(" / ")}
                </td>
                <th>mergeStateStatus</th>
                <td>{pullRequest.mergeStateStatus}</td>
              </tr>
              <tr>
                <th>コミット数</th>
                <td>{pullRequest.commits.totalCount}</td>
                <th>変更行数</th>
                <td className={MONO_CLASS}>
                  +{pullRequest.additions} / -{pullRequest.deletions}（{pullRequest.changedFiles}ファイル）
                </td>
              </tr>
              <tr>
                <th>mergeable</th>
                <td>{pullRequest.mergeable}</td>
                <th>コメント数</th>
                <td>{pullRequest.comments.totalCount}</td>
              </tr>
              <tr>
                <th>本文</th>
                <td colSpan={3} className="whitespace-pre-wrap">
                  {pullRequest.body && pullRequest.body.length > 0 ? pullRequest.body : "本文はありません。"}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="承認フロー（GitHub実データ派生）">
        <div className={FLOW_WRAP_CLASS}>
          {workflow.map((step) => (
            <div key={step.step} className={flowStepClassName(step.state)}>
              <div className={FLOW_STEP_NO_CLASS}>{step.step}</div>
              <div className={FLOW_STEP_NAME_CLASS}>{step.title}</div>
              <div className={FLOW_STEP_META_CLASS}>
                {step.meta.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <div className="mt-2">{step.status}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="変更ファイル一覧"
        action={
          <span className={MUTED_CLASS}>
            合計：{pullRequest?.files?.totalCount ?? 0}ファイル / +{pullRequest?.additions ?? 0} / -
            {pullRequest?.deletions ?? 0}
          </span>
        }
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th>ファイルパス</th>
              <th className="w-16">追加</th>
              <th className="w-16">削除</th>
              <th className="w-16">種別</th>
              <th className="w-20">閲覧状態</th>
              <th className="w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <GitHubTableStateRow
                colSpan={6}
                tone="empty"
                title="変更ファイルはありません。"
                detail="files connection が空です。差分がない PR か、取得対象外の可能性があります。"
              />
            ) : (
              files.map((file) => (
                <tr key={file.path}>
                  <td className={MONO_CLASS}>{file.path}</td>
                  <td className="text-right text-green-700">+{file.additions}</td>
                  <td className="text-right text-red-700">-{file.deletions}</td>
                  <td className="text-center">{file.changeType}</td>
                  <td className="text-center">
                    <JtcStatusTag tone={file.viewerViewedState === "VIEWED" ? "done" : "confirmed"}>
                      {file.viewerViewedState === "VIEWED" ? "確認済" : "未確認"}
                    </JtcStatusTag>
                  </td>
                  <td className="text-center">
                    <Link to={`/pull-requests/${prId}/diff`} className={TEXT_LINK_CLASS}>
                      差分
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>

      <Panel
        title="レビューコメント（投稿順）"
        action={<span className={MUTED_CLASS}>{reviews.length}件</span>}
      >
        <div className="space-y-1.5 bg-slate-50 p-0.5">
          {reviews.length === 0 ? (
            <GitHubInlineState
              tone="empty"
              title="レビュー投稿はまだありません。"
              detail="reviews connection に投稿がありません。"
              className="border border-slate-300 bg-white p-3 text-xs"
            />
          ) : (
            reviews.map((review) => {
              const reviewState = getReviewState(review);

              return (
                <div key={review.id} className="border border-slate-300 bg-white p-2 text-xs">
                  <div className="mb-1 font-bold text-blue-900">
                    ● {review.author?.login ?? "unknown"}
                    <span className={clsx("ml-2 text-xs font-normal text-slate-600", MONO_CLASS)}>
                      {formatGitHubDateTime(review.submittedAt)}
                    </span>
                    <span className="ml-2">
                      <JtcStatusTag tone={reviewState.tone}>{reviewState.label}</JtcStatusTag>
                    </span>
                  </div>
                  <div>{review.body && review.body.length > 0 ? review.body : "本文なし"}</div>
                </div>
              );
            })
          )}
        </div>
      </Panel>

      <Panel title="GitHub操作">
        <div className="p-3 text-center">
          <div className="mb-2 text-xs text-slate-600">
            最終的なレビュー操作は GitHub 本体で行ってください。GraphQL では表示を担当し、mutation
            は未接続です。
          </div>
          <a
            href={pullRequest?.url}
            target="_blank"
            rel="noreferrer"
            className={buttonClassName({ tone: "primary", size: "lg", className: "inline-flex" })}
          >
            GitHubでレビュー
          </a>
          <span className="px-1" />
          <Link
            to={`/pull-requests/${prId}/diff`}
            className={buttonClassName({ size: "lg", className: "inline-flex" })}
          >
            差分表示
          </Link>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestDetailPage(): JSX.Element {
  const { prId } = useParams();

  return <PullRequestDetailScreen prId={prId ?? "conao3:github-jtc:1"} />;
}
