import { useMemo, useState } from 'react';
import { FlipCard } from '../components/FlipCard';
import { useAppState } from '../lib/state';

interface ArchiveDoc {
  identifier?: string;
  title?: string;
}

interface ArchiveResponse {
  response?: {
    docs?: ArchiveDoc[];
  };
}

interface ExampleVideo {
  title: string;
  embedUrl: string;
  sourceUrl: string;
}

const buildArchiveQuery = (topic: string, prompt: string): string => {
  const shortPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join(' ');
  return `${topic} insurance ${shortPrompt}`.trim();
};

const findExampleVideo = async (topic: string, prompt: string): Promise<ExampleVideo | null> => {
  const query = encodeURIComponent(`${buildArchiveQuery(topic, prompt)} AND mediatype:(movies)`);
  const endpoint = `https://archive.org/advancedsearch.php?q=${query}&fl[]=identifier,title&sort[]=downloads+desc&rows=10&page=1&output=json`;

  const response = await fetch(endpoint);
  if (!response.ok) return null;

  const data = (await response.json()) as ArchiveResponse;
  const docs = data.response?.docs ?? [];
  const firstValid = docs.find((d) => d.identifier);
  if (!firstValid?.identifier) return null;

  return {
    title: firstValid.title || 'Example video',
    embedUrl: `https://archive.org/embed/${firstValid.identifier}`,
    sourceUrl: `https://archive.org/details/${firstValid.identifier}`,
  };
};

export const StudyPage = () => {
  const { state, recordReview } = useAppState();
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [start, setStart] = useState(Date.now());
  const [video, setVideo] = useState<ExampleVideo | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  const closeVideo = () => {
    setVideo(null);
    setVideoError(null);
    setVideoLoading(false);
  };

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
        onExample={async () => {
          setVideoError(null);
          setVideoLoading(true);
          const nextVideo = await findExampleVideo(card.topic, card.prompt).catch(() => null);
          setVideoLoading(false);
          if (!nextVideo) {
            setVideoError('No related video found right now. Please try again in a moment.');
            return;
          }
          setVideo(nextVideo);
        }}
        onContinue={() => {
          if (selected === null) return;
          recordReview(card.id, selected, 'Good', Date.now() - start);
          setCursor((c) => c + 1);
          setSelected(null);
          setStart(Date.now());
          closeVideo();
        }}
      />

      {(video || videoLoading || videoError) && (
        <div className="video-overlay" role="dialog" aria-modal="true" aria-label="Question example video">
          <div className="video-dialog">
            <div className="video-header">
              <strong>{video?.title ?? 'Finding a related example video...'}</strong>
              <button type="button" className="secondary-btn" onClick={closeVideo}>Close</button>
            </div>

            {videoLoading && <p>Loading example video...</p>}

            {videoError && (
              <p>{videoError}</p>
            )}

            {video && (
              <>
                <div className="video-frame-wrap">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <a className="cta" href={video.sourceUrl} target="_blank" rel="noreferrer">
                  Open video on Archive.org
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
