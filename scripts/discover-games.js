#!/usr/bin/env node
// NextLevel — AI Game Discovery Script
// Finds new family-friendly games using RAWG + Tavily, evaluated by Gemini 2.5 Flash
//
// Usage:
//   GEMINI_API_KEY=... TAVILY_API_KEY=... node scripts/discover-games.js
//
// Output: scripts/output/suggested-games-YYYY-MM-DD.json
// Review the output and manually paste approved entries into src/App.jsx GAMES array.

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const RAWG_API_KEY = process.env.RAWG_API_KEY || "3b7ab5e4a9334b23b461609de5c93bab";

if (!GEMINI_API_KEY) {
  console.error("❌  GEMINI_API_KEY is required. Get one at https://aistudio.google.com/");
  process.exit(1);
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const VALID_CONSOLES = [
  "Nintendo Switch", "Nintendo Switch 2", "PlayStation 5",
  "PS4/PS5", "Xbox", "PC", "Mobile",
];
const VALID_GENRES = [
  "platformer", "racing", "sandbox", "adventure", "simulation", "rpg",
  "puzzle", "casual", "strategy", "shooter", "family", "multiplayer",
  "co-op", "creative", "relaxing", "exploration", "story", "educational",
  "sports", "fitness", "party", "fighting", "action", "retro", "social",
  "rhythm", "survival", "collecting",
];
const VALID_RATINGS = ["E", "E10+", "T"];
const VALID_TIMES = ["short", "medium", "long", "endless"];

// ─── STEP 1: Get existing slugs from App.jsx ──────────────────────────────────
function getExistingSlugs() {
  const src = readFileSync(join(ROOT, "src", "App.jsx"), "utf8");
  const matches = [...src.matchAll(/slug:\s*["']([^"']+)["']/g)];
  return new Set(matches.map(m => m[1]));
}

// ─── STEP 2: RAWG — fetch recent highly-rated family games ───────────────────
async function fetchRawgCandidates() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateFrom = oneYearAgo.toISOString().split("T")[0];
  const dateTo = new Date().toISOString().split("T")[0];

  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    ordering: "-metacritic",
    metacritic: "70,100",
    dates: `${dateFrom},${dateTo}`,
    page_size: "40",
    tags: "family",
  });

  console.log("📡  Querying RAWG for recent family-friendly games...");
  const res = await fetch(`https://api.rawg.io/api/games?${params}`);
  if (!res.ok) {
    console.warn(`⚠️   RAWG returned ${res.status} — skipping RAWG results`);
    return [];
  }

  const data = await res.json();
  return (data.results || []).map(g => ({
    slug: g.slug,
    title: g.name,
    mc: g.metacritic || null,
    esrb: g.esrb_rating?.slug || null,  // e.g. "everyone", "everyone-10-plus", "teen"
    released: g.released,
    platforms: (g.platforms || []).map(p => p.platform.name),
  }));
}

// ─── STEP 3: Tavily — search for recent game news ────────────────────────────
async function fetchTavilyCandidates() {
  if (!TAVILY_API_KEY) {
    console.warn("⚠️   TAVILY_API_KEY not set — skipping web search");
    return [];
  }

  const queries = [
    "best new family-friendly video games 2025 2026 Nintendo Switch PlayStation",
    "new kids games ESRB rated E E10 released 2025 2026 review",
  ];

  console.log("🔍  Searching web for recent family game news via Tavily...");
  const results = [];

  for (const query of queries) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: "basic",
          max_results: 8,
        }),
      });

      if (!res.ok) {
        console.warn(`⚠️   Tavily returned ${res.status} for query: "${query}"`);
        continue;
      }

      const data = await res.json();
      // Collect the raw content snippets — Gemini will extract game names from them
      for (const r of data.results || []) {
        if (r.content) results.push(r.content.slice(0, 600));
      }
    } catch (e) {
      console.warn(`⚠️   Tavily search error: ${e.message}`);
    }
  }

  return results;
}

// ─── STEP 4: Deduplicate against existing list ────────────────────────────────
function deduplicate(rawgCandidates, existingSlugs) {
  return rawgCandidates.filter(g => {
    if (existingSlugs.has(g.slug)) return false;
    // Skip adult-rated (RAWG uses "mature" slug)
    if (g.esrb === "mature" || g.esrb === "adults-only") return false;
    return true;
  });
}

