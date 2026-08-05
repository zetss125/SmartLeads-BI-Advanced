# Implementation Tasks: Credentials DB & Stability

## 1. Database Integration
- [ ] Install `sqlite3` and `sqlite` dependencies
- [ ] Create `src/lib/db.ts` for SQLite connection and schema init
- [ ] Modify `src/lib/auth.ts` to use SQLite instead of in-memory array

## 2. Stability Fixes ("Glitching")
- [ ] Modify `src/app/page.tsx` — Remove aggressive polling (`setInterval`)
- [ ] Modify `src/lib/liveSimulation.ts` — Throttle auto-generation of leads

## 3. Verification
- [ ] Build project and verify functionality
