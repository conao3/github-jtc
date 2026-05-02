import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  FLOW_WRAP_CLASS,
  FLOW_STEP_META_CLASS,
  FLOW_STEP_NAME_CLASS,
  FLOW_STEP_NO_CLASS,
  MONO_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  WARN_LINE_CLASS,
  buttonClassName,
  flowStepClassName,
} from "../app/styles.ts";

const owners = [
  ["1", "責任者", "sato.taichiro", "佐藤 太一郎", "基盤開発二課", "必須", "変更"],
  ["2", "副責任者", "yamada.taro", "山田 太郎", "基盤開発二課", "必須", "変更"],
  ["3", "開発者", "tanaka.ken", "田中 健", "基盤開発二課", "－", "削除"],
  ["4", "レビュア", "suzuki.h", "鈴木 弘子", "品質保証部", "－", "削除"],
];

const attachments = [
  ["1", "システム概要書", "概要書_payment-system-core.docx", "必須", "添付済", "削除"],
  ["2", "影響調査結果", "－（未添付）", "必須", "未添付", "添付"],
  ["3", "セキュリティチェックシート", "－（未添付）", "必須", "未添付", "添付"],
  ["4", "OSS管理票", "－（未添付）", "条件付", "未添付", "添付"],
];

const steps = [
  ["current", "STEP 1", "申請内容入力", ["担当：山田太郎", "状態：入力中"], "▶ 対応中", "inProgress"],
  ["future", "STEP 2", "課長承認", ["承認者：佐藤課長"], "未着手", "required"],
  ["future", "STEP 3", "セキュリティ室確認", ["担当：セキュリティ室"], "未着手", "required"],
  ["future", "STEP 4", "部長承認", ["承認者：田中部長"], "未着手", "required"],
  ["future", "STEP 5", "リポジトリ作成", ["担当：基盤運用部（自動）"], "未着手", "required"],
] as const;

