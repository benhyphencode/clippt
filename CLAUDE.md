@AGENTS.md

# clippt — Project Canon

## What is clippt?

A social skill-sharing library — "del.icio.us for AI skills." Users save URLs with notes and free-form tags, follow people and tags, and discover resources through their network. Portfolio project for Ben Rowe.

Live at: https://clippt.xyz

## Architecture

- **Next.js 16** App Router (Turbopack) with Server Components for data fetching, Client Components for interactivity
- **Supabase** (local via Docker) — Postgres, RLS, no auth in v2 (demo mode)
- **Tailwind CSS** with CSS custom properties for theming (light/dark)
- **Red Hat Display** font, coral accent colour, Web 2.0 raised button aesthetic

## Demo Auth

"You are always Ben Rowe." `getCurrentUser()` in `src/lib/auth.ts` returns a fixed user. This is the single swap point for v3 real auth.

## Database (5 tables)

- **users** — handle, display_name, identity_line, avatar_url
- **urls** — canonical URL records with nanoid 8-char short_id, og_image_url
- **saves** — user + URL + notes + tags[] (no unique constraint — re-saves allowed)
- **user_follows** — asymmetric follower/following
- **tag_follows** — user following a tag string

Schema: `supabase/migrations/20260429000000_initial_schema.sql`
Seed: 200 saves, 8 users, 77 URLs (generated from Designer's JSON via `scripts/generate-seed.ts`)

## 5 Canonical Surfaces

| Route | Page | Key data |
|-------|------|----------|
| `/` | Home feed | Network saves, Popular this week, Tags you follow |
| `/[user]` | Profile | UserByline, stats, saves (paginated), tag cloud sidebar |
| `/url/[id]` | URL detail | og:image hero, tag taxonomy, chorus (all saves of this URL), related |
| `/tag/[tag]` | Tag page | Stats, saves (paginated), top savers, related tags |
| `/[user]/[tag]` | Filtered profile | User's saves for a specific tag |

## Key Components

| Component | Type | Purpose |
|-----------|------|---------|
| `AppShell` | Server | Nav + DemoBanner + main content wrapper |
| `NavV2` | Client | Logo, theme toggle, + Clip button, profile link |
| `SaveCardV2` | Server | The feed atom — byline, URL, notes, tags, timestamp |
| `EditableSaveCard` | Client | Wraps SaveCardV2 with hover Edit button for own saves |
| `SaveDialogV2` | Client | Create/edit/delete saves, title auto-resolve, AI tag suggestions |
| `LoadMoreSaves` | Client | Paginated save list with "Load more" button |
| `Button3D` | Client | Signature raised coral/dark CTA button |
| `TagPill` | Server | Coloured tag pill (5 colour categories) |
| `TagCloud` / `TagStrip` | Server | Tag layouts with counts and links |
| `UserByline` | Server | Avatar initials + name + identity line |
| `FollowButton` | Client | Optimistic follow/unfollow for users |
| `TagFollowButton` | Client | Optimistic follow/unfollow for tags |
| `DemoBanner` | Client | Dismissable "Demo mode" explanation for visitors |

## Data Layer

### Queries (`src/lib/queries.ts`)
All query functions take `SupabaseClient<Database>` as first arg. Pages compose them via `Promise.all` for parallel fetching. Key functions: `getSaves`, `getRecentFromNetwork`, `getPopularThisWeek`, `getChorusForUrl`, `getUrlTagTaxonomy`, `getTagCounts`, `getFollowCounts`, etc.

### Mutations (`src/lib/mutations.ts`)
`createSave`, `updateSave`, `deleteSave`, `followUser`, `unfollowUser`, `followTag`, `unfollowTag`.

### Hooks (`src/lib/hooks/`)
`useFollowState`, `useTagFollowState` — optimistic toggles via `useTransition`.

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/meta` | GET | Scrapes title, description, og:image from a URL |
| `/api/saves` | GET | Paginated save fetching (userId, tag, urlId, offset, limit) |
| `/api/suggest-tags` | POST | Claude Haiku tag suggestions (requires ANTHROPIC_API_KEY) |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
ANTHROPIC_API_KEY=<optional, enables AI tag suggestions>
```

## Design System

- CSS variables in `globals.css` with `.dark` class swap
- 5 tag colour categories: coral, teal, gold, purple, slate
- FOUC prevention: inline script in layout sets .dark before hydration
- Theme persisted in localStorage as `clippt-theme`

## Build & Dev

- `supabase start` → `npm run dev` (port 3777)
- `npm run build` for production verification
- `supabase db reset` to wipe and re-seed
- See `DEVELOPMENT.md` for full setup guide

## Linear Project

Project: **clippt** in **Benhyphenrowe** workspace
Milestones: v2 Foundation (done), v2 Core Pages (done), v2 Interactions (done), v2 Polish (done)
All tickets BEN-295 through BEN-317 are complete.
