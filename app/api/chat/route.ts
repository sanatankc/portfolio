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

const wallpaperTool = tool({
  description: 'Search for wallpaper images based on a query. Returns a collection of high-quality images that can be used as wallpapers. Add wallpaper prefix if needed like "pastel wallpaper"',
  parameters: z.object({
    query: z.string().describe('The search term for wallpapers (e.g., "nature", "mountains", "abstract", "space")')
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      // Call the internal search-images API
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}/api/search-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          page: 1,
          per_page: 10
        })
      });

      if (!response.ok) {
        return `Error searching for wallpapers: ${response.statusText}`;
      }

      const data = await response.json();
      
      if (data.error) {
        return `Error: ${data.error}`;
      }

      return {
        query: query,
        total: data.total,
        images: data.results.map((image: { id: string; description: string | null; alt_description: string | null; urls: { regular: string; small: string; thumb: string }; user: { name: string; username: string }; likes: number; color: string }) => ({
          id: image.id,
          description: image.description || image.alt_description || 'Wallpaper image',
          urls: {
            regular: image.urls.regular,
            small: image.urls.small,
            thumb: image.urls.thumb
          },
          user: {
            name: image.user.name,
            username: image.user.username
          },
          likes: image.likes,
          color: image.color
        }))
      };
    } catch (error) {
      console.error('Wallpaper search error:', error);
      return "Error: Failed to search for wallpapers. Please try again.";
    }
  }
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 });
    }

    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      messages,
      tools: {
        getCurrentTime: getCurrentTimeTool,
        calculate: calculateTool,
        wallpaper: wallpaperTool
      },
      system: `You are a helpful AI assistant. You can help with:
- General questions and conversations
- Mathematical calculations (use the calculate tool)
- Getting current time (use the getCurrentTime tool)
- Finding & setting wallpaper images (use the wallpaper tool)
- Programming and technical questions
- Creative writing and brainstorming

NEVER REPLY ON YOUR CAPABILITIES, FOR THINGS LIKE ADD ETC. WE HAVE PROVIDED THE TOOLS FOR THAT.
ALWAYS CALL THEM INSTEAD.

When users ask for wallpapers, backgrounds, or want to change their desktop/phone wallpaper, use the wallpaper tool to search for relevant images. Common wallpaper categories include: nature, abstract, space, mountains, ocean, city, minimalist, dark, etc.

Be friendly, helpful, and concise. When you need to perform calculations, get the current time, or search for wallpapers, use the appropriate tools.`,
      maxTokens: 1000,
      maxSteps: 5,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 