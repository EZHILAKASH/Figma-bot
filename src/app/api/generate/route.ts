import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BASE_PROMPT, LANDING_PAGE_PROMPT, DASHBOARD_PROMPT, MOBILE_APP_PROMPT } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { image, context, framework, styleFramework } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing design image' },
        { status: 400 }
      );
    }

    // Check if the API key is set dynamically inside the request handler
    console.log("Safe Loaded Env Keys:", Object.keys(process.env).filter(k => k.toUpperCase().includes("KEY") || k.toUpperCase().includes("GEMINI")));
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    // Initialize the Google Generative AI client dynamically
    const genAI = new GoogleGenerativeAI(apiKey);

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

    // Initialize Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Execute content generation call with multimodal input (text prompt + image)
    const result = await model.generateContent([
      promptText,
      {
        inlineData: {
          data: base64Data,
          mimeType: mediaType,
        },
      },
    ]);

    const contentText = result.response.text();

    return NextResponse.json({
      success: true,
      rawOutput: contentText,
    });
  } catch (error: any) {
    console.error('Gemini API Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during code generation with Gemini.',
      },
      { status: 500 }
    );
  }
}
