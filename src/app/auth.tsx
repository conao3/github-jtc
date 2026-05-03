import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { fetchGitHubViewer } from "./github.ts";
import { getAppOriginBaseUrl } from "./runtime.ts";
import { LOADING_CLASS } from "./styles.ts";

const AUTH_QUERY_KEY = ["auth", "session"] as const;
const AUTH_SESSION_STORAGE_KEY = "github-jtc.auth-session";
const GITHUB_PENDING_LOGIN_STORAGE_KEY = "github-jtc.github-pending-login";

export interface AuthUser {
  readonly login: string;
  readonly displayName: string;
  readonly department: string;
  readonly role: string;
  readonly providerLabel: string;
  readonly avatarUrl?: string;
  readonly profileUrl?: string;
}

export interface AuthSession {
  readonly provider: "jtc" | "github";
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
  readonly lastLoginAt: string;
  readonly user: AuthUser;
}

interface PendingGitHubLogin {
  readonly state: string;
  readonly codeVerifier: string;
  readonly redirectTo: string;
}

interface GitHubCallbackInput {
  readonly code: string;
  readonly returnedState: string;
}

interface GitHubExchangeResponse {
  readonly accessToken?: string;
  readonly access_token?: string;
  readonly refreshToken?: string;
  readonly refresh_token?: string;
  readonly expiresAt?: string;
  readonly expires_at?: string;
  readonly expiresIn?: number;
  readonly expires_in?: number;
  readonly message?: string;
  readonly error_description?: string;
}

function getLocalStorage(): Storage {
  return window.localStorage;
}

function readJsonStorage<T>(key: string): T | null {
  const raw = getLocalStorage().getItem(key);

  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    getLocalStorage().removeItem(key);
    return null;
  }
}

function writeJsonStorage(key: string, value: unknown): void {
  getLocalStorage().setItem(key, JSON.stringify(value));
}

function getStoredSession(): AuthSession | null {
  return readJsonStorage<AuthSession>(AUTH_SESSION_STORAGE_KEY);
}

function storeSession(session: AuthSession): AuthSession {
  writeJsonStorage(AUTH_SESSION_STORAGE_KEY, session);
  return session;
}

function clearStoredSession(): void {
  getLocalStorage().removeItem(AUTH_SESSION_STORAGE_KEY);
}

function getPendingGitHubLogin(): PendingGitHubLogin | null {
  return readJsonStorage<PendingGitHubLogin>(GITHUB_PENDING_LOGIN_STORAGE_KEY);
}

function setPendingGitHubLogin(login: PendingGitHubLogin): void {
  writeJsonStorage(GITHUB_PENDING_LOGIN_STORAGE_KEY, login);
}

function clearPendingGitHubLogin(): void {
  getLocalStorage().removeItem(GITHUB_PENDING_LOGIN_STORAGE_KEY);
}

function parseTokenExpiry(payload: GitHubExchangeResponse): string | undefined {
  if (typeof payload.expiresAt === "string" && payload.expiresAt.length > 0) {
    return payload.expiresAt;
  }

  if (typeof payload.expires_at === "string" && payload.expires_at.length > 0) {
    return payload.expires_at;
  }

  const expiresIn = payload.expiresIn ?? payload.expires_in;

  if (typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0) {
    return new Date(Date.now() + expiresIn * 1000).toISOString();
  }

  return undefined;
}

