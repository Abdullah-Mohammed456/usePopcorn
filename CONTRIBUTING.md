# Contributing

Thanks for helping improve usePopcorn.

## Local setup

1. Install Node.js 24 (or Node.js 22.13 and later in the 22.x line) and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `OMDB_API_KEY` locally.
4. Run `npm run dev` to start the Vite app and API.

## Before submitting

- Keep TypeScript strict. Avoid `any` and unexplained compiler suppressions.
- Keep OMDb credentials on the server; never add secrets to source, commits, or client-side variables.
- Validate API inputs and return safe client errors.
- Preserve keyboard access, visible focus, responsive layouts, and reduced-motion support.
- Run `npm run lint`, `npm run typecheck`, and `npm run build`.
- Describe the user-visible change and include screenshots for UI changes when practical.

## Pull requests

Use a focused branch and pull request. Include the reason for the change, a concise summary, and any environment or deployment changes reviewers need to know.
