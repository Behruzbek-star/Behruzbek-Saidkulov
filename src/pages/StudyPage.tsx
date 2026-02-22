import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Grade } from '../types';

const grades: Grade[] = ['Again', 'Hard', 'Good', 'Easy'];

export function StudyPage() {
  const { dueToday, ensureDueQueue, gradeCard } = useApp();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [mcqChoice, setMcqChoice] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');

  useEffect(() => {
    ensureDueQueue();
  }, [ensureDueQueue]);

  const card = useMemo(() => dueToday[index], [dueToday, index]);

  if (!card) return <section className="card"><h2>All caught up 🎉</h2><p>No cards due right now.</p></section>;

  const mark = (grade: Grade) => {
    const normalized = card.answer.trim().toLowerCase();
    const userAns = card.type === 'scenario_short' ? typedAnswer.trim().toLowerCase() : mcqChoice.trim().toLowerCase();
    const wasCorrect = revealed ? (card.type === 'scenario_short' ? normalized.includes(userAns) || userAns.includes(normalized) : !mcqChoice || userAns === normalized) : false;
    gradeCard(card.id, grade, wasCorrect, Date.now() - startedAt);
    setIndex((i) => i + 1);
    setRevealed(false);
    setMcqChoice('');
    setTypedAnswer('');
    setStartedAt(Date.now());
  };

  return (
    <section className="card">
      <p className="chip">{card.topic} • {card.difficulty} • {card.section}</p>
      <h2>{card.prompt}</h2>
      {card.options && (
        <div className="options">
          {card.options.map((opt) => (
            <label key={opt} className="option">
              <input type="radio" checked={mcqChoice === opt} onChange={() => setMcqChoice(opt)} /> {opt}
            </label>
          ))}
        </div>
      )}
      {card.type === 'scenario_short' && (
        <textarea placeholder="Type your answer" value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} />
      )}

      {!revealed ? (
        <button className="btn" onClick={() => setRevealed(true)}>Reveal Answer</button>
      ) : (
        <>
          <p><strong>Answer:</strong> {card.answer}</p>
          <p><strong>Why:</strong> {card.explanation}</p>
          <div className="row">
            {grades.map((g) => <button key={g} className="btn ghost" onClick={() => mark(g)}>{g}</button>)}
          </div>
        </>
      )}
    </section>
  );
}
