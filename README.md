# Practice Journal Frontend

Single Vite, React, and TypeScript application for both the public doctor journal and the private owner workspace. It follows the Ajo-thrift owner-admin structure and visual language, adapted for editorial work. The Laravel API is deployed separately.

## Setup

1. Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the Laravel API base URL, including `/api/v1`.
2. Install and start:

```bash
npm install
npm run dev
```

3. Sign in with the owner account created in the backend using `php artisan admin:create`.

## Environment

- `VITE_API_URL`: backend API base URL, such as `http://localhost:8000/api/v1`.
Set this app's deployed origin in the backend's `CORS_ALLOWED_ORIGINS` value. The public journal is `/`, owner sign-in is `/owner-login`, and protected owner tools are under `/owner/*`. A future `owner.domain.com` hostname can redirect to `/owner-login`; it does not need a separate frontend build. The app keeps the JWT in session storage and attempts a token refresh after an expired access token.

## Screens

- Public journal: published feed, article pages, approved comments, and moderated comment submissions.
- Owner overview: published and draft counts, pending comment count, recently updated writing.
- Owner writing: list and filter articles, search, create, edit, preview, publish, and save drafts.
- Owner comments: filter by moderation status, approve, hide, or delete reader comments.

Article bodies are stored as Markdown and rendered with raw HTML disabled. Avoid adding patient-identifying details to articles or comments.

```bash
npm run lint
npm run build
```
# taiwo-olaniyi-frontend
