import clsx from "clsx";
import { Link } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
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
    "PR-2025-00089",
    "決済処理の例外ハンドリング追加対応（IS-2025-00125 起票分）",
    "山田 太郎",
    "高",
    "レビュー中",
    "R8/05/01 14:30",
    "4ファイル / +128 -42",
  ],
  [
    "PR-2025-00075",
    "ログ出力カラム追加",
    "佐藤 雄樹",
    "中",
    "承認待ち",
    "R8/04/30 16:10",
    "2ファイル / +21 -8",
  ],
  ["PR-2025-00062", "マスタ更新追加", "田中 健太", "低", "承認済", "R8/04/28 10:12", "6ファイル / +83 -19"],
  [
    "PR-2025-00058",
    "会員検索APIのタイムアウト値見直し",
    "小林 美咲",
    "中",
    "差戻し",
    "R8/04/27 15:48",
    "3ファイル / +15 -6",
  ],
] as const;

export function PullRequestsScreen(): JSX.Element {
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
                ["承認待ち", "4件"],
                ["レビュー中", "3件"],
                ["差戻し", "1件"],
                ["期限超過", "0件"],
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
                ＋ PR作成
              </button>
              <button type="button" className={buttonClassName()}>
                レビュー待ちのみ表示
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
          <label>申請番号/件名</label>
          <input className="border border-jtc-888 px-1.5 py-0.5" placeholder="PR-2025-00089" />
          <label>状態</label>
          <select className="border border-jtc-888 px-1 py-0.5">
            <option>──全て──</option>
            <option>承認待ち</option>
            <option>レビュー中</option>
            <option>差戻し</option>
            <option>承認済</option>
          </select>
          <label>申請者</label>
          <input className="border border-jtc-888 px-1.5 py-0.5" placeholder="山田 太郎" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()}>
            クリア
          </button>
        </div>
      </Panel>

      <Panel title="対象申請一覧" action={<span className={MUTED_CLASS}>該当 3件</span>} bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-jtc-120">申請番号</th>
              <th>件名</th>
              <th className="w-jtc-90">申請者</th>
              <th className="w-jtc-60">優先</th>
              <th className="w-jtc-90">状態</th>
              <th className="w-jtc-120">提出日時</th>
              <th className="w-jtc-150">変更</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([id, title, author, priority, status, submitted, delta]) => (
              <tr key={id}>
                <td className={clsx("text-center", MONO_CLASS)}>
                  <Link to={`/pull-requests/${id}`} className={TEXT_LINK_CLASS}>
                    {id}
                  </Link>
                </td>
                <td>{title}</td>
                <td className="text-center">{author}</td>
                <td className="text-center">{priority}</td>
                <td className="text-center">
                  <JtcStatusTag
                    tone={
                      status === "承認済"
                        ? "done"
                        : status === "差戻し"
                          ? "rejected"
                          : status === "承認待ち"
                            ? "pending"
                            : "review"
                    }
                  >
                    {status}
                  </JtcStatusTag>
                </td>
                <td className={clsx("text-center", MONO_CLASS)}>{submitted}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function PullRequestsPage(): JSX.Element {
  return <PullRequestsScreen />;
}
