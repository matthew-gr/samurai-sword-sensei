# Samurai Sword Sensei — Functional Requirements Document

**Version:** 1.0 (reflects the build as of this writing)
**Owner:** matthew@growrwanda.com
**Status:** Living document — intended to hand to a designer to refine and extend.

---

## 1. Overview

**Samurai Sword Sensei** is a browser-based speech‑therapy game for a young child
(≈5 years old) practicing four articulation targets: the **SH**, **CH**, **S**, and
**Z** sounds at the start of words. The child says a target word out loud; if she
produces the right sound, her stick‑figure samurai strikes and pushes the opponent
back. Winning enough rounds pushes the opponent off the screen and unlocks a prize
(a trophy or a fair‑food treat) that she collects as a sticker.

The experience is deliberately **bright, playful, non‑scary, and never punishing** —
there is no real "lose" state; the child always eventually wins.

### 1.1 Purpose of this document
Describe the current functionality precisely enough that a designer can (a) understand
what exists, (b) redesign/polish the visuals and UX, and (c) scope new features without
breaking the speech‑recognition or sound‑matching logic.

### 1.2 Primary goals
- Make articulation practice **fun and motivating** through a battle + reward loop.
- Give **clear, immediate, encouraging feedback** on what sound the child produced.
- Be **forgiving and patient** — reward effort, avoid nagging.

### 1.3 Non‑goals
- Not a diagnostic/clinical tool; scores are motivational, not medical.
- Not multi‑user/accounts; it's a single‑child local experience.
- Not a content authoring tool (word lists are defined in code today).

---

## 2. Users & context

| | |
|---|---|
| **Primary user** | A ~5‑year‑old practicing SH/CH/S/Z. |
| **Secondary user** | A present adult (parent/therapist) who may talk with the child during play. |
| **Devices** | Modern browser (Chrome desktop, tablets). Microphone required for voice play. |
| **Environment** | Played with an adult nearby; the child may chat or ask questions mid‑game. |

---

## 3. System architecture (current)

- **Single self‑contained file:** `index.html` contains all HTML, CSS, and JavaScript
  inline. No build step. Open in a browser to run.
