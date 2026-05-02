import clsx from "clsx";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  MONO_CLASS,
  MUTED_CLASS,
  PAGER_CLASS,
  PAGER_LINK_ACTIVE_CLASS,
  PAGER_LINK_CLASS,
  TABLE_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const commits = [
  [
    "a4f3c1b2",
    "例外処理の修正（IS-2025-00125対応）レビュー指摘反映",
    "yamada.taro",
    "R8/05/02 17:45",
    "feat/IS-2025-00125",
    76,
    32,
    4,
    "PR-00089",
  ],
  [
    "7e2d9f88",
    "マスタテーブルのインデックス追加（性能改善）",
    "sato.yuki",
    "R8/05/02 14:11",
    "develop",
    12,
    4,
    2,
    "",
  ],
  [
    "d10b5572",
    "テストケース追加（境界値・異常値）",
    "tanaka.ken",
    "R8/05/02 11:30",
    "feat/IS-2025-00125",
    34,
    10,
    1,
    "PR-00089",
  ],
  ["3c8a44e0", "READMEの更新（運用手順記載）", "yamada.taro", "R8/05/01 18:55", "develop", 28, 8, 1, ""],
  [
    "9ff10aa5",
    "ログ出力フォーマットの統一（社内規程Sec-013準拠）",
    "suzuki.hiroyuki",
    "R8/05/01 13:20",
    "develop",
    45,
    32,
    6,
    "PR-00075",
  ],
  [
    "e5b29a14",
    "依存ライブラリのバージョン更新（脆弱性対応）",
    "ito.maki",
    "R8/04/30 16:08",
    "develop",
    8,
    8,
    1,
    "SEC-2025-014",
  ],
  [
    "bf471c33",
    "Merge: feat/oidc → develop",
    "yamada.taro",
    "R8/04/30 11:45",
    "develop",
    412,
    18,
    23,
    "merge",
  ],
  [
    "44f8e992",
    "OIDC連携の初期実装（Issue-00091）",
    "yamada.taro",
    "R8/04/29 17:30",
    "feat/oidc",
    380,
    12,
    18,
    "",
  ],
  [
    "1a902b56",
    "configファイルのリファクタリング",
    "tanaka.ken",
    "R8/04/29 10:15",
    "feat/oidc",
    32,
    28,
    5,
    "",
  ],
  [
    "9d3c7b08",
    "初版コミット（プロジェクト雛形作成）",
    "sato.taichiro",
    "R7/12/15 14:02",
    "main",
    1284,
    0,
    124,
    "v1.0.0",
  ],
] as const;

const commitBars = [
  3, 5, 2, 4, 7, 6, 8, 3, 2, 5, 9, 12, 8, 6, 4, 3, 2, 7, 11, 9, 15, 8, 6, 4, 2, 3, 8, 12, 7, 4,
];

