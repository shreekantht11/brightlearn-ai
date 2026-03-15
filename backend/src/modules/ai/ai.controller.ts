import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { env } from '../../config/env';

const hfAxios = axios.create({
  baseURL: 'https://router.huggingface.co/v1',
  headers: {
    Authorization: `Bearer ${env.HF_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const defaultModel = env.HF_MODEL;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data || error.message;
  }
  return error instanceof Error ? error.message : 'Unknown AI error';
};

const completeWithHuggingFace = async (systemPrompt: string, userPrompt: string) => {
  if (!env.HF_API_KEY) {
    throw new Error('HF_API_KEY is missing in backend/.env. Add a valid Hugging Face token and restart the backend.');
  }

  const response = await hfAxios.post('/chat/completions', {
    model: defaultModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 400,
    temperature: 0.4
  });

  return response.data?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
};

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const route = context?.route ? `Current route: ${context.route}` : '';
    const courseTitle = context?.courseTitle ? `Current course: ${context.courseTitle}` : '';
    const lessonTitle = context?.lessonTitle ? `Current lesson: ${context.lessonTitle}` : '';
    const pageTitle = context?.pageTitle ? `Current page heading: ${context.pageTitle}` : '';

    const systemPrompt = `You are BrightLearn's AI assistant inside an online learning platform.
You help users with:
- understanding lessons and concepts
- choosing courses
- navigating the app
- solving confusion about enrollments, learning flow, and practice

Rules:
- answer clearly, warmly, and concisely
- if the question is about the current page or lesson, use the provided context
- if the user seems confused, suggest the next practical step in the app
- do not invent unavailable account-specific data`;

    const userPrompt = `Context:
${route}
${pageTitle}
${courseTitle}
${lessonTitle}

User question:
${message}`;

    const aiMessage = await completeWithHuggingFace(systemPrompt, userPrompt);
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error('AI Error:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
};

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required for summarization' });

    const summary = await completeWithHuggingFace(
      'You are a study assistant. Summarize lesson content into short, high-signal bullet points.',
      content
    );

    res.json({ summary });
  } catch (error) {
    console.error('AI Error:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

export const quiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required to generate a quiz' });

    const output = await completeWithHuggingFace(
      'You generate exactly 3 multiple-choice quiz questions and return valid JSON only.',
      `Generate 3 multiple-choice quiz questions based on the following content.
Return a JSON array of objects with keys: "question", "options", and "answer".

Content:
${content}`
    );

    let parsedQuiz = [];
    try {
      const match = output.match(/\[.*\]/s);
      parsedQuiz = match ? JSON.parse(match[0]) : JSON.parse(output);
    } catch (parseErr) {
      console.warn('Failed to parse quiz JSON from AI model. Returning raw text.', output);
      parsedQuiz = [{ rawResponse: output }];
    }

    res.json({ quiz: parsedQuiz });
  } catch (error) {
    console.error('AI Error:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};
