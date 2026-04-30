/**
 * clippt v2 — Seed SQL generator
 *
 * Reads the Designer's content authoring JSON and generates
 * supabase/seed.sql with INSERT statements for all tables.
 *
 * Usage: npx tsx scripts/generate-seed.ts
 *
 * Inputs:
 *   - Source JSON (path configurable below)
 *   - User profiles (defined in this script)
 *   - Follow graph (defined in this script)
 *
 * Outputs:
 *   - supabase/seed.sql
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { customAlphabet } from "nanoid";

// ─── Config ────────────────────────────────────

const SOURCE_JSON = resolve(
  process.env.SEED_SOURCE ??
    "/Users/benji/Documents/BenjiVault/Launchpad/projects/clippt/clippt-v2-saves-seed.json"
);
const OUTPUT_SQL = resolve(__dirname, "../supabase/seed.sql");

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(ALPHABET, 8);

// ─── User profiles ─────────────────────────────
// Inferred from canon personas + save patterns.
// You can edit these freely — regenerate with `npx tsx scripts/generate-seed.ts`

interface UserProfile {
  handle: string;
  display_name: string;
  identity_line: string;
  joined_at: string;
}

const USERS: UserProfile[] = [
  {
    handle: "ben-rowe",
    display_name: "Ben Rowe",
    identity_line: "Design-eng hybrid. Building things that feel good.",
    joined_at: "2026-03-01T00:00:00Z",
  },
  {
    handle: "sasha-chen",
    display_name: "Sasha Chen",
    identity_line:
      "Design engineer. Cares about the seam between design and code.",
    joined_at: "2026-03-03T00:00:00Z",
  },
  {
    handle: "marcus-okafor",
    display_name: "Marcus Okafor",
    identity_line:
      "Agent infrastructure engineer. Thinks in decision trees.",
    joined_at: "2026-03-05T00:00:00Z",
  },
  {
    handle: "priya-raman",
    display_name: "Priya Raman",
    identity_line: "Indie product engineer. Ships fast, measures everything.",
    joined_at: "2026-03-07T00:00:00Z",
  },
  {
    handle: "jules-vidal",
    display_name: "Jules Vidal",
    identity_line:
      "Research-minded generalist. Reads papers, writes synthesis.",
    joined_at: "2026-03-09T00:00:00Z",
  },
  {
    handle: "anika-laine",
    display_name: "Anika Laine",
    identity_line: "Brand and visual design. Obsessed with craft and type.",
    joined_at: "2026-03-11T00:00:00Z",
  },
  {
    handle: "dev-thirunavukkarasu",
    display_name: "Dev Thirunavukkarasu",
    identity_line:
      "Engineering lead. Evaluates tools for the team, not just himself.",
    joined_at: "2026-03-13T00:00:00Z",
  },
  {
    handle: "nyala-osei",
    display_name: "Nyala Osei",
    identity_line:
      "New to AI tooling. Bookmarks everything, figures it out later.",
    joined_at: "2026-03-15T00:00:00Z",
  },
];

// ─── Follow graph ──────────────────────────────
// Asymmetric. Ben is mid-pack: well-connected but not central.
// Format: [follower, followed]

const USER_FOLLOWS: [string, string][] = [
  // Ben follows
  ["ben-rowe", "sasha-chen"],
  ["ben-rowe", "marcus-okafor"],
  ["ben-rowe", "priya-raman"],
  ["ben-rowe", "anika-laine"],
  // Sasha follows
  ["sasha-chen", "ben-rowe"],
  ["sasha-chen", "anika-laine"],
  ["sasha-chen", "marcus-okafor"],
  ["sasha-chen", "priya-raman"],
  // Marcus follows
  ["marcus-okafor", "ben-rowe"],
  ["marcus-okafor", "dev-thirunavukkarasu"],
  ["marcus-okafor", "jules-vidal"],
  // Priya follows
  ["priya-raman", "ben-rowe"],
  ["priya-raman", "sasha-chen"],
  ["priya-raman", "marcus-okafor"],
  ["priya-raman", "dev-thirunavukkarasu"],
  // Jules follows
  ["jules-vidal", "marcus-okafor"],
  ["jules-vidal", "priya-raman"],
  ["jules-vidal", "nyala-osei"],
  // Anika follows
  ["anika-laine", "ben-rowe"],
  ["anika-laine", "sasha-chen"],
  ["anika-laine", "jules-vidal"],
  // Dev follows
  ["dev-thirunavukkarasu", "marcus-okafor"],
  ["dev-thirunavukkarasu", "priya-raman"],
  ["dev-thirunavukkarasu", "sasha-chen"],
  // Nyala follows
  ["nyala-osei", "ben-rowe"],
  ["nyala-osei", "sasha-chen"],
  ["nyala-osei", "jules-vidal"],
  ["nyala-osei", "anika-laine"],
];

// ─── Tag follows ───────────────────────────────
// Each user follows 2-4 tags that match their top interests.

const TAG_FOLLOWS: [string, string][] = [
  ["ben-rowe", "skill-authoring"],
  ["ben-rowe", "agentic-design"],
  ["ben-rowe", "skill-craft"],
  ["sasha-chen", "design-engineering"],
  ["sasha-chen", "production-skills"],
  ["sasha-chen", "frontend"],
  ["marcus-okafor", "agent-architecture"],
  ["marcus-okafor", "agent-skills"],
  ["priya-raman", "ship-this-week"],
  ["priya-raman", "claude-code"],
  ["priya-raman", "dev-velocity"],
  ["jules-vidal", "synthesis"],
  ["jules-vidal", "research-paper"],
  ["anika-laine", "craft"],
  ["anika-laine", "design-tools"],
  ["dev-thirunavukkarasu", "for-the-team"],
  ["dev-thirunavukkarasu", "internal-standards"],
  ["nyala-osei", "helped-me-understand"],
  ["nyala-osei", "getting-started"],
];

// ─── Types ─────────────────────────────────────

interface SeedSave {
  id: string;
  user: string;
  url: string;
  title: string;
  domain: string;
  source_type: string;
  note: string;
  tags: string[];
  created_at: string;
  verify: boolean;
}

interface SeedData {
  saves: SeedSave[];
}

// ─── SQL helpers ───────────────────────────────

function esc(str: string): string {
  return str.replace(/'/g, "''");
}

function sqlArray(arr: string[]): string {
  if (arr.length === 0) return "'{}'";
  return `'{${arr.map((t) => `"${esc(t)}"`).join(",")}}'`;
}

// ─── Generate ──────────────────────────────────

function generate() {
  console.log(`Reading source: ${SOURCE_JSON}`);
  const raw = readFileSync(SOURCE_JSON, "utf-8");
  const data: SeedData = JSON.parse(raw);
  console.log(`Found ${data.saves.length} saves`);

  // Generate deterministic UUIDs from handles/urls (v5-style, but simpler)
  // Using a counter-based approach with fixed prefixes for reproducibility
  const userIds = new Map<string, string>();
  USERS.forEach((u, i) => {
    const id = `00000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`;
    userIds.set(u.handle, id);
  });

  // Collect unique URLs and generate short IDs
  const urlMap = new Map<
    string,
    { id: string; shortId: string; title: string; domain: string }
  >();
  let urlCounter = 1;
  for (const save of data.saves) {
    if (!urlMap.has(save.url)) {
      const id = `10000000-0000-0000-0000-${String(urlCounter).padStart(12, "0")}`;
      urlMap.set(save.url, {
        id,
        shortId: nanoid(),
        title: save.title,
        domain: save.domain,
      });
      urlCounter++;
    }
  }
  console.log(`Found ${urlMap.size} unique URLs`);

  // Build SQL
  const lines: string[] = [];

  lines.push("-- ═══════════════════════════════════════════════════════════");
  lines.push("-- clippt v2 — Seed data");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Source: ${SOURCE_JSON}`);
  lines.push(`-- ${data.saves.length} saves across ${USERS.length} users, ${urlMap.size} unique URLs`);
  lines.push("--");
  lines.push("-- To regenerate: npx tsx scripts/generate-seed.ts");
  lines.push("-- To apply: supabase db reset");
  lines.push("-- ═══════════════════════════════════════════════════════════");
  lines.push("");

  // ── Users
  lines.push("-- ─── Users ─────────────────────────────────────────────────");
  lines.push("");
  for (const user of USERS) {
    const id = userIds.get(user.handle)!;
    lines.push(
      `INSERT INTO public.users (id, handle, display_name, avatar_url, identity_line, joined_at) VALUES` +
        ` ('${id}', '${esc(user.handle)}', '${esc(user.display_name)}', null, '${esc(user.identity_line)}', '${user.joined_at}');`
    );
  }
  lines.push("");

  // ── URLs
  lines.push("-- ─── URLs ──────────────────────────────────────────────────");
  lines.push("");
  for (const [url, meta] of urlMap) {
    lines.push(
      `INSERT INTO public.urls (id, short_id, url, title, description, og_image_url, skill_count, tag_suggestions, created_at, updated_at) VALUES` +
        ` ('${meta.id}', '${meta.shortId}', '${esc(url)}', '${esc(meta.title)}', null, null, null, null, now(), now());`
    );
  }
  lines.push("");

  // ── Saves
  lines.push("-- ─── Saves ─────────────────────────────────────────────────");
  lines.push("");
  let saveCounter = 1;
  for (const save of data.saves) {
    const saveId = `20000000-0000-0000-0000-${String(saveCounter).padStart(12, "0")}`;
    const userId = userIds.get(save.user);
    const urlMeta = urlMap.get(save.url);

    if (!userId) {
      console.warn(`Unknown user: ${save.user}, skipping save ${save.id}`);
      continue;
    }
    if (!urlMeta) {
      console.warn(`Unknown URL: ${save.url}, skipping save ${save.id}`);
      continue;
    }

    lines.push(
      `INSERT INTO public.saves (id, user_id, url_id, notes, tags, created_at, updated_at) VALUES` +
        ` ('${saveId}', '${userId}', '${urlMeta.id}', '${esc(save.note)}', ${sqlArray(save.tags)}, '${save.created_at}', '${save.created_at}');`
    );
    saveCounter++;
  }
  lines.push("");

  // ── User follows
  lines.push("-- ─── User Follows ──────────────────────────────────────────");
  lines.push("");
  let followCounter = 1;
  for (const [follower, followed] of USER_FOLLOWS) {
    const followerId = userIds.get(follower);
    const followedId = userIds.get(followed);
    if (!followerId || !followedId) {
      console.warn(`Unknown user in follow: ${follower} -> ${followed}`);
      continue;
    }
    const id = `30000000-0000-0000-0000-${String(followCounter).padStart(12, "0")}`;
    lines.push(
      `INSERT INTO public.user_follows (id, follower_id, followed_id, created_at) VALUES` +
        ` ('${id}', '${followerId}', '${followedId}', '2026-03-15T00:00:00Z');`
    );
    followCounter++;
  }
  lines.push("");

  // ── Tag follows
  lines.push("-- ─── Tag Follows ──────────────────────────────────────────");
  lines.push("");
  let tagFollowCounter = 1;
  for (const [user, tag] of TAG_FOLLOWS) {
    const userId = userIds.get(user);
    if (!userId) {
      console.warn(`Unknown user in tag follow: ${user}`);
      continue;
    }
    const id = `40000000-0000-0000-0000-${String(tagFollowCounter).padStart(12, "0")}`;
    lines.push(
      `INSERT INTO public.tag_follows (id, user_id, tag, created_at) VALUES` +
        ` ('${id}', '${userId}', '${esc(tag)}', '2026-03-15T00:00:00Z');`
    );
    tagFollowCounter++;
  }
  lines.push("");

  // Write output
  const sql = lines.join("\n");
  writeFileSync(OUTPUT_SQL, sql, "utf-8");
  console.log(`\nWrote ${OUTPUT_SQL}`);
  console.log(`  ${USERS.length} users`);
  console.log(`  ${urlMap.size} urls`);
  console.log(`  ${saveCounter - 1} saves`);
  console.log(`  ${followCounter - 1} user follows`);
  console.log(`  ${tagFollowCounter - 1} tag follows`);
}

generate();
