import { useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { defaultTopics } from './data/topics';
import { generateCards } from './lib/generator';
import { bootstrapData, defaultSettings, keyMap, load, save } from './lib/storage';
import { computeReadiness, topicPriority, updateSrs } from './lib/srs';
import { Card, SessionResult, StudySession, Topic, UserSettings } from './types';

bootstrapData();

export default function App() {
  const [topics, setTopics] = useState<Topic[]>(() => load<Topic[]>(keyMap.topics) ?? defaultTopics);
  const [cards, setCards] = useState<Card[]>(() => load<Card[]>(keyMap.cards) ?? []);
  const [sessions, setSessions] = useState<StudySession[]>(() => load<StudySession[]>(keyMap.sessions) ?? []);
  const [settings, setSettings] = useState<UserSettings>(() => load<UserSettings>(keyMap.settings) ?? defaultSettings);
  const [queue, setQueue] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [choice, setChoice] = useState('');
  const [timer, setTimer] = useState(0);

  const readiness = useMemo(() => computeReadiness(topics, cards), [topics, cards]);
  const topicRanked = [...topics].sort((a, b) => topicPriority(b) - topicPriority(a));

  const persist = (t = topics, c = cards, s = sessions, u = settings) => {
    save(keyMap.topics, t);
    save(keyMap.cards, c);
    save(keyMap.sessions, s);
    save(keyMap.settings, u);
  };

  const startStudy = (examMode = false) => {
    const sorted = [...topics].sort((a, b) => topicPriority(b) - topicPriority(a));
    const weak = sorted.slice(0, Math.ceil(sorted.length * 0.4)).map((t) => t.id);
    const strong = sorted.slice(-Math.max(1, Math.ceil(sorted.length * 0.2))).map((t) => t.id);
    const due = cards.filter((c) => new Date(c.srs.dueDate) <= new Date() && (!examMode || c.type === 'scenario'));
    const pick = (ids: string[], n: number) => due.filter((c) => ids.includes(c.topicId)).slice(0, n);
    const n = settings.sessionLength;
    let deck = [
      ...pick(weak, Math.round(n * 0.6)),
      ...pick(topics.map((t) => t.id), Math.round(n * 0.3)),
      ...pick(strong, Math.round(n * 0.1))
    ];
    if (deck.length < n) {
      const generated = generateCards(topics, n - deck.length, settings, weak);
      const nextCards = [...cards, ...generated];
      setCards(nextCards);
      deck = [...deck, ...generated];
      persist(topics, nextCards, sessions, settings);
    }
    setQueue(deck.slice(0, n));
    setIndex(0);
    setReveal(false);
    setChoice('');
    if (examMode) {
      let seconds = n * 45;
      setTimer(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setTimer(seconds);
        if (seconds <= 0) clearInterval(interval);
      }, 1000);
    }
  };

  const answer = (rating: SessionResult['rating'], examMode = false) => {
    const current = queue[index];
    if (!current) return;
    const updated = updateSrs(current, rating);
    const nextCards = cards.map((c) => (c.id === current.id ? updated : c));
    const last = sessions[sessions.length - 1];
    const session = !last || last.cardIds[0] !== queue[0]?.id
      ? { id: uuidv4(), date: new Date().toISOString(), cardIds: queue.map((c) => c.id), results: [], examMode }
      : last;
    session.results.push({ cardId: current.id, rating, timestamp: new Date().toISOString() });
    const nextSessions = !last || last.cardIds[0] !== queue[0]?.id ? [...sessions, session] : [...sessions.slice(0, -1), session];
    setCards(nextCards);
    setSessions(nextSessions);
    persist(topics, nextCards, nextSessions, settings);
    setReveal(false);
    setChoice('');
    setIndex((i) => i + 1);
  };

  const regenerateWeak = () => {
    const ids = topicRanked.slice(0, 3).map((t) => t.id);
    const generated = generateCards(topics, 20, settings, ids);
    const next = [...cards, ...generated];
    setCards(next);
    persist(topics, next, sessions, settings);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <header className="mb-4 rounded-xl bg-white p-3 shadow">
          <h1 className="text-2xl font-bold">NY P&C Flashcards</h1>
          <p className="text-sm text-slate-600">Original exam-style study content only. No official or live exam bank access is claimed.</p>
          <nav className="mt-3 flex flex-wrap gap-2">
            {[
              ['/', 'Dashboard'],
              ['/topics', 'Topic Setup'],
              ['/scores', 'Score Input'],
              ['/study', 'Study'],
              ['/browser', 'Card Browser'],
              ['/exam', 'Exam Mode']
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `rounded px-3 py-1 text-sm ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{label}</NavLink>
            ))}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard topics={topics} cards={cards} readiness={readiness} settings={settings} setSettings={(u) => { setSettings(u); persist(topics, cards, sessions, u); }} startStudy={startStudy} regenerateWeak={regenerateWeak} />} />
          <Route path="/topics" element={<TopicsPage topics={topics} setTopics={(t) => { setTopics(t); persist(t, cards, sessions, settings); }} />} />
          <Route path="/scores" element={<ScoresPage topics={topics} setTopics={(t) => { setTopics(t); persist(t, cards, sessions, settings); }} settings={settings} setSettings={(u) => { setSettings(u); persist(topics, cards, sessions, u); }} />} />
          <Route path="/study" element={<StudyPage queue={queue} index={index} reveal={reveal} setReveal={setReveal} choice={choice} setChoice={setChoice} onRate={(r) => answer(r, false)} examMode={false} />} />
          <Route path="/exam" element={<StudyPage queue={queue.filter((c) => c.type === 'scenario')} index={index} reveal={reveal} setReveal={setReveal} choice={choice} setChoice={setChoice} onRate={(r) => answer(r, true)} examMode timer={timer} cards={cards} topics={topics} sessions={sessions} />} />
          <Route path="/browser" element={<BrowserPage cards={cards} topics={topics} settings={settings} onUpdate={(next) => { setCards(next); persist(topics, next, sessions, settings); }} />} />
        </Routes>
      </div>
    </div>
  );
}

function Dashboard({ topics, cards, readiness, settings, setSettings, startStudy, regenerateWeak }: { topics: Topic[]; cards: Card[]; readiness: number; settings: UserSettings; setSettings: (u: UserSettings) => void; startStudy: (examMode?: boolean) => void; regenerateWeak: () => void; }) {
  const weak = [...topics].sort((a, b) => a.score - b.score);
  return <section className="rounded-xl bg-white p-4 shadow">
    <div className="grid gap-3 md:grid-cols-3">
      <label>Exam Date<input type="date" value={settings.examDate} onChange={(e) => setSettings({ ...settings, examDate: e.target.value })} className="mt-1 w-full rounded border p-2" /></label>
      <Stat title="Readiness" value={`${readiness}%`} />
      <Stat title="Cards" value={String(cards.length)} />
    </div>
    <h3 className="mt-4 font-semibold">Weakness Chart</h3>
    <div className="mt-2 space-y-2">{weak.map((t) => <div key={t.id}><div className="mb-1 flex justify-between text-sm"><span>{t.name}</span><span>{t.score}%</span></div><div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${t.score}%` }} /></div></div>)}</div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={() => startStudy(false)} className="rounded bg-blue-600 px-3 py-2 text-white">Start Study Session</button>
      <button onClick={() => startStudy(true)} className="rounded bg-emerald-600 px-3 py-2 text-white">Start Exam Mode</button>
      <button onClick={regenerateWeak} className="rounded bg-amber-500 px-3 py-2 text-white">Regenerate 20 cards for weakest topics</button>
    </div>
  </section>;
}