export function CommitsScreen(): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-CMT-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "コミット履歴" }]}
      activeTopMenu="開発管理"
      activeSideItem="コミット履歴"
      rightColumn={
        <>
          <Panel title="作成者別ランキング" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <thead>
                <tr>
                  <th>作成者</th>
                  <th className="w-12">件数</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1. yamada.taro", "42"],
                  ["2. sato.yuki", "35"],
                  ["3. tanaka.ken", "28"],
                  ["4. suzuki.h", "22"],
                  ["5. ito.maki", "15"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="text-right font-bold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="タグ一覧" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["v1.0.0", "R7/12/15"],
                ["v1.1.0", "R8/02/01"],
                ["v1.2.0", "R8/03/15"],
                ["v1.2.1-hotfix", "R8/04/02"],
                ["v1.3.0-rc1", "R8/04/30"],
              ].map(([tag, date]) => (
                <li key={tag} className={TODO_LIST_ITEM_CLASS}>
                  <span className={MONO_CLASS}>{tag}</span>
                  <span className={clsx("text-xs", MONO_CLASS)}>{date}</span>
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
      <Panel title="検索条件" bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-b-slate-300 bg-slate-50 px-2 py-1.5">
          <label>リポジトリ：</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>payment-system-core</option>
            <option>auth-gateway</option>
            <option>kanjokei-batch</option>
          </select>
          <label>ブランチ：</label>
          <select className="border border-slate-400 px-1 py-0.5">
            <option>──全て──</option>
            <option>main</option>
            <option>develop</option>
            <option>feat/IS-2025-00125</option>
            <option>feat/oidc</option>
          </select>
          <label>作成者：</label>
          <input className="w-28 border border-slate-400 px-1.5 py-0.5" placeholder="ユーザーID" />
          <label>期間：</label>
          <input className="w-20 border border-slate-400 px-1.5 py-0.5" placeholder="R8/04/01" /> ～
          <input className="w-20 border border-slate-400 px-1.5 py-0.5" placeholder="R8/05/03" />
          <label>キーワード：</label>
          <input className="border border-slate-400 px-1.5 py-0.5" placeholder="コミットメッセージ" />
          <button type="button" className={buttonClassName({ tone: "primary" })}>
            検索
          </button>
          <button type="button" className={buttonClassName()}>
            クリア
          </button>
          <button type="button" className={buttonClassName()}>
            CSV出力
          </button>
        </div>
      </Panel>

      <Panel
        title="コミット履歴一覧（payment-system-core）"
        action={<span className={MUTED_CLASS}>該当 1,284件 ／ 1～10件を表示</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-6"> </th>
              <th className="w-24">コミットID</th>
              <th>コミットメッセージ</th>
              <th className="w-24">ブランチ</th>
              <th className="w-20">作成者</th>
              <th className="w-28">日時</th>
              <th className="w-28">変更</th>
              <th className="w-20">関連</th>
              <th className="w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {commits.map(([hash, message, author, date, branch, add, del, files, related]) => (
              <tr key={hash}>
                <td className="text-center">
                  <span
                    className={clsx(
                      "inline-block h-2 w-2 rounded-full",
                      related === "merge" ? "bg-violet-700" : "bg-blue-900",
                    )}
                  />
                </td>
                <td className={clsx("text-center", MONO_CLASS)}>
                  <span className={TEXT_LINK_CLASS}>{hash}</span>
                </td>
                <td>{message}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{branch}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{author}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{date}</td>
                <td className={clsx("text-center text-xs", MONO_CLASS)}>
                  <span className="text-green-700">+{add}</span> /{" "}
                  <span className="text-red-700">-{del}</span> ({files}f)
                </td>
                <td className="text-center">
                  {related ? (
                    <span className={clsx(TEXT_LINK_CLASS, MONO_CLASS, "text-xs")}>{related}</span>
                  ) : (
                    "－"
                  )}
                </td>
                <td className="text-center">
                  <span className={TEXT_LINK_CLASS}>差分</span> |{" "}
                  <span className={TEXT_LINK_CLASS}>復元</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={PAGER_CLASS}>
          <span className={MUTED_CLASS}>全 1,284件中 1～10件を表示</span>
          <span className={PAGER_LINK_CLASS}>≪先頭</span>
          <span className={PAGER_LINK_CLASS}>＜前</span>
          <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>1</span>
          <span className={PAGER_LINK_CLASS}>2</span>
          <span className={PAGER_LINK_CLASS}>3</span>
          <span className={PAGER_LINK_CLASS}>4</span>
          <span className={PAGER_LINK_CLASS}>…</span>
          <span className={PAGER_LINK_CLASS}>129</span>
          <span className={PAGER_LINK_CLASS}>次＞</span>
          <span className={PAGER_LINK_CLASS}>末尾≫</span>
        </div>
      </Panel>

      <Panel title="日別コミット数（直近30日）">
        <div className={clsx("p-2 text-xs", MONO_CLASS)}>
          <div className="flex h-24 items-end gap-0.5 border-b border-b-slate-400 border-l border-l-slate-400 px-1">
            {commitBars.map((value, index) => (
              <div
                key={`${value}:${index}`}
                className="flex-1 border border-blue-900 bg-gradient-to-t from-blue-900 to-blue-500"
                style={{ height: `${value * 6}px` }}
                title={`${value}件`}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-slate-400">
            <span>4/04</span>
            <span>4/11</span>
            <span>4/18</span>
            <span>4/25</span>
            <span>5/02</span>
          </div>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function CommitsPage(): JSX.Element {
  return <CommitsScreen />;
}
