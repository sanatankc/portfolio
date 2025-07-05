import { NextRequest } from 'next/server';
import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { env } from '../../env';

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY
});

// Define tools using Zod schemas
const getCurrentTimeTool = tool({
  description: 'Get the current date and time',
  parameters: z.object({}),
  execute: async () => {
    return new Date().toLocaleString();
  }
});

const calculateTool = tool({
  description: 'Perform mathematical calculations. Supports basic operations: +, -, *, /, (), and common math functions.',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to evaluate (e.g., "2 + 3 * 4", "(5 + 3) / 2")')
  }),
  execute: async ({ expression }: { expression: string }) => {
    try {
      // Basic safety check - only allow basic math operations and common functions
      const safeExpression = expression.replace(/[^0-9+\-*/().\s,]/g, '');
      if (safeExpression !== expression) {
        return "Error: Only basic math operations are allowed";
      }
      
      // Additional safety: check for potentially dangerous patterns
      if (safeExpression.includes('eval') || safeExpression.includes('Function') || safeExpression.includes('constructor')) {
        return "Error: Invalid expression";
      }
      
      const result = eval(safeExpression);
      return `${expression} = ${result}`;
    } catch {
      return "Error: Invalid calculation";
    }
  }
});

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, messages = [] }: { message: string; messages?: ChatMessage[] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 });
    }

    // Convert messages to AI SDK format
    const aiMessages = messages.map((msg: ChatMessage) => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    // Add the current message
    aiMessages.push({
      role: 'user' as const,
      content: message
    });

    const { textStream } = streamText({
      model: google('gemini-2.0-flash-exp'),
      messages: aiMessages,
      tools: {
        getCurrentTime: getCurrentTimeTool,
        calculate: calculateTool
      },
      system: `You are a helpful AI assistant. You can help with:
- General questions and conversations
- Mathematical calculations (use the calculate tool)
- Getting current time (use the getCurrentTime tool)
- Programming and technical questions
- Creative writing and brainstorming

Be friendly, helpful, and concise. When you need to perform calculations or get the current time, use the appropriate tools.`,
      maxTokens: 1000,
      maxSteps: 5,
      temperature: 0.7,
    });

    const loggingStream = new TransformStream({
      transform(chunk, controller) {
        // Handle both string and binary chunks
        const text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
        console.log('Streaming chunk:', text);
        // Pass the chunk through
        controller.enqueue(chunk);
      }
    });

    // Return the streaming response
    return new Response(textStream.pipeThrough(loggingStream), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 