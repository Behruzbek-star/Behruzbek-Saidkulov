import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface ParsedQuestion {
  prompt: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
}

interface TextItemLike {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
}

interface AnnotationLike {
  color?: number[];
  rect?: number[];
  quadPoints?: number[];
  subtype?: string;
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

const isGreenAnnotation = (annotation: AnnotationLike): boolean => {
  const { color } = annotation;
  if (!Array.isArray(color) || color.length < 3) return false;
  const [r, g, b] = color;
  return g > r * 1.2 && g > b * 1.2;
};

const isHighlightLike = (annotation: AnnotationLike): boolean => {
  const subtype = annotation.subtype?.toLowerCase();
  return subtype === 'highlight' || subtype === 'square' || subtype === 'ink';
};

const doesIntersect = (
  target: { minX: number; maxX: number; minY: number; maxY: number },
  item: { minX: number; maxX: number; minY: number; maxY: number },
): boolean => {
  const overlapX = target.minX <= item.maxX && target.maxX >= item.minX;
  const overlapY = target.minY <= item.maxY && target.maxY >= item.minY;
  return overlapX && overlapY;
};

const textInsideRect = (items: TextItemLike[], rect: number[]): string => {
  const [x1, y1, x2, y2] = rect;
  const target = {
    minX: Math.min(x1, x2) - 2,
    maxX: Math.max(x1, x2) + 2,
    minY: Math.min(y1, y2) - 2,
    maxY: Math.max(y1, y2) + 2,
  };

  return items
    .filter((item) => {
      const t = item.transform;
      if (!t || t.length < 6) return false;
      const x = t[4];
      const y = t[5];
      const width = item.width ?? 0;
      const height = item.height ?? (Math.abs(t[3]) || 8);
      const itemRect = {
        minX: Math.min(x, x + width),
        maxX: Math.max(x, x + width),
        minY: y - height,
        maxY: y + 2,
      };
      return doesIntersect(target, itemRect);
    })
    .map((item) => item.str ?? '')
    .join(' ');
};

const extractSnippetsFromAnnotation = (items: TextItemLike[], annotation: AnnotationLike): string[] => {
  const snippets: string[] = [];

  if (Array.isArray(annotation.quadPoints) && annotation.quadPoints.length >= 8) {
    for (let i = 0; i + 7 < annotation.quadPoints.length; i += 8) {
      const points = annotation.quadPoints.slice(i, i + 8);
      const xs = [points[0], points[2], points[4], points[6]];
      const ys = [points[1], points[3], points[5], points[7]];
      snippets.push(
        normalizeWhitespace(
          textInsideRect(items, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]),
        ),
      );
    }
  }

  if (snippets.length === 0 && Array.isArray(annotation.rect) && annotation.rect.length >= 4) {
    snippets.push(normalizeWhitespace(textInsideRect(items, annotation.rect)));
  }

  return snippets.filter(Boolean);
};

const parseGreenHighlights = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<Map<number, 0 | 1 | 2 | 3>> => {
  const answerMap = new Map<number, 0 | 1 | 2 | 3>();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items as TextItemLike[];
    const annotations = (await page.getAnnotations()) as AnnotationLike[];

    annotations
      .filter((annotation) => isHighlightLike(annotation) && isGreenAnnotation(annotation))
      .forEach((annotation) => {
        const snippets = extractSnippetsFromAnnotation(items, annotation);
        snippets.forEach((snippet) => {
          const pairRegex = /(\d{1,4})\s*[).:\-]?\s*([A-Da-d])/g;
          let pair: RegExpExecArray | null = pairRegex.exec(snippet);
          while (pair) {
            answerMap.set(Number(pair[1]), parseAnswerIndex(pair[2]));
            pair = pairRegex.exec(snippet);
          }
        });
      });
  }

  return answerMap;
};

export const parseQuestionsFromText = (text: string, highlightAnswerMap?: Map<number, 0 | 1 | 2 | 3>): ParsedQuestion[] => {
  const answerSheet = parseAnswerSheetFromText(text);
  const blockRegex = /(?:^|\n)\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?(.+?)\s*\n\s*A[\).:-]\s*(.+?)\s*\n\s*B[\).:-]\s*(.+?)\s*\n\s*C[\).:-]\s*(.+?)\s*\n\s*D[\).:-]\s*(.+?)(?:\s*\n\s*(?:Answer|Correct\s*Answer|Ans(?:wer)?)\s*[:=-]?\s*([A-D]))?(?=\n\s*(?:Q(?:uestion)?\s*\d*[:.)-]?\s*)?[^\n]+\n\s*A[\).:-]|$)/gims;

  const questions: ParsedQuestion[] = [];
  let fallbackQuestionNumber = 1;
  let match: RegExpExecArray | null = blockRegex.exec(text);

  while (match) {
    const rawPrompt = match[1] || '';
    const questionNumber = extractQuestionNumber(rawPrompt) ?? fallbackQuestionNumber;
    fallbackQuestionNumber = Math.max(fallbackQuestionNumber + 1, questionNumber + 1);

    const prompt = normalizeWhitespace(rawPrompt);
    const options = [match[2], match[3], match[4], match[5]].map((item) => normalizeWhitespace(item || '')) as [string, string, string, string];
    const trailingAnswerMatch = options[3].match(/^(.*?)(?:\s+(?:Answer|Correct\s*Answer|Ans(?:wer)?)\s*[:=-]?\s*([A-D]))$/i);
    if (trailingAnswerMatch) {
      options[3] = normalizeWhitespace(trailingAnswerMatch[1]);
    }
    const inlineAnswer = match[6] ?? trailingAnswerMatch?.[2];
    const highlightedAnswer = highlightAnswerMap?.get(questionNumber);
    const mappedAnswer = answerSheet.get(questionNumber);
    const answerIndex = inlineAnswer
      ? parseAnswerIndex(inlineAnswer)
      : (highlightedAnswer ?? mappedAnswer ?? 0);

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

const extractPdfText = async (pdf: pdfjsLib.PDFDocumentProxy): Promise<string> => {
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

const loadPdf = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
  const bytes = await file.arrayBuffer();
  return pdfjsLib.getDocument({ data: bytes }).promise;
};

export const parseQuestionsFromPdf = async (file: File): Promise<ParsedQuestion[]> => {
  const pdf = await loadPdf(file);
  const [text, greenHighlights] = await Promise.all([extractPdfText(pdf), parseGreenHighlights(pdf)]);
  return parseQuestionsFromText(text, greenHighlights);
};

export const parseAnswerSheetFromPdf = async (file: File): Promise<Map<number, 0 | 1 | 2 | 3>> => {
  const pdf = await loadPdf(file);
  const text = await extractPdfText(pdf);
  return parseAnswerSheetFromText(text);
};
