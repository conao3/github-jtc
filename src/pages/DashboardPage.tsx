import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { Link } from "react-router-dom";

import { useAuthSession } from "../app/auth.tsx";
import { CursorPager, useCursorPagerState } from "../app/components/CursorPager.tsx";
import { GitHubInlineState, GitHubTableStateRow } from "../app/components/GitHubQueryState.tsx";
import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  createRepositoryPath,
  createRepositoryScopedNumberRouteId,
  describeGitHubError,
  formatGitHubDateTime,
  formatJapaneseEraDateTime,
} from "../app/github.ts";
import {
  DashboardDocument,
  DashboardRecentRepositoriesDocument,
  type DashboardQuery,
  type DashboardRecentRepositoriesQuery,
} from "../gql/graphql.ts";
import {
  DATE_CELL_CLASS,
  FLOW_STEP_META_CLASS,
  FLOW_STEP_NAME_CLASS,
  FLOW_STEP_NO_CLASS,
  FLOW_WRAP_CLASS,
  KPI_CARD_CLASS,
  KPI_DELTA_CLASS,
  KPI_LABEL_CLASS,
  KPI_ROW_CLASS,
  KPI_UNIT_CLASS,
  KPI_VALUE_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  SHORTCUT_CLASS,
  SHORTCUT_GRID_CLASS,
  SHORTCUT_ICON_CLASS,
  TABLE_CLASS,
  TABS_ROW_CLASS,
  TAB_ACTIVE_CLASS,
  TAB_BADGE_CLASS,
  TAB_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  flowStepClassName,
} from "../app/styles.ts";

const noticeRows = [
  [
    "重要",
    "【重要】システムメンテナンスに伴うサービス停止について（R8/05/15 22:00～翌2:00）",
    "R8/05/02 09:00",
    "R8/05/16 18:00",
    "運用統括部",
    "📎",
  ],
  [
    "重要",
    "【再通知】パスワード定期変更のお願い（6月30日まで）",
    "R8/04/27 17:30",
    "R8/06/30 23:59",
    "情報セキュリティ部",
    "📎",
  ],
  [
    "障害",
    "【障害】一部リポジトリの検索機能が利用できない事象について（暫定対応中）",
    "R8/05/02 08:15",
    "R8/05/05 12:00",
    "運用統括部",
    "－",
  ],
  [
    "お知らせ",
    "バージョンアップのお知らせ（JTC GitHub 5.3.0 リリース予定）",
    "R8/05/01 14:00",
    "R8/06/15 18:00",
    "企画推進部",
    "📎",
  ],
  [
    "運用",
    "Git操作における注意事項について（強制プッシュ禁止の徹底）",
    "R8/04/30 11:20",
    "R8/06/30 23:59",
    "運用統括部",
    "📎",
  ],
  [
    "再通知",
    "第二四半期 セキュリティ研修（必須）受講のお願い",
    "R8/04/28 10:00",
    "R8/05/30 23:59",
    "人材開発部",
    "📎",
  ],
] as const;

const flowSteps = [
  {
    state: "done" as const,
    step: "STEP 1",
    title: "変更登録",
    meta: ["担当：山田 太郎", "登録日：R8/04/28 08:30"],
    status: <JtcStatusTag tone="done">✓ 完了</JtcStatusTag>,
  },
  {
    state: "done" as const,
    step: "STEP 2",
    title: "課長承認",
    meta: ["承認者：佐藤 課長", "承認日：R8/04/29 10:15"],
    status: <JtcStatusTag tone="done">✓ 完了</JtcStatusTag>,
  },
  {
    state: "current" as const,
    step: "STEP 3",
    title: "品質保証部レビュー",
    meta: ["担当：品質保証部", "状態：レビュー中", "期限：R8/05/03 18:00"],
    status: <JtcStatusTag tone="inProgress">▶ 対応中</JtcStatusTag>,
  },
  {
    state: "future" as const,
    step: "STEP 4",
    title: "セキュリティ確認",
    meta: ["担当：セキュリティ室", "状態：未着手"],
    status: <JtcStatusTag tone="required">申請必要</JtcStatusTag>,
  },
  {
    state: "future" as const,
    step: "STEP 5",
    title: "部長承認",
    meta: ["担当：田中 部長", "状態：未着手"],
    status: <JtcStatusTag tone="required">申請必要</JtcStatusTag>,
  },
  {
    state: "future" as const,
    step: "STEP 6",
    title: "リリース承認",
    meta: ["担当：リリース管理委員会", "状態：未着手"],
    status: <JtcStatusTag tone="required">申請必要</JtcStatusTag>,
  },
] as const;

