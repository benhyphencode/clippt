@AGENTS.md

# clippt — Project Canon

## What is clippt?

A social skill-sharing library — "del.icio.us for AI skills." Users save URLs with notes and free-form tags, follow people and tags, and discover resources through their network. Portfolio project for Ben Rowe.

Live at: https://clippt.xyz

## Architecture

- **Next.js 16** App Router (Turbopack) with Server Components for data fetching, Client Components for interactivity
- **Supabase** (local via Docker) — Postgres, RLS, no auth in v2 (demo mode)
- **Tailwind CSS** with CSS custom properties for theming (light/dark via `data-theme`)
- **Red Hat Display** font (retained through v2.1 visual reset)

## Visual identity (v2.1 — current)

**"The tag is the place. Colour is the atmosphere."**

Saturated colour as page identity expressed as *coloured light*, not coloured surface. The signature execution is **bloom-under-glass**: a radial gradient of saturated tag colour anchored lower-left of a hero zone, sitting under a translucent surface with `backdrop-filter: blur(28px)`.

- **Hero:** bloom-under-glass (`<HeroBloomUnderGlass>`)
- **Pills:** liquid glass body with glowing rim (`<TagPill>`)
- **Primary buttons:** glass body with coral glow (`<Button variant="primary">`)
- **Secondary/destructive:** soft-elevated (no glass) (`<Button variant="secondary|destructive">`)
- **Cards:** neutral surface; only pills inside carry tag colour
- **Mode:** light + dark co-equal, swapped via `data-theme` attribute on `<html>`

**Coral** is both the brand accent (Save, Follow, Clip) and the fallback "no-tag" colour (e.g. `/url/[id]` hero when og:image missing).

**Five tag families** (saturated/soft/dark-text values):
- Indigo `#5B5CF0` / `#B0B1F8` / `#4546B8`
- Teal `#18B5A0` / `#6FE0CC` / `#0D7A5F`
- Coral `#F25C3A` / `#FB9D85` / `#B84A24`
- Amber `#E59225` / `#F0C078` / `#A06E12` (rebalanced from v2)
- Rose `#E85B8A` / `#F498B6` / `#B83568`

Tag colour is hash-derived (djb2 → mod 5), deterministic, defined in `src/lib/tag-colours.ts`.

**Retired in v2.1:** `<Button3D>`, hard-offset hover shadows (`box-shadow: 4px 4px 0`), v2 colour-burst CSS, v2 tinted-pill styling.

## Demo Auth

"You are always Ben Rowe." `getCurrentUser()` in `src/lib/auth.ts` returns a fixed user. Single swap point for v3 real auth.

The demo affordance is a thin `<DemoPill>` in the nav top-right that hover-expands to reveal "clippt v2 demo: real URLs, fictitious users and notes." (CSS-only, no JS state.)

## Database (5 tables)

- **users** — handle, display_name, identity_line, avatar_url
- **urls** — canonical URL records with nanoid 8-char short_id, og_image_url
- **saves** — user + URL + notes + tags[] (no unique constraint — re-saves allowed)
- **user_follows** — asymmetric follower/following
- **tag_follows** — user following a tag string

