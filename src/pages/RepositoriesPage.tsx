import clsx from "clsx";
import { Link } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
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

const rows = [
  [
    "001",
    "payment-system-core",
    "PRJ-2025-00125",
    "決済システム基盤ソースコード",
    "金融基盤",
    "Java 17",
    12,
    7,
    9,
    "done",
    "承認済",
    "社外秘",
    "山田太郎",
    "R8/05/02 17:45",
  ],
  [
    "002",
    "kanjokei-batch",
    "PRJ-2024-00088",
    "勘定系夜間バッチ処理",
    "勘定系",
    "COBOL85",
    4,
    2,
    5,
    "pending",
    "承認待ち",
    "社外秘",
    "山田太郎",
    "R8/05/02 10:12",
  ],
  [
    "003",
    "customer-portal-front",
    "PRJ-2025-00103",
    "顧客向けポータル画面",
    "情報系",
    "TypeScript",
    8,
    3,
    2,
    "done",
    "承認済",
    "社内秘",
    "佐藤雄樹",
    "R8/05/01 09:25",
  ],
  [
    "004",
    "internal-design-doc",
    "PRJ-2023-00041",
    "内部設計書ドキュメント管理",
    "共通基盤",
    "Markdown",
    1,
    0,
    0,
    "done",
    "承認済",
    "社内秘",
    "山田太郎",
    "R8/04/28 16:05",
  ],
  [
    "005",
    "auth-gateway",
    "PRJ-2025-00130",
    "認証ゲートウェイ刷新",
    "共通基盤",
    "Java 21",
    6,
    4,
    3,
    "review",
    "レビュー中",
    "社外秘",
    "山田太郎",
    "R8/05/02 14:38",
  ],
  [
    "006",
    "legacy-host-bridge",
    "PRJ-2022-00017",
    "ホスト連携アダプタ（メインフレーム）",
    "勘定系",
    "PL/I",
    2,
    1,
    7,
    "pending",
    "承認待ち",
    "社外秘",
    "鈴木弘子",
    "R8/04/30 19:55",
  ],
  [
    "007",
    "tax-calc-engine",
    "PRJ-2024-00091",
    "税計算エンジン",
    "金融基盤",
    "Java 17",
    5,
    2,
    1,
    "done",
    "承認済",
    "社外秘",
    "田中健太",
    "R8/04/29 11:00",
  ],
  [
    "008",
    "ops-runbooks",
    "PRJ-2023-00012",
    "運用手順書リポジトリ",
    "共通基盤",
    "Markdown",
    1,
    0,
    0,
    "done",
    "承認済",
    "社内秘",
    "運用部",
    "R8/04/29 09:30",
  ],
  [
    "009",
    "customer-data-etl",
    "PRJ-2025-00141",
    "顧客データETLバッチ",
    "情報系",
    "Python",
    3,
    1,
    2,
    "done",
    "承認済",
    "社外秘",
    "伊藤真紀",
    "R8/04/27 15:20",
  ],
  [
    "010",
    "mobile-app-ios",
    "PRJ-2024-00065",
    "顧客向けiOSアプリ",
    "情報系",
    "Swift",
    7,
    2,
    4,
    "done",
    "承認済",
    "社内秘",
    "佐藤雄樹",
    "R8/04/26 18:00",
  ],
] as const;

