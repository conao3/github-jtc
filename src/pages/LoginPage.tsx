import clsx from "clsx";

import { Panel } from "../app/components/Panel.tsx";
import {
  BODY_BG_CLASS,
  CONTACT_BOX_CLASS,
  CONTACT_BOX_TITLE_CLASS,
  FOOTER_CLASS,
  MONO_CLASS,
  PRODUCT_NAME_CLASS,
  PRODUCT_SUBTITLE_CLASS,
  TEXT_LINK_CLASS,
  buttonClassName,
} from "../app/styles.ts";

export function LoginScreen(): JSX.Element {
  return (
    <div className={BODY_BG_CLASS}>
      <div className="mx-auto w-[1280px] border border-[#888] bg-[#e6e9ef]">
        <div className="flex items-center justify-between border-b-2 border-b-[#555] bg-gradient-to-b from-[#3b6aa3] to-[#1a3e72] px-4 py-2 text-white">
          <div>
            <div className={PRODUCT_NAME_CLASS}>
              JTC GitHub<span className="align-super text-[10px]">®</span> Enterprise Edition 5.2.1
            </div>
            <div className={PRODUCT_SUBTITLE_CLASS}>統合ソースコード管理基盤</div>
          </div>
          <div className="text-[11px]">JTC株式会社 ／ 社内利用専用システム</div>
        </div>

        <div className="flex min-h-[560px] items-start justify-center gap-5 px-8 py-8">
          <div className="mt-5 w-[380px]">
            <Panel title="ログイン" bodyClassName="p-5">
              <div className="mb-4 border border-[#d4a000] bg-[#fff0c0] px-2 py-1.5 text-[11px] leading-[1.5]">
                本システムは社内利用者のみ使用可能です。不正アクセスは情報セキュリティ規程に基づき処分の対象となります。
              </div>
              <table className="w-full border-collapse text-[12px]">
                <tbody>
                  <tr>
                    <td className="w-[120px] px-1.5 py-2 text-right font-bold">
                      ユーザーID<span className="text-[#c8001a]">※</span>
                    </td>
                    <td className="px-1.5 py-2">
                      <input
                        className="w-full border border-[#888] px-1.5 py-1"
                        placeholder="例：yamada.taro"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-1.5 py-2 text-right font-bold">
                      パスワード<span className="text-[#c8001a]">※</span>
                    </td>
                    <td className="px-1.5 py-2">
                      <input type="password" className="w-full border border-[#888] px-1.5 py-1" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-1.5 py-2 text-right font-bold">
                      ワンタイムパスワード<span className="text-[#c8001a]">※</span>
                    </td>
                    <td className="px-1.5 py-2">
                      <input
                        className={clsx("w-full border border-[#888] px-1.5 py-1", MONO_CLASS)}
                        placeholder="6桁の数字"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-1.5 py-2 text-right font-bold">所属事業所</td>
                    <td className="px-1.5 py-2">
                      <select className="w-full border border-[#888] px-1 py-0.5">
                        <option>東京本社</option>
                        <option>大阪支社</option>
                        <option>名古屋支社</option>
                        <option>福岡支社</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-1.5 py-2 text-[11px]">
                      <label>
                        <input type="checkbox" /> 利用規約および
                        <span className={TEXT_LINK_CLASS}>情報セキュリティ規程</span>に同意します
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-1.5 py-2 text-center">
                      <button type="button" className={buttonClassName({ tone: "primary", size: "lg" })}>
                        ログイン
                      </button>
                      <span className="px-1" />
                      <button type="button" className={buttonClassName({ size: "lg" })}>
                        クリア
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 border-t border-t-dotted border-t-[#888] pt-2 text-[11px] leading-[1.7]">
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>パスワードを忘れた方はこちら</span>
                </div>
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>アカウント発行の申請（社員番号必須）</span>
                </div>
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>操作マニュアル（PDF）</span>
                </div>
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>よくあるご質問</span>
                </div>
              </div>
            </Panel>
          </div>

          <div className="mt-5 w-[360px]">
            <Panel title="お知らせ">
              <div className="text-[11px] leading-[1.6]">
                <div className="font-bold text-[#c8001a]">【重要】R8/05/15 22:00 メンテナンス予定</div>
                <div>5月15日(金) 22:00～翌2:00、本番DB定期メンテナンスを実施します。</div>
                <div className="mt-1.5 font-bold">【重要】パスワード定期変更のお願い</div>
                <div>6月30日までにパスワードの変更をお願いします。</div>
                <div className="mt-1.5 font-bold">【再通知】セキュリティ研修受講のお願い</div>
                <div>第二四半期 セキュリティ研修（必須）を5/30までに受講してください。</div>
              </div>
            </Panel>

            <Panel title="推奨環境">
              <div className="text-[11px] leading-[1.7]">
                <div>● Microsoft Edge（IEモード）</div>
                <div>● Internet Explorer 11</div>
                <div>● Google Chrome（最新版）</div>
                <div className="text-[10px] text-[#555]">
                  ※ 上記以外のブラウザでは正常に動作しない場合があります。
                </div>
                <div className="text-[10px] text-[#555]">※ 画面解像度：1280×800以上</div>
                <div className="text-[10px] text-[#555]">※ JavaScript／Cookieを有効にしてください。</div>
              </div>
            </Panel>

            <Panel title="ヘルプデスク">
              <div className={CONTACT_BOX_CLASS}>
                <div className={CONTACT_BOX_TITLE_CLASS}>▶ お問い合わせ先</div>
                <span className={clsx("font-bold", MONO_CLASS)}>内線：9999</span>
                <br />
                <span className="text-[10px]">外線：03-1234-5678</span>
                <br />
                <span className="text-[10px]">対応時間：平日 9:00～17:30</span>
              </div>
            </Panel>
          </div>
        </div>

        <footer className={FOOTER_CLASS}>
          <div>Copyright © 2026 JTC Corporation, All rights reserved.</div>
          <div className="justify-self-center">
            <span className={TEXT_LINK_CLASS}>サイトマップ</span>｜
            <span className={TEXT_LINK_CLASS}>プライバシーポリシー</span>｜
            <span className={TEXT_LINK_CLASS}>利用規約</span>
          </div>
          <div className={clsx("justify-self-end", MONO_CLASS)}>JTC-LGN-000 ／ Ver.5.2.1.0428</div>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return <LoginScreen />;
}
