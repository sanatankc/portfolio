import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { env } from '@/app/env';


const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY
})

const themeSchema = z.object({
  name: z.string(),
  colors: z.object({
    background: z.string(),
    foreground: z.string(),
    border: z.string(),
  }),
  window: z.object({
    background: z.string(),
    foreground: z.string(),
    closeButton: z.string(),
    border: z.string(),
  }),
});

const examples = [
  {
    name: 'dark',
    colors: {
      background: '#000000',
      foreground: '#00ff00',
      border: '#00ff00',
    },
    window: {
      background: '#333333',
      foreground: '#ffffff',
      closeButton: '#ff6666',
      border: '#00ff00',
    },
  },
  {
    name: 'solarized',
    colors: {
      background: '#fdf6e3',
      foreground: '#657b83',
      border: '#073642',
    },
    window: {
      background: '#eee8d5',
      foreground: '#002b36',
      closeButton: '#dc322f',
      border: '#073642',
    },
  },
  {
    name: 'default',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      border: '#000000',
    },
    window: {
      background: '#c0c0c0',
      foreground: '#000000',
      closeButton: '#ff0000',
      border: '#000000',
    },
  },
];

export async function POST(req: NextRequest) {
  const { prompt, refine } = await req.json();

  let systemPrompt = `You are a CLI theme generator. Given a prompt, output a JSON object for a CLI theme. Here are some examples:\n${JSON.stringify(examples, null, 2)}\n`;
  if (refine) {
    systemPrompt += `\nRefine the theme as follows: ${refine}`;
  }

  const result = await generateObject({
    model: google('gemini-2.5-flash'),
    schema: themeSchema,
    prompt: `${systemPrompt}\nPrompt: ${prompt}\nTheme:`
  });

  console.log("result...", result)

  if ('error' in result && result.error) {
    const errorMsg = typeof result.error === 'object' && 'message' in result.error ? result.error.message : String(result.error);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
  return NextResponse.json(result.object);
} 