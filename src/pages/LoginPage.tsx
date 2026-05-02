import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  beginGitHubAppLogin,
  getGitHubAuthConfig,
  normalizeRedirectTo,
  useAuthSession,
  usePasswordLoginMutation,
} from "../app/auth.tsx";
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

interface LoginFormState {
  readonly userId: string;
  readonly password: string;
  readonly otp: string;
  readonly office: string;
  readonly consentAccepted: boolean;
}

const initialFormState: LoginFormState = {
  userId: "yamada.taro",
  password: "password",
  otp: "123456",
  office: "東京本社",
  consentAccepted: true,
};

export function LoginScreen(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionQuery = useAuthSession();
  const passwordLoginMutation = usePasswordLoginMutation();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [githubError, setGitHubError] = useState<string | null>(null);
  const redirectTo = normalizeRedirectTo(searchParams.get("redirectTo"));
  const githubConfig = getGitHubAuthConfig();

  useEffect(() => {
    if (sessionQuery.data !== undefined && sessionQuery.data !== null) {
      void navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, sessionQuery.data]);

  async function handleJtcLogin(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setGitHubError(null);

    try {
      await passwordLoginMutation.mutateAsync(form);
      void navigate(redirectTo, { replace: true });
    } catch {
      return;
    }
  }

  async function handleGitHubLogin(): Promise<void> {
    setGitHubError(null);

    try {
      await beginGitHubAppLogin(redirectTo);
    } catch (error) {
      setGitHubError(error instanceof Error ? error.message : "GitHub ログインの開始に失敗しました。");
    }
  }

  return (
    <div className={BODY_BG_CLASS}>
      <div className="min-h-screen w-full border border-[#888] bg-[#e6e9ef]">
        <div className="flex items-center justify-between border-b-2 border-b-[#555] bg-gradient-to-b from-[#3b6aa3] to-[#1a3e72] px-4 py-2 text-white">
          <div>
            <div className={PRODUCT_NAME_CLASS}>
              JTC GitHub<span className="align-super text-[10px]">®</span> Enterprise Edition 5.2.1
            </div>
            <div className={PRODUCT_SUBTITLE_CLASS}>統合ソースコード管理基盤</div>
          </div>
          <div className="text-[11px]">JTC株式会社 ／ 社内利用専用システム</div>
        </div>

        <div className="flex min-h-[560px] flex-wrap items-start justify-center gap-5 px-8 py-8">
          <div className="mt-5 w-[420px]">
            <Panel title="ログイン" bodyClassName="p-5">
              <div className="mb-4 border border-[#d4a000] bg-[#fff0c0] px-2 py-1.5 text-[11px] leading-[1.5]">
                未ログイン状態のため `/login` にリダイレクトされました。ログイン完了後は
                <span className={clsx("px-1", MONO_CLASS)}>{redirectTo}</span>
                に戻ります。
              </div>

              <form onSubmit={handleJtcLogin}>
                <table className="w-full border-collapse text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-[120px] px-1.5 py-2 text-right font-bold">
                        ユーザーID<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          className="w-full border border-[#888] px-1.5 py-1"
                          value={form.userId}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, userId: event.target.value }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">
                        パスワード<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          type="password"
                          className="w-full border border-[#888] px-1.5 py-1"
                          value={form.password}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, password: event.target.value }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">
                        ワンタイムパスワード<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <input
                          className={clsx("w-full border border-[#888] px-1.5 py-1", MONO_CLASS)}
                          value={form.otp}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, otp: event.target.value }))
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">所属事業所</td>
                      <td className="px-1.5 py-2">
                        <select
                          className="w-full border border-[#888] px-1 py-0.5"
                          value={form.office}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, office: event.target.value }))
                          }
                        >
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
                          <input
                            type="checkbox"
                            checked={form.consentAccepted}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, consentAccepted: event.target.checked }))
                            }
                          />{" "}
                          利用規約および
                          <span className={TEXT_LINK_CLASS}>情報セキュリティ規程</span>に同意します
                        </label>
                      </td>
                    </tr>
                    {passwordLoginMutation.isError ? (
                      <tr>
                        <td colSpan={2} className="px-1.5 py-2">
                          <div className="border border-[#b64242] bg-[#ffe0e0] px-2 py-1 text-[11px] text-[#8e0014]">
                            {passwordLoginMutation.error.message}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <td colSpan={2} className="px-1.5 py-2 text-center">
                        <button
                          type="submit"
                          className={buttonClassName({ tone: "primary", size: "lg" })}
                          disabled={passwordLoginMutation.isPending}
                        >
                          {passwordLoginMutation.isPending ? "ログイン中..." : "社内認証でログイン"}
                        </button>
                        <span className="px-1" />
                        <button
                          type="button"
                          className={buttonClassName({ size: "lg" })}
                          onClick={() => setForm(initialFormState)}
                        >
                          初期値に戻す
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="mt-4 border-t border-t-dotted border-t-[#888] pt-3">
                <div className="mb-2 text-[11px] font-bold text-[#16386b]">GitHub App ログイン</div>
                <div className="mb-2 text-[11px] leading-[1.6]">
                  GitHub App で認証し、GraphQL `viewer` クエリでアカウント情報を取得します。
                </div>
                <button
                  type="button"
                  className={clsx(
                    buttonClassName({ tone: "primary", size: "lg" }),
                    "w-full justify-center disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  disabled={!githubConfig.enabled}
                  onClick={() => void handleGitHubLogin()}
                >
                  GitHub App でログイン
                </button>
                <div className="mt-2 text-[10px] text-[#555]">
                  client_id: {githubConfig.clientId.length > 0 ? "設定済" : "未設定"} ／ exchange endpoint:{" "}
                  {githubConfig.exchangeUrl.length > 0 ? "設定済" : "未設定"}
                </div>
                {githubError === null ? null : (
                  <div className="mt-2 border border-[#b64242] bg-[#ffe0e0] px-2 py-1 text-[11px] text-[#8e0014]">
                    {githubError}
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-t-dotted border-t-[#888] pt-2 text-[11px] leading-[1.7]">
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>パスワードを忘れた方はこちら</span>
                </div>
                <div>
                  ▶ <span className={TEXT_LINK_CLASS}>GitHub App 連携設定手順</span>
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

          <div className="mt-5 w-[420px]">
            <Panel title="お知らせ">
              <div className="text-[11px] leading-[1.6]">
                <div className="font-bold text-[#c8001a]">【重要】R8/05/15 22:00 メンテナンス予定</div>
                <div>5月15日(金) 22:00～翌2:00、本番DB定期メンテナンスを実施します。</div>
                <div className="mt-1.5 font-bold">【重要】GitHub App callback URL 更新のお願い</div>
                <div>
                  開発環境と本番環境で callback URL が異なる場合は GitHub App 側で追加登録してください。
                </div>
                <div className="mt-1.5 font-bold">【再通知】セキュリティ研修受講のお願い</div>
                <div>第二四半期 セキュリティ研修（必須）を5/30までに受講してください。</div>
              </div>
            </Panel>

            <Panel title="GitHub App 連携状態">
              <table className="w-full border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="w-[130px] border border-[#c5c5c5] bg-[#edf1f5] px-1.5 py-1 font-bold">
                      client_id
                    </td>
                    <td className="border border-[#c5c5c5] px-1.5 py-1">
                      {githubConfig.clientId.length > 0 ? (
                        <span className={MONO_CLASS}>{githubConfig.clientId}</span>
                      ) : (
                        <span className="text-[#8e0014]">未設定</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#c5c5c5] bg-[#edf1f5] px-1.5 py-1 font-bold">
                      redirect_uri
                    </td>
                    <td className={clsx("border border-[#c5c5c5] px-1.5 py-1", MONO_CLASS)}>
                      {githubConfig.redirectUri}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#c5c5c5] bg-[#edf1f5] px-1.5 py-1 font-bold">
                      exchange endpoint
                    </td>
                    <td className={clsx("border border-[#c5c5c5] px-1.5 py-1", MONO_CLASS)}>
                      {githubConfig.exchangeUrl.length > 0 ? githubConfig.exchangeUrl : "未設定"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#c5c5c5] bg-[#edf1f5] px-1.5 py-1 font-bold">
                      GraphQL endpoint
                    </td>
                    <td className={clsx("border border-[#c5c5c5] px-1.5 py-1", MONO_CLASS)}>
                      {import.meta.env.VITE_GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-[10px] text-[#555]">
                本画面の GitHub App ログインは `Apollo Client` と codegen 生成型を前提に動作します。
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
                <div className="text-[10px] text-[#555]">
                  ※ callback URL は GitHub App 登録値と完全一致が必要です。
                </div>
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
          <div className={clsx("justify-self-end", MONO_CLASS)}>JTC-LGN-000 ／ Ver.5.2.1.0503</div>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return <LoginScreen />;
}
