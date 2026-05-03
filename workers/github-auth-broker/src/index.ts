interface Env {
  readonly GITHUB_APP_CLIENT_ID: string;
  readonly GITHUB_APP_CLIENT_SECRET: string;
  readonly ALLOWED_ORIGINS?: string;
}

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
}

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const EXCHANGE_PATH = "/api/auth/github/exchange";

function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function getAllowedOrigin(origin: string | null, env: Env): string | null {
  if (origin === null) {
    return null;
  }

  const configuredOrigins = env.ALLOWED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (configuredOrigins !== undefined && configuredOrigins.length > 0) {
    return configuredOrigins.includes(origin) ? origin : null;
  }

  return isLocalOrigin(origin) ? origin : null;
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
    headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
    headers.set("Access-Control-Allow-Methods", "OPTIONS, POST");
    headers.set("Vary", "Origin");
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

async function exchangeCode(
  body: ExchangeRequestBody,
  env: Env,
): Promise<GitHubTokenSuccess | GitHubTokenError> {
  if (body.code === undefined || body.code.length === 0) {
    throw new Error("`code` is required.");
  }

  if (body.redirectUri === undefined || body.redirectUri.length === 0) {
    throw new Error("`redirectUri` is required.");
  }

  if (body.codeVerifier === undefined || body.codeVerifier.length === 0) {
    throw new Error("`codeVerifier` is required.");
  }

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_APP_CLIENT_ID,
      client_secret: env.GITHUB_APP_CLIENT_SECRET,
      code: body.code,
      redirect_uri: body.redirectUri,
      code_verifier: body.codeVerifier,
    }),
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

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = getAllowedOrigin(request.headers.get("Origin"), env);

    if (url.pathname !== EXCHANGE_PATH) {
      return jsonResponse({ message: "Not found." }, { origin, status: 404 });
    }

    if (request.method === "OPTIONS") {
      if (origin === null) {
        return jsonResponse({ message: "Origin is not allowed." }, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Headers": "Content-Type, Accept",
          "Access-Control-Allow-Methods": "OPTIONS, POST",
          Vary: "Origin",
        },
      });
    }

    if (origin === null) {
      return jsonResponse({ message: "Origin is not allowed." }, { status: 403 });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Method not allowed." }, { origin, status: 405 });
    }

    try {
      const body = await parseRequestBody(request);
      const payload = await exchangeCode(body, env);

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
};

export default worker;
