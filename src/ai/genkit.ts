'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
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
