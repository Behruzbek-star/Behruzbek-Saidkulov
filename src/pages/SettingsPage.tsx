import type { FormEvent } from 'react';
import { TOPICS } from '../constants';
import { useApp } from '../context/AppContext';
import type { Difficulty, Topic } from '../types';

export function SettingsPage() {
  const { settings, updateSettings } = useApp();

  const updateTopics = (topic: Topic, checked: boolean) => {
    const next = checked ? [...settings.focusTopics, topic] : settings.focusTopics.filter((t) => t !== topic);
    updateSettings({ focusTopics: next.length ? next : [topic] });
  };

  const onSubmit = (e: FormEvent) => e.preventDefault();

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Settings</h2>
      <label>
        Exam mode
        <input value={settings.examMode} disabled />
      </label>
      <label>
        Definitions vs Scenarios: {settings.definitionRatio}% / {100 - settings.definitionRatio}%
        <input type="range" min={40} max={90} value={settings.definitionRatio} onChange={(e) => updateSettings({ definitionRatio: Number(e.target.value) })} />
      </label>
      <label>
        Difficulty
        <select value={settings.difficulty} onChange={(e) => updateSettings({ difficulty: e.target.value as Difficulty })}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </label>
      <label>
        Daily goal
        <input type="number" min={5} max={100} value={settings.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })} />
      </label>
      <label>
        Seed (deterministic generator)
        <input value={settings.seed} onChange={(e) => updateSettings({ seed: e.target.value })} />
      </label>
      <h3>Focus topics</h3>
      <div className="checklist">
        {TOPICS.map((topic) => (
          <label key={topic} className="topic-item">
            <input type="checkbox" checked={settings.focusTopics.includes(topic)} onChange={(e) => updateTopics(topic, e.target.checked)} /> {topic}
          </label>
        ))}
      </div>
    </form>
  );
}
