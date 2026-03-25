## Quick context

This repository contains the front-end for the I Ching simulator at `web/` (Vite + React + TypeScript). The UI supports two AI integration modes: direct browser calls (requires CORS) and a recommended local proxy (see `proxy/` and `web/README.md`). The site is published to GitHub Pages using `gh-pages` and the Vite `base` is set to `/iching-simulator/` in `web/vite.config.ts`.

## Where to look first (high value files)
- `web/README.md` — contains developer workflows and examples for running and deploying the front-end (dev, build, preview, deployment, proxy instructions).
- `web/package.json` — scripts: `dev`, `build` (runs `tsc -b && vite build`), `preview`, `deployment` (gh-pages). Use these when running or CI-ing builds.
- `web/vite.config.ts` — `base: '/iching-simulator/'` (important for gh-pages deployment and asset paths).
- `web/src/main.tsx`, `web/src/App.tsx` — app entry points and UI examples (StrictMode, root mount, where modes & links are exposed).
- `proxy/` — (if present) local proxy server that forwards requests to model APIs. Check `.env.example` and `proxy/` README for endpoints and port (commonly `http://localhost:8787`).

## What the agent should know when editing code
- Always run and verify locally from `web/`:
  - cd web
  - npm install
  - npm run dev (hot reload during changes)
  - npm run build then npm run preview to validate production output
- Builds invoke TypeScript project build before Vite: `npm run build` runs `tsc -b && vite build`. If you touch TS project references or config, ensure `tsc -b` succeeds.
- Deployment: `npm run deployment` pushes `dist/` to `gh-pages`. The Vite `base` must match the Pages hosting path (currently `/iching-simulator/`).

## API / AI integration patterns (concrete examples)
- Two supported modes (see `web/README.md` and `App.tsx`):
  1. Browser direct: front-end POSTS directly to model API (needs CORS). UI settings page stores `API Key`, `Base URL`, `Model`.
  2. Local proxy: front-end POSTs to `http://localhost:8787/chat` (example in README). Use `.env.example` in `proxy/` to configure secrets; do NOT commit keys.
- Example fetch (SSE flow shown in `web/README.md`):
  - POST JSON like `{ question: '...', divinationResult: {...} }` to `http://localhost:8787/chat` when using proxy.

## Project-specific conventions / notes
- The front-end is self-contained under `web/` — run all web scripts from that folder.
- Static assets go into `web/public/` and are served relative to the Vite `base`. Changing `base` requires re-checking absolute paths in templates and `index.html`.
- The repo intentionally runs `tsc -b` before `vite build` — editing TS configuration or adding references may break builds if `tsc` fails.
- The project uses ESLint (`npm run lint`). If you change formatting rules or lint config, run the lint script to verify.

## Project intention & design notes (from `docs/PROJECT—INTENTION.md`)
- This project blends a ritualized, animated I Ching front-end with structured, testable rules and RAG-backed AI explanations.
- Key constraints agents must respect:
  - Deterministic core: the "起卦" (divination) logic is a pure, rule-based algorithm — keep it deterministic and testable (same inputs => same JSON structure).
  - RAG + citations: AI explanations are expected to reference ancient texts from the knowledge base; prefer solutions that preserve or surface citation metadata (source id, excerpt).
  - UX: the front-end uses animation-heavy interactions (Three.js/WebGL patterns) — prefer non-breaking UI changes and verify animations in `web/` dev server.
  - Privacy & proxy: prefer the local `proxy/` approach to avoid leaking API keys; front-end supports direct key entry for testing but the proxy is the recommended default.
  - Observability: the project records interaction metadata (tokens, cited entries). When adding AI flows, include hooks for logging these metrics to support later analysis.


## Small automation hints for pull requests
- For UI changes: run `cd web && npm run dev` and verify interactive behavior. Then `npm run build && npm run preview` to validate production artifacts.
- For CI: ensure `web/package.json` scripts succeed (install + build + lint). Prefer small, focused PRs that change only `web/` files when adjusting the front-end.

## Safety and secrets
- Never add API keys to repo. Use `proxy/.env` (local) or repository secrets for CI deploys. The front-end settings page accepts an API key for direct browser mode — prefer proxy for security.

---

If any of the above is incorrect or you want more detail (example endpoints, proxy implementation file, or CI steps), tell me which area to expand and I will update this file.
