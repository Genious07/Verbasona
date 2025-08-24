'use server';
import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';

export const ai = genkit({
  plugins: [
    groq({apiKey: process.env.GROQ_API_KEY}),
  ],
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