function TopicsPage({ topics, setTopics }: { topics: Topic[]; setTopics: (t: Topic[]) => void }) {
  return <section className="rounded-xl bg-white p-4 shadow">{topics.map((t) => <div key={t.id} className="mb-3 grid gap-2 md:grid-cols-4">
    <input className="rounded border p-2" value={t.name} onChange={(e) => setTopics(topics.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))} />
    <input className="rounded border p-2" type="number" step="0.05" value={t.weight} onChange={(e) => setTopics(topics.map((x) => x.id === t.id ? { ...x, weight: Number(e.target.value) } : x))} />
    <input className="rounded border p-2 md:col-span-2" value={t.subtopics.join(', ')} onChange={(e) => setTopics(topics.map((x) => x.id === t.id ? { ...x, subtopics: e.target.value.split(',').map((s) => s.trim()) } : x))} />
  </div>)}
    <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => setTopics([...topics, { id: uuidv4(), name: 'Custom Subtopic', category: 'Mixed', weight: 1, score: 50, attempted: 0, updatedAt: new Date().toISOString(), subtopics: ['custom'] }])}>Add Custom Subtopic</button>
  </section>;
}

function ScoresPage({ topics, setTopics, settings, setSettings }: { topics: Topic[]; setTopics: (t: Topic[]) => void; settings: UserSettings; setSettings: (u: UserSettings) => void; }) {
  const [raw, setRaw] = useState('');
  const parse = () => {
    const lines = raw.split('\n').map((s) => s.trim()).filter(Boolean);
    setTopics(topics.map((t) => {
      const row = lines.find((line) => line.toLowerCase().includes(t.name.toLowerCase().split(' ')[0]));
      if (!row) return t;
      const score = Number((row.match(/\d{1,3}/) ?? [''])[0]);
      const attempted = Number((row.match(/\((\d+)\)/)?.[1]) ?? t.attempted);
      return Number.isFinite(score) ? { ...t, score: Math.min(100, score), attempted, updatedAt: new Date().toISOString() } : t;
    }));
  };
  return <section className="rounded-xl bg-white p-4 shadow space-y-3">
    {topics.map((t) => <div key={t.id} className="grid gap-2 md:grid-cols-3"><span>{t.name}</span><input className="rounded border p-2" type="number" value={t.score} onChange={(e) => setTopics(topics.map((x) => x.id === t.id ? { ...x, score: Number(e.target.value), updatedAt: new Date().toISOString() } : x))} /><input className="rounded border p-2" type="number" value={t.attempted} onChange={(e) => setTopics(topics.map((x) => x.id === t.id ? { ...x, attempted: Number(e.target.value), updatedAt: new Date().toISOString() } : x))} /></div>)}
    <div className="grid gap-2 md:grid-cols-3"><input className="rounded border p-2" type="number" value={settings.sessionLength} onChange={(e) => setSettings({ ...settings, sessionLength: Number(e.target.value) })} /><input className="rounded border p-2" type="number" step="0.05" value={settings.definitionRatio} onChange={(e) => setSettings({ ...settings, definitionRatio: Number(e.target.value) })} /><input className="rounded border p-2" type="number" min={1} max={5} value={settings.difficulty} onChange={(e) => setSettings({ ...settings, difficulty: Number(e.target.value) })} /></div>
    <textarea className="h-28 w-full rounded border p-2" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Paste score report text" />
    <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={parse}>Upload and Parse</button>
  </section>;
}