export function RepositoryCreateScreen(): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-RPO-003"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "リポジトリ登録申請" }]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ登録申請"
      rightColumn={
        <>
          <Panel title="入力進捗" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1a7f3c]" />
                  申請者情報
                </span>
                <span className="text-[10px]">完了</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f5d949]" />
                  基本情報
                </span>
                <span className="text-[10px]">7/9</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1a7f3c]" />
                  担当者設定
                </span>
                <span className="text-[10px]">完了</span>
              </li>
              <li className={TODO_LIST_ITEM_CLASS}>
                <span>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#c8001a]" />
                  書類添付
                </span>
                <span className="text-[10px]">1/3</span>
              </li>
            </ul>
          </Panel>

          <Panel title="参考資料">
            <div className="space-y-1.5 text-[11px] leading-[1.6]">
              <div>
                📄 <span className={TEXT_LINK_CLASS}>リポジトリ登録規程.pdf</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>登録手順書.pdf</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>命名規約.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>セキュリティチェックシート（雛形）.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>OSS管理票（雛形）.xlsx</span>
              </div>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <div className={WARN_LINE_CLASS}>
        <b>申請にあたっての注意事項：</b>本申請は「リポジトリ登録規程 第3条」に基づくものです。
        <span className="font-bold text-[#c8001a]">★</span>
        付項目は必須入力です。記載不備がある場合は差戻しとなりますのでご注意ください。詳細は
        <span className={TEXT_LINK_CLASS}>リポジトリ登録手順書.pdf</span>
        をご確認ください。
      </div>

      <Panel title="申請者情報（自動入力）" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <tbody>
            <tr>
              <th>申請者ID</th>
              <td className={MONO_CLASS}>yamada.taro</td>
              <th>氏名</th>
              <td>山田 太郎</td>
            </tr>
            <tr>
              <th>所属</th>
              <td colSpan={3}>第一システム事業本部 デジタル基盤統括部 基盤開発二課</td>
            </tr>
            <tr>
              <th>連絡先</th>
              <td className={MONO_CLASS}>内線 1024 / yamada.taro@jtc-corp.example.co.jp</td>
              <th>申請日時</th>
              <td className={MONO_CLASS}>令和8年5月3日 08:42</td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="リポジトリ基本情報" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <tbody>
            <tr>
              <th>
                リポジトリ名<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td colSpan={3}>
                <input
                  className="w-[280px] border border-[#888] px-1.5 py-0.5"
                  placeholder="例：payment-system-core"
                />
                <span className="ml-2 text-[10px] text-[#555]">
                  ※半角英小文字・数字・ハイフンのみ。3～40文字。
                </span>
              </td>
            </tr>
            <tr>
              <th>
                表示名（日本語）<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td colSpan={3}>
                <input
                  className="w-[380px] border border-[#888] px-1.5 py-0.5"
                  placeholder="例：決済システム基盤ソースコード"
                />
              </td>
            </tr>
            <tr>
              <th>管理ID</th>
              <td className={MONO_CLASS}>
                PRJ-2025-XXXXX <span className="text-[10px] text-[#555]">（自動採番）</span>
              </td>
              <th>
                登録区分<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td>
                <label>
                  <input type="radio" defaultChecked /> 新規
                </label>
                <label className="ml-3">
                  <input type="radio" /> 既存システム移管
                </label>
              </td>
            </tr>
            <tr>
              <th>
                事業領域<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td>
                <select className="border border-[#888] px-1 py-0.5">
                  <option>──選択してください──</option>
                  <option>金融基盤</option>
                  <option>勘定系</option>
                  <option>情報系</option>
                  <option>共通基盤</option>
                </select>
              </td>
              <th>
                主要言語<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td>
                <select className="border border-[#888] px-1 py-0.5">
                  <option>──選択してください──</option>
                  <option>Java</option>
                  <option>COBOL85</option>
                  <option>PL/I</option>
                  <option>TypeScript</option>
                  <option>Python</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>
                システム分類<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td colSpan={3}>
                <label>
                  <input type="radio" /> 重要システム
                </label>
                <label className="ml-3">
                  <input type="radio" defaultChecked /> 通常システム
                </label>
                <label className="ml-3">
                  <input type="radio" /> 試行・検証
                </label>
                <span className="ml-2 text-[10px] text-[#555]">※重要システムは別途承認会議が必要</span>
              </td>
            </tr>
            <tr>
              <th>
                機密区分<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td colSpan={3}>
                <label>
                  <input type="radio" defaultChecked /> 社外秘
                </label>
                <label className="ml-3">
                  <input type="radio" /> 社内秘
                </label>
                <label className="ml-3">
                  <input type="radio" /> 公開可
                </label>
              </td>
            </tr>
            <tr>
              <th>
                個人情報を含む<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td>
                <label>
                  <input type="radio" /> 含む
                </label>
                <label className="ml-3">
                  <input type="radio" defaultChecked /> 含まない
                </label>
              </td>
              <th>OSS含有</th>
              <td>
                <label>
                  <input type="radio" defaultChecked /> 有り
                </label>
                <label className="ml-3">
                  <input type="radio" /> 無し
                </label>
                <span className="ml-2 text-[10px] text-[#555]">※有りの場合 OSS 管理票を別途提出</span>
              </td>
            </tr>
            <tr>
              <th>
                説明<span className="font-bold text-[#c8001a]">★</span>
              </th>
              <td colSpan={3}>
                <textarea
                  className="h-[60px] w-full border border-[#888] px-1.5 py-0.5"
                  placeholder="リポジトリの目的・取扱範囲を記載してください（200文字以上推奨）"
                />
              </td>
            </tr>
            <tr>
              <th>本番運用開始予定日</th>
              <td className={MONO_CLASS}>
                <input className="w-[100px] border border-[#888] px-1.5 py-0.5" placeholder="R8/12/01" />
              </td>
              <th>想定保管期間</th>
              <td>
                <select className="border border-[#888] px-1 py-0.5">
                  <option>3年</option>
                  <option>5年</option>
                  <option defaultValue="10年">10年</option>
                  <option>無期限</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <Panel title="担当者・権限設定" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[40px]">No</th>
              <th className="w-[100px]">区分</th>
              <th className="w-[130px]">ユーザーID</th>
              <th>氏名</th>
              <th className="w-[100px]">所属</th>
              <th className="w-[80px]">必須</th>
              <th className="w-[60px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {owners.map(([no, kind, id, name, dept, required, action]) => (
              <tr key={no}>
                <td className="text-center">{no}</td>
                <td className="text-center">
                  {kind === "責任者" || kind === "副責任者" ? <b>{kind}</b> : kind}
                </td>
                <td className={MONO_CLASS}>{id}</td>
                <td>{name}</td>
                <td className="text-center">{dept}</td>
                <td className="text-center">
                  {required === "必須" ? <JtcStatusTag tone="done">必須</JtcStatusTag> : "－"}
                </td>
                <td className="text-center">
                  <span className={TEXT_LINK_CLASS}>{action}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-1.5 py-1 text-right">
          <button type="button" className={buttonClassName()}>
            ＋ 担当者追加
          </button>
        </div>
      </Panel>

      <Panel title="関連書類添付" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[40px]">No</th>
              <th className="w-[200px]">書類種別</th>
              <th>ファイル名</th>
              <th className="w-[80px]">必須</th>
              <th className="w-[80px]">状態</th>
              <th className="w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map(([no, kind, file, required, status, action]) => (
              <tr key={no}>
                <td className="text-center">{no}</td>
                <td>{kind}</td>
                <td className={MONO_CLASS}>{file}</td>
                <td className="text-center">
                  {required === "必須" ? <JtcStatusTag tone="done">必須</JtcStatusTag> : required}
                </td>
                <td className="text-center">
                  <JtcStatusTag tone={status === "添付済" ? "done" : "rejected"}>{status}</JtcStatusTag>
                </td>
                <td className="text-center">
                  <span className={TEXT_LINK_CLASS}>{action}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="承認フロー（予定)">
        <div className={FLOW_WRAP_CLASS}>
          {steps.map(([state, step, title, meta, statusLabel, tone]) => (
            <div key={step} className={flowStepClassName(state)}>
              <div className={FLOW_STEP_NO_CLASS}>{step}</div>
              <div className={FLOW_STEP_NAME_CLASS}>{title}</div>
              <div className={FLOW_STEP_META_CLASS}>
                {meta.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <div className="mt-2">
                <JtcStatusTag tone={tone}>{statusLabel}</JtcStatusTag>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mb-1 border border-[#c5c5c5] bg-white px-2 py-3 text-center">
        <div className="mb-2 text-[10px] text-[#555]">
          ※申請内容は登録後の修正が困難です。十分にご確認のうえ申請してください。
        </div>
        <button type="button" className={buttonClassName()}>
          下書き保存
        </button>
        <span className="px-1" />
        <button type="button" className={buttonClassName({ tone: "primary", size: "lg" })}>
          申請する
        </button>
        <span className="px-1" />
        <button type="button" className={buttonClassName()}>
          キャンセル
        </button>
      </div>
    </JtcChrome>
  );
}

export default function RepositoryCreatePage(): JSX.Element {
  return <RepositoryCreateScreen />;
}
