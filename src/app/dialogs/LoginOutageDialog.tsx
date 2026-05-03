import clsx from "clsx";
import { useState } from "react";
import { Button as AriaButton, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import type { ReactCall } from "react-call";

import { beginGitHubAppLogin } from "../auth.tsx";
import { MONO_CLASS, buttonClassName } from "../styles.ts";
import type { LoginOutageDialogProps, LoginOutageDialogResult } from "./loginOutageDialog.ts";

export default function LoginOutageDialog({
  call,
  clientId,
  exchangeUrl,
  githubEnabled,
  redirectTo,
  redirectUri,
}: ReactCall.Props<LoginOutageDialogProps, LoginOutageDialogResult, {}>): JSX.Element {
  const [githubError, setGitHubError] = useState<string | null>(null);

  async function handleGitHubLogin(): Promise<void> {
    setGitHubError(null);

    try {
      await beginGitHubAppLogin(redirectTo);
    } catch (error) {
      setGitHubError(error instanceof Error ? error.message : "GitHub ログインの開始に失敗しました。");
    }
  }

  return (
    <ModalOverlay
      defaultOpen
      isDismissable
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          call.end("closed");
        }
      }}
      className={({ isEntering, isExiting }) =>
        clsx(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ease-out",
          (isEntering || isExiting) && "opacity-0",
        )
      }
    >
      <Modal
        className={({ isEntering, isExiting }) =>
          clsx(
            "w-full max-w-xl overflow-hidden border border-slate-500 bg-slate-50 shadow-2xl outline-none transition duration-200 ease-out",
            (isEntering || isExiting) && "translate-y-2 scale-95",
          )
        }
      >
        <Dialog className="outline-none">
          <div className="border-b border-b-slate-300 bg-gradient-to-b from-slate-100 to-slate-300 px-3 py-2">
            <Heading slot="title" className="text-xs font-bold text-slate-900">
              ログイン方式切替のお知らせ
            </Heading>
          </div>
          <div className="space-y-3 p-4 text-xs text-slate-900">
            <div className="border border-red-700 bg-amber-100 px-3 py-2 text-red-800">
              現在、社内統合認証基盤が障害中のため、通常の「ログイン」はご利用いただけません。
            </div>
            <div>
              臨時運用として、
              <b>GitHub App ログイン</b>
              を利用してください。認証後は
              <span className={clsx("px-1", MONO_CLASS)}>{redirectTo}</span>
              に戻ります。
            </div>
            <div className="border border-slate-300 bg-white px-3 py-2">
              <div>
                GitHub client_id：
                {clientId.length > 0 ? <span className={MONO_CLASS}>{clientId}</span> : "未設定"}
              </div>
              <div>
                callback URL：
                <span className={clsx("ml-1", MONO_CLASS)}>{redirectUri}</span>
              </div>
              <div>
                exchange endpoint：
                <span className={clsx("ml-1", MONO_CLASS)}>
                  {exchangeUrl.length > 0 ? exchangeUrl : "未設定"}
                </span>
              </div>
            </div>
            {githubError === null ? null : (
              <div className="border border-red-500 bg-red-100 px-3 py-2 text-red-800">{githubError}</div>
            )}
            <div className="flex justify-end gap-2 border-t border-t-dotted border-t-slate-400 pt-3">
              <AriaButton slot="close" className={buttonClassName()}>
                閉じる
              </AriaButton>
              <AriaButton
                autoFocus
                className={clsx(
                  buttonClassName({ tone: "primary" }),
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                isDisabled={!githubEnabled}
                onPress={() => void handleGitHubLogin()}
              >
                GitHubでログイン
              </AriaButton>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
