import clsx from "clsx";
import { useParams } from "react-router-dom";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  MONO_CLASS,
  MUTED_CLASS,
  PAGER_CLASS,
  PAGER_LINK_ACTIVE_CLASS,
  PAGER_LINK_CLASS,
  TABLE_CLASS,
  TABS_ROW_CLASS,
  TAB_ACTIVE_CLASS,
  TAB_BADGE_CLASS,
  TAB_CLASS,
  TEXT_LINK_CLASS,
  TODO_LIST_CLASS,
  TODO_LIST_ITEM_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const files = [
  ["📁 src/", "－", "R8/05/02 17:45", "yamada.t", "例外処理の修正（IS-2025-00125対応）"],
  ["📁 lib/", "－", "R8/05/02 14:11", "sato.y", "マスタテーブルのインデックス追加"],
  ["📁 doc/", "－", "R8/04/28 16:05", "tanaka.k", "設計書ver1.3 反映"],
  ["📁 test/", "－", "R8/05/02 11:30", "tanaka.k", "テストケース追加（境界値）"],
  ["📁 batch/", "－", "R8/04/22 09:18", "suzuki.h", "夜間バッチ起動スクリプト追加"],
  ["📄 README.docx", "45.2 KB", "R8/04/25 10:24", "yamada.t", "README更新"],
  ["📄 設計書_基本設計.xlsx", "2.1 MB", "R8/04/24 11:05", "sato.y", "基本設計書更新"],
  ["📄 構成図.pptx", "3.7 MB", "R8/04/24 10:58", "sato.y", "構成更新"],
  ["📄 build.gradle", "8.4 KB", "R8/04/22 18:30", "yamada.t", "依存ライブラリ更新"],
  ["📄 .gitignore", "1.2 KB", "R7/12/15 14:02", "tanaka.k", "初版登録"],
  ["📄 ライセンス確認書.pdf", "125 KB", "R7/12/15 14:02", "tanaka.k", "初版登録"],
];

