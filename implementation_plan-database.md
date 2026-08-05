# User Authentication Database & Stability Fixes

This plan outlines the steps to resolve the frontend "glitching" issues and introduce a small, reliable database (SQLite) for persistent user credentials, ensuring logins survive server restarts and deployments.

## Open Questions

> [!WARNING]
> **Deployment Target**
> You mentioned "especially when deployed". SQLite works perfectly for standard deployments (e.g., VPS, Docker, AWS EC2, DigitalOcean). However, if you are deploying to a serverless platform like **Vercel** or **Netlify**, the local SQLite file will reset on every deployment. If you plan to use Vercel, we should use a cloud database like Vercel Postgres or Supabase instead. 
> 
> **Are you deploying to a standard server (VPS) or a serverless platform like Vercel?** If Vercel, please provide connection string credentials, otherwise, I will proceed with SQLite.

## Proposed Changes

### 1. Database Integration (SQLite)
We will replace the in-memory array (`const users = []`) with a robust SQLite database to persist user credentials.

#### [NEW] `src/lib/db.ts`
- Implement a singleton connection to `users.db` using the standard `sqlite3` package.
- Auto-initialize a `users` table with schema: `id`, `name`, `email`, `password` (hashed), and `createdAt`.

#### [MODIFY] `src/lib/auth.ts`
- Remove the in-memory array.
- Update `registerUser` to `INSERT INTO users`.
- Update `loginUser` to `SELECT * FROM users WHERE email = ?`.
- Ensure all queries are parameterized to prevent SQL injection.

#### [MODIFY] `package.json`
- Install `sqlite3` and `sqlite` dependencies.

---

### 2. Stability Fixes (The "Glitching")
The glitching is likely caused by aggressive React renders and `setInterval` race conditions overlapping with our new Server-Sent Events (SSE).

#### [MODIFY] `src/app/page.tsx`
- Remove the aggressive 10-second polling (`setInterval`) for `/api/live-feed`.
- Rely entirely on the SSE connection for real-time updates to prevent overlapping state mutations.

#### [MODIFY] `src/lib/liveSimulation.ts`
- Throttle the auto-generation of demo leads to prevent it from overwhelming the dashboard when multiple clients are connected simultaneously.

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` to ensure the SQLite driver compiles correctly for production.

### Manual Verification
1. I will register a new user in the browser.
2. I will manually restart the server.
3. I will attempt to log in with the same user to verify the credentials survived the restart via the SQLite database.
4. I will monitor the dashboard for 60 seconds to ensure the UI remains stable without glitching.
