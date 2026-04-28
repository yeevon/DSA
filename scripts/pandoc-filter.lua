-- scripts/pandoc-filter.lua
--
-- M2 Task T2 — pandoc Lua filter (HYBRID per M1 T2 verdict).
--
-- Three jobs, per design_docs/pandoc_probe.md "What the minimal
-- filter must do":
--
--   1. Reattach callout titles. Pandoc's LaTeX reader silently
--      drops the optional [Title] arg on \begin{defnbox}[Title]
--      etc. We pre-scan the raw .tex source for those args (in
--      document order, per env class) and zip them into the
--      corresponding Divs the AST walker visits.
--
--   2. Preserve lstlisting language hints. Pandoc emits the code
--      content as a CodeBlock but loses the [language=...] option.
--      We default to C++ (chapters target C++17) when no class
--      survives, and emit a fenced markdown code block with the
--      language tag so downstream MDX rendering (T3 + Shiki) can
--      syntax-highlight.
--
--   3. Prefix section anchors with ch_N-. The data model in
--      design_docs/architecture.md §2 (sections.anchor) requires
--      anchors to be unique across the 12 chapters. The chapter
--      id arrives via pandoc metadata --metadata chapter_id=ch_N
--      and the source path via --metadata source_path=<path>.
--
-- Invocation (typical):
--   pandoc --lua-filter scripts/pandoc-filter.lua \
--          --metadata chapter_id=ch_1 \
--          --metadata source_path=chapters/ch_1/lectures.tex \
--          chapters/ch_1/lectures.tex -o /tmp/ch_1.mdx

local CALLOUT_MAP = {
  defnbox    = "Definition",
  ideabox    = "KeyIdea",
  warnbox    = "Gotcha",
  examplebox = "Example",
  notebox    = "Aside",
}

local chapter_id = nil

-- Per-class queue of titles, populated by scan_source(); consumed
-- in document order by the Div walker. If the chapter has more
-- callouts than the scan found (or fewer), the mismatch is silent
-- and the missing entries default to no title — that's a smoke-
-- test signal to investigate, not a filter crash.
local title_queue   = {}
local title_cursor  = {}

local function init_queues()
  for env, _ in pairs(CALLOUT_MAP) do
    title_queue[env]  = {}
    title_cursor[env] = 0
  end
end

-- Scan the raw LaTeX for \begin{<envname>}[<title>] patterns and
-- enqueue titles per env class in document order. Lua patterns are
-- not full regex; this assumes [<title>] doesn't contain literal
-- "]" (which holds for the cs-300 chapter set — verified by spot
-- check; titles are short identifiers / phrases).
local function scan_source(path)
  init_queues()
  local f = io.open(path, "r")
  if not f then
    io.stderr:write("pandoc-filter: could not open source " .. path .. "\n")
    return
  end
  local content = f:read("*all")
  f:close()
  for env, raw_title in content:gmatch("\\begin{(%w+box)}%[([^%]]*)%]") do
    if CALLOUT_MAP[env] then
      table.insert(title_queue[env], raw_title)
    end
  end
end

-- Strip a small set of LaTeX commands from a title string so MDX
-- attribute output stays clean. Best-effort; unknown commands pass
-- through.
local function clean_title(s)
  s = s:gsub("\\texttt{([^}]*)}", "%1")
  s = s:gsub("\\textbf{([^}]*)}", "%1")
  s = s:gsub("\\emph{([^}]*)}",  "%1")
  s = s:gsub("\\_", "_")
  s = s:gsub("\\&", "&")
  s = s:gsub('"', '\\"')
  return s
end

-- Pandoc Lua filters run in document order by default, but the
-- Meta handler is visited *after* element handlers in a single-table
-- filter — too late, since Div needs the title queue populated
-- first. Returning multiple tables forces sequential passes:
-- Meta-only first, then Div/CodeBlock/Header.
local function meta_pass(meta)
  if meta.chapter_id then
    chapter_id = pandoc.utils.stringify(meta.chapter_id)
  end
  if meta.source_path then
    scan_source(pandoc.utils.stringify(meta.source_path))
  end
  return meta
end

-- Wrap a callout Div as a raw-HTML-block bracketed MDX component.
-- The inner content is rendered through pandoc's normal markdown
-- writer so child markdown (lists, code, math) survives.
local function Div(elem)
  for _, class in ipairs(elem.classes) do
    -- M-UX-REVIEW followup (2026-04-27): strip LaTeX `multicols`
    -- wrappers. Pandoc emits \begin{multicols}{N} as a Div with
    -- class "multicols" whose first child is a Para containing the
    -- column count "N", followed by the wrapped blocks. cs-300's
    -- deployed layout is single-column ~75ch reading per ADR-0002,
    -- so multicols is a no-op at render time. Drop the column-count
    -- Para + emit the rest unwrapped — otherwise MDX renders the
    -- literal `::: multicols\nN` fenced-div directive verbatim.
    if class == "multicols" then
      local out = {}
      for i, child in ipairs(elem.content) do
        local skip = false
        if i == 1 and child.t == "Para" and #child.content == 1 then
          local first = child.content[1]
          if first.t == "Str" and first.text:match("^%d+$") then
            skip = true
          end
        end
        if not skip then
          table.insert(out, child)
        end
      end
      return out
    end
    local component = CALLOUT_MAP[class]
    if component then
      title_cursor[class] = title_cursor[class] + 1
      local raw_title = title_queue[class] and title_queue[class][title_cursor[class]]
      local opening
      if raw_title and raw_title ~= "" then
        opening = string.format('<%s title="%s">', component, clean_title(raw_title))
      else
        opening = string.format('<%s>', component)
      end
      local closing = string.format('</%s>', component)
      local out = { pandoc.RawBlock("html", opening) }
      for _, child in ipairs(elem.content) do
        table.insert(out, child)
      end
      table.insert(out, pandoc.RawBlock("html", closing))
      return out
    end
  end
  return elem
end

-- Force every CodeBlock (which is what pandoc emits for lstlisting,
-- verbatim, etc.) to carry exactly the `cpp` class. Pandoc preserves
-- the original lstlisting options (`basicstyle`, `frame`,
-- `language="C++"`) as fence attributes — Shiki then sees the
-- attribute block `{.c++ basicstyle=…}` as the language string and
-- falls back to plaintext. Strip attrs + identifier; replace classes
-- with just `{cpp}`. The chapter set targets C++17 uniformly; the
-- only non-C++ blocks are pseudo-code in ch_2 which renders close
-- enough as cpp. (T2 audit ISS for lang variety; revisit if a
-- chapter ships non-C++ that needs distinct highlighting.)
local function CodeBlock(elem)
  elem.classes = { "cpp" }
  elem.attributes = {}
  elem.identifier = ""
  return elem
end

-- Prefix the Header's auto-slug with chapter_id so anchors are
-- unique across the 12 chapters. Skips if chapter_id wasn't passed
-- (filter still runs, just no prefix).
local function Header(elem)
  if chapter_id and elem.identifier ~= "" then
    elem.identifier = chapter_id .. "-" .. elem.identifier
  end
  return elem
end

return {
  { Meta = meta_pass },
  { Div = Div, CodeBlock = CodeBlock, Header = Header },
}
