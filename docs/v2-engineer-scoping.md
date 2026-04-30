# clippt v2 — Engineer Warm-Up Scoping

**From:** Engineer Advisor
**To:** PM Advisor
**Re:** Architectural scoping responses — all 8 questions addressed
**Date:** 2026-04-28

**Source material read:** clippt — Project Canon (v2) end-to-end, v1 codebase (~1,400 LOC across 20 files), v1 Designer-to-Engineer brief.

---

## 1. Database: Supabase confirmed

**Recommendation: Supabase.** At v2 scale (~250 saves, 8 users, 2 follow tables), the alternatives don't earn their complexity.

| Option | Verdict |
|---|---|
| **Supabase** ✅ | Postgres + RLS + JS client + auth primitives sitting there for v3. Free tier is 50k rows. Perfect fit. |
| Turso / SQLite | Lighter, but loses RLS and the auth upgrade pathway. You'd be writing your own query layer. |
| Postgres direct (Neon / Vercel Postgres) | Viable but re-implements what Supabase gives you (client SDK, RLS, auth upgrade path). |
| Local-first (Replicache) | Over-engineered for a demo with no real-time multi-user. |

**Local dev data shape:** Ship seed data as a Supabase seed script (`supabase/seed.sql`) checked into the repo. `supabase db reset` gives a fresh local instance in seconds. Content authoring output (the ~250 saves) needs to land as INSERT statements — straightforward to generate from whatever structured format Designer produces (JSON, CSV, or spreadsheet all work).

---

## 2. Demo auth: simplest "you are Ben" — no Supabase Auth

**Recommendation: hardcoded user context. No OAuth, no session management, no signup UI.**

Reasoning:

- v2 is local-only demo. No public deploy. No real users.
- Supabase Auth adds OAuth provider config, session management, and signup UI — all throwaway when the demo conceit is "you're always Ben."
- Implementation: a server-side utility `getCurrentUser()` that returns Ben's user record. Every query that needs "the current user" calls this. When v3 adds real auth, you swap that one function.
- Route-based auth isn't necessary either — Ben is the viewer everywhere. `/[user]` routes show other users' profiles, but the "who am I" context is always Ben.

**Auth honesty concession:** I'd still create the `users` table with proper production-shaped structure (`id`, `handle`, `display_name`, `avatar_url`, `identity_line`, `joined_at`). The 8 fictitious users are rows in this table. The schema is production-ready even though auth is faked.

**RLS still works:** set a Postgres session variable (`SET app.current_user_id = 'ben'`) at the start of each request. RLS policies reference that variable. When real auth arrives in v3, the variable comes from the JWT instead of a hardcoded value.

---

## 3. Smart tag suggestion: pre-save on URL blur, Claude Haiku

**Model:** Claude Haiku. Fast enough (<500ms p95 for a short prompt) and cheap enough to not cache aggressively.

**Prompt design:**

```
Given this URL, its page title, and its description, suggest 3-5 tags.
Consider these existing tags from the network: [top 30 tags by frequency].
Prioritise tags the user follows: [user's followed tags].
Return JSON array of strings. Lowercase, hyphenated.
```

**Latency strategy — pre-save suggestion on URL blur:**

- Trigger the Haiku call when the URL field resolves (same timing as the existing title auto-resolve pattern from v1).
- By the time the user types notes and manual tags, suggestions are already there — appearing as ghost pills below the tag input.
- If the user beats the API, suggestions appear late — no harm, they're additive.
- Save is never blocked. The resource is created with whatever tags the user has at the moment they hit Save.

**Why not post-save async:** A "also consider these tags" nudge after saving is technically simpler but worse UX — the user has already moved on mentally. Pre-save is better because it influences the save as it happens.

**Caching:** Cache by URL (not by user). Most URLs will be saved by multiple users; suggestions don't need to vary per-user. The tag-follow priority-weighting is a client-side sort order on the cached suggestions, not a different API call. Store in a `tag_suggestions` column on the `urls` table. TTL: 7 days.

---

## 4. GitHub skill-counting: background async with cache

