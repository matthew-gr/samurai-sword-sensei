# 🥷 Samurai Sword Sensei 🗡️

A bright, playful, browser-based **speech-therapy game** for a five-year-old.
Say the target word with the right sound, and your balloon-sword stick figure
attacks with a big happy **CHA CHA CHA!** 💥

It targets the classic articulation contrasts:

| Sound | Cue            |
|-------|----------------|
| **SH** | quiet "SHHH"  |
| **CH** | choo-choo train "CH-CH-CH" |
| **S**  | hissing snake "SSSS" |
| **Z**  | buzzy bee "ZZZZ" |

So **SHIP** is accepted, but **CHIP / SIP / ZIP** are gently coached, never punished.

## How to play

1. Open `index.html` in a modern browser (Chrome/Edge work best for the
   microphone). It's a single self-contained file — no build, no install.
2. Tap **START** and allow microphone access.
3. Read the big word at the bottom out loud.
   - ✅ **Correct sound** → balloon sword attacks, confetti + stars, "Great job,
     Samurai Sword Sensei!", and the next word appears.
   - 🤫 **Silence** for a few seconds → a friendly picture clue pops up (the answer
     is never spoken aloud).
   - 💬 **Wrong sound** → gentle coaching that names what was heard and shows how to
     make the target sound. Unlimited retries.
4. Every **5 in a row** triggers a rainbow **LEVEL UP!** celebration. 🌈🏆

There is **no losing** — the child always wins and always feels encouraged.

## Features

- 🎤 **Web Speech API** continuous listening with SH / CH / S / Z onset detection.
- 🧠 Fuzzy matching for minor timing differences **only** — SH never matches CH, S, or Z.
- 🙆 Favors success: if *any* recognition alternative is correct, it counts.
- 🎨 Lightweight cartoon stick-figure art (inline SVG) + confetti/explosion animations.
- 🔊 Cute synthesized sounds (Web Audio) and an encouraging spoken voice (Speech Synthesis).
- 💾 Score, streak, and level saved locally (`localStorage`).
- 👆 Big touch-friendly text and buttons.

## Browser support

The microphone game uses the Web Speech API (`SpeechRecognition`), best supported
in **Chrome** and **Edge**. If speech recognition isn't available, the game falls
back to **tap-to-say** buttons so it still works everywhere — the same SH/CH/S/Z
logic and coaching apply.

## Word list

`SHIP IT · CHIP IT · SIP IT · ZIP IT · SHOP · CHOP · SOP · SHEEP · CHEAP · SEEP ·
SHOCK · CHOCK · SOCK · SHIN · CHIN · SIN · SHARE · CHAIR · SHIPS · CHIPS · SIPS ·
ZIPS · SHE SHIPS CHIPS · ZIP THE SHIP · CHEAP SHEEP · CHIP THE SHIP` (cycled randomly).
