import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {groq} from '@genkit-ai/groq';

export const ai = genkit({
  plugins: [googleAI(), groq()],
  model: 'groq/gemma-7b-it',
});
