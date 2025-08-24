'use server';

/**
 * @fileOverview Transcribes audio input into text.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscriptionInput - The input type for the transcribeAudio function.
 * - TranscriptionOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const TranscriptionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscriptionInput = z.infer<typeof TranscriptionInputSchema>;

const TranscriptionOutputSchema = z.object({
  transcription: z
    .string()
    .describe('The transcribed text from the audio.'),
});
export type TranscriptionOutput = z.infer<typeof TranscriptionOutputSchema>;

export async function transcribeAudio(input: TranscriptionInput): Promise<TranscriptionOutput> {
  return transcribeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcriptionPrompt',
  input: {schema: TranscriptionInputSchema},
  output: {schema: TranscriptionOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are a highly accurate audio transcription service.

  Transcribe the following audio data into text. If there is only silence or the audio is unclear, return an empty string.

  Audio Data: {{media url=audioDataUri}}

  Provide only the transcribed text.
  `,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscriptionInputSchema,
    outputSchema: TranscriptionOutputSchema,
  },
  async input => {
    console.log('Transcribing audio chunk...');
    const {output} = await prompt(input);
    
    if (!output || !output.transcription) {
      console.log('Transcription result was empty.');
      return { transcription: '' };
    }
    
    console.log(`Transcription result: "${output.transcription}"`);
    return output;
  }
);
