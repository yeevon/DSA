#!/usr/bin/env node
// scripts/validate-claude-workflow.mjs
//
// Static integrity checker for the cs-300 .claude/ workflow tree.
//
// What this validates (covers what a human reviewer would check before
// trusting the orchestrator on a real task):
//
//   1. Required workflow files exist (agents, _common, commands, skill,
//      long-running pattern, runs/ directory).
//   2. Each agent has valid frontmatter (name, description, tools,
//      model — optionally thinking).
//   3. Each command has valid frontmatter (model, optionally thinking).
//   4. Agent frontmatter `name:` matches the filename.
//   5. Every relative markdown link inside a workflow file resolves to a
//      real file on disk.
//   6. Every agent name referenced in CLAUDE.md, .claude/README.md,
//      SKILL.md, _common/non_negotiables.md, and the commands corresponds
//      to an actual agent file.
//   7. Every LBD-N reference in any workflow file points at an LBD that
//      CLAUDE.md actually defines (LBD-1..14 today).
//   8. The dependency-manifest list is identical across CLAUDE.md,
//      _common/verification_discipline.md, and dependency-auditor.md.
//   9. Each agent's return-verdict ladder (parsed from its
//      `verdict: <X / Y / Z>` block) matches the ladder
//      _common/non_negotiables.md advertises for that agent.
//  10. Models referenced in _common/effort_table.md match the actual
//      model: frontmatter on each file.
//  11. Auditor and architect are on claude-opus-4-7; everything else is
//      on claude-sonnet-4-6 (cs-300's deliberate split — drift gatekeepers
//      get the headroom).
//  12. Every package.json script the workflow files reference (npm run
//      <name>) actually exists in package.json.
//  13. The status-surface 4-way is referenced consistently (the four
//      surfaces named in CLAUDE.md should appear together in any file
//      that calls out LBD-10).
//
// What this does NOT validate (still requires a live exercise):
//
//   - That the Builder/Auditor handoff actually produces a clean cycle.
//   - That `/clean-implement`'s security gate fires only after PASS.
//   - That `dependency-auditor` correctly detects manifest changes.
//   - That `progress.md` is actually append-only across cycles.
//   - That the Auditor reruns gates from scratch.
//
// Those need a real fake-task dry-run; document them under
// `scripts/validate-claude-workflow.md` for the manual exercise.
//
// Exit codes:
//   0 — all checks passed
//   1 — one or more failures (printed as `FAIL: <check> — <detail>`)
//   2 — script error (not a workflow problem)

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// -------------------- helpers --------------------

const failures = [];
const passes = [];

function fail(check, detail) {
  failures.push({ check, detail });
}

function pass(check, detail = "") {
  passes.push({ check, detail });
}

function read(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    return null;
  }
}

function rel(p) {
  return relative(ROOT, p);
}

function parseFrontmatter(src) {
  if (!src.startsWith("---\n")) return null;
  const end = src.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const block = src.slice(4, end);
  const out = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function listMarkdownLinks(src) {
  // Matches [text](path) and [text](path "title"), captures path.
  // Excludes URL-style links.
  const out = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(src))) {
    const target = m[2];
    if (/^https?:\/\//.test(target)) continue;
    if (target.startsWith("#")) continue;
    if (target.startsWith("mailto:")) continue;
    out.push(target);
  }
  return out;
}

