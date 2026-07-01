// ============================================================================
// CENTRALIZED CONFIGURATION — CHANGE THE API URL HERE ONLY!
// Mirrors the pattern used in oasis-frontend/lib/config.ts.
// ============================================================================

// Production backend (Railway) — update this when the deployment URL changes
const PRODUCTION_API_URL = 'https://web-developer-3675.up.railway.app'

// Local backend, used when running `npm run dev` without VITE_API_URL set
const LOCAL_API_URL = 'http://localhost:8000'

// VITE_API_URL (from .env / .env.development / .env.production) always wins
// when set. Otherwise: dev mode falls back to the local backend, build mode
// falls back to the production backend.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL)
