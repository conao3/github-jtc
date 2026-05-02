import clsx from "clsx";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import {
  beginGitHubAppLogin,
  getGitHubAuthConfig,
  normalizeRedirectTo,
  useAuthSession,
} from "../app/auth.tsx";
import { FormErrorList } from "../app/components/FormErrorList.tsx";
import { zodValidators } from "../app/formValidation.ts";
import { Panel } from "../app/components/Panel.tsx";
import {
  BODY_BG_CLASS,
  CONTACT_BOX_CLASS,
  CONTACT_BOX_TITLE_CLASS,
  FOOTER_CLASS,
  FORM_CONTROL_INVALID_CLASS,
  MONO_CLASS,
  PRODUCT_NAME_CLASS,
  PRODUCT_SUBTITLE_CLASS,
  TEXT_LINK_CLASS,
  buttonClassName,
} from "../app/styles.ts";

const loginFieldValidators = {
  userId: z.string().min(1, "ユーザーIDを入力してください。"),
  password: z.string().min(1, "パスワードを入力してください。"),
  otp: z.string().regex(/^\d{6}$/, "ワンタイムパスワードは6桁の数字で入力してください。"),
  office: z.string().min(1, "所属事業所を選択してください。"),
  consentAccepted: z.boolean().refine((value) => value, {
    message: "利用規約および情報セキュリティ規程への同意が必要です。",
  }),
} as const;

type LoginFormState = {
  userId: string;
  password: string;
  otp: string;
  office: string;
  consentAccepted: boolean;
};

const initialFormState: LoginFormState = {
  userId: "",
  password: "",
  otp: "",
  office: "東京本社",
  consentAccepted: false,
};