function parseVerdictLadder(src) {
  // Look for a `verdict: <A / B / C>` line inside a fenced text block.
  const m = src.match(/verdict:\s*<([^>]+)>/);
  if (!m) return null;
  return m[1]
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

// -------------------- 1. file existence --------------------

const required = {
  "CLAUDE.md": ["CLAUDE.md"],
  agents: [
    ".claude/agents/builder.md",
    ".claude/agents/auditor.md",
    ".claude/agents/architect.md",
    ".claude/agents/roadmap-selector.md",
    ".claude/agents/sr-dev.md",
    ".claude/agents/sr-sdet.md",
    ".claude/agents/task-analyzer.md",
    ".claude/agents/security-reviewer.md",
    ".claude/agents/dependency-auditor.md",
  ],
  agents_common: [
    ".claude/agents/_common/non_negotiables.md",
    ".claude/agents/_common/verification_discipline.md",
  ],
  commands: [
    ".claude/commands/clean-implement.md",
    ".claude/commands/audit.md",
    ".claude/commands/auto-implement.md",
    ".claude/commands/autopilot.md",
    ".claude/commands/clean-tasks.md",
    ".claude/commands/implement.md",
    ".claude/commands/queue-pick.md",
  ],
  commands_common: [
    ".claude/commands/_common/cycle_summary_template.md",
    ".claude/commands/_common/effort_table.md",
    ".claude/commands/_common/gate_parse_patterns.md",
  ],
  skill: [".claude/skills/project-development/SKILL.md"],
  agent_docs: ["agent_docs/long_running_pattern.md"],
  runs: ["runs/.gitkeep"],
  readme: [".claude/README.md"],
};

const ALL_FILES = [];
for (const group of Object.values(required)) {
  for (const f of group) {
    const abs = join(ROOT, f);
    if (existsSync(abs) && statSync(abs).isFile()) {
      pass("file-exists", rel(abs));
      ALL_FILES.push(abs);
    } else {
      fail("file-exists", `missing: ${f}`);
    }
  }
}

// Workflow markdown files we will scan for links / references.
const WORKFLOW_MD = ALL_FILES.filter(
  (f) => f.endsWith(".md") && !f.endsWith(".gitkeep"),
);

// -------------------- 2. agent frontmatter --------------------

const AGENT_FILES = required.agents.map((p) => join(ROOT, p));
const agentMeta = new Map(); // name -> { file, model, tools, ... }

for (const f of AGENT_FILES) {
  const src = read(f);
  if (!src) continue;
  const fm = parseFrontmatter(src);
  if (!fm) {
    fail("agent-frontmatter", `${rel(f)}: no frontmatter block`);
    continue;
  }
  const required_fields = ["name", "description", "tools", "model"];
  const missing = required_fields.filter((k) => !fm[k]);
  if (missing.length) {
    fail(
      "agent-frontmatter",
      `${rel(f)}: missing fields ${missing.join(", ")}`,
    );
    continue;
  }
  // name must match filename
  const expected = basename(f, ".md");
  if (fm.name !== expected) {
    fail(
      "agent-name-matches-file",
      `${rel(f)}: name="${fm.name}" but file is ${expected}.md`,
    );
  } else {
    pass("agent-name-matches-file", expected);
  }
  agentMeta.set(fm.name, { file: f, ...fm });
}

// -------------------- 3. command frontmatter --------------------

const CMD_FILES = required.commands.map((p) => join(ROOT, p));
const commandMeta = new Map();

for (const f of CMD_FILES) {
  const src = read(f);
  if (!src) continue;
  const fm = parseFrontmatter(src);
  if (!fm) {
    fail("command-frontmatter", `${rel(f)}: no frontmatter block`);
    continue;
  }
  if (!fm.model) {
    fail("command-frontmatter", `${rel(f)}: missing model`);
    continue;
  }
  commandMeta.set(basename(f, ".md"), { file: f, ...fm });
}

// -------------------- 4. relative-link resolution --------------------

for (const f of WORKFLOW_MD) {
  const src = read(f);
  if (!src) continue;
  const links = listMarkdownLinks(src);
  for (const link of links) {
    // Strip anchor fragment.
    const [path, _frag] = link.split("#");
    if (!path) continue; // anchor-only link
    // Skip placeholder paths: anything with `<...>` is a fill-in token
    // (e.g., `../tasks/T<NN>_<slug>.md` inside an example template).
    if (/<[^>]+>/.test(path)) continue;
    let target;
    if (path.startsWith("/")) {
      target = join(ROOT, path);
    } else {
      target = resolve(dirname(f), path);
    }
    if (!existsSync(target)) {
      fail("link-resolves", `${rel(f)} → ${link} (resolved ${rel(target)})`);
    }
  }
}
pass("link-resolves", "all relative markdown links walked");

// -------------------- 5. agent-name references --------------------

const KNOWN_AGENTS = new Set(agentMeta.keys());

// Files that mention agents by string. We grep for backtick-wrapped names
// so we don't false-positive on prose like "the builder pattern."
const AGENT_REF_FILES = [
  "CLAUDE.md",
  ".claude/README.md",
  ".claude/skills/project-development/SKILL.md",
  ".claude/agents/_common/non_negotiables.md",
  ...required.commands,
  ...required.agents, // agents reference each other (e.g., clean-tasks → task-analyzer)
];

for (const rp of AGENT_REF_FILES) {
  const f = join(ROOT, rp);
  const src = read(f);
  if (!src) continue;
  // Match `<name>` where name looks like an agent id (kebab or single word).
  const refs = new Set();
  const re = /`([a-z][a-z0-9-]*)`/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    if (KNOWN_AGENTS.has(name)) refs.add(name);
  }
  // We don't fail on missing references — different files cite different
  // subsets. We do fail if a referenced name doesn't exist.
  for (const r of refs) {
    if (!KNOWN_AGENTS.has(r)) {
      fail("agent-ref-exists", `${rp}: references unknown agent \`${r}\``);
    }
  }
}
pass("agent-ref-exists", "all backticked agent references resolve");

