import { useMemo, useState } from 'react';
import { FlipCard } from '../components/FlipCard';
import { useAppState } from '../lib/state';

export const StudyPage = () => {
  const { dueCards, state, generateNewCards, recordReview } = useAppState();
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(Date.now());

  const card = dueCards[cursor];
  const reviews = Object.values(state.reviews).flatMap((r) => r.history);
  const streak = useMemo(() => {
    let count = 0;
    for (let i = reviews.length - 1; i >= 0; i -= 1) {
      if (!reviews[i].wasCorrect) break;
      count += 1;
    }
    return count;
  }, [reviews]);
  const accuracy = reviews.length ? Math.round((reviews.filter((h) => h.wasCorrect).length / reviews.length) * 100) : 0;
  const timeSpent = reviews.reduce((sum, h) => sum + h.timeSpentMs, 0);

  if (!card) {
    return (
      <section>
        <h1>Study Session</h1>
        <p>No due cards right now.</p>
        <button onClick={() => generateNewCards(state.settings.newCardsBatchSize)}>Generate {state.settings.newCardsBatchSize} new cards</button>
      </section>
    );
  }

  return (
    <section>
      <h1>Study Session</h1>
      <p>Streak: {streak} • Accuracy: {accuracy}% • Time spent: {Math.round(timeSpent / 1000)}s</p>
      <FlipCard
        card={card}
        selected={selected}
        reveal={selected !== null}
        onSelect={(idx) => setSelected(idx)}
        onRate={(rating) => {
          if (selected === null) return;
          recordReview(card.id, selected, rating, Date.now() - start);
          setCursor((c) => c + 1);
          setSelected(null);
          setStart(Date.now());
        }}
      />
    </section>
  );
};
