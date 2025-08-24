import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkitPlugin, groqModel} from 'genkitx-groq';

export const ai = genkit({
  plugins: [googleAI(), genkitPlugin({apiKey: process.env.GROQ_API_KEY})],
  model: 'groq/gemma-7b-it',
  genericAuthPolicy: {
    // TODO: This should be configured to your needs.
    // see: https://firebase.google.com/docs/genkit/flow-auth#self-hosted
    'localhost': [
      {
        'path': '/**',
        'allow': 'public',
      },
    ],
  },
});
