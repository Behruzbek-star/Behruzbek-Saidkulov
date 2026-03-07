import { useMemo, useState } from 'react';
import { useAppState } from '../lib/state';
import { STUDY_TOPICS, ThemeName, Topic } from '../lib/types';


const themeOptions: { value: ThemeName; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'ocean', label: 'Ocean Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'sunset', label: 'Sunset Orange' },
  { value: 'midnight', label: 'Midnight Dark' },
];

export const SettingsPage = () => {
  const { state, setSettings } = useAppState();
  const [local, setLocal] = useState(state.settings);

  const selectedCount = local.selectedTopics.length;
  const allSelected = selectedCount === STUDY_TOPICS.length;

  const topicGroups = useMemo(
    () => [
      {
        title: 'Core Foundations',
        topics: [
          'Insurance Regulation',
          'General Insurance',
          'Property and Casualty Insurance Basics',
        ] as Topic[],
      },
      {
        title: 'Personal Lines',
        topics: ['Dwelling (2014) Policy', 'Homeowners (2011) Policy', 'Auto Insurance'] as Topic[],
      },
      {
        title: 'Commercial Lines',
        topics: [
          'Commercial Package Policy (CPP)',
          'Businessowners (2010) Policy',
          "Workers' Compensation Insurance",
        ] as Topic[],
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
          <span className="pill">
            {selectedCount}/{STUDY_TOPICS.length} selected
          </span>
        </div>

        <div className="topic-actions">
          <button type="button" className="secondary-btn" onClick={() => setLocal({ ...local, selectedTopics: [...STUDY_TOPICS] })}>
            Select all
          </button>
          <button type="button" className="secondary-btn" onClick={() => setLocal({ ...local, selectedTopics: [] })}>
            Clear all
          </button>
          {!allSelected && selectedCount === 0 && (
            <small className="inline-help">No topics selected. Saving will default to all topics.</small>
          )}
        </div>

        <div className="topic-groups">
          {topicGroups.map((group) => (
            <div key={group.title} className="topic-group">
              <h4>{group.title}</h4>
              <div className="checklist">
                {group.topics.map((topic) => (
                  <label key={topic} className="topic-item">
                    <input
                      type="checkbox"
                      checked={local.selectedTopics.includes(topic)}
                      onChange={() => toggleTopic(topic)}
                    />
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
            setSettings({
              ...next,
              selectedTopics: next.selectedTopics.length ? next.selectedTopics : [...STUDY_TOPICS],
            });
          }}
        >
          {themeOptions.map((theme) => (
            <option key={theme.value} value={theme.value}>{theme.label}</option>
          ))}
        </select>

        <label htmlFor="daily-goal">Daily goal (cards/day)</label>
        <input
          id="daily-goal"
          type="number"
          min={5}
          value={local.dailyGoal}
          onChange={(e) => setLocal({ ...local, dailyGoal: Number(e.target.value) })}
        />
      </div>

      <button type="button" onClick={save}>
        Save settings
      </button>
    </section>
  );
};
