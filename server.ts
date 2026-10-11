import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper for Gemini AI instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// AI Generation endpoint
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured',
        isMockFallback: true,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.json({
      text: response.text || '',
      success: true,
    });
  } catch (error: any) {
    console.error('Error generating with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate content with AI',
      success: false,
    });
  }
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured',
        isMockFallback: true,
      });
    }

    // Convert messages
    const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
    const conversationHistory = (messages || [])
      .slice(0, -1)
      .map((m: any) => `${m.role === 'user' ? 'Người học' : 'Trợ lý AI'}: ${m.content}`)
      .join('\n');

    const prompt = conversationHistory
      ? `Lịch sử hội thoại trước đó:\n${conversationHistory}\n\nNgười học: ${lastUserMessage}`
      : lastUserMessage;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.json({
      text: response.text || '',
      success: true,
    });
  } catch (error: any) {
    console.error('Error in chat with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message',
      success: false,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