function StudyPage({ queue, index, reveal, setReveal, choice, setChoice, onRate, examMode, timer, cards, topics, sessions }: { queue: Card[]; index: number; reveal: boolean; setReveal: (v: boolean) => void; choice: string; setChoice: (v: string) => void; onRate: (rating: SessionResult['rating']) => void; examMode: boolean; timer?: number; cards?: Card[]; topics?: Topic[]; sessions?: StudySession[]; }) {
  const current = queue[index];
  const latestExam = sessions?.filter((s) => s.examMode).at(-1);
  const topicBreakdown = latestExam && cards && topics ? topics.map((t) => {
    const ids = cards.filter((c) => c.topicId === t.id).map((c) => c.id);
    const results = latestExam.results.filter((r) => ids.includes(r.cardId));
    const correct = results.filter((r) => r.rating === 'correct' || r.rating === 'easy').length;
    return { topic: t.name, total: results.length, correct };
  }).filter((x) => x.total > 0) : [];

  return <section className="rounded-xl bg-white p-4 shadow">
    <div className="mb-2 flex justify-between"><h2 className="text-lg font-semibold">{examMode ? 'Exam Mode' : 'Study Session'}</h2>{examMode && <span>{timer}s</span>}</div>
    {!current ? <div>
      <p>Session complete.</p>
      {examMode && topicBreakdown.length > 0 && <div className="mt-3 space-y-1">{topicBreakdown.map((row) => <p key={row.topic}>{row.topic}: {row.correct}/{row.total}</p>)}</div>}
    </div> : <div className="space-y-2">
      <p className="text-sm">Card {index + 1} / {queue.length}</p>
      <p>{current.prompt}</p>
      {current.options?.map((o) => <label key={o.id} className="block rounded border p-2"><input className="mr-2" type="radio" checked={choice === o.id} onChange={() => setChoice(o.id)} />{o.text}</label>)}
      <button className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => setReveal(true)}>Reveal</button>
      {reveal && <div className="rounded bg-slate-100 p-2 text-sm"><p><b>Answer:</b> {current.answer}</p><p>{current.explanation}</p>{current.options?.map((o) => <p key={o.id}>• {o.text}: {o.reason}</p>)}</div>}
      {!examMode
        ? <div className="flex gap-2">{(['incorrect', 'hard', 'correct', 'easy'] as const).map((r) => <button key={r} className="rounded bg-blue-600 px-2 py-1 text-white" onClick={() => onRate(r)}>{r}</button>)}</div>
        : <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={() => onRate(current.options?.find((o) => o.id === choice)?.isCorrect ? 'correct' : 'incorrect')}>Submit</button>}
    </div>}
  </section>;
}

