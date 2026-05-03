import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { Link, useParams } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryScopedNumberRouteId,
  describeGitHubError,
  formatGitHubDateTime,
  formatGitHubFileChangeType,
  formatGitHubMergeableState,
  formatGitHubMergeStateStatus,
  formatGitHubReviewDecision,
  parseRepositoryScopedNumberRouteId,
  type GitHubPullRequestDetail,
} from "../app/github.ts";
import {
  PullRequestCommentsDocument,
  PullRequestClosingIssuesDocument,
  PullRequestDetailDocument,
  PullRequestFilesDocument,
} from "../gql/graphql.ts";
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

const PULL_REQUEST_DETAIL_FILES_PAGE_SIZE = 20;
const PULL_REQUEST_DETAIL_CLOSING_ISSUES_PAGE_SIZE = 5;
const PULL_REQUEST_DETAIL_COMMENTS_PAGE_SIZE = 10;

function renderUserAvatar(
  login: string | null | undefined,
  avatarUrl: string | null | undefined,
  sizeClassName = "size-8",
): JSX.Element {
  if (avatarUrl === null || avatarUrl === undefined || avatarUrl.length === 0) {
    return (
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-sm border border-slate-400 bg-slate-200 text-xs font-bold text-slate-600",
          sizeClassName,
        )}
        aria-hidden="true"
      >
        人
      </span>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`${login ?? "不明"} のアイコン`}
      className={clsx("rounded-sm border border-slate-400 object-cover", sizeClassName)}
    />
  );
}

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
      title: "プルリクエスト作成",
      meta: [
        `作成者：${pullRequest.author?.login ?? "不明"}`,
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
        `レビュー判定：${formatGitHubReviewDecision(pullRequest.reviewDecision)}`,
        `最新レビュー：${latestReview?.author?.login ?? "なし"}`,
      ],
      status: <JtcStatusTag tone={state.tone}>{state.label}</JtcStatusTag>,
    },
    {
      state: pullRequest.state === "MERGED" ? ("done" as const) : ("future" as const),
      step: "STEP 4",
      title: "マージ状態",
      meta: [
        `マージ可否：${formatGitHubMergeableState(pullRequest.mergeable)}`,
        `マージ状態：${formatGitHubMergeStateStatus(pullRequest.mergeStateStatus)}`,
      ],
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
  const filesPager = useCursorPagerState();
  const closingIssuesPager = useCursorPagerState();
  const commentsPager = useCursorPagerState();
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const coordinates = parseRepositoryScopedNumberRouteId(prId, sessionQuery.data?.user.login);
  const detailQuery = useQuery(PullRequestDetailDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      reviewsFirst: 10,
      threadsFirst: 20,
    },
    fetchPolicy: "network-only",
  });
  const filesQuery = useQuery(PullRequestFilesDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      filesFirst: PULL_REQUEST_DETAIL_FILES_PAGE_SIZE,
      filesAfter: filesPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const closingIssuesQuery = useQuery(PullRequestClosingIssuesDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      first: PULL_REQUEST_DETAIL_CLOSING_ISSUES_PAGE_SIZE,
      after: closingIssuesPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const commentsQuery = useQuery(PullRequestCommentsDocument, {
    skip: accessToken === undefined || coordinates === null,
    variables: {
      owner: coordinates?.owner ?? "",
      name: coordinates?.name ?? "",
      number: coordinates?.number ?? 0,
      first: PULL_REQUEST_DETAIL_COMMENTS_PAGE_SIZE,
      after: commentsPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const pullRequest =
    detailQuery.data?.repository?.pullRequest ?? detailQuery.previousData?.repository?.pullRequest;
  const state = pullRequest === null || pullRequest === undefined ? null : getPullRequestState(pullRequest);
  const workflow = pullRequest === null || pullRequest === undefined ? [] : getWorkflowSteps(pullRequest);
  const filesConnection =
    filesQuery.data?.repository?.pullRequest?.files ??
    filesQuery.previousData?.repository?.pullRequest?.files;
  const closingIssuesConnection =
    closingIssuesQuery.data?.repository?.pullRequest?.closingIssuesReferences ??
    closingIssuesQuery.previousData?.repository?.pullRequest?.closingIssuesReferences;
  const commentsConnection =
    commentsQuery.data?.repository?.pullRequest?.comments ??
    commentsQuery.previousData?.repository?.pullRequest?.comments;
  const files = (filesConnection?.nodes ?? []).filter((file) => file !== null);
  const reviews = (pullRequest?.reviews?.nodes ?? []).filter((review) => review !== null);
  const closingIssues = (closingIssuesConnection?.nodes ?? []).filter((issue) => issue !== null);
  const comments = (commentsConnection?.nodes ?? []).filter((comment) => comment !== null);
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
          return "不明";
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
                  <th>レビュー判定</th>
                  <td>{formatGitHubReviewDecision(pullRequest?.reviewDecision)}</td>
                </tr>
                <tr>
                  <th>マージ可否</th>
                  <td>{formatGitHubMergeableState(pullRequest?.mergeable)}</td>
                </tr>
                <tr>
                  <th>レビュー依頼</th>
                  <td>{pullRequest?.reviewRequests?.totalCount ?? 0}</td>
                </tr>
                <tr>
                  <th>本文コメント</th>
                  <td>{pullRequest?.comments.totalCount ?? 0}</td>
                </tr>
                <tr>
                  <th>レビュー投稿</th>
                  <td>{pullRequest?.reviews?.totalCount ?? 0}</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="関連チケット" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {closingIssues.length === 0 ? (
                  closingIssuesQuery.loading ? (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="empty"
                      title="関連チケットを取得しています。"
                      detail="GitHub から関連チケット一覧を読み込んでいます。"
                    />
                  ) : closingIssuesQuery.error ? (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="error"
                      {...describeGitHubError(closingIssuesQuery.error, "関連チケットの取得に失敗しました。")}
                    />
                  ) : (
                    <GitHubTableStateRow
                      colSpan={2}
                      tone="empty"
                      title="関連チケットはありません。"
                      detail="closingIssuesReferences に紐づくチケットが見つかりません。"
                    />
                  )
                ) : (
                  closingIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className={MONO_CLASS}>#{issue.number}</td>
                      <td>
                        {coordinates === null ? (
                          issue.title
                        ) : (
                          <Link
                            to={`/issues/${createRepositoryScopedNumberRouteId({
                              owner: coordinates.owner,
                              name: coordinates.name,
                              number: issue.number,
                            })}`}
                            className={TEXT_LINK_CLASS}
                          >
                            {issue.title}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <CursorPager
              currentPage={closingIssuesPager.currentPage}
              pageSize={PULL_REQUEST_DETAIL_CLOSING_ISSUES_PAGE_SIZE}
              visibleCount={closingIssues.length}
              totalCount={
                closingIssuesConnection?.totalCount ?? pullRequest?.closingIssuesReferences?.totalCount
              }
              hasNextPage={closingIssuesConnection?.pageInfo.hasNextPage ?? false}
              isLoading={closingIssuesQuery.loading}
              onFirstPage={closingIssuesPager.goToFirstPage}
              onPreviousPage={closingIssuesPager.goToPreviousPage}
              onNextPage={() => closingIssuesPager.goToNextPage(closingIssuesConnection?.pageInfo.endCursor)}
            />
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
                      <span className="inline-flex items-center gap-1">
                        {renderUserAvatar(review.author?.login, review.author?.avatarUrl, "size-6")}
                        <JtcStatusTag tone={reviewState.tone}>{reviewState.label}</JtcStatusTag>
                        <span>{review.author?.login ?? "不明"}</span>
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
        <b>レビュー導線：</b>この画面は GitHub GraphQL のプルリクエスト
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
            title="プルリクエスト識別子を解釈できませんでした。"
            detail="一覧画面から対象プルリクエストを選び直してください。"
            className="py-8"
          />
        ) : detailQuery.loading && pullRequest == null ? (
          <div className="py-8 text-center text-slate-600">
            GitHub からプルリクエスト詳細を取得しています。
          </div>
        ) : detailQuery.error ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(detailQuery.error, "プルリクエスト詳細の取得に失敗しました。")}
          />
        ) : pullRequest === null || pullRequest === undefined ? (
          <GitHubInlineState
            tone="empty"
            title="対象プルリクエストを表示できません。"
            detail={`${coordinates.owner}/${coordinates.name} のプルリクエスト #${coordinates.number} は存在しないか、現在のトークンでは参照できません。`}
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
                <th>変更元</th>
                <td className={MONO_CLASS}>{pullRequest.headRefName}</td>
                <th>変更先</th>
                <td className={MONO_CLASS}>{pullRequest.baseRefName}</td>
              </tr>
              <tr>
                <th>作成者</th>
                <td>{pullRequest.author?.login ?? "不明"}</td>
                <th>レビュー依頼先</th>
                <td>{reviewerLabels.length === 0 ? "なし" : reviewerLabels.join(" / ")}</td>
              </tr>
              <tr>
                <th>関連チケット</th>
                <td>
                  {(pullRequest.closingIssuesReferences?.totalCount ?? 0) === 0
                    ? "なし"
                    : `${pullRequest.closingIssuesReferences?.totalCount ?? 0}件`}
                </td>
                <th>マージ状態</th>
                <td>{formatGitHubMergeStateStatus(pullRequest.mergeStateStatus)}</td>
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
                <th>マージ可否</th>
                <td>{formatGitHubMergeableState(pullRequest.mergeable)}</td>
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
            合計：{filesConnection?.totalCount ?? pullRequest?.changedFiles ?? 0}ファイル / +
            {pullRequest?.additions ?? 0} / -{pullRequest?.deletions ?? 0}
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
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              filesQuery.loading ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="変更ファイル一覧を取得しています。"
                  detail="GitHub から変更ファイル一覧を読み込んでいます。"
                />
              ) : filesQuery.error ? (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="error"
                  {...describeGitHubError(filesQuery.error, "変更ファイル一覧の取得に失敗しました。")}
                />
              ) : (
                <GitHubTableStateRow
                  colSpan={5}
                  tone="empty"
                  title="変更ファイルはありません。"
                  detail="変更ファイル一覧が空です。差分がないプルリクエストか、取得対象外の可能性があります。"
                />
              )
            ) : (
              files.map((file) => (
                <tr key={file.path}>
                  <td className={MONO_CLASS}>
                    <Link
                      to={`/pull-requests/${prId}/diff?file=${encodeURIComponent(file.path)}`}
                      className={TEXT_LINK_CLASS}
                    >
                      {file.path}
                    </Link>
                  </td>
                  <td className="text-right text-green-700">+{file.additions}</td>
                  <td className="text-right text-red-700">-{file.deletions}</td>
                  <td className="text-center">{formatGitHubFileChangeType(file.changeType)}</td>
                  <td className="text-center">
                    <JtcStatusTag tone={file.viewerViewedState === "VIEWED" ? "done" : "confirmed"}>
                      {file.viewerViewedState === "VIEWED" ? "確認済" : "未確認"}
                    </JtcStatusTag>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <CursorPager
          currentPage={filesPager.currentPage}
          pageSize={PULL_REQUEST_DETAIL_FILES_PAGE_SIZE}
          visibleCount={files.length}
          totalCount={filesConnection?.totalCount}
          hasNextPage={filesConnection?.pageInfo.hasNextPage ?? false}
          isLoading={filesQuery.loading}
          onFirstPage={filesPager.goToFirstPage}
          onPreviousPage={filesPager.goToPreviousPage}
          onNextPage={() => filesPager.goToNextPage(filesConnection?.pageInfo.endCursor)}
        />
      </Panel>

      <Panel
        title="本文コメント（投稿順）"
        action={
          <span className={MUTED_CLASS}>
            {commentsConnection?.totalCount ?? pullRequest?.comments.totalCount ?? 0}件
          </span>
        }
      >
        <div className="space-y-1.5 bg-slate-50 p-0.5">
          {comments.length === 0 ? (
            commentsQuery.loading ? (
              <div className="border border-slate-300 bg-white p-3 text-xs text-slate-600">
                GitHub から本文コメントを取得しています。
              </div>
            ) : commentsQuery.error ? (
              <GitHubInlineState
                tone="error"
                title="本文コメントの取得に失敗しました。"
                detail={
                  describeGitHubError(commentsQuery.error, "GitHub からコメントを再取得してください。").detail
                }
                className="border border-slate-300 bg-white p-3 text-xs"
              />
            ) : (
              <GitHubInlineState
                tone="empty"
                title="本文コメントはまだありません。"
                detail="pullRequest.comments に投稿がありません。"
                className="border border-slate-300 bg-white p-3 text-xs"
              />
            )
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-slate-300 bg-white p-2 text-xs">
                <div className="mb-1 flex items-start gap-2">
                  {renderUserAvatar(comment.author?.login, comment.author?.avatarUrl)}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-blue-900">{comment.author?.login ?? "不明"}</div>
                    <div className={clsx("text-xs font-normal text-slate-600", MONO_CLASS)}>
                      {formatGitHubDateTime(comment.publishedAt)}
                    </div>
                  </div>
                </div>
                <div className="whitespace-pre-wrap">
                  {comment.bodyText.trim().length > 0 ? comment.bodyText : "本文なし"}
                </div>
                <div className="mt-2 text-right">
                  <a href={comment.url} target="_blank" rel="noreferrer" className={TEXT_LINK_CLASS}>
                    GitHubで開く
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
        <CursorPager
          currentPage={commentsPager.currentPage}
          pageSize={PULL_REQUEST_DETAIL_COMMENTS_PAGE_SIZE}
          visibleCount={comments.length}
          totalCount={commentsConnection?.totalCount ?? pullRequest?.comments.totalCount}
          hasNextPage={commentsConnection?.pageInfo.hasNextPage ?? false}
          isLoading={commentsQuery.loading}
          onFirstPage={commentsPager.goToFirstPage}
          onPreviousPage={commentsPager.goToPreviousPage}
          onNextPage={() => commentsPager.goToNextPage(commentsConnection?.pageInfo.endCursor)}
        />
      </Panel>

      <Panel title="レビュー投稿（投稿順）" action={<span className={MUTED_CLASS}>{reviews.length}件</span>}>
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
                  <div className="mb-1 flex items-start gap-2">
                    {renderUserAvatar(review.author?.login, review.author?.avatarUrl)}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-blue-900">{review.author?.login ?? "不明"}</div>
                      <div className={clsx("text-xs font-normal text-slate-600", MONO_CLASS)}>
                        {formatGitHubDateTime(review.submittedAt)}
                      </div>
                    </div>
                    <span className="pt-0.5">
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
            最終的なレビュー操作は GitHub 本体で行ってください。GraphQL
            では表示のみ対応し、更新操作は未接続です。
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
