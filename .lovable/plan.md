# Obfuscation Overhaul — Phased Plan

You picked all 4 phases. I'll build them, but I'm being upfront: Phases 3 and 4 are weeks of work and historically the #1 cause of executor breakage. I'll ship them in order, verify each phase works on real scripts, then move on. **This plan covers Phase 1 as a shippable deliverable now**, with Phases 2–4 scoped as follow-ups.

## Phase 1 — Ship now (this turn)

**Layers built into `supabase/functions/serve-raw-script/index.ts` as a new pass `applyObfuscation(source, preset)`:**

1. **String encryption** — tokenize `"..."`, `'...'`, and `[[...]]` outside comments; XOR each with a per-script key; emit `_S(idx)` calls backed by a decrypt table at the top of the payload.
2. **Number obfuscation** — replace integer literals `>= 2` with `(a op b)` where `op` ∈ {+, -, *} and result matches exactly. Skip floats, hex, and numbers inside string keys.
3. **Junk code injection** — insert no-op `local _jN = <expr>` lines between statements at configurable density.
4. **Anti-debug toggles** — extend existing preamble with checks for `getgc`, `getrenv`, `getsenv`, `debug.getinfo` on `loadstring`. On detection: fold into decryption entropy (silent garble) rather than kick, so we don't repeat the freeze bug.

**Presets:**

| Preset  | Strings | Numbers | Junk | Anti-debug |
| ------- | ------- | ------- | ---- | ---------- |
| Light   | ✓       | ✗       | 0%   | ✓          |
| Medium  | ✓       | ✓       | 10%  | ✓          |
| Heavy   | ✓       | ✓       | 25%  | ✓          |
| Insane  | ✓       | ✓       | 40%  | ✓ (+ Phase 2/3/4 as they land) |

**Gating:** Insane preset locked to Pro/Enterprise. Free/Pro/Enterprise all get Light/Medium/Heavy.

**Schema:** Add `obfuscation_preset text not null default 'medium'` to `scripts`. Migration includes CHECK on allowed values.

**UI:** Add a preset dropdown in `OwnerPanel.tsx` next to the existing `cli_protection_mode` selector. Show a lock icon + upsell on Insane for free users. No stats preview in Phase 1 (adds surface area for little value; can add in Phase 2 if you want it).

**Verification:** After deploy, run the existing Stage 1 → Stage 2 flow end-to-end with a small script (`print("hello")`) and a mid-size script to confirm nothing regresses.

## Phase 2 — Variable renaming (next turn)

Requires a real Lua scope analyzer. I'll pull in a tested tokenizer (or hand-roll one — Lua's grammar is small). Scope: rename `local` declarations and their references only. **Will not rename globals, table keys, or method calls** — doing so without full type info breaks scripts. This is the honest limit.

## Phase 3 — Control-flow flattening (follow-up)

Only viable on straight-line functions. I'll build it as an *opt-in* sub-option under Insane, off by default, with a warning that it may break complex scripts. Historically this is what breaks large scripts on Matcha/Solara.

## Phase 4 — Custom VM (long horizon)

Real VM = weeks of work, 5–20x runtime cost, ongoing maintenance as executors change. My honest recommendation is to defer this and see if Phases 1–3 push attackers off. If you still want it after, I'll scope it as its own multi-turn build (bytecode walker, opcode table, dispatcher, encrypted opcode stream). **I will not fake-ship a "VM" that's just a renamed XOR loop** — that's what other AI panels do and it's how you end up with dumped source again.

## Files touched this turn

- `supabase/functions/serve-raw-script/index.ts` — add `applyObfuscation()` pass, wire preset into payload build.
- Migration: `scripts.obfuscation_preset` column + CHECK.
- `src/components/OwnerPanel.tsx` — preset dropdown, Pro gate on Insane.
- `src/integrations/supabase/types.ts` — regenerated automatically.

## Not in scope this turn

Variable renaming, control-flow flattening, custom VM, self-modifying chunk streaming (we already stream via `load(reader)` → assembled `loadstring`; deeper chunking risks re-breaking large scripts), stats preview, dead-code removal (Lua is dynamic — safe DCE requires full analysis; low ROI).

Approve and I'll implement Phase 1.
