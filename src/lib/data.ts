/**
 * clippt data layer.
 *
 * Abstracted behind an interface so localStorage can be swapped
 * for Supabase / SQLite later.
 */

// ─── Types ──────────────────────────────────

export interface Resource {
  id: string;
  url: string;
  title: string;
  domain: string;
  tags: string[];
  notes: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

export type ResourceInput = Omit<Resource, "id" | "createdAt" | "updatedAt" | "domain">;

// ─── Helpers ────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Storage key ────────────────────────────

const STORAGE_KEY = "clippt-resources";

// ─── CRUD ───────────────────────────────────

function readAll(): Resource[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Resource[];
  } catch {
    return [];
  }
}

function writeAll(resources: Resource[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

export function getResources(): Resource[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getResource(id: string): Resource | undefined {
  return readAll().find((r) => r.id === id);
}

export function createResource(input: ResourceInput): Resource {
  const now = new Date().toISOString();
  const resource: Resource = {
    id: generateId(),
    url: input.url,
    title: input.title,
    domain: extractDomain(input.url),
    tags: input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  const all = readAll();
  all.push(resource);
  writeAll(all);
  return resource;
}

export function updateResource(
  id: string,
  updates: Partial<ResourceInput>
): Resource | undefined {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;

  const existing = all[idx];
  const updated: Resource = {
    ...existing,
    ...updates,
    domain: updates.url ? extractDomain(updates.url) : existing.domain,
    tags: updates.tags
      ? updates.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      : existing.tags,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deleteResource(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

/**
 * Get all unique tags with counts, sorted by count desc.
 */
export function getTagCounts(resources?: Resource[]): { tag: string; count: number }[] {
  const all = resources ?? readAll();
  const counts = new Map<string, number>();
  for (const r of all) {
    for (const t of r.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Seed the store if empty. Returns true if seeded.
 */
export function seedIfEmpty(): boolean {
  if (readAll().length > 0) return false;
  const seeds: ResourceInput[] = [
    {
      url: "https://modelcontextprotocol.io",
      title: "Model Context Protocol",
      tags: ["mcp", "protocol", "ai-tools"],
      notes: "The open standard for connecting AI assistants to external tools and data sources.",
    },
    {
      url: "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
      title: "Tool Use — Anthropic Docs",
      tags: ["anthropic", "ai-tools", "api"],
      notes: "Official guide to function calling / tool use with Claude.",
    },
    {
      url: "https://huggingface.co/blog/open-source-llms-as-agents",
      title: "Open-source LLMs as Agents",
      tags: ["agents", "open-source", "llm"],
      notes: "Great overview of using open-source models as autonomous agents.",
    },
    {
      url: "https://www.cursor.com",
      title: "Cursor — The AI Code Editor",
      tags: ["ai-tools", "coding", "editor"],
      notes: "AI-native code editor built on VS Code. Solid tab-complete and cmd-k.",
    },
    {
      url: "https://simonwillison.net/2024/Mar/22/claude-and-chatgpt-case-study/",
      title: "Claude and ChatGPT for ad-hoc sidequests",
      tags: ["articles", "anthropic", "llm"],
      notes: "Simon Willison's take on using LLMs for quick research tasks.",
    },
    {
      url: "https://github.com/langchain-ai/langchain",
      title: "LangChain",
      tags: ["agents", "open-source", "framework"],
      notes: "Framework for developing applications powered by LLMs.",
    },
    {
      url: "https://platform.openai.com/docs/guides/function-calling",
      title: "Function Calling — OpenAI",
      tags: ["api", "ai-tools"],
      notes: "OpenAI's docs on function calling. Useful to compare with Anthropic's approach.",
    },
    {
      url: "https://www.perplexity.ai",
      title: "Perplexity AI",
      tags: ["ai-tools", "search"],
      notes: "AI-powered search engine. Good for research that needs citations.",
    },
    {
      url: "https://lilianweng.github.io/posts/2023-06-23-agent/",
      title: "LLM Powered Autonomous Agents — Lilian Weng",
      tags: ["agents", "articles", "llm"],
      notes: "Definitive deep-dive on agent architectures: planning, memory, tool use.",
    },
    {
      url: "https://v0.dev",
      title: "v0 by Vercel",
      tags: ["ai-tools", "coding", "ui"],
      notes: "AI-generated UI components. Good for prototyping shadcn/ui layouts.",
    },
  ];

  for (const seed of seeds) {
    createResource(seed);
  }
  return true;
}
