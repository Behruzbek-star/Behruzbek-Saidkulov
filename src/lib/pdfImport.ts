import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface ParsedQuestion {
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
}

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const parseAnswerIndex = (answer: string | undefined): 0 | 1 | 2 | 3 => {
  if (!answer) return 0;
  const letter = answer.trim().toUpperCase().charAt(0);
  if (letter === 'B') return 1;
  if (letter === 'C') return 2;
  if (letter === 'D') return 3;
  return 0;
};

export const extractQuestionNumber = (raw: string): number | null => {
  const byQuestionLabel = raw.match(/^\s*(?:Q(?:uestion)?\s*)?(\d{1,4})\s*[).:-]?\s*/i);
  if (!byQuestionLabel) return null;
  return Number(byQuestionLabel[1]);
};

export const parseAnswerSheetFromText = (text: string): Map<number, 0 | 1 | 2 | 3> => {
  const answerMap = new Map<number, 0 | 1 | 2 | 3>();

  const keySection = text.match(/answer\s*key[\s\S]*/i)?.[0] ?? text;
  const sanitized = keySection
    .replace(/[^\dA-Da-d).:\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const pairRegex = /(\d{1,4})\s*[).:\-]?\s*([A-Da-d])(?=\s|$)/g;
  let pair: RegExpExecArray | null = pairRegex.exec(sanitized);
  while (pair) {
    answerMap.set(Number(pair[1]), parseAnswerIndex(pair[2]));
    pair = pairRegex.exec(sanitized);
  }

  return answerMap;
};

export const parseQuestionsFromText = (text: string): ParsedQuestion[] => {
  const answerSheet = parseAnswerSheetFromText(text);
  const blockRegex = /(?:^|\n)\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?(.+?)\s*\n\s*A[\).:-]\s*(.+?)\s*\n\s*B[\).:-]\s*(.+?)\s*\n\s*C[\).:-]\s*(.+?)\s*\n\s*D[\).:-]\s*(.+?)(?:\s*\n\s*(?:Answer|Correct\s*Answer)\s*[:=-]?\s*([A-D]))?(?=\n\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?[^\n]+\n\s*A[\).:-]|$)/gims;

  const questions: ParsedQuestion[] = [];
  let fallbackQuestionNumber = 1;
  let match: RegExpExecArray | null = blockRegex.exec(text);

  while (match) {
    const rawPrompt = match[1] || '';
    const questionNumber = extractQuestionNumber(rawPrompt) ?? fallbackQuestionNumber;
    fallbackQuestionNumber = Math.max(fallbackQuestionNumber + 1, questionNumber + 1);

    const prompt = normalizeWhitespace(rawPrompt);
    const options = [match[2], match[3], match[4], match[5]].map((item) => normalizeWhitespace(item || '')) as [string, string, string, string];
    const inlineAnswer = match[6];
    const mappedAnswer = answerSheet.get(questionNumber);
    const answerIndex = inlineAnswer ? parseAnswerIndex(inlineAnswer) : (mappedAnswer ?? 0);

    if (prompt && options.every(Boolean)) {
      questions.push({
        prompt,
        options,
        answerIndex,
      });
    }

    match = blockRegex.exec(text);
  }

  return questions;
};

const extractPdfText = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n');
    pages.push(pageText);
  }

  return pages.join('\n');
};

export const parseQuestionsFromPdf = async (file: File): Promise<ParsedQuestion[]> => {
  const text = await extractPdfText(file);
  return parseQuestionsFromText(text);
};

export const parseAnswerSheetFromPdf = async (file: File): Promise<Map<number, 0 | 1 | 2 | 3>> => {
  const text = await extractPdfText(file);
  return parseAnswerSheetFromText(text);
};
