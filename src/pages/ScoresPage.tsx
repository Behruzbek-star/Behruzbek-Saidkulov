import { useState } from 'react';
import type { FormEvent } from 'react';
import { useApp } from '../context/AppContext';

export function ScoresPage() {
  const { scores, addScore } = useApp();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [propertyPct, setPropertyPct] = useState(70);
  const [casualtyPct, setCasualtyPct] = useState(70);
  const [overallPct, setOverallPct] = useState(70);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    addScore({ date: new Date(date).toISOString(), propertyPct, casualtyPct, overallPct });
  };

  return (
    <section className="card">
      <h2>Score Inputs</h2>
      <form onSubmit={submit} className="grid-form">
        <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Property %<input type="number" min={0} max={100} value={propertyPct} onChange={(e) => setPropertyPct(Number(e.target.value))} /></label>
        <label>Casualty %<input type="number" min={0} max={100} value={casualtyPct} onChange={(e) => setCasualtyPct(Number(e.target.value))} /></label>
        <label>Overall %<input type="number" min={0} max={100} value={overallPct} onChange={(e) => setOverallPct(Number(e.target.value))} /></label>
        <button className="btn" type="submit">Add Score</button>
      </form>
      <h3>History</h3>
      <ul>
        {[...scores].sort((a, b) => b.date.localeCompare(a.date)).map((s) => (
          <li key={s.id}>{new Date(s.date).toLocaleDateString()} — Property {s.propertyPct}% | Casualty {s.casualtyPct}% | Overall {s.overallPct}%</li>
        ))}
      </ul>
    </section>
  );
}
