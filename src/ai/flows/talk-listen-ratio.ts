'use server';

/**
 * @fileOverview Calculates and visualizes the talk/listen ratio during a conversation.
 *
 * - calculateTalkListenRatio - A function that calculates the talk/listen ratio.
 * - TalkListenRatioInput - The input type for the calculateTalkListenRatio function.
 * - TalkListenRatioOutput - The return type for the calculateTalkListenRatio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TalkListenRatioInputSchema = z.object({
  conversationAudioDataUri: z
    .string()
    .describe(
      "The conversation audio data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  speakerDiarizationData: z
    .string()
    .describe('The diarization data containing the speakers and their timings.'),
});
export type TalkListenRatioInput = z.infer<typeof TalkListenRatioInputSchema>;

const TalkListenRatioOutputSchema = z.object({
  talkListenRatio: z
    .number()
    .describe(
      'The calculated talk/listen ratio, where values > 1 indicate more talking than listening.'
    ),
  speakerTimings: z
    .record(z.string(), z.number())
    .describe('The speaking time of each speaker'),
});
export type TalkListenRatioOutput = z.infer<typeof TalkListenRatioOutputSchema>;

export async function calculateTalkListenRatio(
  input: TalkListenRatioInput
): Promise<TalkListenRatioOutput> {
  return calculateTalkListenRatioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'talkListenRatioPrompt',
  input: {schema: TalkListenRatioInputSchema},
  output: {schema: TalkListenRatioOutputSchema},
  prompt: `You are an expert in analyzing conversational dynamics.

  You are given the audio recording of a conversation and its speaker diarization data.
  Your goal is to calculate the talk/listen ratio for the user and provide insights into their conversational behavior.

  Here is the audio data of the conversation: {{media url=conversationAudioDataUri}}
  Here is the speaker diarization data: {{{speakerDiarizationData}}}

  Calculate the talk/listen ratio as the total speaking time of the user divided by the total speaking time of all other participants.
  Provide the calculated ratio, as well as the timings for each speaker.
`,
});

const calculateTalkListenRatioFlow = ai.defineFlow(
  {
    name: 'calculateTalkListenRatioFlow',
    inputSchema: TalkListenRatioInputSchema,
    outputSchema: TalkListenRatioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
