# NY P&C Flashcards (Website)

A responsive website for New York Property & Casualty exam prep using original flashcards and adaptive scheduling.

## Website features
- Multi-page UX (React Router): Dashboard, Topic Setup, Score Input, Study, Card Browser, and Exam Mode.
- Definition and scenario MCQ cards with explanations and why wrong options are wrong.
- Adaptive study:
  - Simplified SM-2 style card scheduling (`interval`, `easeFactor`, `dueDate`, `reps`).
  - Weakness-weighted session assembly (60% weak, 30% mixed, 10% strong).
- Topic score input, attempted-question tracking, and score-report text parsing.
- Card browser with search/filter/edit/flag/regenerate/delete.
- Exam mode with timer and topic score breakdown on completion.
- Dashboard control to regenerate 20 cards for weakest topics.
- Local persistence with `localStorage`.
- Safety language: app states content is original and not official exam-bank content.

## Run locally
```bash
npm install
npm run dev
```

## Validation
```bash
npm run test:validate
```
Validation checks:
- each scenario has exactly 1 correct option
- each card has explanation text
- topic coverage/distribution sanity
- definition ratio close to configured settings

## Notes
- Initial bootstrap generates 160 cards (>=150 required) across NY P&C-oriented topics.
- Card generation is abstracted in `generateCards()` for future AI model integration.
