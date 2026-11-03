import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface GenerateCardsPayload {
  sourceText?: string;
  pdfBase64?: string;
  targetCount?: number;
  studyDepth?: 'concepts' | 'granular' | 'interview' | 'formulas';
  customInstructions?: string;
}

// POST /api/generate-cards
app.post('/api/generate-cards', async (req: Request, res: Response) => {
  try {
    const {
      sourceText = '',
      pdfBase64,
      targetCount = 10,
      studyDepth = 'concepts',
      customInstructions = '',
    }: GenerateCardsPayload = req.body;

    if (!sourceText.trim() && !pdfBase64) {
      return res.status(400).json({
        error: 'Please provide raw study notes or upload a PDF/text document.',
      });
    }

    const ai = getGeminiClient();

    let depthGuidance = '';
    switch (studyDepth) {
      case 'granular':
        depthGuidance =
          'Focus on granular definitions, exact terminology, specific numbers/metrics, and discrete factual recall.';
        break;
      case 'interview':
        depthGuidance =
          'Focus on frequently tested technical interview questions, trade-off comparisons, edge cases, and "how does X work under the hood" prompts.';
        break;
      case 'formulas':
        depthGuidance =
          'Focus on mathematical formulas, physical equations, algorithms, computational complexities, and relationships. Standardize math into LaTeX syntax (e.g., $E = mc^2$ or $$\\mathcal{O}(V + E)$$).';
        break;
      case 'concepts':
      default:
        depthGuidance =
          'Focus on core conceptual pillars, foundational mechanisms, and cause-and-effect relationships.';
        break;
    }

    const systemInstruction = `You are an elite cognitive learning engineer and flashcard author specializing in active recall and spaced repetition (Anki style).
Your task is to ingest study notes and transform them into exceptional, atomic study flashcards.

CRITICAL QUALITY RULES & GUARDRAILS:
1. ATOMIC CARDS: The Front must be a single, razor-sharp prompt, term, or question. Never combine two unrelated questions onto one card.
2. CONCISE HIGH-RETENTION BACKS: The Back MUST be 1 to 3 clear, punchy sentences OR a crisp markdown bullet list (max 3-4 bullets). No walls of text.
3. ACCURACY OVER ASSUMPTIONS: Ground all definitions strictly on the provided material. Do not hallucinate external claims. If material is ambiguous, preserve technical accuracy.
4. FORMULAS & NOTATION: Standardize all math, logic, or scientific formulas in standard LaTeX using inline $...$ or block $$...$$.
5. NO DUPLICATES: Deduplicate terms across sections.
6. TARGET COUNT: Produce approximately ${targetCount} high-yield cards (minimum ${Math.min(targetCount, 5)}, maximum ${Math.min(targetCount + 4, 35)}).
7. STUDY DEPTH EMPHASIS: ${depthGuidance}
${customInstructions ? `USER CUSTOM FOCUS: ${customInstructions}` : ''}
`;

    const parts: any[] = [];

    if (pdfBase64) {
      // Clean base64 header if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      });
    }

    const promptText = `Please analyze the provided study materials and extract ${targetCount} atomic, high-retention flashcards adhering to the schema.
${sourceText.trim() ? `\n\n--- STUDY NOTES CONTENT ---\n${sourceText.trim().slice(0, 80000)}` : ''}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'A concise title for this flashcard deck (3 to 6 words).',
            },
            summary: {
              type: Type.STRING,
              description: 'A 1-2 sentence executive overview of the source topic.',
            },
            cards: {
              type: Type.ARRAY,
              description: 'List of atomic flashcards.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: {
                    type: Type.STRING,
                    description: 'Unique identifier, e.g. card-1, card-2.',
                  },
                  front: {
                    type: Type.STRING,
                    description: 'Atomic prompt, term, or question.',
                  },
                  back: {
                    type: Type.STRING,
                    description: 'Concise answer (1-3 sentences or clean bullets). Math in LaTeX $...$.',
                  },
                  topic: {
                    type: Type.STRING,
                    description: 'Sub-topic or category for this card.',
                  },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '1 to 3 relevant tags for filtering and Anki export.',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Perceived recall difficulty: Easy, Medium, or Hard.',
                  },
                },
                required: ['id', 'front', 'back', 'topic', 'tags', 'difficulty'],
              },
            },
          },
          required: ['title', 'summary', 'cards'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: any) {
    const isKeyError = err?.message?.includes('API_KEY') || err?.message?.includes('KEY_INVALID');
    const message = isKeyError
      ? 'API credentials issue. Please ensure GEMINI_API_KEY is configured in Secrets.'
      : 'Unable to extract flashcards from the provided notes. Please ensure your notes contain text and try again.';
    return res.status(500).json({ error: message });
  }
});

// POST /api/regenerate-card
// Refines or rewrites an individual flashcard
app.post('/api/regenerate-card', async (req: Request, res: Response) => {
  try {
    const { card, instruction = 'make it more atomic and punchy', context = '' } = req.body;
    if (!card || !card.front) {
      return res.status(400).json({ error: 'Card data is required.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please regenerate and improve this flashcard based on this instruction: "${instruction}".
Original Card:
- Front: ${card.front}
- Back: ${card.back}
- Topic: ${card.topic || ''}
- Tags: ${(card.tags || []).join(', ')}
${context ? `Relevant context snippet: ${context.slice(0, 2000)}` : ''}

Ensure:
1. Front is single atomic question/concept.
2. Back is 1-3 sentences or tight bullet list. Math in LaTeX $...$.
3. Keep or refine tags and difficulty.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            front: { type: Type.STRING },
            back: { type: Type.STRING },
            topic: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING },
          },
          required: ['front', 'back', 'topic', 'tags', 'difficulty'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...card, ...parsed });
  } catch {
    return res.status(500).json({ error: 'Unable to refine this flashcard. Please try again.' });
  }
});

// Dev vs Prod Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
