import { PageHeader } from "../app/components/PageHeader.tsx";
import { Panel } from "../app/components/Panel.tsx";
import { BULLET_LIST_CLASS, COMPACT_TABLE_CLASS, TABLE_CLASS } from "../app/styles.ts";
import { profile } from "../data/mockData.ts";

export default function ProfilePage(): JSX.Element {
  return (
    <div className="space-y-4">
      <PageHeader
        title="利用者プロフィール"
        summary="所属、権限、連絡先、個人設定を一覧する社内システムらしいプロフィール画面です。"
        breadcrumbs={[{ label: "利用者情報", to: "/" }, { label: "プロフィール" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="利用者基本情報">
          <table className={COMPACT_TABLE_CLASS}>
            <tbody>
              <tr>
                <th>利用者ID</th>
                <td>{profile.userId}</td>
              </tr>
              <tr>
                <th>氏名</th>
                <td>{profile.name}</td>
              </tr>
              <tr>
                <th>所属</th>
                <td>{profile.department}</td>
              </tr>
              <tr>
                <th>役職</th>
                <td>{profile.role}</td>
              </tr>
              <tr>
                <th>メール</th>
                <td>{profile.mail}</td>
              </tr>
              <tr>
                <th>内線</th>
                <td>{profile.extension}</td>
              </tr>
            </tbody>
          </table>
        </Panel>

        <Panel title="付与権限一覧">
          <table className={TABLE_CLASS}>
            <thead>
              <tr>
                <th>権限領域</th>
                <th>付与内容</th>
              </tr>
            </thead>
            <tbody>
              {profile.permissions.map((permission) => (
                <tr key={permission.area}>
                  <td>{permission.area}</td>
                  <td>{permission.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="個人設定メモ">
        <ul className={BULLET_LIST_CLASS}>
          <li>文字サイズは画面右上の切替から設定できます。</li>
          <li>承認待ち通知は 08:30 / 12:00 / 16:00 の 1 日 3 回で配信されます。</li>
          <li>監査 CSV は所属部門配下のみ出力可能です。</li>
          <li>配布権限が必要な場合は構成管理室へ申請してください。</li>
        </ul>
      </Panel>
    </div>
  );
}
