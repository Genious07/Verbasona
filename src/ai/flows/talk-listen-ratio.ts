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

  You are given an audio recording of a conversation. Your goal is to determine the speaking time for the "user" (the primary speaker) and all "others".
  Assume the audio chunk is 5 seconds long.
  If there's only one person speaking, assume it's the user.
  If there are multiple people, estimate the split.
  If there is silence, both should be 0.

  Here is the audio data of the conversation: {{media url=conversationAudioDataUri}}

  Provide the speaking time for the 'user' and 'others' in the speakerTimings object. The sum of timings should not exceed 5 seconds.
  Calculate the talkListenRatio as the total speaking time of the user divided by the total speaking time of all other participants. If others' time is 0, the ratio should be 1.
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
    const userTime = Number(output.speakerTimings['user']) || 0;
    const othersTime = Number(output.speakerTimings['others']) || 0;

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
