import clsx from "clsx";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcPriorityTag, JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  KPI_CARD_CLASS,
  KPI_DELTA_CLASS,
  KPI_LABEL_CLASS,
  KPI_ROW_CLASS,
  KPI_UNIT_CLASS,
  KPI_VALUE_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  PAGER_CLASS,
  PAGER_LINK_ACTIVE_CLASS,
  PAGER_LINK_CLASS,
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
  FLOW_WRAP_CLASS,
  FLOW_STEP_META_CLASS,
  FLOW_STEP_NAME_CLASS,
  FLOW_STEP_NO_CLASS,
  flowStepClassName,
} from "../app/styles.ts";

const dashboardKpis = [
  { label: "担当リポジトリ数", value: "12", note: "▲ 前月比 +2件" },
  { label: "未対応PR", value: "7", note: "▼ 前日比 +1件" },
  { label: "担当課題（Issue）", value: "14", note: "▼ 前日比 +3件" },
  { label: "承認待ちタスク", value: "5", note: "▲ 前日比 -2件" },
];

const noticeRows = [
  [
    "重要",
    "【重要】システムメンテナンスに伴うサービス停止について（令和8年5月15日 22:00～翌2:00）",
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
    "Git操作における注意事項について（force-push禁止の徹底）",
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
];

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
];

const shortcuts = [
  ["変", "変更登録"],
  ["PR", "PR作成"],
  ["課", "課題票作成"],
  ["🔍", "リポジトリ検索"],
  ["人", "ユーザー検索"],
  ["📖", "操作マニュアル"],
];

const todoItems = [
  ["承認待ち（変更）", "2 件"],
  ["承認待ち（PR）", "1 件"],
  ["課題回答待ち", "3 件"],
  ["レビュー依頼中", "2 件"],
  ["マイタスク", "5 件"],
  ["差戻し対応", "1 件"],
  ["研修・訓練", "0 件"],
];

const assignedIssues = [
  ["ISS-25-00125", "決済処理でエラーになる", "対応中", "高", "05/30"],
  ["ISS-25-00118", "ログ出力が消えている", "新規", "中", "06/02"],
  ["ISS-25-00105", "画面遷移時のDBエラー", "対応中", "高", "05/15"],
  ["ISS-25-00099", "マスタ更新の権限が無い", "確認待", "低", "06/15"],
];

function NoticeTag({ label }: { label: string }): JSX.Element {
  const tone =
    label === "重要"
      ? "border-[#a03333] bg-[#ffdede] text-[#8e0014]"
      : label === "障害"
        ? "border-[#a03333] bg-[#ffe0e0] text-[#8e0014]"
        : label === "運用"
          ? "border-[#49739d] bg-[#dce8f6] text-[#16386b]"
          : "border-[#888] bg-[#efefef] text-[#555]";

  return (
    <span
      className={clsx("inline-flex min-w-[46px] justify-center border px-1 py-px text-10 font-bold", tone)}
    >
      {label}
    </span>
  );
}

export function DashboardScreen(): JSX.Element {
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

          <Panel title="ToDo一覧（未完了）" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {todoItems.map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className={clsx("font-bold", value === "0 件" ? "text-[#777]" : "text-[#16386b]")}>
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="課題一覧（自分の担当）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <thead>
                <tr>
                  <th className="w-[88px]">課題ID</th>
                  <th>件名</th>
                  <th className="w-[46px]">状態</th>
                  <th className="w-[30px]">優先</th>
                  <th className="w-[46px]">期限</th>
                </tr>
              </thead>
              <tbody>
                {assignedIssues.map(([id, title, status, priority, due]) => (
                  <tr key={id}>
                    <td className={clsx("text-center", MONO_CLASS)}>
                      <span className={TEXT_LINK_CLASS}>{id}</span>
                    </td>
                    <td>{title}</td>
                    <td className="text-center">
                      <JtcStatusTag
                        tone={status === "新規" ? "new" : status === "確認待" ? "confirmed" : "inProgress"}
                      >
                        {status}
                      </JtcStatusTag>
                    </td>
                    <td className="text-center">
                      <JtcPriorityTag
                        priority={priority === "高" ? "high" : priority === "中" ? "medium" : "low"}
                      >
                        {priority}
                      </JtcPriorityTag>
                    </td>
                    <td className={clsx("text-center", MONO_CLASS)}>{due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="システムからのお知らせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>運用連絡：</b>令和8年5月15日(金)
        22:00～翌2:00、本番リポジトリDB定期メンテナンスを実施します。当該時間帯は push/merge
        が不可となります。詳細は
        <span className={TEXT_LINK_CLASS}>運用手順書（変更管理編）.pdf</span>
        をご確認ください。
      </div>

      <Panel
        title="本日のサマリ（令和8年5月3日 8時42分時点）"
        action={<span className={MUTED_CLASS}>自動更新：5分間隔</span>}
      >
        <div className={KPI_ROW_CLASS}>
          {dashboardKpis.map((item) => (
            <div key={item.label} className={KPI_CARD_CLASS}>
              <div className={KPI_LABEL_CLASS}>{item.label}</div>
              <div className={KPI_VALUE_CLASS}>
                {item.value}
                <span className={KPI_UNIT_CLASS}>件</span>
              </div>
              <div className={KPI_DELTA_CLASS}>{item.note}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="お知らせ・運用連絡"
        action={<span className={TEXT_LINK_CLASS}>お知らせ一覧へ ▶</span>}
        bodyClassName="p-0"
      >
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
              <th className="w-[60px]">種別</th>
              <th>件名</th>
              <th className="w-[120px]">掲載日時</th>
              <th className="w-[120px]">掲載期限</th>
              <th className="w-[90px]">発行元</th>
              <th className="w-[50px]">添付</th>
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
                  {(kind === "重要" || title.includes("force-push")) && (
                    <span className="ml-1 font-bold text-[#c8001a]">★</span>
                  )}
                </td>
                <td className={clsx("text-center", MONO_CLASS)}>{posted}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{deadline}</td>
                <td className="text-center">{owner}</td>
                <td className="text-center">
                  {attachment === "－" ? "－" : <span className={TEXT_LINK_CLASS}>{attachment}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={PAGER_CLASS}>
          <span className={MUTED_CLASS}>全 18件中 1～6件を表示</span>
          <span className={PAGER_LINK_CLASS}>≪先頭</span>
          <span className={PAGER_LINK_CLASS}>＜前</span>
          <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>1</span>
          <span className={PAGER_LINK_CLASS}>2</span>
          <span className={PAGER_LINK_CLASS}>3</span>
          <span className={PAGER_LINK_CLASS}>次＞</span>
          <span className={PAGER_LINK_CLASS}>末尾≫</span>
        </div>
      </Panel>

      <Panel
        title="変更登録フロー（現在ステータス）：CHG-2025-00472 「決済例外処理の修正」"
        action={<span className={MUTED_CLASS}>登録日：R8/04/28 ／ 期限：R8/05/10</span>}
      >
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
