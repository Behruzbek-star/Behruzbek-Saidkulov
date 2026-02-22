import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppState } from '../lib/state';
import { STUDY_TOPICS } from '../lib/types';

export const DashboardPage = () => {
  const { state, topicStats } = useAppState();
  const byTopic = STUDY_TOPICS.map((topic) => {
    const s = topicStats[topic];
    return { topic: topic.slice(0, 12), accuracy: s?.total ? Math.round((s.correct / s.total) * 100) : 0 };
  });

  const dailyMap = new Map<string, number>();
  Object.values(state.reviews).forEach((review) => {
    review.history.forEach((h) => {
      const d = h.timestamp.slice(0, 10);
      dailyMap.set(d, (dailyMap.get(d) ?? 0) + 1);
    });
  });
  const perDay = [...dailyMap.entries()].slice(-7).map(([date, count]) => ({ date, count }));
  const weakest = [...byTopic].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const recentScore = state.scoreHistory.at(-1)?.overallPct ?? 70;
  const appAcc = byTopic.reduce((s, t) => s + t.accuracy, 0) / byTopic.length;
  const readiness = Math.round(recentScore * 0.45 + appAcc * 0.55);

  return (
    <section>
      <h1>Dashboard</h1>
      <h3>Accuracy by topic</h3>
      <ResponsiveContainer width="100%" height={220}><BarChart data={byTopic}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="topic" /><YAxis /><Tooltip /><Bar dataKey="accuracy" /></BarChart></ResponsiveContainer>
      <h3>Cards studied (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={220}><BarChart data={perDay}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="count" /></BarChart></ResponsiveContainer>
      <h3>Weakest topics</h3>
      <ul>{weakest.map((w) => <li key={w.topic}>{w.topic}: {w.accuracy}% — recommended focus</li>)}</ul>
      <p><strong>Readiness estimate:</strong> {readiness}% (estimate based only on app performance and self-reported scores).</p>
    </section>
  );
};
