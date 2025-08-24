'use server';

/**
 * @fileOverview Analyzes audio input to estimate the real-time emotional temperature of the conversation.
 *
 * - analyzeEmotion - A function that handles the emotion analysis process.
 * - EmotionAnalysisInput - The input type for the analyzeEmotion function.
 * - EmotionAnalysisOutput - The return type for the analyzeEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const EmotionAnalysisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  conversationContext: z
    .string()
    .optional()
    .describe('Context about the conversation, such as the topic and participants.'),
});
export type EmotionAnalysisInput = z.infer<typeof EmotionAnalysisInputSchema>;

const EmotionAnalysisOutputSchema = z.object({
  emotionalTemperature: z
    .string()
    .describe(
      'The estimated emotional temperature of the conversation (e.g., positive, negative, neutral, tense).'
    ),
  confidence: z
    .number()
    .describe('A confidence score (0-1) indicating the reliability of the emotion analysis.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the emotional temperature assessment.'),
});
export type EmotionAnalysisOutput = z.infer<typeof EmotionAnalysisOutputSchema>;

export async function analyzeEmotion(input: EmotionAnalysisInput): Promise<EmotionAnalysisOutput> {
  return analyzeEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emotionAnalysisPrompt',
  input: {schema: EmotionAnalysisInputSchema},
  output: {schema: EmotionAnalysisOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI expert in analyzing conversation audio to determine the emotional temperature.

  Analyze the provided audio data and conversation context (if available) to estimate the real-time emotional temperature.
  Provide a confidence score indicating the reliability of your analysis.
  Explain the reasoning behind your assessment.

  Audio Data: {{media url=audioDataUri}}
  Conversation Context: {{conversationContext}}

  Ensure the output is well-formatted and easy to understand.
  `,
});

const analyzeEmotionFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionFlow',
    inputSchema: EmotionAnalysisInputSchema,
    outputSchema: EmotionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
