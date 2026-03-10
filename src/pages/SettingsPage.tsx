import { useMemo, useState } from 'react';
import { useAppState } from '../lib/state';
import { QuestionBankItem, STUDY_TOPICS, ThemeName, Topic } from '../lib/types';

const themeOptions: { value: ThemeName; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'ocean', label: 'Ocean Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'sunset', label: 'Sunset Orange' },
  { value: 'midnight', label: 'Midnight Dark' },
];

export const SettingsPage = () => {
  const { state, setSettings, addQuestion, removeQuestion } = useAppState();
  const [local, setLocal] = useState(state.settings);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [form, setForm] = useState<QuestionBankItem>({
    id: '',
    topic: STUDY_TOPICS[0],
    prompt: '',
    options: ['', '', '', ''],
    answerIndex: 0,
  });

  const selectedCount = local.selectedTopics.length;
  const allSelected = selectedCount === STUDY_TOPICS.length;

  const topicGroups = useMemo(
    () => [
      {
        title: 'Core Foundations',
        topics: ['Insurance Regulation', 'General Insurance', 'Property and Casualty Insurance Basics'] as Topic[],
      },
      {
        title: 'Personal Lines',
        topics: ['Dwelling (2014) Policy', 'Homeowners (2011) Policy', 'Auto Insurance'] as Topic[],
      },
      {
        title: 'Commercial Lines',
        topics: ['Commercial Package Policy (CPP)', 'Businessowners (2010) Policy', "Workers' Compensation Insurance"] as Topic[],
      },
      {
        title: 'Other Areas',
        topics: ['Other Coverages and Options', 'Accident and Health Insurance'] as Topic[],
      },
    ],
    [],
  );

  const toggleTopic = (topic: Topic) => {
    const selected = local.selectedTopics.includes(topic)
      ? local.selectedTopics.filter((t) => t !== topic)
      : [...local.selectedTopics, topic];
    setLocal({ ...local, selectedTopics: selected });
  };

  const save = () => {
    setSettings({
      ...local,
      selectedTopics: local.selectedTopics.length ? local.selectedTopics : [...STUDY_TOPICS],
    });
  };

  return (
    <section className="settings-page">
      <h1>Settings</h1>

      <div className="settings-block">
        <h3>Exam</h3>
        <p>
          Mode: <strong>New York P&C</strong>
        </p>
      </div>

      <div className="settings-block">
        <div className="settings-row">
          <h3>Study Topics</h3>
          <span className="pill">{selectedCount}/{STUDY_TOPICS.length} selected</span>
        </div>

        <div className="topic-actions">
          <button type="button" className="secondary-btn" onClick={() => setLocal({ ...local, selectedTopics: [...STUDY_TOPICS] })}>Select all</button>
          <button type="button" className="secondary-btn" onClick={() => setLocal({ ...local, selectedTopics: [] })}>Clear all</button>
          {!allSelected && selectedCount === 0 && <small className="inline-help">No topics selected. Saving will default to all topics.</small>}
        </div>

        <div className="topic-groups">
          {topicGroups.map((group) => (
            <div key={group.title} className="topic-group">
              <h4>{group.title}</h4>
              <div className="checklist">
                {group.topics.map((topic) => (
                  <label key={topic} className="topic-item">
                    <input type="checkbox" checked={local.selectedTopics.includes(topic)} onChange={() => toggleTopic(topic)} />
                    <span>{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-block">
        <h3>Generation Preferences</h3>

        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={local.theme}
          onChange={(e) => {
            const nextTheme = e.target.value as ThemeName;
            const next = { ...local, theme: nextTheme };
            setLocal(next);
            setSettings({ ...next, selectedTopics: next.selectedTopics.length ? next.selectedTopics : [...STUDY_TOPICS] });
          }}
        >
          {themeOptions.map((theme) => (
            <option key={theme.value} value={theme.value}>{theme.label}</option>
          ))}
        </select>

        <label htmlFor="daily-goal">Daily goal (cards/day)</label>
        <input id="daily-goal" type="number" min={5} value={local.dailyGoal} onChange={(e) => setLocal({ ...local, dailyGoal: Number(e.target.value) })} />
      </div>

      <div className="settings-block">
        <div className="settings-row">
          <h3>Question Manager</h3>
          <button type="button" className="secondary-btn" onClick={() => setShowQuestionManager((v) => !v)}>
            {showQuestionManager ? 'Hide Questions' : 'Manage Questions'}
          </button>
        </div>

        {showQuestionManager && (
          <>
            <p className="inline-help">You currently have {state.questionBank.length} questions saved.</p>
            <div className="question-list">
              {state.questionBank.map((q) => (
                <div key={q.id} className="question-item">
                  <p><strong>{q.prompt}</strong></p>
                  <small>{q.topic}</small>
                  <button type="button" className="secondary-btn" onClick={() => removeQuestion(q.id)}>Remove</button>
                </div>
              ))}
            </div>

            <h4>Add Question</h4>
            <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as Topic })}>
              {STUDY_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Question" value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />
            {form.options.map((opt, i) => (
              <input key={i} placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => {
                const next = [...form.options] as [string, string, string, string];
                next[i] = e.target.value;
                setForm({ ...form, options: next });
              }} />
            ))}
            <label>Correct Answer</label>
            <select value={form.answerIndex} onChange={(e) => setForm({ ...form, answerIndex: Number(e.target.value) as 0 | 1 | 2 | 3 })}>
              <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
            </select>
            <button type="button" onClick={() => {
              if (!form.prompt.trim() || form.options.some((o) => !o.trim())) return;
              addQuestion({ ...form, id: `custom-${Date.now()}` });
              setForm({ id: '', topic: STUDY_TOPICS[0], prompt: '', options: ['', '', '', ''], answerIndex: 0 });
            }}>Add Question</button>
          </>
        )}
      </div>

      <button type="button" onClick={save}>Save settings</button>
    </section>
  );
};
