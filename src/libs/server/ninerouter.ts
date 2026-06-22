import OpenAI from 'openai';

export function getNineRouterClient() {
  const baseURL = process.env.NINEROUTER_URL || 'http://localhost:20128/v1';
  const apiKey = process.env.NINEROUTER_KEY || 'sk-dummy';

  if (!process.env.NINEROUTER_URL) {
    console.warn('NINEROUTER_URL is not set, falling back to http://localhost:20128/v1');
  }

  return new OpenAI({
    baseURL,
    apiKey,
  });
}