// ─── STEP 5: Gemini Flash — evaluate candidates and generate game objects ─────
async function evaluateWithGemini(rawgCandidates, tavilySnippets, existingSlugs) {
  const candidateList = rawgCandidates.slice(0, 20).map((g, i) => {
    const esrbMap = { "everyone": "E", "everyone-10-plus": "E10+", "teen": "T" };
    return `${i + 1}. "${g.title}" (slug: ${g.slug}, Metacritic: ${g.mc || "N/A"}, ESRB: ${esrbMap[g.esrb] || "unknown"}, released: ${g.released}, platforms: ${g.platforms.slice(0, 4).join(", ")})`;
  }).join("\n");

  const tavilyContext = tavilySnippets.length > 0
    ? `\n\nAdditional context from recent game news articles (use this to discover titles not in the RAWG list above):\n${tavilySnippets.join("\n\n---\n\n")}`
    : "";

  const prompt = `You are a curator for NextLevel, a family game finder app. Your job is to evaluate candidate games and generate properly structured data for any that genuinely belong in the app.

NextLevel's audience: parents with kids aged 5–13. The app only includes ESRB E, E10+, or T games. Games must be available on mainstream platforms (Switch, PS5, Xbox, PC, or Mobile).

RAWG candidates (recently released, Metacritic 70+):
${candidateList}
${tavilyContext}

For EACH game you include, return a JSON object with EXACTLY these fields:
- id: use 1000 + (index starting at 0)
- title: exact game title string
- consoles: array using ONLY these values: ${VALID_CONSOLES.join(", ")}
- excl: boolean — true only if released exclusively on one platform
- genre: array of 2–4 tags from ONLY this list: ${VALID_GENRES.join(", ")}
- rating: ONLY "E", "E10+", or "T"
- price: integer USD (0 for free, use typical launch price if unknown)
- slug: RAWG slug string (use the slug from the candidate list, or best guess for Tavily games)
- mc: Metacritic score integer or null
- ign: IGN score float or null
- time: ONLY "short", "medium", "long", or "endless"
- coop: boolean — has any co-op or multiplayer mode?
- sib: boolean — specifically good for two siblings playing together?
- pk: boolean — specifically designed or great for parent+child play?
- soon: boolean — not yet released?
- desc: string, 1–2 sentences for parents, max 180 characters
- quote: string, short critic quote with source (e.g. "A delight for all ages. — IGN"), or empty string if unknown

RULES:
- ONLY include games rated E, E10+, or T
- ONLY include genuine family-friendly titles (no war shooters, horror, etc.)
- Skip games already in the list: ${[...existingSlugs].join(", ")}
- If you're not confident a game is family-appropriate, leave it out
- Return ONLY a valid JSON array, no markdown fences, no explanation

Return the JSON array now:`;

  console.log("🤖  Asking Gemini 2.5 Flash to evaluate candidates...");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown fences if present
  const jsonText = text.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/gi, "").trim();

  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array");

    // Validate and sanitise each entry
    return parsed.filter(g => {
      if (!g.title || !g.slug) return false;
      if (!VALID_RATINGS.includes(g.rating)) return false;
      if (!Array.isArray(g.consoles) || g.consoles.length === 0) return false;
      return true;
    }).map((g, i) => ({
      ...g,
      id: 1000 + i,
      consoles: g.consoles.filter(c => VALID_CONSOLES.includes(c)),
      genre: (g.genre || []).filter(t => VALID_GENRES.includes(t)),
      time: VALID_TIMES.includes(g.time) ? g.time : "medium",
      price: typeof g.price === "number" ? g.price : 0,
      mc: g.mc || null,
      ign: g.ign || null,
    }));
  } catch (e) {
    console.error("❌  Could not parse Gemini response as JSON:", e.message);
    console.error("Raw response:\n", text.slice(0, 500));
    return [];
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎮  NextLevel Game Discovery — starting...\n");

  const existingSlugs = getExistingSlugs();
  console.log(`📋  Found ${existingSlugs.size} existing games in App.jsx\n`);

  const [rawgRaw, tavilySnippets] = await Promise.all([
    fetchRawgCandidates(),
    fetchTavilyCandidates(),
  ]);

  const rawgCandidates = deduplicate(rawgRaw, existingSlugs);
  console.log(`\n✅  RAWG: ${rawgRaw.length} found, ${rawgCandidates.length} new after deduplication`);
  console.log(`✅  Tavily: ${tavilySnippets.length} snippets collected\n`);

  if (rawgCandidates.length === 0 && tavilySnippets.length === 0) {
    console.log("ℹ️   No new candidates found. Try again next month!");
    return;
  }

  const suggestions = await evaluateWithGemini(rawgCandidates, tavilySnippets, existingSlugs);

  if (suggestions.length === 0) {
    console.log("\nℹ️   Gemini found no qualifying new games this run.");
    return;
  }

  // Write output
  const date = new Date().toISOString().split("T")[0];
  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `suggested-games-${date}.json`);
  writeFileSync(outFile, JSON.stringify(suggestions, null, 2));

  console.log(`\n🎉  Found ${suggestions.length} suggested game(s)!`);
  console.log(`📄  Output: scripts/output/suggested-games-${date}.json`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the JSON file and remove any entries you don't want`);
  console.log(`  2. Paste approved entries into the GAMES array in src/App.jsx`);
  console.log(`  3. Update the id fields to continue from the last game's id`);
  console.log(`  4. Commit and deploy!\n`);

  // Print a quick summary
  suggestions.forEach(g => {
    console.log(`  • ${g.title} [${g.rating}] — ${g.consoles.slice(0, 2).join(", ")} — ${g.desc?.slice(0, 60)}...`);
  });
}

main().catch(err => {
  console.error("❌  Fatal error:", err.message);
  process.exit(1);
});