const shortcuts = [
  ["変", "変更登録"],
  ["プ", "プルリクエスト作成"],
  ["課", "チケット作成"],
  ["🔍", "リポジトリ検索"],
  ["人", "ユーザー検索"],
  ["📖", "操作マニュアル"],
] as const;

type ReviewRequestNode = Extract<
  NonNullable<NonNullable<DashboardQuery["reviewRequests"]["nodes"]>[number]>,
  { __typename: "PullRequest" }
>;

type AssignedIssueNode = Extract<
  NonNullable<NonNullable<DashboardQuery["issueAssignments"]["nodes"]>[number]>,
  { __typename: "Issue" }
>;

type RecentRepositoryNode = NonNullable<
  NonNullable<DashboardRecentRepositoriesQuery["viewer"]["repositories"]["nodes"]>[number]
>;

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getDashboardQueryRange(): { readonly from: string; readonly to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function getReviewRequestNodes(
  nodes: DashboardQuery["reviewRequests"]["nodes"] | null | undefined,
): ReviewRequestNode[] {
  return (nodes ?? []).filter((node): node is ReviewRequestNode => node?.__typename === "PullRequest");
}

function getAssignedIssueNodes(
  nodes: DashboardQuery["issueAssignments"]["nodes"] | null | undefined,
): AssignedIssueNode[] {
  return (nodes ?? []).filter((node): node is AssignedIssueNode => node?.__typename === "Issue");
}

function getReviewDecisionTag(decision: ReviewRequestNode["reviewDecision"]): {
  readonly tone: "pending" | "review" | "done" | "rejected";
  readonly label: string;
} {
  switch (decision) {
    case "APPROVED":
      return { tone: "done", label: "承認済" };
    case "CHANGES_REQUESTED":
      return { tone: "rejected", label: "差戻し" };
    case "REVIEW_REQUIRED":
      return { tone: "review", label: "要レビュー" };
    default:
      return { tone: "pending", label: "依頼中" };
  }
}

function getIssueStateTag(state: AssignedIssueNode["state"]): {
  readonly tone: "new" | "inProgress" | "confirmed";
  readonly label: string;
} {
  switch (state) {
    case "OPEN":
      return { tone: "inProgress", label: "オープン" };
    case "CLOSED":
      return { tone: "confirmed", label: "クローズ" };
    default:
      return { tone: "new", label: state };
  }
}

function NoticeTag({ label }: { label: string }): JSX.Element {
  const tone =
    label === "重要"
      ? "border-red-500 bg-red-100 text-red-800"
      : label === "障害"
        ? "border-red-500 bg-red-100 text-red-800"
        : label === "運用"
          ? "border-blue-400 bg-blue-100 text-blue-900"
          : "border-slate-400 bg-slate-100 text-slate-600";

  return (
    <span className={clsx("inline-flex min-w-12 justify-center border px-1 py-px text-xs font-bold", tone)}>
      {label}
    </span>
  );
}

function SideList({ children }: { readonly children: React.ReactNode }): JSX.Element {
  return <div className="divide-y divide-slate-300">{children}</div>;
}

export function DashboardScreen(): JSX.Element {
  const sessionQuery = useAuthSession();
  const accessToken = sessionQuery.data?.accessToken;
  const viewerLogin = sessionQuery.data?.user.login ?? "";
  const recentRepositoriesPager = useCursorPagerState();
  const range = getDashboardQueryRange();
  const dashboardQuery = useQuery(DashboardDocument, {
    skip: accessToken === undefined || viewerLogin.length === 0,
    variables: {
      from: range.from,
      to: range.to,
      todoFirst: 5,
      reviewRequestQuery: `is:open is:pr archived:false review-requested:${viewerLogin} sort:updated-desc`,
      issueAssignmentQuery: `is:open is:issue archived:false assignee:${viewerLogin} sort:updated-desc`,
      authoredPrQuery: `is:open is:pr archived:false author:${viewerLogin} sort:updated-desc`,
    },
    fetchPolicy: "network-only",
  });
  const recentRepositoriesQuery = useQuery(DashboardRecentRepositoriesDocument, {
    skip: accessToken === undefined || viewerLogin.length === 0,
    variables: {
      first: 6,
      after: recentRepositoriesPager.currentCursor,
    },
    fetchPolicy: "network-only",
  });
  const dashboard = dashboardQuery.data ?? dashboardQuery.previousData;
  const isDashboardInitialLoading = dashboardQuery.loading && dashboard === undefined;
  const reviewRequests = getReviewRequestNodes(dashboard?.reviewRequests?.nodes);
  const assignedIssues = getAssignedIssueNodes(dashboard?.issueAssignments?.nodes);
  const recentRepositoriesPayload = recentRepositoriesQuery.data ?? recentRepositoriesQuery.previousData;
  const recentRepositories = (recentRepositoriesPayload?.viewer.repositories.nodes ?? []).filter(isPresent);
  const repositoriesConnection = recentRepositoriesPayload?.viewer.repositories;
  const isKpiPending = dashboard === undefined && dashboardQuery.loading;
  const kpis = [
    {
      label: "担当リポジトリ数",
      value: isKpiPending ? "-" : String(dashboard?.viewer.repositoryCount.totalCount ?? 0),
      note: "利用可能リポジトリ参照",
    },
    {
      label: "直近30日コミット",
      value: isKpiPending
        ? "-"
        : String(dashboard?.viewer.contributionsCollection.totalCommitContributions ?? 0),
      note: "直近30日集計",
    },
    {
      label: "レビュー依頼中プルリクエスト",
      value: isKpiPending ? "-" : String(dashboard?.reviewRequests.issueCount ?? 0),
      note: "レビュー依頼検索",
    },
    {
      label: "自分担当チケット",
      value: isKpiPending ? "-" : String(dashboard?.issueAssignments.issueCount ?? 0),
      note: "担当者検索",
    },
  ] as const;
  const todoItems = [
    ["レビュー依頼中", `${dashboard?.reviewRequests.issueCount ?? 0} 件`],
    ["自分担当チケット", `${dashboard?.issueAssignments.issueCount ?? 0} 件`],
    ["自分が開いているプルリクエスト", `${dashboard?.authoredPullRequests.issueCount ?? 0} 件`],
    ["最近更新したリポジトリ", `${recentRepositories.length} 件`],
    [
      "直近30日レビュー",
      `${dashboard?.viewer.contributionsCollection.totalPullRequestReviewContributions ?? 0} 件`,
    ],
    ["直近30日チケット", `${dashboard?.viewer.contributionsCollection.totalIssueContributions ?? 0} 件`],
  ] as const;

  return (
    <JtcChrome
      screenId="JTC-PRT-001"
      crumbs={[{ label: "ポータル", to: "/" }, { label: "ポータル画面（ダッシュボード）" }]}
      activeTopMenu="ポータル"
      activeSideItem="ダッシュボード"
      rightColumn={
        <>
          <Panel title="クイックショートカット" bodyClassName="p-0">
            <div className={SHORTCUT_GRID_CLASS}>
              {shortcuts.map(([icon, label]) => (
                <div key={label} className={SHORTCUT_CLASS}>
                  <span className={SHORTCUT_ICON_CLASS}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="GitHub 未処理一覧" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {todoItems.map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className={clsx("font-bold", value === "0 件" ? "text-slate-500" : "text-blue-900")}>
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="レビュー依頼中プルリクエスト" bodyClassName="p-0">
            {isDashboardInitialLoading ? (
              <div className="px-2 py-3 text-xs text-slate-600">GitHub から読込中です。</div>
            ) : dashboardQuery.error ? (
              <GitHubInlineState
                tone="error"
                className="px-2 py-3 text-xs"
                {...describeGitHubError(dashboardQuery.error, "レビュー依頼一覧を取得できませんでした。")}
              />
            ) : reviewRequests.length === 0 ? (
              <GitHubInlineState
                tone="empty"
                title="レビュー依頼中のプルリクエストはありません。"
                detail="レビュー依頼検索にオープン中のプルリクエストがありません。"
                className="px-2 py-3 text-xs"
              />
            ) : (
              <SideList>
                {reviewRequests.map((pullRequest) => {
                  const status = getReviewDecisionTag(pullRequest.reviewDecision);

                  return (
                    <div key={pullRequest.id} className="space-y-1 px-2 py-2 text-xs">
                      <div className="font-bold">
                        <Link
                          to={`/pull-requests/${createRepositoryScopedNumberRouteId(
                            `${pullRequest.repository.nameWithOwner}/${pullRequest.number}`,
                          )}`}
                          className={TEXT_LINK_CLASS}
                        >
                          プルリクエスト #{pullRequest.number}
                        </Link>
                      </div>
                      <div>
                        <Link
                          to={`/pull-requests/${createRepositoryScopedNumberRouteId(
                            `${pullRequest.repository.nameWithOwner}/${pullRequest.number}`,
                          )}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {pullRequest.title}
                        </Link>
                      </div>
                      <div className={MONO_CLASS}>
                        <Link
                          to={`/repositories/${createRepositoryPath(pullRequest.repository.nameWithOwner)}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {pullRequest.repository.nameWithOwner}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <JtcStatusTag tone={status.tone}>{status.label}</JtcStatusTag>
                        <span className={clsx("text-slate-600", MONO_CLASS)}>
                          {formatGitHubDateTime(pullRequest.updatedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </SideList>
            )}
          </Panel>

          <Panel title="自分の担当チケット" bodyClassName="p-0">
            {isDashboardInitialLoading ? (
              <div className="px-2 py-3 text-xs text-slate-600">GitHub から読込中です。</div>
            ) : dashboardQuery.error ? (
              <GitHubInlineState
                tone="error"
                className="px-2 py-3 text-xs"
                {...describeGitHubError(dashboardQuery.error, "チケット一覧を取得できませんでした。")}
              />
            ) : assignedIssues.length === 0 ? (
              <GitHubInlineState
                tone="empty"
                title="担当中のオープン中チケットはありません。"
                detail="担当者検索に一致するチケットがありません。"
                className="px-2 py-3 text-xs"
              />
            ) : (
              <SideList>
                {assignedIssues.map((issue) => {
                  const status = getIssueStateTag(issue.state);

                  return (
                    <div key={issue.id} className="space-y-1 px-2 py-2 text-xs">
                      <div className="font-bold">
                        <Link
                          to={`/issues/${createRepositoryScopedNumberRouteId(
                            `${issue.repository.nameWithOwner}/${issue.number}`,
                          )}`}
                          className={TEXT_LINK_CLASS}
                        >
                          チケット #{issue.number}
                        </Link>
                      </div>
                      <div>
                        <Link
                          to={`/issues/${createRepositoryScopedNumberRouteId(
                            `${issue.repository.nameWithOwner}/${issue.number}`,
                          )}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {issue.title}
                        </Link>
                      </div>
                      <div className={MONO_CLASS}>
                        <Link
                          to={`/repositories/${createRepositoryPath(issue.repository.nameWithOwner)}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {issue.repository.nameWithOwner}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <JtcStatusTag tone={status.tone}>{status.label}</JtcStatusTag>
                        <span className={clsx("text-slate-600", MONO_CLASS)}>
                          {formatGitHubDateTime(issue.updatedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </SideList>
            )}
          </Panel>

          <Panel title="最近更新したリポジトリ" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {recentRepositories.length === 0 ? (
                  recentRepositoriesQuery.loading ? (
                    <GitHubTableStateRow
                      colSpan={3}
                      tone="empty"
                      title="最近更新したリポジトリを取得しています。"
                      detail="GitHub からリポジトリ一覧を読み込んでいます。"
                    />
                  ) : recentRepositoriesQuery.error ? (
                    <GitHubTableStateRow
                      colSpan={3}
                      tone="error"
                      {...describeGitHubError(
                        recentRepositoriesQuery.error,
                        "最近更新したリポジトリの取得に失敗しました。",
                      )}
                    />
                  ) : (
                    <GitHubTableStateRow
                      colSpan={3}
                      tone="empty"
                      title="最近更新したリポジトリはありません。"
                      detail="最近更新したリポジトリの表示対象データがありません。"
                    />
                  )
                ) : (
                  recentRepositories.map((repository: RecentRepositoryNode) => (
                    <tr key={repository.id}>
                      <td className={MONO_CLASS}>
                        <Link
                          to={`/repositories/${createRepositoryPath(repository.nameWithOwner)}`}
                          className={TEXT_LINK_CLASS}
                        >
                          {repository.name}
                        </Link>
                      </td>
                      <td className="text-center">{repository.primaryLanguage?.name ?? "－"}</td>
                      <td className={clsx("text-center", MONO_CLASS)}>
                        {formatGitHubDateTime(repository.pushedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <CursorPager
              currentPage={recentRepositoriesPager.currentPage}
              pageSize={6}
              visibleCount={recentRepositories.length}
              totalCount={repositoriesConnection?.totalCount}
              hasNextPage={repositoriesConnection?.pageInfo.hasNextPage ?? false}
              isLoading={recentRepositoriesQuery.loading}
              onFirstPage={recentRepositoriesPager.goToFirstPage}
              onPreviousPage={recentRepositoriesPager.goToPreviousPage}
              onNextPage={() =>
                recentRepositoriesPager.goToNextPage(repositoriesConnection?.pageInfo.endCursor)
              }
            />
          </Panel>

          <Panel title="システムからのお知らせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>運用連絡：</b>R8/05/15(金)
        22:00～翌2:00、本番リポジトリDB定期メンテナンスを実施します。当該時間帯は プッシュ/マージ
        が不可となります。詳細は
        <span className={TEXT_LINK_CLASS}>運用手順書（変更管理編）.pdf</span>
        をご確認ください。
      </div>

      <Panel
        title={`本日のサマリ（${formatJapaneseEraDateTime(new Date())} 時点）`}
        action={
          <span className={MUTED_CLASS}>
            {isDashboardInitialLoading
              ? "GitHub から集計中..."
              : dashboardQuery.error
                ? "GitHub 集計の取得に失敗"
                : `${dashboard?.viewer.name ?? dashboard?.viewer.login ?? "利用者"} / 直近30日集計`}
          </span>
        }
      >
        {dashboardQuery.error ? (
          <GitHubInlineState
            tone="error"
            className="py-8"
            {...describeGitHubError(dashboardQuery.error, "ダッシュボード集計の取得に失敗しました。")}
          />
        ) : (
          <div className={KPI_ROW_CLASS}>
            {kpis.map((item) => (
              <div key={item.label} className={KPI_CARD_CLASS}>
                <div className={KPI_LABEL_CLASS}>{item.label}</div>
                <div className={KPI_VALUE_CLASS}>
                  {item.value}
                  {item.value === "-" ? null : <span className={KPI_UNIT_CLASS}>件</span>}
                </div>
                <div className={KPI_DELTA_CLASS}>{item.note}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="お知らせ・運用連絡" bodyClassName="p-0">
        <div className={TABS_ROW_CLASS}>
          <span className={clsx(TAB_CLASS, TAB_ACTIVE_CLASS)}>
            重要なお知らせ <span className={TAB_BADGE_CLASS}>3</span>
          </span>
          <span className={TAB_CLASS}>
            お知らせ <span className={TAB_BADGE_CLASS}>7</span>
          </span>
          <span className={TAB_CLASS}>
            障害情報 <span className={TAB_BADGE_CLASS}>1</span>
          </span>
          <span className={TAB_CLASS}>
            メンテナンス予定 <span className={TAB_BADGE_CLASS}>2</span>
          </span>
          <span className={TAB_CLASS}>
            運用連絡 <span className={TAB_BADGE_CLASS}>5</span>
          </span>
        </div>
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-16">種別</th>
              <th>件名</th>
              <th className="w-36">掲載日時</th>
              <th className="w-36">掲載期限</th>
              <th className="w-24">発行元</th>
              <th className="w-12">添付</th>
            </tr>
          </thead>
          <tbody>
            {noticeRows.map(([kind, title, posted, deadline, owner, attachment]) => (
              <tr key={`${kind}:${title}`}>
                <td className="text-center">
                  <NoticeTag label={kind} />
                </td>
                <td>
                  {title}
                  {(kind === "重要" || title.includes("強制プッシュ")) && (
                    <span className="ml-1 font-bold text-red-700">★</span>
                  )}
                </td>
                <td className={DATE_CELL_CLASS}>{posted}</td>
                <td className={DATE_CELL_CLASS}>{deadline}</td>
                <td className="text-center">{owner}</td>
                <td className="text-center">
                  {attachment === "－" ? "－" : <span className={TEXT_LINK_CLASS}>{attachment}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="変更登録フロー：CHG-2025-00472 「決済例外処理の修正」">
        <div className={FLOW_WRAP_CLASS}>
          {flowSteps.map((step) => (
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
    </JtcChrome>
  );
}

export default function DashboardPage(): JSX.Element {
  return <DashboardScreen />;
}
