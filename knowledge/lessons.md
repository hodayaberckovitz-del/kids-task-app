# Lessons

**2026-11-03 - base44 vite plugin auto-generates @/entities/ and @/functions/ imports.**
After removing the plugin, build fails because files like `@/entities/Subject` don't exist.
Fix: create `src/entities/EntityName.js` stubs that re-export from the compat layer.
Same for `src/functions/`.

**2026-11-03 - Never redirect to /Registration on a generic catch block.**
ChildSelector.jsx was doing `navigate('/Registration')` on any error in loadData —
including network errors after child registration. User saw a login loop.
Rule: only redirect to login on explicit 401/403. All other errors show UI feedback and let the user retry.
