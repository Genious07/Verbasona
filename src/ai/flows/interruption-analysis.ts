'use server';

/**
 * @fileOverview Analyzes interruption patterns in a conversation to compare how often the user interrupts others versus being interrupted.
 *
 * - analyzeInterruptions - A function that handles the interruption analysis process.
 * - InterruptionAnalysisInput - The input type for the analyzeInterruptions function.
 * - InterruptionAnalysisOutput - The return type for the analyzeInterruptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterruptionAnalysisInputSchema = z.object({
  conversationText: z
    .string()
    .optional()
    .describe('The full conversation text to analyze.'),
  userSpeakingTime: z
    .number()
    .describe('The amount of time the user spent speaking in seconds.'),
  totalSpeakingTime: z
    .number()
    .describe('The total speaking time of all participants in seconds.'),
  userInterruptionCount: z
    .number()
    .describe('The number of times the user interrupted others.'),
  otherInterruptionCount: z
    .number()
    .describe('The number of times the user was interrupted by others.'),
});
export type InterruptionAnalysisInput = z.infer<typeof InterruptionAnalysisInputSchema>;

const InterruptionAnalysisOutputSchema = z.object({
  interruptionAnalysis: z
    .string()
    .describe(
      'An analysis of the user interruption patterns, comparing how often the user interrupts others versus being interrupted, and suggestions for improvement.'
    ),
});
export type InterruptionAnalysisOutput = z.infer<typeof InterruptionAnalysisOutputSchema>;

export async function analyzeInterruptions(
  input: InterruptionAnalysisInput
): Promise<InterruptionAnalysisOutput> {
  return interruptionAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interruptionAnalysisPrompt',
  input: {schema: InterruptionAnalysisInputSchema},
  output: {schema: InterruptionAnalysisOutputSchema},
  prompt: `You are an expert communication analyst. Based on the cumulative data below, provide a concise, actionable suggestion for the user.

  - User Speaking Time: a total of {{{userSpeakingTime}}} seconds
  - Total Speaking Time for Everyone: {{{totalSpeakingTime}}} seconds
  - Times User Interrupted Others: {{{userInterruptionCount}}}
  - Times User Was Interrupted: {{{otherInterruptionCount}}}

  Analyze the data and provide a single, insightful tip to help the user improve their communication style. Focus on the most significant pattern you see. For example, if they interrupt a lot, give a tip on that. If they get interrupted, give a tip for that. If the balance is good, provide positive reinforcement.
  `,
});

const interruptionAnalysisFlow = ai.defineFlow(
  {
    name: 'interruptionAnalysisFlow',
    inputSchema: InterruptionAnalysisInputSchema,
    outputSchema: InterruptionAnalysisOutputSchema,
  },
  async input => {
    // This flow is now more about providing coaching based on stats
    // than analyzing text, since we don't have transcription yet.
    if (input.totalSpeakingTime === 0) {
      return { interruptionAnalysis: "Start speaking to get feedback on your communication style." };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
