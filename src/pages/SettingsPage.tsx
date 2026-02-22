import { useState } from 'react';
import { useAppState } from '../lib/state';
import { Difficulty, STUDY_TOPICS, Topic } from '../lib/types';

export const SettingsPage = () => {
  const { state, setSettings } = useAppState();
  const [local, setLocal] = useState(state.settings);

  const toggleTopic = (topic: Topic) => {
    const selected = local.selectedTopics.includes(topic)
      ? local.selectedTopics.filter((t) => t !== topic)
      : [...local.selectedTopics, topic];
    setLocal({ ...local, selectedTopics: selected });
  };

  return (
    <section>
      <h1>Settings</h1>
      <p>Exam mode: <strong>New York P&C</strong></p>
      <h3>Study Topics</h3>
      <div className="checklist">
        {STUDY_TOPICS.map((topic) => (
          <label key={topic}><input type="checkbox" checked={local.selectedTopics.includes(topic)} onChange={() => toggleTopic(topic)} />{topic}</label>
        ))}
      </div>
      <label>Definition-style ratio: {local.definitionRatio}%
        <input type="range" min={0} max={100} value={local.definitionRatio} onChange={(e) => setLocal({ ...local, definitionRatio: Number(e.target.value) })} />
      </label>
      <label>Difficulty
        <select value={local.difficulty} onChange={(e) => setLocal({ ...local, difficulty: e.target.value as Difficulty })}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </label>
      <label>Daily goal
        <input type="number" min={5} value={local.dailyGoal} onChange={(e) => setLocal({ ...local, dailyGoal: Number(e.target.value) })} />
      </label>
      <button onClick={() => setSettings({ ...local, selectedTopics: local.selectedTopics.length ? local.selectedTopics : [...STUDY_TOPICS] })}>Save settings</button>
    </section>
  );
};