function isExpired(session: AuthSession): boolean {
  if (session.expiresAt === undefined) {
    return false;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
}

function randomBase64Url(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

async function createPkceChallenge(codeVerifier: string): Promise<string> {
  const encoded = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toBase64Url(new Uint8Array(digest));
}

function getDefaultGitHubRedirectUri(): string {
  return new URL("login/callback", getAppOriginBaseUrl()).toString();
}

export function getGitHubAuthConfig(): {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly exchangeUrl: string;
  readonly enabled: boolean;
} {
  const clientId = import.meta.env.VITE_GITHUB_APP_CLIENT_ID?.trim() ?? "";
  const exchangeUrl = import.meta.env.VITE_GITHUB_APP_EXCHANGE_URL?.trim() ?? "";
  const redirectUri = import.meta.env.VITE_GITHUB_APP_REDIRECT_URI?.trim() || getDefaultGitHubRedirectUri();

  return {
    clientId,
    redirectUri,
    exchangeUrl,
    enabled: clientId.length > 0 && exchangeUrl.length > 0,
  };
}

export function normalizeRedirectTo(value: string | null | undefined): string {
  if (value === null || value === undefined || value.length === 0) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

async function loadAuthSession(): Promise<AuthSession | null> {
  const stored = getStoredSession();

  if (stored === null) {
    return null;
  }

  if (isExpired(stored)) {
    clearStoredSession();
    return null;
  }

  if (stored.provider !== "github" || stored.accessToken === undefined) {
    return stored;
  }

  try {
    const viewer = await fetchGitHubViewer(stored.accessToken);
    const session: AuthSession = {
      ...stored,
      user: {
        login: viewer.login,
        displayName: viewer.name ?? viewer.login,
        department: viewer.company ?? "GitHub App 連携ユーザー",
        role: "GitHub App 利用者",
        providerLabel: "GitHub App",
        avatarUrl: viewer.avatarUrl,
        profileUrl: viewer.url,
      },
    };

    return storeSession(session);
  } catch {
    clearStoredSession();
    return null;
  }
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown> | null> {
  const contentType = response.headers.get("content-type");

  if (contentType === null || !contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as Record<string, unknown>;
}

async function exchangeGitHubCodeForSession(input: GitHubCallbackInput): Promise<{
  readonly redirectTo: string;
  readonly session: AuthSession;
}> {
  const config = getGitHubAuthConfig();

  if (!config.enabled) {
    throw new Error("GitHub App 連携の環境変数が不足しています。");
  }

  const pending = getPendingGitHubLogin();
  clearPendingGitHubLogin();

  if (pending === null) {
    throw new Error("GitHub ログイン要求の保存状態が見つかりません。再度ログインを開始してください。");
  }

  if (pending.state !== input.returnedState) {
    throw new Error("GitHub ログインの state 検証に失敗しました。");
  }

  const response = await fetch(config.exchangeUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: input.code,
      state: input.returnedState,
      redirectUri: config.redirectUri,
      codeVerifier: pending.codeVerifier,
    }),
  });

  const payload = (await parseJsonResponse(response)) as GitHubExchangeResponse | null;

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error_description === "string"
          ? payload.error_description
          : "GitHub 認証コードの交換に失敗しました。";
    throw new Error(message);
  }

  const accessToken = payload?.accessToken ?? payload?.access_token;

  if (accessToken === undefined || accessToken.length === 0) {
    throw new Error("交換応答に access token が含まれていません。");
  }

  const viewer = await fetchGitHubViewer(accessToken);
  const session: AuthSession = {
    provider: "github",
    accessToken,
    refreshToken: payload?.refreshToken ?? payload?.refresh_token,
    expiresAt: payload === null ? undefined : parseTokenExpiry(payload),
    lastLoginAt: new Date().toISOString(),
    user: {
      login: viewer.login,
      displayName: viewer.name ?? viewer.login,
      department: viewer.company ?? "GitHub App 連携ユーザー",
      role: "GitHub App 利用者",
      providerLabel: "GitHub App",
      avatarUrl: viewer.avatarUrl,
      profileUrl: viewer.url,
    },
  };

  return {
    redirectTo: pending.redirectTo,
    session: storeSession(session),
  };
}

export async function beginGitHubAppLogin(redirectTo: string): Promise<void> {
  const config = getGitHubAuthConfig();

  if (!config.enabled) {
    throw new Error("GitHub App 連携の client ID または code exchange endpoint が未設定です。");
  }

  const state = randomBase64Url();
  const codeVerifier = randomBase64Url();
  const codeChallenge = await createPkceChallenge(codeVerifier);

  setPendingGitHubLogin({
    state,
    codeVerifier,
    redirectTo: normalizeRedirectTo(redirectTo),
  });

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  window.location.assign(url.toString());
}

export function formatSessionTimestamp(value: string | undefined): string {
  if (value === undefined) {
    return "－";
  }

  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: loadAuthSession,
  });
}

export function useGitHubCallbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exchangeGitHubCodeForSession,
    onSuccess: ({ session }) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      clearStoredSession();
      clearPendingGitHubLogin();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function RequireAuth(): JSX.Element {
  const location = useLocation();
  const sessionQuery = useAuthSession();

  if (sessionQuery.isPending) {
    return <div className={LOADING_CLASS}>認証状態を確認中です。しばらくお待ちください...</div>;
  }

  if (sessionQuery.data === null) {
    const redirectTo = encodeURIComponent(
      normalizeRedirectTo(`${location.pathname}${location.search}${location.hash}`),
    );
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
