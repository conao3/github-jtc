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
      <div className="flex h-full w-full flex-col border border-slate-400 bg-slate-200">
        <div className="flex items-center justify-between border-b-2 border-b-slate-600 bg-gradient-to-b from-blue-700 to-blue-900 px-4 py-2 text-white">
          <div>
            <div className={PRODUCT_NAME_CLASS}>
              JTC GitHub<span className="align-super text-xs">®</span> エンタープライズ版 5.2.1
            </div>
            <div className={PRODUCT_SUBTITLE_CLASS}>GitHub App 認証処理</div>
          </div>
          <div className="text-xs">GitHub App 認証コールバック処理</div>
        </div>

        <div className="mx-auto flex min-h-0 flex-1 max-w-4xl items-center overflow-auto px-6 py-10">
          <div className="w-full">
            <Panel title="GitHub App ログイン処理">
              {error !== null ? (
                <div className="space-y-2 text-xs">
                  <div className="border border-red-500 bg-red-100 px-3 py-2 text-red-800">
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
                <div className="space-y-2 text-xs">
                  <div className="border border-red-500 bg-red-100 px-3 py-2 text-red-800">
                    コールバックURL に必要な `code` または `state` が含まれていません。
                  </div>
                  <div>`/login/callback` は GitHub 認証完了後のリダイレクト先として利用してください。</div>
                </div>
              ) : callbackMutation.isPending ? (
                <div className="space-y-2 text-xs">
                  <div className="border border-amber-500 bg-amber-100 px-3 py-2">
                    GitHub 認証コードを交換し、GraphQL で利用者情報を取得しています。
                  </div>
                  <div className={MONO_CLASS}>code: {code}</div>
                  <div className={MONO_CLASS}>state: {returnedState}</div>
                </div>
              ) : callbackMutation.isError ? (
                <div className="space-y-2 text-xs">
                  <div className="border border-red-500 bg-red-100 px-3 py-2 text-red-800">
                    GitHub 認証コードの交換に失敗しました。
                  </div>
                  <div>{callbackMutation.error.message}</div>
                  <div className="text-xs text-slate-600">
                    `VITE_GITHUB_APP_EXCHANGE_URL` と GitHub App のコールバックURL設定を確認してください。
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="border border-green-500 bg-green-100 px-3 py-2 text-green-800">
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
