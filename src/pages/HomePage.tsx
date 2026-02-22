import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function HomePage() {
  const { dueToday, ensureDueQueue, sessions, settings } = useApp();

  useEffect(() => {
    ensureDueQueue();
  }, [ensureDueQueue]);

  const today = new Date().toISOString().slice(0, 10);
  const todaySession = sessions.find((s) => s.date === today);
  const accuracy = todaySession ? Math.round((todaySession.correct / Math.max(1, todaySession.cardsStudied)) * 100) : 0;

  return (
    <section className="card">
      <h2>Ready to study</h2>
      <p>Due today: <strong>{dueToday.length}</strong> cards</p>
      <p>Daily goal: <strong>{settings.dailyGoal}</strong></p>
      <p>Today's accuracy: <strong>{accuracy}%</strong></p>
      <div className="row">
        <Link className="btn" to="/study">Start Study Session</Link>
        <Link className="btn ghost" to="/dashboard">View Analytics</Link>
      </div>
    </section>
  );
}