**Flow:**

1. **On save:** validate the URL is a GitHub repo (`github.com/:owner/:repo` regex). Save immediately with `skill_count: null`.
2. **Post-save async** (Supabase Edge Function or Next.js API route triggered after save): call GitHub API `GET /repos/:owner/:repo/git/trees/HEAD?recursive=1`, scan the file tree for `.claude/skills/**`, `skills/**`, and top-level `*SKILL*.md` patterns (case-insensitive).
3. Write `skill_count` back to the save record. Cache the count keyed by `repo_url` on the `urls` table with a 24h TTL.
4. **View-time:** if `skill_count` is null and the URL is a GitHub repo, show a subtle "counting…" indicator. Don't block render.

**Rate limits:** GitHub unauthenticated API allows 60 req/hr. ~80 of the 250 saves may be GitHub repos. Solution: use a GitHub personal access token (5,000 req/hr) as an env var. Single seed run completes comfortably within limits.

---

## 5. URL ID format: base62, 8 characters — confirmed

Designer's lean is correct. Using `nanoid` with a custom base62 alphabet (`0-9`, `A-Z`, `a-z`).

8 chars → 62⁸ = 218 trillion combinations. Generated at first-save time for each unique URL, stored in a `urls` table. The `/url/[id]` route resolves via `SELECT * FROM urls WHERE short_id = $1`.

**Why 8, not 6:** 62⁶ = 56B is fine mathematically, but 8 is still short in a URL bar and gives more headroom. No downside to the extra 2 characters.

---

## 6. Migration from v1: clean start, no migration

**Recommendation: start fresh.** No data migration.

- v1 is single-user localStorage with 12 generic AI bookmarks (not SKILL.md-anchored)
- v2 is multi-user Postgres with ~250 curated saves, a follow graph, and a different content scope
- v1 seed data doesn't fit the v2 discriminator
- v1 `Resource` type is missing `user`, and `id` format changes

**What carries forward from v1:** components, design tokens, visual system, layout patterns. The `src/components/clippt/` directory is largely reusable — `TagPill`, `Button3D`, `ThemeToggle`, `Logo`, `Nav` all survive with modifications. The data layer (`src/lib/data.ts`) is replaced wholesale.

---

## 7. Architectural pushback — two refinements to canon component contracts

Everything in "Settled product decisions" holds on technical grounds. No pushback on free-form tags, URL-as-IA, no algorithmic feed, or asymmetric follows.

**Two component refinements:**

### a) Split `<TagCloud>` — the 4-variant contract is doing too much

The canon lists `vertical-column | horizontal-strip | horizontal-related | horizontal-strip-cross-user`. These share frequency-sizing logic but diverge in layout, sizing tiers, overflow behaviour, and interaction model.

**Proposed split:**

- **`<TagCloud>`** — the vertical column variant (profile sidebar). Owns frequency → tier mapping + overflow (`+ N more`).
- **`<TagStrip>`** — the three horizontal variants (filter strip on profile, related tags on tag page, cross-user taxonomy on URL detail). Shares the tier-mapping utility but has its own horizontal layout and overflow logic.
- **`tagCountToTier()`** — the shared primitive is a utility function, not a component.

This doesn't break the canon's intent — it refines the component tree underneath the contracts.

### b) Extract `<UserByline>` as a sub-component

The byline pattern (avatar + handle + optional metadata) appears in `<SaveRow>`, `<ChorusEntry>`, and the Popular column's compact cards. Rather than duplicating, extract a `<UserByline>` primitive that all three compose. Small component, high reuse.

---

## 8. Build sequence

### Phase 1 — Foundation (3–4 days)

- **1a.** Supabase project + schema (`users`, `urls`, `saves`, `user_follows`, `tag_follows`)
- **1b.** Seed script generation from content authoring output
- **1c.** Demo auth utility (`getCurrentUser` → Ben)
- **1d.** Base data hooks (`useSaves`, `useUser`, `useTagCounts`, `useFollows`)
- **1e.** nanoid URL short-ID generation + `urls` table

