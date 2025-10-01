'use server';
/**
 * @fileOverview Generates a random, helpful tip for gym beginners.
 *
 * - generateBeginnerTip - A function that returns a single workout tip.
 * - GenerateBeginnerTipOutput - The return type for the generateBeginnerTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBeginnerTipOutputSchema = z.object({
  tip: z.string().describe('Uma única dica concisa e acionável para um iniciante na academia. A dica deve ser sobre forma, consistência, nutrição ou mentalidade. A resposta deve ser em português do Brasil.'),
});
export type GenerateBeginnerTipOutput = z.infer<typeof GenerateBeginnerTipOutputSchema>;

export async function generateBeginnerTip(): Promise<GenerateBeginnerTipOutput> {
  return generateBeginnerTipFlow();
}

const prompt = ai.definePrompt({
  name: 'generateBeginnerTipPrompt',
  output: {schema: GenerateBeginnerTipOutputSchema},
  prompt: `Você é um personal trainer amigável e experiente. Gere uma única dica rápida, útil e encorajadora para alguém que está começando na academia. Concentre-se em um conceito de cada vez. Mantenha a dica curta e direta. A resposta deve ser em português do Brasil.`,
});

const generateBeginnerTipFlow = ai.defineFlow(
  {
    name: 'generateBeginnerTipFlow',
    outputSchema: GenerateBeginnerTipOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
