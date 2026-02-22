import { Link } from 'react-router-dom';
import { useAppState } from '../lib/state';

export const HomePage = () => {
  const { dueCards, state } = useAppState();
  const reviews = Object.values(state.reviews).flatMap((r) => r.history);
  const accuracy = reviews.length ? Math.round((reviews.filter((h) => h.wasCorrect).length / reviews.length) * 100) : 0;

  return (
    <section>
      <h1>Welcome back</h1>
      <div className="grid">
        <article><h3>Due Today</h3><p>{dueCards.length}</p></article>
        <article><h3>Daily Goal</h3><p>{state.settings.dailyGoal}</p></article>
        <article><h3>Overall Accuracy</h3><p>{accuracy}%</p></article>
      </div>
      <Link className="cta" to="/study">Start Study</Link>
    </section>
  );
};
