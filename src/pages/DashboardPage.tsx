import { useMemo } from 'react';
import { useApp, useCardTopicMap } from '../context/AppContext';
import { TOPICS } from '../constants';
import { recommendedTopics, topicAccuracy } from '../services/adaptive';

export function DashboardPage() {
  const { reviews, sessions, settings, scores } = useApp();
  const cardTopicMap = useCardTopicMap();

  const topicStats = useMemo(() => TOPICS.map((topic) => ({ topic, acc: topicAccuracy(topic, cardTopicMap, reviews) })), [cardTopicMap, reviews]);
  const weak = [...topicStats].sort((a, b) => a.acc - b.acc).slice(0, 4);
  const rec = recommendedTopics(settings, cardTopicMap, reviews);

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const session = sessions.find((s) => s.date === d);
    return { date: d.slice(5), cards: session?.cardsStudied ?? 0 };
  });

  const appAcc = (() => {
    const hist = Object.values(reviews).flatMap((r) => r.history);
    if (!hist.length) return 0.65;
    return hist.filter((h) => h.wasCorrect).length / hist.length;
  })();
  const latestScore = [...scores].sort((a, b) => b.date.localeCompare(a.date))[0]?.overallPct ?? 65;
  const readiness = Math.round(appAcc * 60 + latestScore * 0.4);

  return (
    <section className="card">
      <h2>Analytics Dashboard</h2>
      <h3>Accuracy by topic</h3>
      <ul>{topicStats.map((t) => <li key={t.topic}>{t.topic}: {Math.round(t.acc * 100)}%</li>)}</ul>

      <h3>Cards studied per day (last 7 days)</h3>
      <ul>{last7.map((d) => <li key={d.date}>{d.date}: {d.cards}</li>)}</ul>

      <h3>Weakest topics</h3>
      <ul>{weak.map((w) => <li key={w.topic}>{w.topic} ({Math.round(w.acc * 100)}%)</li>)}</ul>

      <h3>Recommended focus</h3>
      <p>{rec.map((r) => r.topic).join(', ') || 'Keep broad review.'}</p>

      <h3>Readiness estimate</h3>
      <p><strong>{readiness}%</strong> (estimate based only on your in-app performance and self-reported scores).</p>
    </section>
  );
}
