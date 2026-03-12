import { useMemo, useState } from 'react';
import { FlipCard } from '../components/FlipCard';
import { useAppState } from '../lib/state';

const toVideoSearchUrl = (topic: string, prompt: string): string => {
  const query = encodeURIComponent(`${topic} insurance ${prompt}`);
  return `https://www.youtube.com/embed?autoplay=1&listType=search&list=${query}`;
};

export const StudyPage = () => {
  const { state, recordReview } = useAppState();
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(Date.now());
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const sessionCards = useMemo(() => {
    const selectedTopics = state.settings.selectedTopics.length ? state.settings.selectedTopics : [];
    const questions = selectedTopics.length
      ? state.questionBank.filter((q) => selectedTopics.includes(q.topic))
      : [...state.questionBank];

    return questions.map((q) => ({
      id: q.id,
      type: 'mcq' as const,
      prompt: q.prompt,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: 'From your provided quiz bank.',
      topic: q.topic,
      difficulty: 'Medium' as const,
      style: 'definition' as const,
      createdAt: new Date().toISOString(),
    }));
  }, [state.questionBank, state.settings.selectedTopics]);

  const card = sessionCards.length ? sessionCards[cursor % sessionCards.length] : undefined;
  const reviews = Object.values(state.reviews).flatMap((r) => r.history);
  const streak = useMemo(() => {
    let count = 0;
    for (let i = reviews.length - 1; i >= 0; i -= 1) {
      if (!reviews[i].wasCorrect) break;
      count += 1;
    }
    return count;
  }, [reviews]);
  const accuracy = reviews.length ? Math.round((reviews.filter((h) => h.wasCorrect).length / reviews.length) * 100) : 0;
  const timeSpent = reviews.reduce((sum, h) => sum + h.timeSpentMs, 0);

  if (!card) {
    return (
      <section>
        <h1>Study Session</h1>
        <p>No questions available. Add questions in Settings to begin studying.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Study Session</h1>
      <p>Streak: {streak} • Accuracy: {accuracy}% • Time spent: {Math.round(timeSpent / 1000)}s</p>
      <FlipCard
        card={card}
        selected={selected}
        reveal={selected !== null}
        onSelect={(idx) => setSelected(idx)}
        onExample={() => setVideoUrl(toVideoSearchUrl(card.topic, card.prompt))}
        onContinue={() => {
          if (selected === null) return;
          recordReview(card.id, selected, 'Good', Date.now() - start);
          setCursor((c) => c + 1);
          setSelected(null);
          setStart(Date.now());
          setVideoUrl(null);
        }}
      />

      {videoUrl && (
        <div className="video-overlay" role="dialog" aria-modal="true" aria-label="Question example video">
          <div className="video-dialog">
            <button type="button" className="secondary-btn" onClick={() => setVideoUrl(null)}>Close</button>
            <div className="video-frame-wrap">
              <iframe
                src={videoUrl}
                title="Question Example Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
