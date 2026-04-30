# clippt v2 — Local Development

## Prerequisites

| Tool | Install | Verify |
|------|---------|--------|
| Node.js 20+ | [nodejs.org](https://nodejs.org) | `node -v` |
| Docker Desktop | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) | Whale icon in menu bar says "running" |
| Supabase CLI | `brew install supabase/tap/supabase` | `supabase --version` |

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Start Supabase (runs Postgres + Auth + Studio in Docker)
#    First run pulls images — takes a few minutes, then ~10s after that.
supabase start

# 3. Create .env.local from the keys printed by supabase start
cp .env.example .env.local
#    Then paste the "Project URL" and "Publishable" key into:
#      NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#      NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from supabase start>

# 4. Start the dev server
npm run dev
```

Open [localhost:3000](http://localhost:3000) — you're running.

## Daily workflow

```bash
# Start Supabase (if not already running)
supabase start

# Start Next.js dev server
npm run dev
```

## Key commands

| Command | What it does |
|---------|-------------|
| `supabase start` | Starts local Postgres, Auth, Studio, and other services in Docker |
| `supabase stop` | Stops containers (saves battery/RAM) |
| `supabase db reset` | Wipes the database and re-runs migration + seed from scratch |
| `supabase status` | Shows local service URLs and keys |
| `npm run dev` | Starts Next.js dev server on localhost:3000 |
| `npm run build` | Production build (catches type errors) |
| `npx tsx scripts/generate-seed.ts` | Regenerates `supabase/seed.sql` from Designer's JSON |

## Database

### Schema

Five tables defined in `supabase/migrations/20260429000000_initial_schema.sql`:

- **users** — profiles with handle, display name, identity line
- **urls** — canonical URL records with nanoid short IDs for `/url/[id]` routes
- **saves** — the core object: one user bookmarking one URL with notes and tags
- **user_follows** — asymmetric user-to-user follows
- **tag_follows** — users following tags

### Seed data

200 saves across 8 fictitious users, 77 unique URLs, 28 user follows, 19 tag follows.

Source of truth: Designer's JSON file (path in `scripts/generate-seed.ts`).

To edit seed data:
1. Edit the Designer's JSON (or the user profiles/follow graph in `scripts/generate-seed.ts`)
2. Run `npx tsx scripts/generate-seed.ts` to regenerate `supabase/seed.sql`
3. Run `supabase db reset` to apply

### RLS and demo auth

Row-Level Security is enabled on all tables. The demo auth model sets
`app.current_user_handle = 'ben-rowe'` via a session variable at the start of
each server request. This means "you are always Ben" in v2.

The auth swap point for v3 (real auth) is `src/lib/auth.ts` — one function to change.

## Supabase Studio

When Supabase is running, open [127.0.0.1:54323](http://127.0.0.1:54323) for a
visual database dashboard. Click **Table Editor** to browse data.

## Project structure

```
clippt/
├── supabase/
│   ├── migrations/        # SQL schema (runs on supabase start / db reset)
│   └── seed.sql           # Generated — do not edit directly
├── scripts/
│   └── generate-seed.ts   # Seed generator (reads Designer's JSON)
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   └── lib/
│       ├── supabase/      # Client setup, types, server helpers
│       ├── auth.ts        # Demo auth (getCurrentUser, getCurrentUserHandle)
│       ├── queries.ts     # Server-side read functions
│       ├── mutations.ts   # Server-side write functions
│       ├── url-id.ts      # nanoid short ID generation + URL lookup
│       └── hooks/         # Client-side hooks (follow state, etc.)
└── DEVELOPMENT.md         # This file
```

## Troubleshooting

**`supabase start` hangs or fails**
- Make sure Docker Desktop is running (whale icon in menu bar)
- Try `supabase stop --no-backup` then `supabase start` again

**`supabase db reset` fails with a SQL error**
- Check the migration file for syntax errors
- If you edited the seed JSON, regenerate seed.sql first

**App boots but shows "Demo user not found"**
- Run `supabase db reset` to re-seed the database
- Check `.env.local` has the correct Supabase URL and key
