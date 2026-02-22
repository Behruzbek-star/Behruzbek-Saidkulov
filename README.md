# NY P&C Flashcards

A mobile-first React + TypeScript study app for **New York Property & Casualty** exam prep.

> This app uses **original, generated practice questions** and does **not** claim access to official exam or proprietary question banks.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Implemented routes

- `/` Home (due today + quick stats)
- `/study` Flashcard study flow
- `/settings` Exam mode, topic focus, study split, goal, seed
- `/scores` Score entry + score history
- `/dashboard` Analytics + readiness estimate

## Adaptive logic summary

The generator adapts card selection and difficulty using two data streams:

1. **Self-reported scores** (`/scores`)
   - Lower Property % raises Property section weight.
   - Lower Casualty % raises Casualty section weight.
2. **In-app performance** (`/study` reviews)
   - Topic accuracy is tracked from review history.
   - Topics with lower recent accuracy are selected more often.
   - If recent overall accuracy is high, the generator can raise difficulty and insert trickier MCQ distractors.

### Spaced repetition

A simplified SM-2 style scheduler is used:
- Grade each card: Again / Hard / Good / Easy
- Interval and ease factor update after each review
- Next due date is set automatically
- Due cards populate the daily queue on Home/Study

## Data model

- `Card`: `id, type, prompt, options?, answer, explanation, topic, difficulty, createdAt`
- `Review`: `cardId, lastReviewedAt, nextDueAt, ease, interval, repetitions, history[]`
- `ScoreEntry`: `date, propertyPct, casualtyPct, overallPct`

All data persists to `localStorage` (single key `ny-pc-flashcards-v1`), with code structured in services/context so a backend can be added later.
