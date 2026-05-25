import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { BASE_PROMPT, LANDING_PAGE_PROMPT, DASHBOARD_PROMPT, MOBILE_APP_PROMPT } from '@/lib/prompts';

// Initialize the Anthropic client using the server-side environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { image, context, framework, styleFramework } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing design image' },
        { status: 400 }
      );
    }

    // Check if the API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    // Parse base64 image data and determine media type
    let mediaType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/data:([^;]+);base64/);
      if (match) {
        mediaType = match[1];
      }
      base64Data = parts[1];
    }

    // Map context types to prompt variants
    let selectedPrompt = BASE_PROMPT;
    if (context === 'landing_page') {
      selectedPrompt = LANDING_PAGE_PROMPT;
    } else if (context === 'dashboard') {
      selectedPrompt = DASHBOARD_PROMPT;
    } else if (context === 'mobile_app') {
      selectedPrompt = MOBILE_APP_PROMPT;
    }

    // Append user-custom context if they specified details
    let promptText = selectedPrompt;
    if (framework || styleFramework) {
      promptText += `\n\n## Custom Preferences:\n`;
      if (framework) promptText += `- Component Library/Framework: ${framework}\n`;
      if (styleFramework) promptText += `- Styling: ${styleFramework}\n`;
    }

    // Execute vision model generation call
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as any,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: promptText,
            },
          ],
        },
      ],
    });

    const contentText = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      success: true,
      rawOutput: contentText,
    });
  } catch (error: any) {
    console.error('Claude API Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during code generation with Claude.',
      },
      { status: 500 }
    );
  }
}