// -------------------- 6. LBD references --------------------

const claudeMd = read(join(ROOT, "CLAUDE.md")) || "";
const lbdDefs = new Set();
{
  const re = /\|\s*(LBD-\d+)\s*\|/g;
  let m;
  while ((m = re.exec(claudeMd))) lbdDefs.add(m[1]);
}
if (lbdDefs.size === 0) {
  fail("lbd-defs", "no LBD-N rows found in CLAUDE.md table");
} else {
  pass("lbd-defs", `${lbdDefs.size} LBDs defined: ${[...lbdDefs].sort().join(", ")}`);
}

for (const f of WORKFLOW_MD) {
  const src = read(f);
  if (!src) continue;
  const re = /\bLBD-(\d+)\b/g;
  let m;
  while ((m = re.exec(src))) {
    const id = `LBD-${m[1]}`;
    if (!lbdDefs.has(id)) {
      // Allow LBD-N..M ranges (e.g., "LBD-1..14")
      // Skip if the immediate context is a range
      const ctx = src.slice(Math.max(0, m.index - 5), m.index + 10);
      if (/LBD-\d+\.\.\d+/.test(ctx)) continue;
      fail("lbd-ref-defined", `${rel(f)}: cites ${id} which CLAUDE.md does not define`);
    }
  }
}
pass("lbd-ref-defined", "all LBD-N citations resolve to a CLAUDE.md row");

// -------------------- 7. dependency-manifest list consistency --------------------

const DEP_MANIFESTS_EXPECTED = [
  "package.json",
  "package-lock.json",
  "pyproject.toml",
  "uv.lock",
  "requirements*.txt",
  ".nvmrc",
  ".pandoc-version",
  "Dockerfile",
  "docker-compose.yml",
];

function extractManifestList(src) {
  // Look for a fenced ```text block with the canonical list.
  const m = src.match(/```text\n([^`]+?)\n```/g);
  if (!m) return null;
  for (const block of m) {
    const inner = block.replace(/```text\n|```/g, "").trim().split("\n");
    const candidates = inner.map((l) => l.trim()).filter(Boolean);
    const has = (s) => candidates.includes(s);
    if (
      has("package.json") &&
      has("package-lock.json") &&
      has("pyproject.toml")
    ) {
      return candidates;
    }
  }
  return null;
}

const manifestSources = [
  "CLAUDE.md",
  ".claude/agents/_common/verification_discipline.md",
  ".claude/agents/dependency-auditor.md",
];
const manifestLists = [];
for (const rp of manifestSources) {
  const src = read(join(ROOT, rp)) || "";
  const list = extractManifestList(src);
  if (!list) {
    fail("dep-manifest-list", `${rp}: cannot find canonical manifest list`);
    continue;
  }
  manifestLists.push({ rp, list });
}
// All extracted lists must be identical and equal to expected.
const ref = JSON.stringify(DEP_MANIFESTS_EXPECTED);
for (const { rp, list } of manifestLists) {
  if (JSON.stringify(list) !== ref) {
    fail(
      "dep-manifest-list",
      `${rp}: list does not match canonical (got ${JSON.stringify(list)})`,
    );
  }
}
pass("dep-manifest-list", `${manifestLists.length} sources, all aligned`);

// -------------------- 8. verdict-ladder consistency --------------------

// Pull the ladder declared in non_negotiables.md and cross-check against
// each agent's actual `verdict: <…>` block.
const nnSrc = read(
  join(ROOT, ".claude/agents/_common/non_negotiables.md"),
) || "";

const declaredLadders = new Map();
{
  // Match table rows: | `agent-name` | `LADDER` |
  const re = /\|\s*`([a-z][a-z0-9-]+)`\s*\|\s*`([^`]+)`\s*\|/g;
  let m;
  while ((m = re.exec(nnSrc))) {
    declaredLadders.set(
      m[1],
      m[2]
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean)
        .sort(),
    );
  }
}

