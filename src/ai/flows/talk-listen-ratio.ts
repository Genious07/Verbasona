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
import {googleAI} from '@genkit-ai/googleai';

const TalkListenRatioInputSchema = z.object({
  conversationAudioDataUri: z
    .string()
    .describe(
      "The conversation audio data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  speakerDiarizationData: z
    .string()
    .optional()
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
    .object({
      user: z.number().describe('The speaking time in seconds of the user.'),
      others: z.number().describe('The speaking time in seconds of others.'),
    })
    .describe('The speaking time in seconds of each speaker (e.g., user, others)'),
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
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert in analyzing conversational dynamics.

  You are given a 5-second audio recording of a conversation. Your goal is to determine the speaking time for the "user" (the primary speaker) and all "others".

  Follow these rules:
  1. If only one person is speaking, assume it's the 'user'. Assign all speaking time to 'user' and 0 to 'others'.
  2. If multiple people are speaking, estimate the time split between 'user' and 'others'.
  3. If there is only silence, 'user' and 'others' should both be 0.
  4. The sum of 'user' and 'others' speaking time must not exceed 5 seconds.
  5. Calculate the talkListenRatio as user / others. If others is 0, the ratio is 1.

  Here is the audio data: {{media url=conversationAudioDataUri}}

  Provide the output in the format specified.
`,
});

const calculateTalkListenRatioFlow = ai.defineFlow(
  {
    name: 'calculateTalkListenRatioFlow',
    inputSchema: TalkListenRatioInputSchema,
    outputSchema: TalkListenRatioOutputSchema,
  },
  async input => {
    // For now, since true speaker diarization is not implemented,
    // we'll mock the logic inside the flow based on a simple prompt.
    // In a real scenario, we would use a speaker diarization library here.
    const {output} = await prompt(input);

    if (!output) {
        // Handle cases where the model doesn't return a valid output
        return {
            talkListenRatio: 1,
            speakerTimings: { user: 2.5, others: 2.5 } // Default to a balanced split
        };
    }

    // Ensure timings are numbers and default to 0 if not
    const userTime = Number(output.speakerTimings.user) || 0;
    const othersTime = Number(output.speakerTimings.others) || 0;

    // Recalculate ratio to be safe
    const ratio = othersTime > 0 ? userTime / othersTime : 1;

    return {
        talkListenRatio: ratio,
        speakerTimings: {
            user: userTime,
            others: othersTime
        }
    };
  }
);
