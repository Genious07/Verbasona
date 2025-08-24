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
  otherInterruptionCount:
    z.number().describe('The number of times the user was interrupted by others.'),
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
  prompt: `You are an expert communication analyst. Analyze the following conversation data to determine the user's interruption patterns and suggest improvements.

Conversation Text: {{{conversationText}}}
User Speaking Time: {{{userSpeakingTime}}} seconds
Total Speaking Time: {{{totalSpeakingTime}}} seconds
User Interruption Count: {{{userInterruptionCount}}}
Other Interruption Count: {{{otherInterruptionCount}}}

Analyze the data and provide a concise analysis of the user's interruption behavior, comparing how often the user interrupts others versus being interrupted. Include specific suggestions for improving their communication style based on this analysis.
`,
});

const interruptionAnalysisFlow = ai.defineFlow(
  {
    name: 'interruptionAnalysisFlow',
    inputSchema: InterruptionAnalysisInputSchema,
    outputSchema: InterruptionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
