# NY P&C Flashcards

A mobile-first React + TypeScript + Vite app for studying New York Property & Casualty licensing with exam-style (non-official) multiple-choice flashcards.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Adaptive logic

- Generator only uses selected Study Topics (defaults to all topics when none selected).
- Definition vs Scenario card style is controlled by a ratio slider.
- Topic weighting increases for weaker topics, using:
  - lower self-reported section scores (Property/Casualty), and
  - lower in-app topic accuracy.
- Difficulty starts from user setting, then nudges up/down based on recent self-reported overall scores.
- Generator is deterministic when `seed` is provided.

## SRS scheduling

- Simplified SM-2 style scheduler is used.
- Rating choices: Again / Hard / Good / Easy.
- Incorrect answers are always treated as `Again` for scheduling.
- Review stores ease, interval, repetitions, next due date, and full answer history including time spent.

## Notes

- All cards are MCQ with exactly 4 options.
- Content is exam-style and original. It does not claim official or proprietary question bank usage.
- Data is stored in `localStorage` with schema version + migration-safe loader.
