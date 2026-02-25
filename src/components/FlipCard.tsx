import { Card } from '../lib/types';

interface Props {
  card: Card;
  selected: number | null;
  reveal: boolean;
  onSelect: (idx: number) => void;
  onContinue: () => void;
}

export const FlipCard = ({ card, selected, reveal, onSelect, onContinue }: Props) => {
  const isCorrect = selected === card.answerIndex;
  return (
    <div className="flip-wrap">
      <div className={`flip-inner ${reveal ? 'flipped' : ''}`}>
        <section className="flip-face front">
          <span className="tag">{card.topic} • {card.difficulty} • {card.style}</span>
          <h2>{card.prompt}</h2>
          <div className="options">
            {card.options.map((option, i) => (
              <button className="option-btn" key={option} onClick={() => onSelect(i)} disabled={selected !== null}>
                {String.fromCharCode(65 + i)}. {option}
              </button>
            ))}
          </div>
        </section>

        <section className="flip-face back clickable-back" onClick={onContinue} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onContinue()}>
          <h2>{isCorrect ? '✅ Correct' : '❌ Not quite'}</h2>
          <p>Your answer: {selected !== null ? String.fromCharCode(65 + selected) : '-'}</p>
          <p>Correct answer: {String.fromCharCode(65 + card.answerIndex)}. {card.options[card.answerIndex]}</p>
          <p>{card.explanation}</p>
          <small>Tap anywhere on this card to continue. Scheduling is automatic: correct answers are marked as Good, incorrect answers as Again.</small>
        </section>
      </div>
    </div>
  );
};
