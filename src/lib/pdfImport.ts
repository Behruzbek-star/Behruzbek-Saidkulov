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

export const parseQuestionsFromText = (text: string): ParsedQuestion[] => {
  const blockRegex = /(?:^|\n)\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?(.+?)\s*\n\s*A[\).:-]\s*(.+?)\s*\n\s*B[\).:-]\s*(.+?)\s*\n\s*C[\).:-]\s*(.+?)\s*\n\s*D[\).:-]\s*(.+?)(?:\s*\n\s*(?:Answer|Correct\s*Answer)\s*[:=-]?\s*([A-D]))?(?=\n\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?[^\n]+\n\s*A[\).:-]|$)/gims;

  const questions: ParsedQuestion[] = [];
  let match: RegExpExecArray | null = blockRegex.exec(text);
  while (match) {
    const prompt = normalizeWhitespace(match[1] || '');
    const options = [match[2], match[3], match[4], match[5]].map((item) => normalizeWhitespace(item || '')) as [string, string, string, string];
    if (prompt && options.every(Boolean)) {
      questions.push({
        prompt,
        options,
        answerIndex: parseAnswerIndex(match[6]),
      });
    }
    match = blockRegex.exec(text);
  }

  return questions;
};

export const parseQuestionsFromPdf = async (file: File): Promise<ParsedQuestion[]> => {
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

  return parseQuestionsFromText(pages.join('\n'));
};
