# M7 — Phase 7: Audio narration

**Maps to:** `interactive_notes_roadmap.md` Phase 7
**Status:** todo
**Depends on:** M2 (Astro pipeline + content collections must
exist; audio file layout was pinned during M2 to avoid M7 unwind)
**Unblocks:** —

## Goal

Pre-generate TTS narration for each chapter, ship the audio +
sentence-timestamp JSON as static assets, and surface a player
that highlights the current sentence as audio plays. Works in
both `static` and `interactive` modes since audio is static
(architecture.md §1.4).

## Done when

- [ ] TTS pipeline produces, per chapter:
  - `public/audio/ch_N.mp3` — the narration.
  - `public/audio/ch_N.timestamps.json` — sentence-level offsets.
- [ ] `<AudioPlayer>` island component:
  - Loads MP3 + JSON.
  - Plays / pauses / scrubs.
  - Highlights the current sentence in the rendered chapter as
    audio progresses.
  - Click a sentence to seek to that timestamp.
- [ ] Generation is idempotent — re-running the TTS pipeline on
      unchanged source produces byte-identical (or
      semantically-identical) MP3 + JSON. Or the regen detection
      is explicit ("source changed since last gen, re-generate").
- [ ] All 12 chapters have audio committed (or
      lfs-tracked / external-stored — see decision below).
- [ ] TTS provider decision documented (architecture.md §6 lists
      this as an open question).
- [ ] Storage decision documented: commit MP3s to git, use Git
      LFS, or host externally and reference by URL?

## Tasks

1. Pick a TTS provider. Candidates: ElevenLabs (best quality,
   paid), OpenAI TTS (mid quality, paid), Coqui XTTS (local,
   free). Document the call.
2. Build the generation script:
   `scripts/generate-audio.mjs <chapter>` reads the rendered
   chapter MDX, splits to sentences, calls the TTS provider,
   writes MP3 + JSON.
3. Decide storage: if MP3s commit, add `*.mp3` allowance to
   `.gitignore`; if LFS, set up `.gitattributes`; if external,
   build a manifest + downloader.
4. Implement `<AudioPlayer>` component. Use HTMLAudioElement
   directly (avoid heavy player libs). Sentence-highlight via
   CSS class swap on a `setInterval`-driven cursor.
5. Wire into chapter pages: the player renders at the top of
   each lecture (and conditionally at top of notes if useful).
6. Test the player in both modes: `static` (just read + listen)
   and `interactive` (M5 review queue can play the relevant
   sentence on a missed question — optional polish).

## Open decisions resolved here

- **TTS provider** (architecture.md §6).
- **Audio storage** (commit / LFS / external) — not in
  architecture.md §5 because it's M7-local.

## Out of scope

- **Real-time TTS.** All audio is pre-generated at build time.
  No streaming TTS.
- **Other languages.** English only.
- **Speaker selection / multi-voice.** One voice per chapter.
- **Auto-regeneration on content change.** Manual trigger via
  the script. Could automate in CI later but not load-bearing.