export function RepositoryDetailScreen({
  repoId = "payment-system-core",
}: {
  readonly repoId?: string;
}): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-RPO-002"
      crumbs={[
        { label: "開発管理", to: "/repositories" },
        { label: "リポジトリ一覧", to: "/repositories" },
        { label: "リポジトリ詳細" },
      ]}
      activeTopMenu="開発管理"
      activeSideItem="リポジトリ一覧"
      rightColumn={
        <>
          <Panel title="権限情報" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>あなたの権限</th>
                  <td>
                    <b>書込権限</b>
                  </td>
                </tr>
                <tr>
                  <th>ロール</th>
                  <td>開発者</td>
                </tr>
                <tr>
                  <th>付与日</th>
                  <td className={MONO_CLASS}>R7/12/15</td>
                </tr>
                <tr>
                  <th>有効期限</th>
                  <td className={MONO_CLASS}>R8/12/14</td>
                </tr>
              </tbody>
            </table>
          </Panel>

          <Panel title="統計情報" bodyClassName="p-0">
            <ul className={TODO_LIST_CLASS}>
              {[
                ["総コミット数", "1,284"],
                ["ブランチ数", "12"],
                ["タグ数", "38"],
                ["貢献者数", "14"],
                ["未解決Issue", "9 件"],
                ["未マージPR", "7 件"],
              ].map(([label, value]) => (
                <li key={label} className={TODO_LIST_ITEM_CLASS}>
                  <span>{label}</span>
                  <span className="font-bold text-[#16386b]">{value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="関連ドキュメント">
            <div className="space-y-1.5 text-[11px]">
              <div>
                📄 <span className={TEXT_LINK_CLASS}>基本設計書_v1.3.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>詳細設計書_決済処理.docx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>テスト計画書.xlsx</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>運用手順書.pdf</span>
              </div>
              <div>
                📄 <span className={TEXT_LINK_CLASS}>障害対応マニュアル.pdf</span>
              </div>
            </div>
          </Panel>

          <Panel title="お問い合わせ">
            <HelpDeskPanel />
          </Panel>
        </>
      }
    >
      <Panel
        title="リポジトリ基本情報"
        action={<span className={MUTED_CLASS}>最終更新：R8/05/02 17:45</span>}
        bodyClassName="p-0"
      >
        <table className={TABLE_CLASS}>
          <tbody>
            <tr>
              <th>
                リポジトリ名<span className="font-bold text-[#c8001a]">※</span>
              </th>
              <td className={MONO_CLASS}>
                <b>{repoId}</b>{" "}
                <span className="text-[10px] text-[#555]">（決済システム基盤ソースコード）</span>
              </td>
              <th>管理ID</th>
              <td className={MONO_CLASS}>PRJ-2025-00125</td>
            </tr>
            <tr>
              <th>事業領域</th>
              <td>金融基盤／決済</td>
              <th>主要言語</th>
              <td>Java 17.0.10 / Spring Boot 3.2</td>
            </tr>
            <tr>
              <th>プロジェクト責任者</th>
              <td>佐藤 太一郎（基盤開発二課 課長）</td>
              <th>所属組織</th>
              <td>第一システム事業本部 デジタル基盤統括部</td>
            </tr>
            <tr>
              <th>説明</th>
              <td colSpan={3}>
                決済処理に係るマイクロサービス群。勘定系連携アダプタを含む。本リポジトリは「重要システム」分類のため
                変更管理規程第5条に基づく承認フローを必須とします。
              </td>
            </tr>
            <tr>
              <th>あなたの権限</th>
              <td>
                <b>書込権限あり（開発者ロール）</b>
              </td>
              <th>分類</th>
              <td>
                重要システム ／ 機密区分：<b>社外秘</b>
              </td>
            </tr>
            <tr>
              <th>登録申請日</th>
              <td className={MONO_CLASS}>令和5年4月3日</td>
              <th>最終アクセス</th>
              <td className={MONO_CLASS}>R8/05/02 18:42</td>
            </tr>
          </tbody>
        </table>
      </Panel>

      <Panel
        title="ファイルツリー"
        action={
          <span>
            ブランチ：
            <span className="inline-flex min-w-[96px] items-center border border-[#888] bg-white px-1.5 py-0.5">
              develop ▼
            </span>
            <span className="px-1" />
            <button type="button" className={buttonClassName({ size: "sm" })}>
              更新
            </button>
            <span className="px-1" />
            <button type="button" className={buttonClassName({ size: "sm", tone: "primary" })}>
              アップロード
            </button>
          </span>
        }
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-b-[#c5c5c5] bg-[#f4f6fa] px-2 py-1.5">
          <label>パス：</label>
          <span className={MONO_CLASS}>/</span>
          <label>表示：</label>
          <select className="border border-[#888] px-1 py-0.5">
            <option>全て</option>
            <option>ディレクトリのみ</option>
            <option>ファイルのみ</option>
          </select>
          <label>並び順：</label>
          <select className="border border-[#888] px-1 py-0.5">
            <option>名前順</option>
            <option>更新日時順</option>
            <option>サイズ順</option>
          </select>
          <span className="text-[10px] text-[#555]">
            ※一度にアップロードできるファイルサイズは100MBまでです。
          </span>
        </div>

        <div className={TABS_ROW_CLASS}>
          <span className={TAB_CLASS + " " + TAB_ACTIVE_CLASS}>ファイル一覧</span>
          <span className={TAB_CLASS}>
            コミット履歴 <span className={TAB_BADGE_CLASS}>128</span>
          </span>
          <span className={TAB_CLASS}>変更履歴</span>
          <span className={TAB_CLASS}>
            プルリクエスト <span className={TAB_BADGE_CLASS}>7</span>
          </span>
          <span className={TAB_CLASS}>ブランチ／タグ</span>
          <span className={TAB_CLASS}>アクセス履歴</span>
          <span className={TAB_CLASS}>設定</span>
        </div>

        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-[24px]">
                <input type="checkbox" />
              </th>
              <th>名前</th>
              <th className="w-[80px]">サイズ</th>
              <th className="w-[110px]">更新日時</th>
              <th className="w-[100px]">更新者</th>
              <th>最終コミットメッセージ</th>
              <th className="w-[80px]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center"> </td>
              <td className={MONO_CLASS}>
                <span className={MUTED_CLASS}>↰ ..</span>
              </td>
              <td>－</td>
              <td>－</td>
              <td>－</td>
              <td>－</td>
              <td>－</td>
            </tr>
            {files.map(([name, size, updated, author, message]) => (
              <tr key={name}>
                <td className="text-center">
                  <input type="checkbox" />
                </td>
                <td className={MONO_CLASS}>{name}</td>
                <td className="text-right">{size}</td>
                <td className={MONO_CLASS}>{updated}</td>
                <td>{author}</td>
                <td>{message}</td>
                <td className="text-center">
                  <span className={TEXT_LINK_CLASS}>詳細</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={PAGER_CLASS}>
          <span className={MUTED_CLASS}>全 23件中 1～11件を表示</span>
          <span className={PAGER_LINK_CLASS + " " + PAGER_LINK_ACTIVE_CLASS}>1</span>
          <span className={PAGER_LINK_CLASS}>2</span>
          <span className={PAGER_LINK_CLASS}>3</span>
          <span className={PAGER_LINK_CLASS}>次＞</span>
        </div>

        <div className="flex items-center justify-between border-t border-t-[#c5c5c5] bg-[#f4f6fa] px-1.5 py-1">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClassName()}>
              削除
            </button>
            <button type="button" className={buttonClassName()}>
              ダウンロード
            </button>
            <button type="button" className={buttonClassName()}>
              コピー
            </button>
            <button type="button" className={buttonClassName()}>
              移動
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClassName({ tone: "primary" })}>
              ＋ 新規ファイル
            </button>
            <button type="button" className={buttonClassName()}>
              CSV出力
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="README.docx プレビュー">
        <div className={clsx("min-h-[120px] bg-[#f8f5e8] p-3 text-[11px]", MONO_CLASS)}>
          <div className="text-center text-[14px] font-bold">決済システム基盤 ソースコード管理リポジトリ</div>
          <div className="mb-2 text-right text-[10px]">令和8年4月25日 第3.2版</div>
          <div className="mb-1 border-b-2 border-b-black pb-0.5 font-bold">1．本リポジトリの目的</div>
          <div>
            本リポジトリは、決済システム基盤に係るソースコード及び関連ドキュメントを一元管理することを目的とする。
            <br />
            運用・保守作業時には別途定める「変更管理手順書」に従うこと。
          </div>
          <div className="mb-1 mt-2 border-b-2 border-b-black pb-0.5 font-bold">2．連絡先</div>
          <div>
            本件に関する問合せは下記までお願い致します。
            <br />
            　基盤開発二課 佐藤 太一郎（内線：1234）
          </div>
        </div>
      </Panel>
    </JtcChrome>
  );
}

export default function RepositoryDetailPage(): JSX.Element {
  const { repoId } = useParams();

  return <RepositoryDetailScreen repoId={repoId ?? "payment-system-core"} />;
}
