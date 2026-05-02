import clsx from "clsx";
import { Link, useParams } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
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

const workflow = [
  ["done", "STEP 1", "PR申請", ["申請者：山田 太郎", "申請日：R8/05/01 14:30"], "✓ 完了", "done"],
  [
    "done",
    "STEP 2",
    "自動チェック",
    ["CI/CD：成功", "静的解析：警告 2件", "カバレッジ：87.3%"],
    "✓ 完了",
    "done",
  ],
  [
    "current",
    "STEP 3",
    "課長レビュー",
    ["レビュア：佐藤 課長", "状態：レビュー中", "期限：R8/05/03 18:00"],
    "▶ 対応中",
    "inProgress",
  ],
  ["future", "STEP 4", "セキュリティチェック", ["担当：セキュリティ室"], "申請必要", "required"],
  ["future", "STEP 5", "マージ承認", ["担当：リリース管理委員会"], "申請必要", "required"],
] as const;

const changedFiles = [
  ["src/main/java/jp/co/jtc/payment/PaymentService.java", "+76", "-32", "▮▮▮▮▮▮▮▯▯▯", "confirmed", "未確認"],
  ["src/main/java/jp/co/jtc/payment/PaymentException.java", "+18", "-0", "▮▮▮▯▯▯▯▯▯▯", "done", "確認済"],
  [
    "src/test/java/jp/co/jtc/payment/PaymentServiceTest.java",
    "+34",
    "-10",
    "▮▮▮▮▮▯▯▯▯▯",
    "confirmed",
    "未確認",
  ],
  ["doc/release-notes.md", "+0", "-0", "▯▯▯▯▯▯▯▯▯▯", "done", "確認済"],
] as const;

const comments = [
  [
    "佐藤 太一郎（課長）",
    "R8/05/02 10:25",
    "review",
    "指摘",
    "例外処理は概ね問題ありませんが、PaymentException のメッセージに勘定系連携IDを含める必要があります（運用ルール第7条）。修正をお願いします。また、ログ出力レベルが ERROR ではなく WARN になっている箇所があるようですので、併せてご確認ください。",
  ],
  [
    "山田 太郎（起票者）",
    "R8/05/02 11:48",
    "done",
    "対応済",
    "佐藤課長 ご指摘ありがとうございます。ご指摘の2点について修正のうえ、コミット a4f3c1b2 として再プッシュいたしました。再度ご確認のほど、よろしくお願いいたします。",
  ],
  [
    "鈴木 弘子（任意レビュア）",
    "R8/05/02 14:02",
    "new",
    "補足",
    "テストケース、境界値だけでなく異常値（タイムアウト発生時）も追加されていてとても良いと思います。なお、本変更については影響調査の結果、夜間バッチへの影響は無い旨確認しております。",
  ],
] as const;