### Phase 2 — Core pages (4–5 days, partially parallel)

- **2a.** `/[user]` — profile (identity column + tag cloud + library grid)
- **2b.** `/[user]/[tag]` — filtered state (`TagFilterBand` + filtered library)
- **2c.** `/tag/[tag]` — global tag page (hero + sidebar + save rows)
- **2d.** `/url/[id]` — URL detail (`UrlHero` + chorus + related sidebar)
- **2e.** `/` — home feed (network bar + recent + popular columns)

### Phase 3 — Interactions (2–3 days)

- **3a.** Save flow v2 (carry from v1 + smart tag suggestion via Haiku)
- **3b.** Follow / unfollow (users + tags)
- **3c.** GitHub skill-counting (async + cache)
- **3d.** og:image scraping extension for URL hero

### Phase 4 — Polish (1–2 days)

- **4a.** Dark mode audit across all 5 surfaces
- **4b.** Multi-colour hero spot-check (all 5 tag colours at full saturation)
- **4c.** Empty states for all surfaces
- **4d.** Demo affordance placement

**Total estimate: ~12–14 days of build** after the Designer→Engineer brief lands.

**Critical dependency:** Content authoring output format. If Designer produces saves as structured data (JSON / spreadsheet), Phase 1b is trivial. If saves are embedded in HTML mockups, extraction adds a half day.

**Parallelism:** Phases 2a–2e are partially parallelisable — 2a and 2e have no dependency on each other. Phase 3 depends on Phase 1 (data layer) and Phase 2 (pages exist to integrate into).

---

## Responses to open tensions

### og:image scraping at ~250 URLs

Fine. The `/api/meta` route already exists from v1. I'd run a **one-time batch scrape during seed** to pre-populate `og_image_url` on the `urls` table rather than fetching at view-time. 250 fetches with 5s timeout each = ~20 min worst case, parallelised to ~2 min. Failures fall through to the domain-initials-on-gradient fallback.

### GIN index on `tags[]`

Not needed at 250 rows. I'd include the migration file with the index creation commented out, annotated: *"Uncomment when row count exceeds ~10k."* Zero cost to prepare, zero risk of premature optimisation.

### "Popular" timeframe variants

Build "this week" only. Adding month / all-time is a 30-minute query change later — not worth the UI surface at v2.

### Tag-filter dropdown on `/`

Canon flags: *"The Filter by tag ▾ affordance opens to what?"* My suggestion: tags from people you follow, frequency-sized like the cloud, click filters Recent column only (not Popular). Implementation-wise this is a `<TagStrip>` in a dropdown — same primitive, different container.

---

## Pressure-test results

**Component contracts as engineering primitives:** Mostly clean. The two refinements above (`TagCloud` split, `UserByline` extraction) are the only friction points. All seven canon components map to real React components with clear props interfaces.

**og:image scraping reliability:** Confirmed viable at demo scale. Batch pre-scrape at seed time eliminates view-time latency. Fallback covers failures.

**"Settled product decisions" on technical grounds:** Nothing to contest. Free-form tags with GIN index is the right Postgres pattern. `tags @> ARRAY['tag']` queries are clean. The URL-as-IA maps directly to App Router file-system routing. Asymmetric follows are standard junction tables.

---

## What I need before build starts

1. **Content authoring output** in a structured format (JSON preferred, CSV or spreadsheet also fine). Schema per save: `user_handle`, `url`, `notes`, `tags[]`, `created_at`.
2. **User roster details** for the `users` table: `handle`, `display_name`, `avatar_url` (or generation approach), `identity_line`, `joined_at`.
3. **Follow graph** — who follows whom, who follows which tags. Can be a simple adjacency list.
4. **Designer→Engineer brief** for the visual specifics that diverge from v1 (colour-burst hero at full saturation across all 5 colours, `TagFilterBand` gradient spec, `SaveRow` layout, `UrlHero` image-area spec, `ChorusEntry` own-row treatment).

Items 1–3 come from content authoring. Item 4 comes from visual review. Both can proceed in parallel with Phase 1 schema work.
