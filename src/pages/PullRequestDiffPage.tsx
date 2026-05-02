import clsx from "clsx";
import { useParams } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  MONO_CLASS,
  TABLE_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const oldLines = [
  [41, "    public PaymentResult executePayment(PaymentRequest req) {"],
  [42, "        try {"],
  [43, "            Connection conn = dataSource.getConnection();"],
  [44, "            // 決済処理の実行"],
  [45, "            return paymentDao.execute(conn, req);"],
  [46, "        } catch (SQLException e) {"],
  [47, "            // ログ出力なしで継続（不具合）"],
  [48, "            return PaymentResult.failure();"],
  [49, "        }"],
  [50, "    }"],
] as const;

const newLines = [
  [41, "    public PaymentResult executePayment(PaymentRequest req) throws PaymentException {"],
  [42, '        Objects.requireNonNull(req, "req must not be null");'],
  [43, "        final String tranId = req.getTransactionId();"],
  [44, "        try (Connection conn = dataSource.getConnection()) {"],
  [45, '            log.info("[PAY-START] tranId={} amount={}", tranId, req.getAmount());'],
  [46, "            return paymentDao.execute(conn, req);"],
  [47, "        } catch (SQLTimeoutException e) {"],
  [48, '            log.error("[PAY-TIMEOUT] tranId={} 勘定系連携ID={}", tranId, req.getKanjoId(), e);'],
  [49, '            throw new PaymentException("E0042", "DB接続タイムアウト", tranId, e);'],
  [50, "        } catch (SQLException e) {"],
  [51, '            log.error("[PAY-DB-ERROR] tranId={}", tranId, e);'],
  [52, '            throw new PaymentException("E0099", "DBエラー", tranId, e);'],
  [53, "        }"],
  [54, "    }"],
] as const;

