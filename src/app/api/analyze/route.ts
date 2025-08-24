import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analysisInputSchema = z.object({
  transcription: z.string(),
});

const analysisOutputSchema = z.object({
    talkListenRatio: z.object({
        user: z.number().describe("The user's speaking time in seconds."),
        others: z.number().describe("The speaking time of others in seconds."),
    }),
    interruptions: z.object({
        user: z.number().describe("The number of times the user interrupted."),
        others: z.number().describe("The number of times the user was interrupted."),
    }),
    analysis: z.string().describe('A concise and actionable suggestion for the user.'),
});


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcription } = analysisInputSchema.parse(body);

    if (!transcription.trim()) {
      return NextResponse.json({
        talkListenRatio: { user: 0, others: 0 },
        interruptions: { user: 0, others: 0 },
        analysis: "Start speaking to get feedback.",
      });
    }

    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `You are a conversation analyst. Analyze the following transcription and provide metrics in JSON format. The "user" is the primary speaker. Identify interruptions and estimate the talk/listen ratio. Provide a concise, actionable coaching tip. The response should be a JSON object matching this schema: ${JSON.stringify(analysisOutputSchema)}`,
            },
            {
                role: "user",
                content: `Transcription: "${transcription}"`,
            },
        ],
        model: "llama3-8b-8192",
        temperature: 0.2,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in analysis API:', error);
    return NextResponse.json({ error: 'Failed to analyze transcription' }, { status: 500 });
  }
}