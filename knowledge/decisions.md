# Decisions

**2026-11-03 - Supabase over Firebase/Railway for base44 replacement.**
Supabase provides auth + PostgreSQL + REST API in one free tier, closest to base44's API shape.
Firebase ruled out (Firestore not Postgres, harder to query). Railway ruled out (more work, no
managed auth). Compatibility layer approach chosen — mirror base44 API exactly so components
don't change.

**2026-11-03 - RLS policy: allow all authenticated users on all tables.**
Family app, single-tenant per family_id. Keeping it simple now; can tighten later if needed.
Rejected: per-user RLS (too complex for the gain at this stage).

**2026-11-03 - Vercel for frontend hosting.**
Free tier, zero-config for Vite/React, deploys on every GitHub push. Railway was considered but
overkill for a static frontend.

**2026-11-03 - webtop credentials stored in localStorage (not server).**
Credentials are sensitive. Storing server-side would need an encrypted secrets table.
LocalStorage is acceptable for a personal family app where the user owns the device.
Can revisit if the app becomes multi-user/shared.
