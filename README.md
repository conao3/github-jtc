# github-jtc

JTC 風 GitHub フロントエンド PoC です。

## Deploy

このリポジトリは次の 2 つを前提にしています。

- GitHub Pages: フロントエンド配布
- Cloudflare Worker: GitHub App の `code -> access token` 交換

### GitHub repository variables

- `GITHUB_APP_CLIENT_ID`
  GitHub App の Client ID
- `GITHUB_APP_EXCHANGE_URL`
  例:
  `https://github-jtc-auth-broker.<subdomain>.workers.dev/api/auth/github/exchange`
- `PAGES_BASE_PATH` optional
  project site 以外で配布するときの base path。未設定時は repo 名から自動計算
- `PAGES_BASE_URL` optional
  Worker 側の `ALLOWED_ORIGINS` 自動計算に使う完全な Pages URL
- `WORKER_ALLOWED_ORIGINS` optional
  Worker が受ける Origin を明示上書きする場合のカンマ区切り一覧
- `VITE_GITHUB_APP_REDIRECT_URI` optional
  GitHub App callback URL を固定したい場合だけ指定

### GitHub repository secrets

- `CLOUDFLARE_API_TOKEN`
  Worker deploy 用
- `GITHUB_APP_CLIENT_SECRET`
  GitHub App の Client Secret

### GitHub App settings

- Callback URL:
  `https://<owner>.github.io/<repo>/login/callback`
  user/org site の場合は `https://<owner>.github.io/login/callback`

### Workflows

- `.github/workflows/deploy-pages.yml`
  Pages build and deploy
- `.github/workflows/deploy-worker.yml`
  Cloudflare Worker deploy
