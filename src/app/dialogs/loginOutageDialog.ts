import { lazy } from "react";
import { createCallable } from "react-call";

export interface LoginOutageDialogProps {
  readonly clientId: string;
  readonly exchangeUrl: string;
  readonly githubEnabled: boolean;
  readonly redirectTo: string;
  readonly redirectUri: string;
}

export type LoginOutageDialogResult = "closed";

export const LoginOutageDialog = createCallable<LoginOutageDialogProps, LoginOutageDialogResult>(
  lazy(() => import("./LoginOutageDialog.tsx")),
  200,
);