- **Optional cloud upgrade:** when deployed to **Vercel** with an Azure Speech resource,
  the game upgrades to **Azure Pronunciation Assessment** for per‑sound scoring.
  - `api/azure-token.js` — serverless function that mints a short‑lived Azure token so
    the secret key never reaches the browser.
  - Environment variables: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` (e.g. `eastus`).
- **Graceful degradation:** if the Azure SDK or token endpoint is unavailable (or the
  file is opened locally), the game automatically falls back to the browser's **Web
  Speech API**. If neither is available, on‑screen **practice buttons** appear.

---

## 4. Functional requirements

> IDs are grouped by area (FR‑START, FR‑LOOP, …) for easy reference.

### 4.1 Onboarding / Start

- **FR‑START‑1** Show a START overlay with the title, a one‑line explanation, and a
  big START button.
- **FR‑START‑2** On START: request microphone access, unlock audio/text‑to‑speech, and
  begin the first round after a short beat.
- **FR‑START‑3** Choose the speech engine at start: Azure (if a token is available),
  else Web Speech, else practice‑button mode.

### 4.2 Core round loop

- **FR‑LOOP‑1** Each round presents one **target word/phrase** (large text) plus a
  **picture clue** (emoji) and, when applicable, the **minimal‑pair cards** (§4.6).
- **FR‑LOOP‑2** The game listens for the child to say the target.
- **FR‑LOOP‑3** A **correct** attempt → the player wins the round (§4.4).
- **FR‑LOOP‑4** A **wrong‑sound** attempt (right word shape, wrong onset, e.g. "sip"
  for "ship") → the opponent counter‑attacks and the coach gives a short tip (§4.5).
- **FR‑LOOP‑5** **Free talk / questions / noise** that isn't an attempt at the target
  is **ignored** (no score, no penalty, no interruption).
- **FR‑LOOP‑6** Words are drawn at random with no immediate repeat of the prior word.

### 4.3 Speech recognition & sound matching

- **FR‑SPEECH‑1 (target extraction)** The child does **not** have to say the word in
  isolation. The target is extracted from longer phrases ("I think it's ship",
  "zip it please").
- **FR‑SPEECH‑2 (best guess, not target‑biased)** Recognition uses the engine's **best
  guess of what she actually said** — it must not assume the target just because the
  target appears somewhere in the recognizer's alternatives.
- **FR‑SPEECH‑3 (sound discrimination)** Judgment is on the **articulation target**,
  not exact wording. Only the onset sound matters: for "SHIP", accept SH‑onset; treat
  "chip/sip/zip" as wrong‑sound (coachable).
- **FR‑SPEECH‑4 (benefit of the doubt)** If the recognizer drops/garbles the leading
  sound but the rest of the word matches, count it as the target (favor success).
- **FR‑SPEECH‑5 (Azure scoring, when enabled)** Use Azure **unscripted** Pronunciation
  Assessment to (a) report the word she actually said and (b) return a **0–100 accuracy
  score** for the target sound. Win threshold is **70** (tunable). The score drives the
  closeness bar (§4.6).
- **FR‑SPEECH‑6 (fallback)** With Web Speech (no Azure), a correct best‑guess wins; the
  closeness bar simply snaps to full on a win (no graduated score available).

### 4.4 Winning a round (player strikes)

- **FR‑WIN‑1** Player advances toward the clash line and performs a **visible forehand
  sword swing toward the opponent** (never back across her own body).
- **FR‑WIN‑2** On the downswing **contact**: impact burst + comic words
  ("POW!"/"BAM!"/"WHACK!"), a battle call‑out ("CHA CHA CHA CHA!"), success sound, and
  the opponent **stumbles back and wobbles**.
- **FR‑WIN‑3** The struck fighter's face changes from a **smile to a frown** briefly
  (~1.2s) then returns.
- **FR‑WIN‑4** The player **gains ground** (the meeting point moves toward the
  opponent's side). Progress persists between rounds.
- **FR‑WIN‑5** A celebration plays (confetti + stars) and, after a short pause so it's
  enjoyable, the next round loads.

### 4.5 Wrong sound (opponent counter‑attacks)

- **FR‑LOSS‑1** Opponent steps in and swings ("PA PA PA PA!"); the player takes a small
  step back and gives a little ground. **Nobody cries or "loses."**
- **FR‑LOSS‑2** A friendly **coach bubble** explains the target sound with a kid cue
  (e.g. "finger on your lips: SHHH … then say SHIP!").
- **FR‑LOSS‑3** Unlimited retries on the same word; no score penalty beyond losing a
  little ground.

### 4.6 Minimal‑pair cards + closeness bar + "you said this"

- **FR‑CARD‑1** For single‑word targets that belong to a minimal‑pair family, show a row
  of cards — one per real variant — each with a **picture + the word in letters**
  (e.g. SHIP / CHIP / SIP / ZIP). Some families have 3 variants (no Z), some 4.
- **FR‑CARD‑2** The **target card** carries a **closeness bar** that fills with the
  target‑sound score and ramps **red → yellow → green**; green (≥ threshold) = win.
- **FR‑CARD‑3 (reinforcement)** After each attempt, **highlight the card she sounded
  most like** and keep it highlighted until her next attempt:
  - matched the target → green ring + "⭐ you said this!"
  - a sibling → orange ring + "👂 you said this".
- **FR‑CARD‑4** Multi‑word phrase targets do not show cards (scoring still applies).

### 4.7 Battle / territory model (tug‑of‑war)

- **FR‑BATTLE‑1** Two stick‑figure fighters stand **close together near the center**,
  with a moving **front line** between them and a fixed **finish line** (🏁) on the
  opponent's side.
- **FR‑BATTLE‑2** Each correct answer nudges the pair toward the opponent; each wrong
  sound nudges them back. Movement is **gradual** (tug‑of‑war feel), not dramatic.
- **FR‑BATTLE‑3** When the opponent is pushed **behind the finish line**, it **topples
  over in a silly, harmless way** (dizzy stars) and the prize screen appears.
- **FR‑BATTLE‑4** A new "level" then restarts the tug‑of‑war near even. Roughly ~6
  correct answers complete a level (tunable).

### 4.8 Prize screen (trophies + fair foods)

- **FR‑PRIZE‑1** On a battle win, show a celebratory **"PICK YOUR PRIZE!"** screen with
  **three randomly chosen options**, mixing:
  - **Trophies:** Rainbow, Princess, Dragon, Kitten, Heart, Star (shown with a 🏆).
  - **Fair foods:** Cupcake, Cotton Candy, Cake, Ice Cream, Lollipop, Donut, Popcorn,
    Pretzel.
- **FR‑PRIZE‑2** The child taps one option. **Exactly one sticker is awarded — only the
  one she chose** (no surprise extras).
- **FR‑PRIZE‑3** The "KEEP GOING!" continue button is **hidden until she picks**.
- **FR‑PRIZE‑4** Generous, lingering celebration on this screen (confetti/stars/fanfare).

### 4.9 Sticker collection

- **FR‑STICK‑1** A **persistent sticker rail** is always visible on the side of the
  screen ("MY STICKERS").
- **FR‑STICK‑2** New stickers animate in and the collection **grows over time**, so the
  child feels she is building her own collection.
- **FR‑STICK‑3** A small **reset control** (with confirmation) clears the collection
  back to zero — intended for the adult, "when it's time."

### 4.10 Scoreboard & progress

- **FR‑SCORE‑1** Header chips show **Score (⭐)**, **Streak (🔥)**, and **Level (🏆)**.
- **FR‑SCORE‑2** Streak increments on correct, resets on a wrong sound; best streak is
  tracked.
- **FR‑SCORE‑3** All progress **persists locally** between sessions (see §6).

### 4.11 Patience / encouragement

- **FR‑PATIENCE‑1** Default behavior is **silent listening** — no prompting on every
  pause or noise.
- **FR‑PATIENCE‑2** Offer a gentle spoken nudge ("Take your time", "You can do it",
  "Listen carefully and try again") **only when all are true**: >10s elapsed, ≥1 real
  attempt made, and that attempt was reasonably close to the target.
- **FR‑PATIENCE‑3** Never repeat encouragement more than **once per 15s**.
- **FR‑PATIENCE‑4** A picture clue may appear alongside encouragement.

### 4.12 Audio & voice

- **FR‑AUDIO‑1** Spoken praise/coaching via text‑to‑speech (friendly, higher pitch).
- **FR‑AUDIO‑2** Cute WebAudio sound effects: success chime, soft thud, level fanfare.
- **FR‑AUDIO‑3** TTS must **never name/say the answer** during the silent‑wait nudges.

### 4.13 No‑microphone fallback

- **FR‑NOMIC‑1** If no speech engine is available, show **tappable practice buttons**
  (the target word + sound‑swapped confusables) that drive the same win/coach logic.

---

## 5. Visual / asset inventory (current)

- **Fighters (inline SVG stick figures):**
  - *Player* — girl with pigtails + bow, pink dress; holds a **steel katana** (gold
    guard, brown grip) gripped at the bottom, blade raised; a sheath on her back.
  - *Opponent* — green‑faced figure with headband, blue body; **steel katana** (purple
    guard, blue grip); sheath on its back.
  - Faces switch smile ↔ frown when struck.
- **Stage:** sky/ground arena with front line (dotted), finish line (dashed + 🏁).
- **FX:** confetti (spread across the top, falls down), emoji stars/sparkles, expanding
  impact "boom", comic words (POW/BAM/WHACK), battle call‑outs.
- **Emoji clues / cards / prizes / stickers** as listed in §4.

### 5.1 Word list & minimal‑pair families (current content)
Single words grouped into families (each shows the variants that are real words):
`SHIP/CHIP/SIP/ZIP`, `SHOP/CHOP/SOP`, `SHEEP/CHEAP/SEEP`, `SHOCK/CHOCK/SOCK`,
`SHIN/CHIN/SIN`, `SHARE/CHAIR`, `SHIPS/CHIPS/SIPS/ZIPS`. Plus multi‑word phrases:
`SHE SHIPS CHIPS`, `ZIP THE SHIP`, `CHEAP SHEEP`, `CHIP THE SHIP`.

---

## 6. Data & persistence

Stored in `localStorage` under key **`sss_progress_v1`**:

| Field | Type | Meaning |
|---|---|---|
| `score` | number | Total correct answers. |
| `streak` | number | Current correct‑in‑a‑row. |
| `best` | number | Best streak achieved. |
| `level` | number | Levels (battles) won. |
| `pushback` | number (0–100) | Tug‑of‑war progress in the current level. |
| `stickers` | string[] | Collected sticker emoji, in order earned. |

---

## 7. Configuration / tuning knobs (in code today)

| Name | Default | Effect |
|---|---|---|
| `WIN_THRESHOLD` | 70 | Min Azure sound‑accuracy (0–100) to win a round. |
| `START_PUSH` | 20 | Tug‑of‑war starting position each level. |
| `WIN_STEP` | 14 | Ground gained per correct answer. |
| `LOSE_STEP` | 8 | Ground lost per wrong sound. |
| `GOAL` | 100 | Opponent is behind the finish line at this point. |
| Patience timing | 10s / 15s | Min wait before, and min gap between, nudges. |

---

## 8. Non‑functional requirements

- **NFR‑1 (tone)** Always bright, playful, encouraging; never scary or punishing.
- **NFR‑2 (responsiveness)** Feedback should feel immediate; celebrations last ~a couple
  of seconds (visible but not boring).
- **NFR‑3 (offline‑capable core)** The game runs from a single file without a backend
  (Web Speech / practice‑button modes).
- **NFR‑4 (privacy)** With Azure enabled, the child's audio is streamed to Azure for
  scoring; the API key is never exposed to the browser. This is a deliberate choice for
  the adult to make.
- **NFR‑5 (devices)** Works on desktop Chrome and tablets; layout adapts; large tap
  targets for small hands.

---

## 9. Known limitations / current gaps

1. **Word list lives in code** — no UI to add/edit words or pictures.
2. **Minimal‑pair cards only for single‑word families** — multi‑word phrases show no
   cards and can be harder to complete.
3. **"Which sibling" vs "how good" can disagree** — the highlighted card comes from the
   recognizer's best guess of the *word*; the bar comes from the *phoneme* score. Usually
   aligned, occasionally not.
4. **Speech accuracy depends on the engine** — Web Speech quality varies by browser and
   struggles with child speech; Azure is better but needs setup, network, and incurs
   small per‑use cost.
5. **External dependency** — Azure mode loads the Speech SDK from a CDN, so the app is no
   longer a single offline file when Azure is in use.
6. **Single child, single device** — no profiles, no progress sync.

---

## 10. Opportunities for the designer to build out

These are directions, not commitments — areas where design input would add the most value:

- **Visual refresh / art direction** for the fighters, arena, cards, prize screen, and
  sticker board (current art is simple inline SVG/emoji).
- **Sticker board as a destination** — a richer "my collection" view, themed boards,
  milestones, decorating.
- **Progress & motivation** — a visible "road to the trophy" map, daily streaks, gentle
  goals.
- **Content scaling** — more sound families and word sets; difficulty levels; a way for
  an adult to choose which sounds to focus on.
- **Per‑sound feedback UI** — richer use of the phoneme score (e.g. "your SH was strong!"
  meters, before/after).
- **Sessions for the adult** — a simple summary screen (what was practiced, how it went).
- **Accessibility** — left/right‑handed, color‑blind‑safe states, larger text mode,
  captioning of spoken praise.
- **Onboarding** — a short "how to play" with a practice round and mic check.

---

## 11. Glossary

- **Onset** — the first consonant sound of a word (SH/CH/S/Z here).
- **Minimal pair** — words differing by a single sound (ship/chip/sip/zip).
- **Pronunciation Assessment** — Azure feature scoring how accurately a sound/word was
  produced, including per‑phoneme scores.
- **Tug‑of‑war / pushback** — the territory model tracking who is winning the battle.
