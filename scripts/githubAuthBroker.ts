export {};

interface ExchangeRequestBody {
  readonly code?: string;
  readonly redirectUri?: string;
  readonly codeVerifier?: string;
}

interface GitHubTokenSuccess {
  readonly access_token: string;
  readonly expires_in?: number;
  readonly refresh_token?: string;
  readonly refresh_token_expires_in?: number;
  readonly scope?: string;
  readonly token_type?: string;
}

interface GitHubTokenError {
  readonly error?: string;
  readonly error_description?: string;
  readonly error_uri?: string;
}

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const DEFAULT_PORT = 3000;

function readRequiredEnv(name: string, fallbackName?: string): string {
  const primary = Bun.env[name]?.trim();
  if (primary !== undefined && primary.length > 0) {
    return primary;
  }

  if (fallbackName !== undefined) {
    const fallback = Bun.env[fallbackName]?.trim();
    if (fallback !== undefined && fallback.length > 0) {
      return fallback;
    }
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function getPort(): number {
  const raw = Bun.env["GITHUB_AUTH_PORT"]?.trim();
  if (raw === undefined || raw.length === 0) {
    return DEFAULT_PORT;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("GITHUB_AUTH_PORT must be a positive integer.");
  }

  return parsed;
}

function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function getAllowedOrigin(origin: string | null): string | null {
  const configured = Bun.env["GITHUB_AUTH_ALLOWED_ORIGIN"]?.trim();
  if (configured !== undefined && configured.length > 0) {
    return origin === configured ? configured : null;
  }

  if (origin !== null && isLocalOrigin(origin)) {
    return origin;
  }

  return null;
}

function jsonResponse(
  payload: Record<string, unknown>,
  init?: { readonly origin?: string | null; readonly status?: number },
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
  });

  if (init?.origin !== undefined && init.origin !== null) {
    headers.set("Access-Control-Allow-Origin", init.origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    headers.set("Access-Control-Allow-Methods", "OPTIONS, POST");
  }

  return Response.json(payload, {
    status: init?.status ?? 200,
    headers,
  });
}

async function parseRequestBody(request: Request): Promise<ExchangeRequestBody> {
  try {
    return (await request.json()) as ExchangeRequestBody;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

async function exchangeCode(body: ExchangeRequestBody): Promise<GitHubTokenSuccess | GitHubTokenError> {
  if (body.code === undefined || body.code.length === 0) {
    throw new Error("`code` is required.");
  }

  if (body.redirectUri === undefined || body.redirectUri.length === 0) {
    throw new Error("`redirectUri` is required.");
  }

  if (body.codeVerifier === undefined || body.codeVerifier.length === 0) {
    throw new Error("`codeVerifier` is required.");
  }

  const params = new URLSearchParams({
    client_id: readRequiredEnv("GITHUB_APP_CLIENT_ID", "VITE_GITHUB_APP_CLIENT_ID"),
    client_secret: readRequiredEnv("GITHUB_APP_CLIENT_SECRET"),
    code: body.code,
    redirect_uri: body.redirectUri,
    code_verifier: body.codeVerifier,
  });

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const payload = (await response.json()) as GitHubTokenSuccess | GitHubTokenError;

  if (!response.ok) {
    const errorPayload = payload as GitHubTokenError;
    return {
      error: errorPayload.error,
      error_description: errorPayload.error_description ?? "GitHub token exchange failed.",
    };
  }

  return payload;
}

const port = getPort();

console.log(`[github-auth-broker] listening on http://localhost:${port}`);

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const origin = getAllowedOrigin(request.headers.get("Origin"));

    if (request.method === "OPTIONS" && url.pathname === "/api/auth/github/exchange") {
      return new Response(null, {
        status: 204,
        headers:
          origin === null
            ? undefined
            : {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Headers": "Content-Type, Accept",
                "Access-Control-Allow-Methods": "OPTIONS, POST",
                Vary: "Origin",
              },
      });
    }

    if (url.pathname !== "/api/auth/github/exchange") {
      return jsonResponse({ message: "Not found." }, { origin, status: 404 });
    }

    if (origin === null) {
      return jsonResponse({ message: "Origin is not allowed." }, { status: 403 });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Method not allowed." }, { origin, status: 405 });
    }

    try {
      const body = await parseRequestBody(request);
      const payload = await exchangeCode(body);

      if ("access_token" in payload && payload.access_token.length > 0) {
        return jsonResponse(
          {
            accessToken: payload.access_token,
            expiresIn: payload.expires_in,
            refreshToken: payload.refresh_token,
            refreshTokenExpiresIn: payload.refresh_token_expires_in,
            scope: payload.scope,
            tokenType: payload.token_type,
          },
          { origin },
        );
      }

      const errorPayload = payload as GitHubTokenError;
      return jsonResponse(
        {
          message: errorPayload.error_description ?? errorPayload.error ?? "GitHub token exchange failed.",
          error: errorPayload.error,
          error_description: errorPayload.error_description,
        },
        { origin, status: 400 },
      );
    } catch (error) {
      return jsonResponse(
        {
          message: error instanceof Error ? error.message : "Unexpected broker error.",
        },
        { origin, status: 400 },
      );
    }
  },
});
