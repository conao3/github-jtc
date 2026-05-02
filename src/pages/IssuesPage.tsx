import { Link } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcPriorityTag, JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const rows = [
  [
    "ISS-2025-00125",
    "決済処理においてDB接続タイムアウト時にエラーログが出力されない",
    "不具合",
    "対応中",
    "高",
    "山田 太郎",
    "R8/05/30",
  ],
  ["ISS-2025-00118", "ログ出力カラムの欠落", "改善", "新規", "中", "佐藤 雄樹", "R8/06/02"],
  ["ISS-2025-00105", "マスタ更新時のDBエラー", "不具合", "確認待ち", "低", "田中 健太", "R8/06/15"],
] as const;

export function IssuesScreen(): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-ISS-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "課題（Issue）一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="課題（Issue）一覧"
      rightColumn={
        <>
          <Panel title="課題サマリ" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["対応中", "8件"],
                ["新規", "3件"],
                ["確認待ち", "2件"],
                ["期限超過", "1件"],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-jtc-16386b">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="よく使う操作">
            <div className="flex flex-col gap-1">
              <button type="button" className={buttonClassName({ tone: "primary" })}>
                ＋ 課題起票
              </button>
              <button type="button" className={buttonClassName()}>
                高優先度のみ表示
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
        <div className="flex flex-wrap items-center gap-2 border-b border-b-jtc-c5c5c5 bg-jtc-f4f6fa px-2 py-1.5">
          <label>課題番号/件名/区分</label>
          <input className="border border-jtc-888 px-1.5 py-0.5" placeholder="ISS-2025-00125" />
          <label>状態</label>
          <select className="border border-jtc-888 px-1 py-0.5">
            <option>──全て──</option>
            <option>新規</option>
            <option>対応中</option>
            <option>確認待ち</option>
            <option>解決</option>
          </select>
          <label>担当者</label>
          <input className="border border-jtc-888 px-1.5 py-0.5" placeholder="山田 太郎" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()}>
            クリア
          </button>
        </div>
      </Panel>

      <Panel title="課題一覧" action={<span className={MUTED_CLASS}>該当 3件</span>} bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-jtc-120">課題番号</th>
              <th>件名</th>
              <th className="w-jtc-80">区分</th>
              <th className="w-jtc-90">状態</th>
              <th className="w-jtc-60">優先</th>
              <th className="w-jtc-90">担当者</th>
              <th className="w-jtc-100">期限</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([id, title, category, status, priority, assignee, due]) => (
              <tr key={id}>
                <td className={MONO_CLASS}>
                  <Link to={`/issues/${id}`} className={TEXT_LINK_CLASS}>
                    {id}
                  </Link>
                </td>
                <td>{title}</td>
                <td className="text-center">{category}</td>
                <td className="text-center">
                  <JtcStatusTag
                    tone={status === "対応中" ? "inProgress" : status === "新規" ? "new" : "confirmed"}
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
                <td className="text-center">{assignee}</td>
                <td className={MONO_CLASS}>{due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function IssuesPage(): JSX.Element {
  return <IssuesScreen />;
}
