import clsx from "clsx";

import { HelpDeskPanel, JtcChrome } from "../app/components/JtcChrome.tsx";
import { JtcStatusTag } from "../app/components/JtcIndicators.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  KPI_CARD_CLASS,
  KPI_LABEL_CLASS,
  KPI_ROW_CLASS,
  KPI_UNIT_CLASS,
  KPI_VALUE_CLASS,
  MONO_CLASS,
  MUTED_CLASS,
  TABLE_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const roles = [
  ["1", "開発者（一般）", "payment-system-core", "R7/12/15", "R8/12/14", "done", "有効", "佐藤太一郎"],
  ["2", "開発者（一般）", "auth-gateway", "R8/01/10", "R8/12/14", "done", "有効", "佐藤太一郎"],
  ["3", "レビュア", "customer-portal-front", "R7/06/01", "R8/05/31", "review", "期限間近", "田中健太"],
  ["4", "閲覧者", "internal-design-doc", "R6/04/01", "R9/03/31", "done", "有効", "田中健太"],
  ["5", "開発者（一般）", "legacy-host-bridge", "R5/04/01", "R8/03/31", "rejected", "期限切", "前任者"],
] as const;

const trainings = [
  ["1", "情報セキュリティ研修（必須） 第7回", "研修", "R7/10/15", "R8/10/14", "done", "有効"],
  ["2", "個人情報保護法研修", "研修", "R7/06/22", "R8/06/21", "review", "期限間近"],
  ["3", "情報処理安全確保支援士", "資格", "R5/04/01", "R8/03/31", "done", "有効（更新済）"],
  ["4", "応用情報技術者", "資格", "H30/10/15", "－", "done", "有効"],
  ["5", "勘定系システム業務研修（社内）", "研修", "R6/09/10", "－", "done", "修了"],
] as const;