function BrowserPage({ cards, topics, settings, onUpdate }: { cards: Card[]; topics: Topic[]; settings: UserSettings; onUpdate: (next: Card[]) => void; }) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('all');
  const [type, setType] = useState('all');
  const [flagged, setFlagged] = useState(false);
  const filtered = cards.filter((c) => c.prompt.toLowerCase().includes(q.toLowerCase()) && (topic === 'all' || c.topicId === topic) && (type === 'all' || c.type === type) && (!flagged || c.flagged));
  return <section className="rounded-xl bg-white p-4 shadow space-y-2">
    <div className="grid gap-2 md:grid-cols-4"><input className="rounded border p-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" /><select className="rounded border p-2" value={topic} onChange={(e) => setTopic(e.target.value)}><option value="all">All topics</option>{topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select><select className="rounded border p-2" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="definition">Definition</option><option value="scenario">Scenario</option></select><label><input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} /> flagged only</label></div>
    {filtered.slice(0, 100).map((c) => <div key={c.id} className="rounded border p-2">
      <p className="font-medium">{c.prompt}</p>
      <textarea className="mt-1 h-16 w-full rounded border p-2" value={c.explanation} onChange={(e) => onUpdate(cards.map((x) => x.id === c.id ? { ...x, explanation: e.target.value } : x))} />
      <div className="mt-2 flex gap-2"><button className="rounded bg-amber-500 px-2 py-1 text-white" onClick={() => onUpdate(cards.map((x) => x.id === c.id ? { ...x, flagged: !x.flagged } : x))}>Flag</button><button className="rounded bg-indigo-600 px-2 py-1 text-white" onClick={() => onUpdate(cards.map((x) => x.id === c.id ? generateCards(topics, 1, settings, [x.topicId])[0] : x))}>Regenerate</button><button className="rounded bg-rose-600 px-2 py-1 text-white" onClick={() => onUpdate(cards.filter((x) => x.id !== c.id))}>Delete</button></div>
    </div>)}
  </section>;
}

function Stat({ title, value }: { title: string; value: string }) {
  return <div className="rounded bg-slate-100 p-3"><p className="text-sm">{title}</p><p className="text-2xl font-semibold">{value}</p></div>;
}
