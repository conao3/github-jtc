# GitHub real-data migration

- [x] Replace login/session state with real GitHub App authentication.
- [x] Replace profile, repository list, and repository detail base sections with GitHub GraphQL data.
- [x] Replace dashboard KPIs and side panels with `viewer`, contributions, recent repositories, and review requests.
- [x] Replace pull request list/detail/diff screens with real `pullRequests` queries.
- [x] Replace issue list/detail screens with real `issues` queries.
- [x] Replace commit history screen with default branch `history` data.
- [x] Remove remaining static JTC-only tables or clearly mark them as non-GitHub placeholders.
- [x] Add pagination and client-side filters on repository / PR / issue lists.
- [x] Add empty / permission-denied / rate-limit states for every GitHub-backed screen.
- [x] Wire repository creation to a real viewer-scoped GitHub `createRepository` mutation, while keeping JTC-only approval / attachment sections as mock UI.
