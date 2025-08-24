'use server';

/**
 * @fileOverview Analyzes a chunk of conversation audio for multiple metrics in a single flow.
 *
 * - analyzeConversationChunk - A function that handles the combined analysis process.
 * - ConversationAnalysisInput - The input type for the analyzeConversationChunk function.
 * - ConversationAnalysisOutput - The return type for the analyzeConversationChunk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const ConversationAnalysisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A 5-second audio chunk as a data URI, including a MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cumulativeAnalysis: z.object({
      userSpeakingTime: z.number().describe("The user's cumulative speaking time in seconds."),
      totalSpeakingTime: z.number().describe("The total cumulative speaking time for all participants in seconds."),
      userInterruptionCount: z.number().describe("The user's cumulative interruption count."),
      otherInterruptionCount: z.number().describe("The cumulative count of times the user was interrupted."),
  }).describe("The cumulative analysis data from the session so far.")
});
export type ConversationAnalysisInput = z.infer<typeof ConversationAnalysisInputSchema>;

const ConversationAnalysisOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio chunk.'),
  emotionalTemperature: z.enum(['positive', 'negative', 'neutral', 'tense']).describe('The estimated emotional temperature of the audio chunk.'),
  speakerTimings: z.object({
    user: z.number().describe('The speaking time in seconds of the user in this chunk.'),
    others: z.number().describe('The speaking time in seconds of others in this chunk.'),
  }),
  interruptionAnalysis: z.string().describe('An updated, concise, and actionable suggestion for the user based on the new cumulative data.'),
});
export type ConversationAnalysisOutput = z.infer<typeof ConversationAnalysisOutputSchema>;

export async function analyzeConversationChunk(input: ConversationAnalysisInput): Promise<ConversationAnalysisOutput> {
  return conversationAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationAnalysisPrompt',
  input: {schema: ConversationAnalysisInputSchema},
  output: {schema: ConversationAnalysisOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are a real-time conversation analyst. You will receive a 5-second audio chunk and cumulative data from the conversation so far. Your task is to perform four analyses and return the results in a single JSON object.

  Audio Chunk: {{media url=audioDataUri}}
  
  Cumulative Data for Context:
  - User's Total Speaking Time: {{{cumulativeAnalysis.userSpeakingTime}}} seconds
  - Everyone's Total Speaking Time: {{{cumulativeAnalysis.totalSpeakingTime}}} seconds
  - Times User Interrupted Others: {{{cumulativeAnalysis.userInterruptionCount}}}
  - Times User Was Interrupted: {{{cumulativeAnalysis.otherInterruptionCount}}}

  Perform the following four tasks based on the provided 5-second audio chunk:

  1.  **Transcription**: Transcribe the audio. If it's unclear or silent, return an empty string.

  2.  **Emotion Analysis**: Analyze the emotional tone. Classify it as 'positive', 'negative', 'neutral', or 'tense'.

  3.  **Speaker Timings (Diarization)**: Estimate the speaking time for the "user" (primary speaker) and all "others" within this 5-second chunk.
      - If only one person speaks, assume it's the 'user'. Assign all time to 'user' and 0 to 'others'.
      - If multiple people speak, estimate the split.
      - If there's only silence, both 'user' and 'others' are 0.
      - The sum of 'user' and 'others' must not exceed 5 seconds.

  4.  **Interruption Analysis & Coaching**: Based on the *updated* cumulative data (including this chunk), provide a *single*, concise, actionable coaching tip for the user. The tip should focus on the most significant pattern you observe (e.g., interrupting too much, being interrupted, or maintaining a good balance). If total speaking time is zero, the tip should be "Start speaking to get feedback."

  Return a single, well-formatted JSON object with the results.
  `,
});


const conversationAnalysisFlow = ai.defineFlow(
  {
    name: 'conversationAnalysisFlow',
    inputSchema: ConversationAnalysisInputSchema,
    outputSchema: ConversationAnalysisOutputSchema,
  },
  async (input) => {

    const { output } = await prompt(input);

    if (!output) {
      // Fallback in case the model returns nothing
      return {
        transcription: '',
        emotionalTemperature: 'neutral',
        speakerTimings: { user: 0, others: 0 },
        interruptionAnalysis: 'Analysis is currently unavailable.'
      };
    }
    
    // Ensure all parts of the output are well-defined to prevent downstream errors.
    return {
        transcription: output.transcription || '',
        emotionalTemperature: output.emotionalTemperature || 'neutral',
        speakerTimings: output.speakerTimings || { user: 0, others: 0 },
        interruptionAnalysis: output.interruptionAnalysis || 'Keep up the balanced conversation!'
    };
  }
);