if (declaredLadders.size < KNOWN_AGENTS.size) {
  fail(
    "ladder-table-complete",
    `non_negotiables.md declares ${declaredLadders.size} ladders, expected ${KNOWN_AGENTS.size}`,
  );
} else {
  pass("ladder-table-complete", `${declaredLadders.size} ladders declared`);
}

for (const [name, meta] of agentMeta) {
  const src = read(meta.file) || "";
  const actual = parseVerdictLadder(src);
  if (!actual) {
    fail("agent-ladder-parsed", `${rel(meta.file)}: no verdict block found`);
    continue;
  }
  const declared = declaredLadders.get(name);
  if (!declared) {
    fail(
      "agent-ladder-declared",
      `non_negotiables.md does not list a ladder for \`${name}\``,
    );
    continue;
  }
  if (JSON.stringify(actual) !== JSON.stringify(declared)) {
    fail(
      "agent-ladder-matches",
      `${name}: agent ladder ${actual.join("/")} differs from declared ${declared.join("/")}`,
    );
  }
}
pass("agent-ladder-matches", "all agent verdict ladders match the declared table");

// -------------------- 9. effort table vs frontmatter models --------------------

const effortSrc = read(
  join(ROOT, ".claude/commands/_common/effort_table.md"),
) || "";
const effortRows = new Map();
{
  // Rows look like: | `agent-name` | **opus-4-7** | (adaptive) | … |  OR
  //                 | `/command`    | sonnet-4-6   | high        | … |
  const re =
    /\|\s*`([\/A-Za-z0-9_-]+)`\s*\|\s*\**(opus-4-7|sonnet-4-6|haiku-4-5)\**\s*\|\s*([^|]+?)\s*\|/g;
  let m;
  while ((m = re.exec(effortSrc))) {
    effortRows.set(m[1], { model: m[2], thinking: m[3].trim() });
  }
}

if (effortRows.size === 0) {
  fail("effort-table-parsed", "could not parse effort_table.md rows");
} else {
  pass("effort-table-parsed", `${effortRows.size} rows`);
}

const expand = (s) => `claude-${s}`;
for (const [name, meta] of agentMeta) {
  const eff = effortRows.get(name);
  if (!eff) {
    fail("effort-table-coverage", `agent \`${name}\` not in effort table`);
    continue;
  }
  if (meta.model !== expand(eff.model)) {
    fail(
      "effort-table-model-match",
      `${name}: file model=${meta.model}, effort table=${expand(eff.model)}`,
    );
  }
}

for (const [name, meta] of commandMeta) {
  const eff = effortRows.get(`/${name}`);
  if (!eff) {
    fail("effort-table-coverage", `command \`/${name}\` not in effort table`);
    continue;
  }
  if (meta.model !== expand(eff.model)) {
    fail(
      "effort-table-model-match",
      `/${name}: file model=${meta.model}, effort table=${expand(eff.model)}`,
    );
  }
}
pass(
  "effort-table-model-match",
  "all agent + command models match the effort table",
);

// -------------------- 10. drift-gatekeeper policy --------------------

const OPUS_AGENTS = new Set(["auditor", "architect"]);
for (const [name, meta] of agentMeta) {
  const expectedModel = OPUS_AGENTS.has(name)
    ? "claude-opus-4-7"
    : "claude-sonnet-4-6";
  if (meta.model !== expectedModel) {
    fail(
      "drift-gatekeeper-model",
      `${name}: expected ${expectedModel}, got ${meta.model}`,
    );
  }
}
for (const [name, meta] of commandMeta) {
  if (meta.model !== "claude-sonnet-4-6") {
    fail(
      "drift-gatekeeper-model",
      `/${name}: expected claude-sonnet-4-6, got ${meta.model}`,
    );
  }
}
pass("drift-gatekeeper-model", "auditor + architect on opus-4-7; everything else sonnet-4-6");

