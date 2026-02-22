import { useState } from 'react';
import { useAppState } from '../lib/state';

export const ScoresPage = () => {
  const { state, addScore } = useAppState();
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), propertyPct: 70, casualtyPct: 70, overallPct: 70 });

  return (
    <section>
      <h1>Score History</h1>
      <div className="grid-form">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input type="number" value={form.propertyPct} onChange={(e) => setForm({ ...form, propertyPct: Number(e.target.value) })} placeholder="Property %" />
        <input type="number" value={form.casualtyPct} onChange={(e) => setForm({ ...form, casualtyPct: Number(e.target.value) })} placeholder="Casualty %" />
        <input type="number" value={form.overallPct} onChange={(e) => setForm({ ...form, overallPct: Number(e.target.value) })} placeholder="Overall %" />
        <button onClick={() => addScore(form)}>Add score</button>
      </div>
      <ul>{state.scoreHistory.map((s) => <li key={s.date + s.overallPct}>{s.date}: P {s.propertyPct}% | C {s.casualtyPct}% | O {s.overallPct}%</li>)}</ul>
    </section>
  );
};
