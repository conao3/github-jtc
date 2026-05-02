import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGitHubCallbackMutation } from "../app/auth.tsx";
import { Panel } from "../app/components/Panel.tsx";
import {
  BODY_BG_CLASS,
  FOOTER_CLASS,
  MONO_CLASS,
  PRODUCT_NAME_CLASS,
  PRODUCT_SUBTITLE_CLASS,
  TEXT_LINK_CLASS,
} from "../app/styles.ts";

export function LoginCallbackScreen(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackMutation = useGitHubCallbackMutation();
  const startedRef = useRef(false);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (startedRef.current || error !== null || code === null || returnedState === null) {
      return;
    }

    startedRef.current = true;

    void callbackMutation
      .mutateAsync({ code, returnedState })
      .then(({ redirectTo }) => {
        void navigate(redirectTo, { replace: true });
      })
      .catch(() => undefined);
  }, [callbackMutation, code, error, navigate, returnedState]);

  return (
    <div className={BODY_BG_CLASS}>
      <div className="min-h-screen w-full border border-[#888] bg-[#e6e9ef]">
        <div className="flex items-center justify-between border-b-2 border-b-[#555] bg-gradient-to-b from-[#3b6aa3] to-[#1a3e72] px-4 py-2 text-white">
          <div>
            <div className={PRODUCT_NAME_CLASS}>
              JTC GitHub<span className="align-super text-10">®</span> Enterprise Edition 5.2.1
            </div>
            <div className={PRODUCT_SUBTITLE_CLASS}>GitHub App 認証処理</div>
          </div>
          <div className="text-11">GitHub App OAuth callback handler</div>
        </div>

        <div className="mx-auto flex min-h-[560px] max-w-[720px] items-center px-6 py-10">
          <div className="w-full">
            <Panel title="GitHub App ログイン処理">
              {error !== null ? (
                <div className="space-y-2 text-11">
                  <div className="border border-[#b64242] bg-[#ffe0e0] px-3 py-2 text-[#8e0014]">
                    GitHub 側で認証が完了しませんでした。
                  </div>
                  <div>
                    <b>error:</b> <span className={MONO_CLASS}>{error}</span>
                  </div>
                  <div>
                    <b>description:</b> {errorDescription ?? "詳細説明は返却されませんでした。"}
                  </div>
                </div>
              ) : code === null || returnedState === null ? (
                <div className="space-y-2 text-11">
                  <div className="border border-[#b64242] bg-[#ffe0e0] px-3 py-2 text-[#8e0014]">
                    callback URL に必要な `code` または `state` が含まれていません。
                  </div>
                  <div>`/login/callback` は GitHub 認証完了後のリダイレクト先として利用してください。</div>
                </div>
              ) : callbackMutation.isPending ? (
                <div className="space-y-2 text-11">
                  <div className="border border-[#d4a000] bg-[#fff0c0] px-3 py-2">
                    GitHub 認証コードを交換し、GraphQL でユーザー情報を取得しています。
                  </div>
                  <div className={MONO_CLASS}>code: {code}</div>
                  <div className={MONO_CLASS}>state: {returnedState}</div>
                </div>
              ) : callbackMutation.isError ? (
                <div className="space-y-2 text-11">
                  <div className="border border-[#b64242] bg-[#ffe0e0] px-3 py-2 text-[#8e0014]">
                    GitHub 認証コードの交換に失敗しました。
                  </div>
                  <div>{callbackMutation.error.message}</div>
                  <div className="text-10 text-[#555]">
                    `VITE_GITHUB_APP_EXCHANGE_URL` と GitHub App の callback URL 設定を確認してください。
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-11">
                  <div className="border border-[#2a7f45] bg-[#dff3e5] px-3 py-2 text-[#176535]">
                    認証が完了しました。元の画面にリダイレクトします。
                  </div>
                </div>
              )}
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
          <div className={MONO_CLASS}>JTC-LGN-CB-001 ／ Ver.5.2.1.0503</div>
        </footer>
      </div>
    </div>
  );
}

export default function LoginCallbackPage(): JSX.Element {
  return <LoginCallbackScreen />;
}
