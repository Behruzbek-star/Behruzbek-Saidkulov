import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useAppState } from '../lib/state';
import { parseQuestionsFromPdf } from '../lib/pdfImport';
import { QuestionBankItem, STUDY_TOPICS, ThemeName, Topic } from '../lib/types';

const themeOptions: { value: ThemeName; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'ocean', label: 'Ocean Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'sunset', label: 'Sunset Orange' },
  { value: 'midnight', label: 'Midnight Dark' },
];

interface PreviewQuestion {
  tempId: string;
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  selected: boolean;
  isDuplicate: boolean;
}

const normalizePrompt = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

export const SettingsPage = () => {
  const { state, setSettings, addQuestion, addQuestions, removeQuestion, clearAllQuestions, updateQuestion } = useAppState();
  const [local, setLocal] = useState(state.settings);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string>('');
  const [importingPdf, setImportingPdf] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [preview, setPreview] = useState<PreviewQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<QuestionBankItem | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [form, setForm] = useState<QuestionBankItem>({
    id: '',
    topic: STUDY_TOPICS[0],
    prompt: '',
    options: ['', '', '', ''],
    answerIndex: 0,
  });

  const selectedCount = local.selectedTopics.length;
  const allSelected = selectedCount === STUDY_TOPICS.length;

  const knownPrompts = useMemo(() => new Set(state.questionBank.map((q) => normalizePrompt(q.prompt))), [state.questionBank]);

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

  const onPdfPick = (event: ChangeEvent<HTMLInputElement>) => {
    setPdfStatus('');
    setPreview([]);
    const file = event.target.files?.[0] ?? null;
    setPdfFile(file);
  };

  const importFromPdf = async () => {
    const fileFromInput = pdfInputRef.current?.files?.[0] ?? null;
    const fileToImport = pdfFile ?? fileFromInput;
    if (!fileToImport) {
      setPdfStatus('Please choose a PDF file first.');
      return;
    }

    setImportingPdf(true);
    setPdfStatus('Reading PDF and preparing preview...');
    const parsed = await parseQuestionsFromPdf(fileToImport).catch(() => []);
    setImportingPdf(false);

    if (!parsed.length) {
      setPdfStatus('No supported questions were detected. Use format: prompt + A/B/C/D options (optional Answer: B).');
      return;
    }

    const seen = new Set<string>();
    const prepared = parsed.map((item, index) => {
      const normalized = normalizePrompt(item.prompt);
      const isDuplicate = knownPrompts.has(normalized) || seen.has(normalized);
      seen.add(normalized);
      return {
        tempId: `preview-${Date.now()}-${index}`,
        prompt: item.prompt,
        options: item.options,
        answerIndex: item.answerIndex,
        selected: !isDuplicate,
        isDuplicate,
      } satisfies PreviewQuestion;
    });

    setPreview(prepared);
    const duplicateCount = prepared.filter((p) => p.isDuplicate).length;
    setPdfStatus(`Preview ready: ${prepared.length} parsed, ${duplicateCount} duplicate(s) detected.`);
  };

  const importSelectedPreview = () => {
    const rows = preview.filter((p) => p.selected && p.prompt.trim() && p.options.every((opt) => opt.trim()));
    const toImport = rows
      .filter((item) => (skipDuplicates ? !item.isDuplicate : true))
      .map((item, index) => ({
        id: `pdf-${Date.now()}-${index}`,
        topic: form.topic,
        prompt: item.prompt.trim(),
        options: item.options.map((o) => o.trim()) as [string, string, string, string],
        answerIndex: item.answerIndex,
      }));

    if (toImport.length === 0) {
      setPdfStatus('No selected rows were eligible for import.');
      return;
    }

    addQuestions(toImport);
    setPdfStatus(`Imported ${toImport.length} question(s) into topic: ${form.topic}.`);
    setPreview([]);
    setPdfFile(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  return (
    <section className="settings-page">
      <h1>Settings</h1>

      <div className="settings-block">
        <h3>Exam</h3>
        <p>Mode: <strong>New York P&C</strong></p>
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
          {themeOptions.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
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
            <div className="topic-actions">
              <p className="inline-help">You currently have {state.questionBank.length} questions saved.</p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  if (state.questionBank.length === 0) return;
                  if (!window.confirm('Remove all questions from your question bank?')) return;
                  clearAllQuestions();
                }}
              >
                Clear all
              </button>
            </div>
            <div className="question-list">
              {state.questionBank.map((q) => (
                <div key={q.id} className="question-item">
                  {editingId === q.id && editDraft ? (
                    <>
                      <input value={editDraft.prompt} onChange={(e) => setEditDraft({ ...editDraft, prompt: e.target.value })} />
                      {editDraft.options.map((opt, idx) => (
                        <input
                          key={idx}
                          value={opt}
                          onChange={(e) => {
                            const next = [...editDraft.options] as [string, string, string, string];
                            next[idx] = e.target.value;
                            setEditDraft({ ...editDraft, options: next });
                          }}
                        />
                      ))}
                      <select value={editDraft.answerIndex} onChange={(e) => setEditDraft({ ...editDraft, answerIndex: Number(e.target.value) as 0 | 1 | 2 | 3 })}>
                        <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                      </select>
                      <div className="topic-actions">
                        <button type="button" onClick={() => {
                          if (!editDraft.prompt.trim() || editDraft.options.some((o) => !o.trim())) return;
                          updateQuestion({ ...editDraft, prompt: editDraft.prompt.trim(), options: editDraft.options.map((o) => o.trim()) as [string, string, string, string] });
                          setEditingId(null);
                          setEditDraft(null);
                        }}>Save</button>
                        <button type="button" className="secondary-btn" onClick={() => { setEditingId(null); setEditDraft(null); }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>{q.prompt}</strong></p>
                      <small>{q.topic}</small>
                      <div className="topic-actions">
                        <button type="button" className="secondary-btn" onClick={() => { setEditingId(q.id); setEditDraft({ ...q }); }}>Edit</button>
                        <button type="button" className="secondary-btn" onClick={() => removeQuestion(q.id)}>Remove</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <h4>Add Question</h4>
            <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as Topic })}>
              {STUDY_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Question" value={form.prompt} onChange={(e) => { setForm({ ...form, prompt: e.target.value }); setFormError(''); }} />
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
              const normalized = normalizePrompt(form.prompt);
              if (!form.prompt.trim() || form.options.some((o) => !o.trim())) return;
              if (knownPrompts.has(normalized)) {
                setFormError('Duplicate question detected. Edit the prompt or update an existing question instead.');
                return;
              }
              addQuestion({ ...form, id: `custom-${Date.now()}`, prompt: form.prompt.trim(), options: form.options.map((o) => o.trim()) as [string, string, string, string] });
              setForm({ id: '', topic: STUDY_TOPICS[0], prompt: '', options: ['', '', '', ''], answerIndex: 0 });
              setFormError('');
            }}>Add Question</button>
            {formError && <small className="inline-help">{formError}</small>}

            <div className="pdf-import-block">
              <h4>Import Questions from PDF</h4>
              <p className="inline-help">Upload PDF, review parsed questions, edit if needed, then import selected rows.</p>
              <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={onPdfPick} />
              <button type="button" onClick={importFromPdf} disabled={importingPdf}>{importingPdf ? 'Parsing...' : 'Preview PDF Questions'}</button>
              {pdfFile && <small className="inline-help">Selected file: {pdfFile.name}</small>}
              {pdfStatus && <small className="inline-help">{pdfStatus}</small>}

              {preview.length > 0 && (
                <div className="pdf-preview-list">
                  <label className="topic-item">
                    <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} />
                    <span>Skip duplicates during import</span>
                  </label>
                  {preview.map((row) => (
                    <div key={row.tempId} className={`question-item ${row.isDuplicate ? 'duplicate-item' : ''}`}>
                      <label className="topic-item">
                        <input type="checkbox" checked={row.selected} onChange={(e) => setPreview((prev) => prev.map((p) => (p.tempId === row.tempId ? { ...p, selected: e.target.checked } : p)))} />
                        <span>{row.isDuplicate ? 'Duplicate' : 'Ready'}</span>
                      </label>
                      <input value={row.prompt} onChange={(e) => setPreview((prev) => prev.map((p) => (p.tempId === row.tempId ? { ...p, prompt: e.target.value } : p)))} />
                      {row.options.map((opt, idx) => (
                        <input key={idx} value={opt} onChange={(e) => setPreview((prev) => prev.map((p) => {
                          if (p.tempId !== row.tempId) return p;
                          const next = [...p.options] as [string, string, string, string];
                          next[idx] = e.target.value;
                          return { ...p, options: next };
                        }))} />
                      ))}
                      <select value={row.answerIndex} onChange={(e) => setPreview((prev) => prev.map((p) => (p.tempId === row.tempId ? { ...p, answerIndex: Number(e.target.value) as 0 | 1 | 2 | 3 } : p)))}>
                        <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
                      </select>
                    </div>
                  ))}
                  <button type="button" onClick={importSelectedPreview}>Import Selected Preview Questions</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <button type="button" onClick={save}>Save settings</button>
    </section>
  );
};