export function RepositoriesScreen(): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-RPO-001"
      crumbs={[{ label: "開発管理", to: "/repositories" }, { label: "リポジトリ一覧" }]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ一覧"
      rightColumn={
        <>
          <Panel title="よく使う検索条件" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                "★ 自分が担当のもの",
                "★ 承認待ちのもの",
                "★ 重要システム分類",
                "★ 直近1週間更新",
                "★ 期限切れ間近",
              ].map((item) => (
                <li key={item} className={TODO_LIST_ITEM_CLASS}>
                  <span className={TEXT_LINK_CLASS}>{item}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="統計（事業領域別）" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["金融基盤", "3"],
                  ["勘定系", "2"],
                  ["情報系", "3"],
                  ["共通基盤", "3"],
                  ["その他", "1"],
                  ["合計", "12"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className={label === "合計" ? "font-bold" : undefined}>{label}</td>
                    <td className="text-right font-bold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="検索条件"
        action={<span className={TEXT_LINK_CLASS}>［検索条件を保存］</span>}
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-1 border-b border-b-[#c5c5c5] bg-[#f4f6fa] px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <label>リポジトリ名：</label>
            <input className="border border-[#888] px-1.5 py-0.5" />
            <label>管理ID：</label>
            <input className="border border-[#888] px-1.5 py-0.5" placeholder="PRJ-2025-00125" />
            <label>事業領域：</label>
            <select className="border border-[#888] px-1 py-0.5">
              <option>──全て──</option>
              <option>金融基盤</option>
              <option>勘定系</option>
              <option>情報系</option>
              <option>共通基盤</option>
            </select>
            <label>主要言語：</label>
            <select className="border border-[#888] px-1 py-0.5">
              <option>──全て──</option>
              <option>Java</option>
              <option>COBOL85</option>
              <option>PL/I</option>
              <option>TypeScript</option>
              <option>Python</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label>担当者：</label>
            <input className="border border-[#888] px-1.5 py-0.5" placeholder="山田 太郎" />
            <label>承認状態：</label>
            <select className="border border-[#888] px-1 py-0.5">
              <option>──全て──</option>
              <option>承認済</option>
              <option>承認待ち</option>
              <option>レビュー中</option>
              <option>却下</option>
            </select>
            <label>登録日（自）</label>
            <input className="w-[90px] border border-[#888] px-1.5 py-0.5" placeholder="R8/01/01" />
            <label>～（至）</label>
            <input className="w-[90px] border border-[#888] px-1.5 py-0.5" placeholder="R8/12/31" />
            <label>機密区分：</label>
            <select className="border border-[#888] px-1 py-0.5">
              <option>──全て──</option>
              <option>社外秘</option>
              <option>社内秘</option>
              <option>公開可</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label>表示件数：</label>
            <select className="border border-[#888] px-1 py-0.5">
              <option>10</option>
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
            <button type="button" className={buttonClassName({ tone: "primary" })}>
              検索実行
            </button>
            <button type="button" className={buttonClassName()}>
              条件クリア
            </button>
            <button type="button" className={buttonClassName()}>
              CSV出力
            </button>
            <button type="button" className={buttonClassName()}>
              印刷プレビュー
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        title="検索結果"
        action={<span className={MUTED_CLASS}>該当 12件 ／ 令和8年5月3日 8時42分時点</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th rowSpan={2} className="w-[24px]">
                <input type="checkbox" />
              </th>
              <th rowSpan={2} className="w-[40px]">
                No
              </th>
              <th rowSpan={2}>リポジトリ名／管理ID／説明</th>
              <th rowSpan={2} className="w-[80px]">
                事業領域
              </th>
              <th rowSpan={2} className="w-[80px]">
                主要言語
              </th>
              <th colSpan={3} className="w-[180px]">
                件数
              </th>
              <th rowSpan={2} className="w-[80px]">
                承認状態
              </th>
              <th rowSpan={2} className="w-[90px]">
                機密区分
              </th>
              <th rowSpan={2} className="w-[90px]">
                担当者
              </th>
              <th rowSpan={2} className="w-[100px]">
                最終更新
              </th>
              <th rowSpan={2} className="w-[80px]">
                操作
              </th>
            </tr>
            <tr>
              <th className="w-[50px]">BR</th>
              <th className="w-[50px]">PR</th>
              <th className="w-[50px]">課題</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ([
                no,
                name,
                id,
                description,
                domain,
                language,
                br,
                pr,
                issue,
                tone,
                status,
                secrecy,
                owner,
                updated,
              ]) => (
                <tr key={no}>
                  <td className="text-center">
                    <input type="checkbox" />
                  </td>
                  <td className="text-right">{no}</td>
                  <td>
                    <Link to={`/repositories/${name}`} className={TEXT_LINK_CLASS}>
                      <b>{name}</b>
                    </Link>
                    <br />
                    <span className={clsx("text-10", MUTED_CLASS, MONO_CLASS)}>
                      {id} ／ {description}
                    </span>
                  </td>
                  <td className="text-center">{domain}</td>
                  <td className="text-center">{language}</td>
                  <td className="text-right">{br}</td>
                  <td className="text-right">{pr}</td>
                  <td className="text-right">{issue}</td>
                  <td className="text-center">
                    <JtcStatusTag tone={tone}>{status}</JtcStatusTag>
                  </td>
                  <td className="text-center">{secrecy}</td>
                  <td className="text-center">{owner}</td>
                  <td className={clsx("text-center", MONO_CLASS)}>{updated}</td>
                  <td className="text-center">
                    <Link to={`/repositories/${name}`} className={TEXT_LINK_CLASS}>
                      詳細
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        <div className={PAGER_CLASS}>
          <span className={MUTED_CLASS}>全 12件中 1～10件を表示</span>
          <span className={PAGER_LINK_CLASS}>≪先頭</span>
          <span className={PAGER_LINK_CLASS}>＜前</span>
          <span className={clsx(PAGER_LINK_CLASS, PAGER_LINK_ACTIVE_CLASS)}>1</span>
          <span className={PAGER_LINK_CLASS}>2</span>
          <span className={PAGER_LINK_CLASS}>次＞</span>
          <span className={PAGER_LINK_CLASS}>末尾≫</span>
        </div>

        <div className="flex items-center justify-between border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-1.5 py-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClassName()}>
              一括ダウンロード
            </button>
            <button type="button" className={buttonClassName()}>
              CSV出力
            </button>
            <button type="button" className={buttonClassName()}>
              PDF出力
            </button>
            <button type="button" className={buttonClassName()}>
              権限変更申請
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/repositories/new" className={buttonClassName({ tone: "primary" })}>
              ＋ 新規リポジトリ登録申請
            </Link>
            <button type="button" className={buttonClassName({ tone: "danger" })}>
              削除申請
            </button>
          </div>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoriesPage(): JSX.Element {
  return <RepositoriesScreen />;
}