export function PullRequestDetailScreen({ prId = "PR-2025-00089" }: { readonly prId?: string }): JSX.Element {
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
          <Panel title="承認情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>承認期限</th>
                  <td className={MONO_CLASS}>
                    <b className="text-[#c8001a]">R8/05/03 18:00</b>
                  </td>
                </tr>
                <tr>
                  <th>残時間</th>
                  <td className={MONO_CLASS}>
                    <b>9時間18分</b>
                  </td>
                </tr>
                <tr>
                  <th>必須レビュア</th>
                  <td>佐藤課長</td>
                </tr>
                <tr>
                  <th>承認済</th>
                  <td>0 / 1</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="関連プルリクエスト" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <td className={MONO_CLASS}>PR-25-00075</td>
                  <td>ログ出力カラム追加</td>
                </tr>
                <tr>
                  <td className={MONO_CLASS}>PR-25-00062</td>
                  <td>マスタ更新追加</td>
                </tr>
                <tr>
                  <td className={MONO_CLASS}>PR-25-00059</td>
                  <td>OIDC連携初期実装</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="CI/CD実行結果" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["ビルド", "成功", "green"],
                ["単体テスト", "187/187", "green"],
                ["静的解析", "警告 2", "yellow"],
                ["脆弱性検査", "問題無", "green"],
                ["カバレッジ", "87.3%", "green"],
              ].map(([label, value, color]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>
                    <span
                      className={`mr-1 inline-block h-2 w-2 rounded-full ${color === "yellow" ? "bg-[#f5d949]" : "bg-[#1a7f3c]"}`}
                    />
                    {label}
                  </span>
                  <span className={clsx("text-10", MONO_CLASS)}>{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>承認依頼：</b>本プルリクエストはあなたの<b>承認</b>を必要としています（期限：令和8年5月3日
        18:00）。 内容を確認のうえ、画面下部の承認ボタンを押下してください。
      </div>

      <Panel
        title={`プルリクエスト基本情報 ${prId}`}
        action={<span className={MUTED_CLASS}>登録日：R8/05/01 14:30</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <tbody>
            <tr>
              <th>
                件名<span className="font-bold text-[#c8001a]">※</span>
              </th>
              <td colSpan={3}>
                <b>決済処理の例外ハンドリング追加対応（IS-2025-00125 起票分）</b>
              </td>
            </tr>
            <tr>
              <th>リポジトリ</th>
              <td className={MONO_CLASS}>payment-system-core</td>
              <th>状態</th>
              <td>
                <JtcStatusTag tone="review">レビュー中</JtcStatusTag>
              </td>
            </tr>
            <tr>
              <th>マージ元（source）</th>
              <td className={MONO_CLASS}>feat/IS-2025-00125-exception-handling</td>
              <th>マージ先（target）</th>
              <td className={MONO_CLASS}>develop</td>
            </tr>
            <tr>
              <th>申請者</th>
              <td>山田 太郎（基盤開発二課）</td>
              <th>レビュア</th>
              <td>佐藤 太一郎（必須）／ 鈴木 弘子（任意）</td>
            </tr>
            <tr>
              <th>関連課題</th>
              <td>
                <span className={TEXT_LINK_CLASS}>ISS-25-00125</span> 決済処理でエラーになる
              </td>
              <th>関連変更管理</th>
              <td>
                <span className={TEXT_LINK_CLASS}>CHG-2025-00472</span>
              </td>
            </tr>
            <tr>
              <th>コミット数</th>
              <td>3</td>
              <th>変更行数</th>
              <td className={MONO_CLASS}>+128 / -42（4ファイル）</td>
            </tr>
            <tr>
              <th>影響範囲</th>
              <td colSpan={3}>
                <b>限定的</b> ／ 決済処理本体（PaymentService.java）、テストコード ／ DB変更：<b>無し</b> ／
                設定変更：<b>無し</b>
              </td>
            </tr>
            <tr>
              <th>説明</th>
              <td colSpan={3}>
                決済処理において DB
                接続タイムアウト発生時、適切な例外がハンドリングされず処理が継続されてしまう不具合を修正しました。
                <br />
                具体的には、PaymentService.java の executePayment() メソッド内で、SQLException
                が発生した場合に PaymentException でラップして上位に伝播するように修正しています。
                <br />
                テストケースについても境界値・異常系を追加しております。詳細は別添「修正概要書.docx」をご参照ください。
              </td>
            </tr>
            <tr>
              <th>添付資料</th>
              <td colSpan={3}>
                📄 <span className={TEXT_LINK_CLASS}>修正概要書.docx</span> ／ 📄{" "}
                <span className={TEXT_LINK_CLASS}>影響調査結果.xlsx</span> ／ 📄{" "}
                <span className={TEXT_LINK_CLASS}>単体テスト結果.xlsx</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="承認フロー（現在ステータス）">
        <div className={FLOW_WRAP_CLASS}>
          {workflow.map(([state, step, title, meta, label, tone]) => (
            <div key={step} className={flowStepClassName(state)}>
              <div className={FLOW_STEP_NO_CLASS}>{step}</div>
              <div className={FLOW_STEP_NAME_CLASS}>{title}</div>
              <div className={FLOW_STEP_META_CLASS}>
                {meta.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <div className="mt-2">
                <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="変更ファイル一覧"
        action={<span className={MUTED_CLASS}>合計：4ファイル / +128 / -42</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[24px]"> </th>
              <th>ファイルパス</th>
              <th className="w-[70px]">追加</th>
              <th className="w-[70px]">削除</th>
              <th className="w-[80px]">差分</th>
              <th className="w-[110px]">レビュー状態</th>
              <th className="w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {changedFiles.map(([path, add, del, bar, tone, label]) => (
              <tr key={path}>
                <td className="text-center">📄</td>
                <td className={MONO_CLASS}>{path}</td>
                <td className="text-right text-[#1a7f3c]">{add}</td>
                <td className="text-right text-[#c8001a]">{del}</td>
                <td className="text-center">{bar}</td>
                <td className="text-center">
                  <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
                </td>
                <td className="text-center">
                  <Link to={`/pull-requests/${prId}/diff`} className={TEXT_LINK_CLASS}>
                    差分
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="レビューコメント（時系列）" action={<span className={MUTED_CLASS}>3件</span>}>
        <div className="space-y-1.5 bg-[#f4f6fa] p-0.5">
          {comments.map(([author, date, tone, label, body]) => (
            <div key={`${author}:${date}`} className="border border-[#c5c5c5] bg-white p-2 text-11">
              <div className="mb-1 font-bold text-[#16386b]">
                ● {author}
                <span className={clsx("ml-2 text-10 font-normal text-[#555]", MONO_CLASS)}>{date}</span>
                <span className="ml-2">
                  <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
                </span>
              </div>
              <div>{body}</div>
            </div>
          ))}
          <div className="border border-dashed border-[#c89400] bg-[#fffce8] p-2 text-11">
            <div className="mb-1 font-bold">＋ 新規コメント</div>
            <textarea
              className="h-[50px] w-full border border-[#888] px-1.5 py-1"
              placeholder="コメントを入力してください（マークダウン記法対応）"
            />
            <div className="mt-1 text-right">
              <button type="button" className={buttonClassName()}>
                下書き保存
              </button>
              <span className="px-1" />
              <button type="button" className={buttonClassName({ tone: "primary" })}>
                投稿する
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="承認・差戻し操作">
        <div className="p-3 text-center">
          <div className="mb-2 text-10 text-[#555]">
            ※承認ボタンの押下は取り消しできません。内容を十分にご確認のうえ操作してください。
          </div>
          <button type="button" className={buttonClassName({ tone: "primary", size: "lg" })}>
            ✓ 承認する
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName({ size: "lg" })}>
            差戻し
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName({ tone: "danger", size: "lg" })}>
            却下
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName({ size: "lg" })}>
            保留
          </button>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestDetailPage(): JSX.Element {
  const { prId } = useParams();

  return <PullRequestDetailScreen prId={prId ?? "PR-2025-00089"} />;
}
