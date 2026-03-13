import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { env } from '../../config/env';

const hfAxios = axios.create({
  baseURL: 'https://api-inference.huggingface.co/models',
  headers: {
    Authorization: `Bearer ${env.HF_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const defaultModel = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const prompt = `[INST] You are an AI tutor for an online Learning Management System. Answer the student's question clearly and concisely. Question: ${message} [/INST]`;

    const response = await hfAxios.post(`/${defaultModel}`, {
      inputs: prompt,
      parameters: { max_new_tokens: 250, return_full_text: false }
    });

    const aiMessage = response.data?.[0]?.generated_text?.trim() || 'No response generated.';
    res.json({ reply: aiMessage });
  } catch (error: any) {
    console.error('AI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
};

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required for summarization' });

    const prompt = `[INST] Summarize the following lesson content into key bullet points:
    Content: ${content} [/INST]`;

    const response = await hfAxios.post(`/${defaultModel}`, {
      inputs: prompt,
      parameters: { max_new_tokens: 300, return_full_text: false }
    });

    const summary = response.data?.[0]?.generated_text?.trim() || 'No summary generated.';
    res.json({ summary });
  } catch (error: any) {
    console.error('AI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

export const quiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required to generate a quiz' });

    const prompt = `[INST] Generate 3 multiple-choice quiz questions based on the following content. Return the result in a JSON format as an array of objects with keys: "question", "options" (an array of 4 choices), and "answer" (the correct choice string). Content: ${content} [/INST]`;

    const response = await hfAxios.post(`/${defaultModel}`, {
      inputs: prompt,
      parameters: { max_new_tokens: 500, return_full_text: false }
    });

    const output = response.data?.[0]?.generated_text?.trim() || '[]';
    
    // Attempt to parse JSON strictly or lightly if necessary
    let parsedQuiz = [];
    try {
      // Find JSON array in the text in case there is text before/after
      const match = output.match(/\[.*\]/s);
      parsedQuiz = match ? JSON.parse(match[0]) : JSON.parse(output);
    } catch (parseErr) {
      console.warn('Failed to parse quiz JSON from AI model. Returning raw text.', output);
      parsedQuiz = [{ rawResponse: output }];
    }

    res.json({ quiz: parsedQuiz });
  } catch (error: any) {
    console.error('AI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};
