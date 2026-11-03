# Session 2026-11-03 — Supabase migration + webtop sync

## What happened

Started from a base44 app zip. User cancelled base44 subscription mid-session,
so the full goal shifted from "add features" to "migrate off base44 and deploy."

### Built
1. **webtop homework sync** — `base44/functions/syncWebtopHomework/entry.ts` (Deno)
   calls webtop API (login → InitDashboard → GetPupilLessonsAndHomework), deduplicates
   by lessonId+date, auto-creates subjects, saves to HomeworkTask.
   UI: `src/components/parent-panel/WebtopSyncTab.jsx` — credentials in localStorage,
   week navigation, result display. Added card + tab to ParentPanel.

2. **Login loop fix** — `src/pages/ChildSelector.jsx` catch block was sending ANY error
   to `/Registration`. Fixed to only redirect on 401/403.

3. **Full base44 → Supabase migration**
   - `supabase/migrations/001_initial.sql` — 14 tables + RLS + signup trigger
   - `src/api/base44Client.js` — compatibility layer (same API surface as base44 SDK)
   - `src/lib/AuthContext.jsx` — Supabase onAuthStateChange
   - `src/lib/supabaseClient.js` — singleton client
   - `src/entities/*.js` — stubs for `@/entities/` legacy imports
   - `src/functions/uploadHouseholdTasks.js` — stub for `@/functions/` import
   - `vite.config.js` — removed base44 plugin, added `@` alias

### Status at end of session
- SQL migration ran successfully in Supabase ✅
- Vercel deploy started, got "Sudo mode challenge canceled" — user needs to retry Deploy button

## Still open
- Vercel deploy to complete
- Supabase Storage bucket `app-uploads` needs to be created manually
- webtop Deno function needs conversion to Supabase Edge Function (or stays as frontend call with CORS proxy)
- Android APK with Capacitor for Google Play Store
- Remaining bug fixes (mentioned at start, not yet addressed)
