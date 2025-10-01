import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAICompatible } from '@genkit-ai/compat-oai';

const aiPlatform = process.env.AI_PLATFORM || 'gemini';

const getAIConfig = () => {
  if (aiPlatform === 'openai') {
    return {
      plugins: [openAICompatible({
        name: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
      })],
      model: 'openai/gpt-4o-mini', // Modelo mais barato da OpenAI que suporta as funcionalidades necessárias
    };
  } else {
    return {
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-flash',
    };
  }
};

const config = getAIConfig();

export const ai = genkit({
  plugins: config.plugins,
  model: config.model,
});