export function PullRequestDiffScreen({ prId = "PR-2025-00089" }: { readonly prId?: string }): JSX.Element {
  const reviewChecklist = [
    { label: "例外処理が適切である", checked: true },
    { label: "ログ出力規約に準拠", checked: true },
    { label: "テストケースが網羅的", checked: true },
    { label: "影響範囲調査済", checked: false },
    { label: "セキュリティ確認済", checked: false },
    { label: "設計書との整合確認", checked: false },
    { label: "性能影響評価済", checked: false },
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
              <li className={clsx(TODO_LIST_ITEM_CLASS, "bg-jtc-fff5b8 font-bold")}>
                <span>📄 PaymentService.java</span>
                <span className={clsx("text-10", MONO_CLASS)}>+76 -32</span>
              </li>
              {[
                ["📄 PaymentException.java", "+18 -0"],
                ["📄 PaymentServiceTest.java", "+34 -10"],
                ["📄 release-notes.md", "+0 -0"],
              ].map(([label, delta]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className={clsx("text-10", MONO_CLASS)}>{delta}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="レビューチェックリスト">
            <div className="space-y-1 text-11">
              {reviewChecklist.map(({ label, checked }) => (
                <div key={label}>
                  <label>
                    <input type="checkbox" defaultChecked={checked} /> {label}
                  </label>
                </div>
              ))}
              <div className="pt-1 text-10 text-jtc-555">※全項目チェックで承認可能</div>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title={`差分表示 ${prId} ／ PaymentService.java`}
        action={
          <span>
            表示モード：
            <select className="ml-1 border border-jtc-888 px-1 py-0.5 text-11">
              <option>横並び（Side-by-Side）</option>
              <option>縦並び（Unified）</option>
            </select>
            <span className="ml-2">空白：</span>
            <select className="ml-1 border border-jtc-888 px-1 py-0.5 text-11">
              <option>無視する</option>
              <option>無視しない</option>
            </select>
          </span>
        }
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-b-jtc-c5c5c5 bg-jtc-f4f6fa px-2 py-1.5">
          <label>ファイル：</label>
          <select className="min-w-jtc-280 border border-jtc-888 px-1 py-0.5">
            <option>(1/4) src/main/java/jp/co/jtc/payment/PaymentService.java</option>
            <option>(2/4) src/main/java/jp/co/jtc/payment/PaymentException.java</option>
            <option>(3/4) src/test/java/jp/co/jtc/payment/PaymentServiceTest.java</option>
            <option>(4/4) doc/release-notes.md</option>
          </select>
          <button type="button" className={buttonClassName({ size: "sm" })}>
            ＜ 前ファイル
          </button>
          <button type="button" className={buttonClassName({ size: "sm" })}>
            次ファイル ＞
          </button>
          <span className="text-10 text-jtc-555">
            追加：<b className="text-jtc-1a7f3c">+76行</b> 削除：<b className="text-jtc-c8001a">-32行</b>
          </span>
          <span className="ml-auto text-11">
            <label>
              <input type="checkbox" defaultChecked /> 行番号表示
            </label>
            <span className="px-1" />
            <label>
              <input type="checkbox" defaultChecked /> 文字色強調
            </label>
          </span>
        </div>

        <div className="grid grid-cols-2 border-t border-t-jtc-aab">
          <div className="border-r border-r-jtc-aab">
            <div className="border-b border-b-jtc-aab bg-gradient-to-b from-jtc-f0d8d8 to-jtc-e0b8b8 px-2 py-1 text-11 font-bold">
              変更前（develop @ 7e2d9f88）
            </div>
            <table className={clsx("w-full border-collapse text-11", MONO_CLASS)}>
              <tbody>
                {oldLines.map(([line, content]) => {
                  const removed = [44, 47, 48].includes(line);
                  return (
                    <tr key={line} className={removed ? "bg-jtc-ffe0e0" : "bg-white"}>
                      <td className="w-jtc-40 border-r border-r-jtc-ddd px-1.5 py-px text-right text-jtc-888">
                        {line}
                      </td>
                      <td className="whitespace-pre px-2 py-px">
                        {removed ? "- " : "  "}
                        {content}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <div className="border-b border-b-jtc-aab bg-gradient-to-b from-jtc-d8eed8 to-jtc-b8d8b8 px-2 py-1 text-11 font-bold">
              変更後（feat/IS-2025-00125 @ a4f3c1b2）
            </div>
            <table className={clsx("w-full border-collapse text-11", MONO_CLASS)}>
              <tbody>
                {newLines.map(([line, content]) => {
                  const added = [41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52].includes(line);
                  return (
                    <tr key={line} className={added ? "bg-jtc-d8f0d8" : "bg-white"}>
                      <td className="w-jtc-40 border-r border-r-jtc-ddd px-1.5 py-px text-right text-jtc-888">
                        {line}
                      </td>
                      <td className="whitespace-pre px-2 py-px">
                        {added ? "+ " : "  "}
                        {content}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-t-jtc-aab bg-jtc-f4f6fa p-2">
          <div className="mb-1 text-11 font-bold">■ 行コメント（45行目）</div>
          <div className="mb-1 border border-jtc-c5c5c5 bg-white p-2 text-11">
            <div className="font-bold text-jtc-16386b">
              ● 佐藤太一郎（課長）
              <span className={clsx("ml-2 text-10 font-normal text-jtc-555", MONO_CLASS)}>
                R8/05/02 10:25
              </span>
            </div>
            <div>
              ログメッセージのフォーマットですが、運用統括部の標準ログ規約（社内規程
              Sec-013）に準拠する必要があります。
              <br />
              規約上、決済処理は「[PAY-XXX]」プレフィックス＋tranId＋勘定系連携ID＋金額の順で出力してください。
            </div>
          </div>
          <div className="mb-1 border border-jtc-c5c5c5 bg-white p-2 text-11">
            <div className="font-bold text-jtc-16386b">
              ● 山田太郎
              <span className={clsx("ml-2 text-10 font-normal text-jtc-555", MONO_CLASS)}>
                R8/05/02 11:30
              </span>
              <span className="ml-2">
                <JtcStatusTag tone="done">対応済</JtcStatusTag>
              </span>
            </div>
            <div>
              ご指摘ありがとうございます。45行目および48行目について、ログ規約に準拠する形に修正いたしました（コミット：a4f3c1b2）。
            </div>
          </div>
          <div className="border border-dashed border-jtc-c89400 bg-jtc-fffce8 p-2 text-11">
            <textarea
              className="h-jtc-36 w-full border border-jtc-888 px-1.5 py-1"
              placeholder="行コメントを入力（マークダウン記法対応）"
            />
            <div className="mt-1 text-right">
              <button type="button" className={buttonClassName({ size: "sm", tone: "primary" })}>
                コメント追加
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="静的解析結果（SonarQube連携）"
        action={<span>警告 2件 / エラー 0件</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-jtc-40">No</th>
              <th className="w-jtc-70">区分</th>
              <th className="w-jtc-50">行</th>
              <th>指摘内容</th>
              <th className="w-jtc-90">ルール</th>
              <th className="w-jtc-80">状態</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">1</td>
              <td className="text-center">
                <JtcStatusTag tone="review">警告</JtcStatusTag>
              </td>
              <td className={clsx("text-center", MONO_CLASS)}>42</td>
              <td>Objects.requireNonNull の代わりに @NonNull アノテーションの使用を推奨します。</td>
              <td className={clsx("text-center", MONO_CLASS)}>JTC-CODE-S013</td>
              <td className="text-center">
                <JtcStatusTag tone="rejected">未対応</JtcStatusTag>
              </td>
            </tr>
            <tr>
              <td className="text-center">2</td>
              <td className="text-center">
                <JtcStatusTag tone="review">警告</JtcStatusTag>
              </td>
              <td className={clsx("text-center", MONO_CLASS)}>51</td>
              <td>例外メッセージはメッセージリソース化することを推奨します（多言語対応規程）。</td>
              <td className={clsx("text-center", MONO_CLASS)}>JTC-CODE-M008</td>
              <td className="text-center">
                <JtcStatusTag tone="confirmed">確認中</JtcStatusTag>
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestDiffPage(): JSX.Element {
  const { prId } = useParams();

  return <PullRequestDiffScreen prId={prId ?? "PR-2025-00089"} />;
}
