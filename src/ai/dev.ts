'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/emotion-analysis.ts';
import '@/ai/flows/talk-listen-ratio.ts';
import '@/ai/flows/interruption-analysis.ts';
import '@/ai/flows/transcription.ts';