// -------------------- 11. npm scripts referenced exist --------------------

const pkgRaw = read(join(ROOT, "package.json"));
let pkgScripts = {};
if (pkgRaw) {
  try {
    pkgScripts = JSON.parse(pkgRaw).scripts || {};
  } catch {
    fail("package-json-parsed", "could not parse package.json");
  }
}

const npmRunRefs = new Set();
for (const f of WORKFLOW_MD) {
  const src = read(f) || "";
  const re = /\bnpm run ([a-z][a-z:-]+)\b/g;
  let m;
  while ((m = re.exec(src))) npmRunRefs.add(m[1]);
}
for (const s of npmRunRefs) {
  if (!pkgScripts[s]) {
    fail(
      "npm-script-exists",
      `workflow files reference \`npm run ${s}\` but it is not in package.json`,
    );
  }
}
pass(
  "npm-script-exists",
  `${npmRunRefs.size} npm scripts referenced; all exist in package.json`,
);

// -------------------- 12. status-surface 4-way consistency --------------------
//
// LBD-10 names four surfaces. Enforcement strategy: CLAUDE.md is the
// canonical definition and MUST enumerate all four. Procedure files
// (the ones that actually drive task-close flow) MUST also enumerate.
// Reference / index / advisory files (effort table, SKILL, README,
// /audit, /autopilot, /implement) may name the rule in passing without
// repeating the four bullets — the canonical source carries the load.

const STATUS_SURFACE_KEYWORDS = [
  { name: "per-task spec", re: /per-task spec/i },
  { name: "tasks/README.md row", re: /tasks\/README\.md/ },
  { name: "milestone README task table", re: /milestone README/i },
  { name: "Done when checkboxes", re: /Done when/i },
];

const PROCEDURE_FILES_THAT_MUST_ENUMERATE = [
  "CLAUDE.md",
  ".claude/agents/auditor.md",
  ".claude/agents/builder.md",
  ".claude/agents/task-analyzer.md",
  ".claude/commands/clean-tasks.md",
  ".claude/commands/clean-implement.md",
  ".claude/commands/_common/cycle_summary_template.md",
  "agent_docs/long_running_pattern.md",
];

for (const rp of PROCEDURE_FILES_THAT_MUST_ENUMERATE) {
  const src = read(join(ROOT, rp)) || "";
  const missing = STATUS_SURFACE_KEYWORDS.filter((kw) => !kw.re.test(src));
  if (missing.length > 0) {
    fail(
      "status-surface-4way",
      `${rp}: procedure file is missing surface(s): ${missing.map((kw) => kw.name).join(", ")}`,
    );
  }
}
pass(
  "status-surface-4way",
  `${PROCEDURE_FILES_THAT_MUST_ENUMERATE.length} procedure files enumerate all four LBD-10 surfaces`,
);

// -------------------- summary --------------------

const totalChecks = passes.length + failures.length;
console.log("");
console.log(`Validating cs-300 .claude/ workflow under ${ROOT}`);
console.log("");
for (const p of passes) {
  console.log(`  PASS  ${p.check}${p.detail ? ` — ${p.detail}` : ""}`);
}
console.log("");
if (failures.length === 0) {
  console.log(`OK — ${passes.length} checks passed.`);
  console.log("");
  console.log(
    "Reminder: this is a STATIC integrity check. The following still",
  );
  console.log("require live exercise (see scripts/validate-claude-workflow.md):");
  console.log("  - Builder/Auditor handoff on a real fake task");
  console.log("  - /clean-implement security gate firing only after PASS");
  console.log("  - dependency-auditor detecting manifest changes");
  console.log("  - progress.md append-only behaviour across cycles");
  process.exit(0);
} else {
  console.log(`FAIL — ${failures.length}/${totalChecks} checks failed:`);
  console.log("");
  for (const f of failures) {
    console.log(`  FAIL  ${f.check}: ${f.detail}`);
  }
  console.log("");
  process.exit(1);
}
