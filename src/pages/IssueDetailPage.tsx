import clsx from "clsx";
import { useParams } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcPriorityTag, JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const timeline = [
  ["1", "R8/04/28 10:15", "高橋健一", "new", "起票", "運用統括部より起票。優先度「高」にて担当者割当依頼。"],
  ["2", "R8/04/28 14:30", "佐藤課長", "pending", "割当", "基盤開発二課・山田に対応指示。期限：5/30。"],
  [
    "3",
    "R8/04/29 09:00",
    "山田太郎",
    "inProgress",
    "調査",
    "原因調査開始。ログ出力ロジックの確認、コードレビュー実施。",
  ],
  [
    "4",
    "R8/04/30 16:20",
    "山田太郎",
    "inProgress",
    "調査",
    "原因特定。PaymentService.java の例外処理に不備。修正方針を策定。",
  ],
  ["5", "R8/05/01 14:30", "山田太郎", "review", "PR申請", "修正コード作成完了。PR-2025-00089 申請。"],
  [
    "6",
    "R8/05/02 11:48",
    "山田太郎",
    "review",
    "レビュー対応",
    "佐藤課長レビュー指摘対応完了。再レビュー依頼。",
  ],
] as const;

export function IssueDetailScreen({
  issueId = "ISS-2025-00125",
}: {
  readonly issueId?: string;
}): JSX.Element {
  const statusHistory = [
    { label: "新規", note: "→ 04/28", muted: false },
    { label: "割当", note: "→ 04/28", muted: false },
    { label: "調査中", note: "→ 04/29", muted: false },
    { label: "対応中", note: "→ 05/01（現在）", muted: false },
    { label: "レビュー待ち", note: "未到達", muted: true },
    { label: "解決", note: "未到達", muted: true },
    { label: "クローズ", note: "未到達", muted: true },
  ] as const;

  return (
    <JtcChrome
      screenId="JTC-ISS-004"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "課題（Issue）一覧", to: "/issues" },
        { label: "課題詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="課題（Issue）一覧"
      rightColumn={
        <>
          <Panel title="担当者情報">
            <div className="text-center">
              <div
                className={clsx(
                  "mx-auto my-1 flex h-16 w-16 items-center justify-center border border-[#555] bg-gradient-to-br from-[#c5cdd9] to-[#8a96a8] text-[28px] text-white",
                  MONO_CLASS,
                )}
              >
                山田
              </div>
              <div className="font-bold">山田 太郎</div>
              <div className="text-[10px] text-[#555]">基盤開発二課</div>
              <div className={clsx("text-[10px]", MONO_CLASS)}>yamada.taro</div>
              <div className="mt-1">
                <button type="button" className={buttonClassName({ size: "sm" })}>
                  プロフィール
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="課題ステータス推移" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {statusHistory.map(({ label, note, muted }) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span className={muted ? "text-[#888]" : undefined}>{label}</span>
                  <span className={muted ? "text-[10px] text-[#888]" : "text-[10px]"}>{note}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="操作">
            <div className="flex flex-col gap-1">
              <button type="button" className={buttonClassName()}>
                担当者変更
              </button>
              <button type="button" className={buttonClassName()}>
                優先度変更
              </button>
              <button type="button" className={buttonClassName()}>
                期限変更
              </button>
              <button type="button" className={buttonClassName({ tone: "primary" })}>
                解決報告
              </button>
              <button type="button" className={buttonClassName({ tone: "danger" })}>
                課題取消（要承認）
              </button>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>対応期限注意：</b>本課題の対応期限は<b className="text-[#c8001a]">令和8年5月30日</b>
        です。残日数27日。期限超過時は週次の課題進捗会議にて報告対象となります。
      </div>

      <Panel
        title={`課題基本情報 ${issueId}`}
        action={<span>起票日：R8/04/28 10:15 ／ 最終更新：R8/05/02 11:48</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <tbody>
            <tr>
              <th>
                件名<span className="font-bold text-[#c8001a]">※</span>
              </th>
              <td colSpan={3}>
                <b>決済処理においてDB接続タイムアウト時にエラーログが出力されない事象について</b>
              </td>
            </tr>
            <tr>
              <th>区分</th>
              <td>不具合（バグ）</td>
              <th>分類</th>
              <td>機能不具合 ／ ログ出力</td>
            </tr>
            <tr>
              <th>状態</th>
              <td>
                <JtcStatusTag tone="inProgress">対応中</JtcStatusTag>
              </td>
              <th>優先度</th>
              <td>
                <JtcPriorityTag priority="high">高</JtcPriorityTag>
              </td>
            </tr>
            <tr>
              <th>影響度</th>
              <td>大（顧客影響あり）</td>
              <th>緊急度</th>
              <td>中</td>
            </tr>
            <tr>
              <th>対応リポジトリ</th>
              <td className={MONO_CLASS}>payment-system-core</td>
              <th>関連PR</th>
              <td>
                <span className={TEXT_LINK_CLASS}>PR-2025-00089</span>
              </td>
            </tr>
            <tr>
              <th>起票者</th>
              <td>運用統括部 高橋 健一</td>
              <th>担当者</th>
              <td>山田 太郎（基盤開発二課）</td>
            </tr>
            <tr>
              <th>起票日</th>
              <td className={MONO_CLASS}>令和8年4月28日</td>
              <th>対応期限</th>
              <td className={MONO_CLASS}>
                <b className="text-[#c8001a]">令和8年5月30日</b>
              </td>
            </tr>
            <tr>
              <th>発生環境</th>
              <td>本番環境（PROD-01）／ サーバ：jtc-pay-srv-002</td>
              <th>再現性</th>
              <td>常時再現</td>
            </tr>
            <tr>
              <th>事象内容</th>
              <td colSpan={3}>
                令和8年4月28日 03:15 頃、決済処理において DB
                接続タイムアウト（30秒）が発生したが、エラーログが出力されず、業務担当者が事象を検知できなかった。詳細は別添「障害報告書_R8-0428.xlsx」を参照のこと。なお、本事象により業務影響として
                12件の決済処理がリトライ対象となった（業務側で復旧済み）。
              </td>
            </tr>
            <tr>
              <th>原因（仮）</th>
              <td colSpan={3}>
                PaymentService.java の executePayment() メソッドにおいて、SQLException
                発生時の例外伝播が適切に行われておらず、ログ出力がスキップされていた可能性が高い。
              </td>
            </tr>
            <tr>
              <th>対応方針</th>
              <td colSpan={3}>
                例外処理を全面的に見直し、PaymentException
                でラップして上位に伝播するように修正する。テストケースについても境界値・異常系を追加する。
              </td>
            </tr>
            <tr>
              <th>添付資料</th>
              <td colSpan={3}>
                📄 <span className={TEXT_LINK_CLASS}>障害報告書_R8-0428.xlsx</span> ／ 📄{" "}
                <span className={TEXT_LINK_CLASS}>ログ調査結果.txt</span> ／ 📄{" "}
                <span className={TEXT_LINK_CLASS}>業務影響評価.docx</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="対応進捗（タイムライン）" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[40px]">No</th>
              <th className="w-[110px]">日時</th>
              <th className="w-[100px]">対応者</th>
              <th className="w-[90px]">区分</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map(([no, date, actor, tone, label, body]) => (
              <tr key={no}>
                <td className="text-center">{no}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{date}</td>
                <td className="text-center">{actor}</td>
                <td className="text-center">
                  <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
                </td>
                <td>{body}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-1.5 py-1 text-right">
          <button type="button" className={buttonClassName()}>
            ＋ 進捗を追加
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            状態を変更
          </button>
        </div>
      </Panel>

      <Panel title="関連情報" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[120px]">種別</th>
              <th>ID／件名</th>
              <th className="w-[120px]">状態</th>
              <th className="w-[100px]">担当</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">プルリク</td>
              <td className={MONO_CLASS}>PR-2025-00089 決済処理の例外ハンドリング追加対応</td>
              <td className="text-center">
                <JtcStatusTag tone="review">レビュー中</JtcStatusTag>
              </td>
              <td className="text-center">山田太郎</td>
            </tr>
            <tr>
              <td className="text-center">変更管理</td>
              <td className={MONO_CLASS}>CHG-2025-00472 決済例外処理の修正</td>
              <td className="text-center">
                <JtcStatusTag tone="review">レビュー中</JtcStatusTag>
              </td>
              <td className="text-center">品質保証部</td>
            </tr>
            <tr>
              <td className="text-center">障害報告</td>
              <td className={MONO_CLASS}>INC-2025-00038 決済処理ログ欠損事象</td>
              <td className="text-center">
                <JtcStatusTag tone="done">解決済</JtcStatusTag>
              </td>
              <td className="text-center">運用統括部</td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function IssueDetailPage(): JSX.Element {
  const { issueId } = useParams();

  return <IssueDetailScreen issueId={issueId ?? "ISS-2025-00125"} />;
}