export function LoginScreen(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionQuery = useAuthSession();
  const [isOutageDialogOpen, setIsOutageDialogOpen] = useState(false);
  const [githubError, setGitHubError] = useState<string | null>(null);
  const redirectTo = normalizeRedirectTo(searchParams.get("redirectTo"));
  const githubConfig = getGitHubAuthConfig();
  const form = useForm({
    defaultValues: initialFormState,
    onSubmit: async () => {
      setGitHubError(null);
      setIsOutageDialogOpen(true);
    },
  });

  useEffect(() => {
    if (sessionQuery.data !== undefined && sessionQuery.data !== null) {
      void navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, sessionQuery.data]);

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

        <div className="flex min-h-[560px] flex-wrap items-start justify-center gap-5 px-[30px] py-[30px]">
          <div className="mt-5 w-[380px]">
            <Panel title="ログイン" bodyClassName="p-5">
              <div className="mb-3.5 border border-[#d4a000] bg-[#fff0c0] px-2 py-1.5 text-[11px] leading-[1.5]">
                本システムは社内利用者のみ使用可能です。不正アクセスは情報セキュリティ規程に基づき処分の対象となります。
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void form.handleSubmit();
                }}
              >
                <table className="w-full border-collapse text-[12px]">
                  <tbody>
                    <tr>
                      <td className="w-[120px] px-1.5 py-2 text-right font-bold">
                        ユーザーID<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <form.Field name="userId" validators={zodValidators(loginFieldValidators.userId)}>
                          {(field) => (
                            <>
                              <input
                                name={field.name}
                                className={clsx(
                                  "w-full border border-[#888] px-1 py-[3px]",
                                  field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                                )}
                                placeholder="例：yamada.taro"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                              />
                              <FormErrorList errors={field.state.meta.errors} />
                            </>
                          )}
                        </form.Field>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">
                        パスワード<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <form.Field name="password" validators={zodValidators(loginFieldValidators.password)}>
                          {(field) => (
                            <>
                              <input
                                name={field.name}
                                type="password"
                                className={clsx(
                                  "w-full border border-[#888] px-1 py-[3px]",
                                  field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                                )}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                              />
                              <FormErrorList errors={field.state.meta.errors} />
                            </>
                          )}
                        </form.Field>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">
                        ワンタイムパスワード<span className="text-[#c8001a]">※</span>
                      </td>
                      <td className="px-1.5 py-2">
                        <form.Field name="otp" validators={zodValidators(loginFieldValidators.otp)}>
                          {(field) => (
                            <>
                              <input
                                name={field.name}
                                className={clsx(
                                  "w-full border border-[#888] px-1 py-[3px]",
                                  MONO_CLASS,
                                  field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                                )}
                                placeholder="6桁の数字"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                              />
                              <FormErrorList errors={field.state.meta.errors} />
                            </>
                          )}
                        </form.Field>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-1.5 py-2 text-right font-bold">所属事業所</td>
                      <td className="px-1.5 py-2">
                        <form.Field name="office" validators={zodValidators(loginFieldValidators.office)}>
                          {(field) => (
                            <>
                              <select
                                name={field.name}
                                className={clsx(
                                  "w-full border border-[#888] px-1 py-[2px]",
                                  field.state.meta.errors.length > 0 && FORM_CONTROL_INVALID_CLASS,
                                )}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                              >
                                <option>東京本社</option>
                                <option>大阪支社</option>
                                <option>名古屋支社</option>
                                <option>福岡支社</option>
                              </select>
                              <FormErrorList errors={field.state.meta.errors} />
                            </>
                          )}
                        </form.Field>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-1.5 py-2 text-[11px]">
                        <form.Field
                          name="consentAccepted"
                          validators={zodValidators(loginFieldValidators.consentAccepted)}
                        >
                          {(field) => (
                            <>
                              <label>
                                <input
                                  name={field.name}
                                  type="checkbox"
                                  checked={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.checked)}
                                />{" "}
                                利用規約および
                                <span className={TEXT_LINK_CLASS}>情報セキュリティ規程</span>に同意します
                              </label>
                              <FormErrorList errors={field.state.meta.errors} />
                            </>
                          )}
                        </form.Field>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-1.5 py-2 text-center">
                        <button type="submit" className={buttonClassName({ tone: "primary", size: "lg" })}>
                          ログイン
                        </button>
                        <span className="px-1" />
                        <button
                          type="button"
                          className={buttonClassName({ size: "lg" })}
                          onClick={() => {
                            setGitHubError(null);
                            form.reset();
                          }}
                        >
                          クリア
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="mt-3.5 border-t border-t-dotted border-t-[#888] pt-2 text-[11px] leading-[1.6]">
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
                <div className="mt-1.5 font-bold text-[#c8001a]">【障害】社内認証基盤 接続障害</div>
                <div>
                  現在、社内統合認証基盤に断続的な障害が発生しています。ログインボタン押下後は案内に従い
                  GitHub ログインをご利用ください。
                </div>
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
          <div className={clsx("justify-self-end", MONO_CLASS)}>JTC-LGN-000 ／ Ver.5.2.1.0503</div>
        </footer>
      </div>

      <ModalOverlay
        isOpen={isOutageDialogOpen}
        onOpenChange={setIsOutageDialogOpen}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.46)] p-4"
      >
        <Modal className="w-full max-w-[560px] border border-[#666] bg-[#f4f6fa] shadow-[0_18px_40px_rgba(0,0,0,0.35)] outline-none">
          <Dialog className="outline-none">
            <div className="border-b border-b-[#7c8b9d] bg-gradient-to-b from-[#e8edf4] to-[#c7d1df] px-3 py-2 text-[12px] font-bold text-[#10233f]">
              ログイン方式切替のお知らせ
            </div>
            <div className="space-y-3 p-4 text-[12px] leading-[1.7] text-[#222]">
              <div className="border border-[#c8001a] bg-[#fff0c0] px-3 py-2 text-[11px] text-[#8e0014]">
                現在、社内統合認証基盤が障害中のため、通常の「ログイン」はご利用いただけません。
              </div>
              <div>
                臨時運用として、
                <b>GitHub App ログイン</b>
                を利用してください。認証後は
                <span className={clsx("px-1", MONO_CLASS)}>{redirectTo}</span>
                に戻ります。
              </div>
              <div className="border border-[#c5c5c5] bg-white px-3 py-2 text-[11px]">
                <div>
                  GitHub client_id：
                  {githubConfig.clientId.length > 0 ? (
                    <span className={MONO_CLASS}>{githubConfig.clientId}</span>
                  ) : (
                    "未設定"
                  )}
                </div>
                <div>
                  callback URL：
                  <span className={clsx("ml-1", MONO_CLASS)}>{githubConfig.redirectUri}</span>
                </div>
                <div>
                  exchange endpoint：
                  <span className={clsx("ml-1", MONO_CLASS)}>
                    {githubConfig.exchangeUrl.length > 0 ? githubConfig.exchangeUrl : "未設定"}
                  </span>
                </div>
              </div>
              {githubError === null ? null : (
                <div className="border border-[#b64242] bg-[#ffe0e0] px-3 py-2 text-[11px] text-[#8e0014]">
                  {githubError}
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-t-dotted border-t-[#999] pt-3">
                <button
                  type="button"
                  className={buttonClassName()}
                  onClick={() => setIsOutageDialogOpen(false)}
                >
                  閉じる
                </button>
                <button
                  type="button"
                  className={clsx(
                    buttonClassName({ tone: "primary" }),
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  disabled={!githubConfig.enabled}
                  onClick={() => void handleGitHubLogin()}
                >
                  GitHubでログイン
                </button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return <LoginScreen />;
}