export function ProfileScreen(): JSX.Element {
  return (
    <JtcChrome
      screenId="JTC-USR-005"
      crumbs={[
        { label: "共通管理", to: "/profile" },
        { label: "ユーザー管理", to: "/profile" },
        { label: "ユーザー詳細（プロフィール）" },
      ]}
      activeTopMenu="共通管理"
      activeSideItem="ユーザー管理"
      rightColumn={
        <>
          <Panel title="操作メニュー">
            <div className="flex flex-col gap-1">
              {[
                "プロフィール編集",
                "パスワード変更",
                "SSH鍵管理",
                "アクセストークン",
                "通知設定",
                "代理者設定",
              ].map((label) => (
                <button key={label} type="button" className={buttonClassName()}>
                  {label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="緊急連絡先">
            <div className="text-xs">
              <div className="font-bold">所属長：佐藤 太一郎</div>
              <div className={clsx("text-xs", MONO_CLASS)}>内線：1020</div>
              <div className={clsx("text-xs", MONO_CLASS)}>携帯：090-XXXX-XXXX</div>
              <div className="mt-2 border-t border-t-dotted border-t-slate-400 pt-2">
                <div className="font-bold">ヘルプデスク</div>
                <div className={clsx("text-xs", MONO_CLASS)}>内線：9999</div>
                <div className="text-xs">対応：平日 9:00-17:30</div>
              </div>
            </div>
          </Panel>

          <Panel title="最近のログイン履歴" bodyClassName="p-0">
            <table className={TABLE_CLASS}>
              <tbody>
                {[
                  ["R8/05/02 18:42", "PC（社内）"],
                  ["R8/05/02 09:01", "PC（社内）"],
                  ["R8/05/01 18:55", "PC（社内）"],
                  ["R8/05/01 08:58", "PC（社内）"],
                  ["R8/04/30 17:20", "PC（在宅）"],
                ].map(([date, device]) => (
                  <tr key={`${date}:${device}`}>
                    <td className={clsx("text-center", MONO_CLASS)}>{date}</td>
                    <td className="text-center">{device}</td>
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
      <Panel title="基本情報" action={<span className={MUTED_CLASS}>最終更新：R8/04/22 10:38</span>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="text-center">
            <div
              className={clsx(
                "mx-auto flex h-32 w-24 items-center justify-center border-2 border-slate-600 bg-gradient-to-br from-slate-300 to-slate-400 text-5xl text-white",
                MONO_CLASS,
              )}
            >
              山田
            </div>
            <div className="mt-1 text-xs text-slate-600">
              証明写真
              <br />
              （R7/04/01撮影）
            </div>
            <button type="button" className={buttonClassName({ size: "sm", className: "mt-1" })}>
              変更申請
            </button>
          </div>
          <div>
            <table className={TABLE_CLASS}>
              <tbody>
                <tr>
                  <th>
                    ユーザーID<span className="font-bold text-red-700">※</span>
                  </th>
                  <td className={MONO_CLASS}>
                    <b>yamada.taro</b>
                  </td>
                  <th>社員番号</th>
                  <td className={MONO_CLASS}>10024531</td>
                </tr>
                <tr>
                  <th>氏名（漢字）</th>
                  <td>
                    <b>山田 太郎</b>
                  </td>
                  <th>氏名（カナ）</th>
                  <td>ヤマダ タロウ</td>
                </tr>
                <tr>
                  <th>氏名（英字）</th>
                  <td>YAMADA Taro</td>
                  <th>表示名</th>
                  <td>山田太郎</td>
                </tr>
                <tr>
                  <th>所属</th>
                  <td colSpan={3}>第一システム事業本部 デジタル基盤統括部 基盤開発二課</td>
                </tr>
                <tr>
                  <th>役職</th>
                  <td>主任</td>
                  <th>等級</th>
                  <td>S2-3</td>
                </tr>
                <tr>
                  <th>入社年月日</th>
                  <td className={MONO_CLASS}>平成27年4月1日</td>
                  <th>勤続</th>
                  <td>11年1ヶ月</td>
                </tr>
                <tr>
                  <th>勤務地</th>
                  <td>東京本社（千代田区）8F</td>
                  <th>内線</th>
                  <td className={MONO_CLASS}>03-1234-5678 / 内線 1024</td>
                </tr>
                <tr>
                  <th>メール</th>
                  <td className={MONO_CLASS}>yamada.taro@jtc-corp.example.co.jp</td>
                  <th>勤務形態</th>
                  <td>常勤（在宅勤務週2日可）</td>
                </tr>
                <tr>
                  <th>所属長</th>
                  <td>佐藤 太一郎（基盤開発二課 課長）</td>
                  <th>承認権限者</th>
                  <td>田中 健太（デジタル基盤統括部 部長）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <Panel title="権限・ロール情報" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>ロール</th>
              <th>付与範囲</th>
              <th className="w-24">付与日</th>
              <th className="w-24">有効期限</th>
              <th className="w-20">状態</th>
              <th className="w-20">付与者</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(([no, role, scope, from, until, tone, label, grantor]) => (
              <tr key={no}>
                <td className="text-center">{no}</td>
                <td>{role}</td>
                <td className={MONO_CLASS}>{scope}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{from}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{until}</td>
                <td className="text-center">
                  <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
                </td>
                <td className="text-center">{grantor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-t-slate-300 bg-slate-50 px-1.5 py-1 text-right">
          <button type="button" className={buttonClassName()}>
            ＋ 権限申請
          </button>
          <span className="px-1" />
          <button type="button" className={buttonClassName()}>
            権限延長申請
          </button>
        </div>
      </Panel>

      <Panel title="活動実績（直近30日）">
        <div className={KPI_ROW_CLASS}>
          {[
            ["コミット数", "42"],
            ["PR作成数", "8"],
            ["レビュー対応", "15"],
            ["課題対応数", "11"],
          ].map(([label, value]) => (
            <div key={label} className={KPI_CARD_CLASS}>
              <div className={KPI_LABEL_CLASS}>{label}</div>
              <div className={KPI_VALUE_CLASS}>
                {value}
                <span className={KPI_UNIT_CLASS}>件</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="研修・資格" bodyClassName="p-0">
        <table className={TABLE_CLASS}>
          <thead>
            <tr>
              <th className="w-10">No</th>
              <th>名称</th>
              <th className="w-20">区分</th>
              <th className="w-24">取得日</th>
              <th className="w-24">有効期限</th>
              <th className="w-20">状態</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map(([no, name, kind, got, limit, tone, label]) => (
              <tr key={no}>
                <td className="text-center">{no}</td>
                <td>{name}</td>
                <td className="text-center">{kind}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{got}</td>
                <td className={clsx("text-center", MONO_CLASS)}>{limit}</td>
                <td className="text-center">
                  <JtcStatusTag tone={tone}>{label}</JtcStatusTag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </JtcChrome>
  );
}

export default function ProfilePage(): JSX.Element {
  return <ProfileScreen />;
}