Schema: `supabase/migrations/20260429000000_initial_schema.sql`
Seed: 200 saves, 8 users, 77 URLs (generated from Designer's JSON via `scripts/generate-seed.ts`)

## 5 Canonical Surfaces

| Route | Page | v2.1 hero treatment |
|-------|------|--------------------|
| `/` | Home feed | No hero — network bar + Recent + Popular this week |
| `/[user]` | Profile | UserByline + stats + Tags-you-follow (`Following` eyebrow, hidden when empty) |
| `/url/[id]` | URL detail | og:image OR coral bloom-under-glass with domain initials at hero scale |
| `/tag/[tag]` | Tag page | Full bloom-under-glass hero in tag's family colour, `#tag` heading at 78px |
| `/[user]/[tag]` | Filtered profile | Slim bloom-band with active-tag pill (saturated body, white text), `Clear ✕` |

## Key Components

| Component | Type | Purpose |
|-----------|------|---------|
| `AppShell` | Server | Nav + main content wrapper |
| `NavV2` | Client | Logo, search placeholder, DemoPill, ThemeToggle, Clip button, profile link |
| `DemoPill` | Server | Persistent thin nav pill, CSS hover-expand to full sentence |
| `ThemeToggle` | Client | Sun/moon toggle, secondary button style, `data-theme` swap |
| `HeroBloomUnderGlass` | Server | Signature 3-layer hero: bloom → glass → content. `variant="hero"|"band"` |
| `TagPill` | Client | Liquid glass body + glowing rim. `active` prop for filter pill |
| `Button` | Client | One component, three variants: primary (glass+glow coral), secondary (soft neutral), destructive (red) |
| `SaveCardV2` | Server | Feed atom — neutral card, soft-lift hover (no horizontal offset) |
| `EditableSaveCard` | Client | Wraps SaveCardV2 with hover Edit button for own saves |
| `SaveDialogV2` | Client | Create/edit/delete saves, title auto-resolve, AI tag suggestions |
| `LoadMoreSaves` | Client | Paginated save list with "Load more" button |
| `TagCloud` | Server | Frequency-sized pills (5 tiers), `+N more` overflow |
| `UserByline` | Server | Avatar initials + name + identity line |
| `FollowButton` / `TagFollowButton` | Client | Optimistic follow toggle; primary button when not following, secondary when following |

## Data Layer

- **Queries** (`src/lib/queries.ts`) — server-side, take `SupabaseClient<Database>` first arg
- **Mutations** (`src/lib/mutations.ts`) — `createSave`, `updateSave`, `deleteSave`, `follow*` / `unfollow*`
- **Hooks** (`src/lib/hooks/`) — `useFollowState`, `useTagFollowState` (optimistic via `useTransition`)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/meta` | GET | Scrapes title, description, og:image from a URL |
| `/api/saves` | GET | Paginated save fetching (userId, tag, urlId, offset, limit) |
| `/api/suggest-tags` | POST | Claude Haiku tag suggestions (requires `ANTHROPIC_API_KEY`) |

## CSS Token System

`src/app/globals.css` defines the token system. Mode switching:

- `[data-theme="light"]` (default) and `[data-theme="dark"]` swap CSS custom properties
- Inline script in `layout.tsx` reads `localStorage['clippt-theme']` (or `prefers-color-scheme`) and sets `data-theme` before stylesheet eval (no FOUC)
- Tailwind dark variant: `@custom-variant dark (&:is([data-theme="dark"] *))`

**Bloom helpers:** `.bloom-hero` (full hero, ~210px) and `.bloom-band` (slim, ~80px filter band). Take `--bloom-color` as inline style.

**Glass helpers:** `.glass-pill`, `.glass-button` — translucent body with `backdrop-filter`. Both have `@supports not (backdrop-filter)` fallbacks (more opaque body, no blur).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
ANTHROPIC_API_KEY=<optional, enables AI tag suggestions>
```

## Build & Dev

- `supabase start` → `npm run dev` (port 3777)
- `npm run build` for production verification
- `supabase db reset` to wipe and re-seed
- See `DEVELOPMENT.md` for full setup guide

## Linear Project

Project: **clippt** in **Benhyphenrowe** workspace
Milestones (all complete): v2 Foundation · v2 Core Pages · v2 Interactions · v2 Polish · **v2.1 Visual refresh + ship-the-gap**

Authoritative spec for v2.1: [Designer-to-Engineer Brief](https://linear.app/benhyphenrowe/document/clippt-v21-designer-to-engineer-brief-visual-refresh-ship-the-gap-02dd3931cada).

v3 (skill-as-anchor) is in the parking lot for strategic exploration. Do not let v3 thinking enter v2.1 implementation.
