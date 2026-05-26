import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BASE_PROMPT, LANDING_PAGE_PROMPT, DASHBOARD_PROMPT, MOBILE_APP_PROMPT } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { image, context, framework, styleFramework, model: requestedModel } = await req.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Missing design image' },
        { status: 400 }
      );
    }

    const finalModel = requestedModel || 'gemini-2.5-flash';
    let contentText = '';

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

    if (finalModel.startsWith('claude-')) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Claude API key is not configured. Please add ANTHROPIC_API_KEY to your .env.local file to use Claude models.',
          },
          { status: 400 }
        );
      }

      let claudeModelId = 'claude-3-5-sonnet-20241022';
      if (finalModel === 'claude-3-5-haiku') {
        claudeModelId = 'claude-3-5-haiku-20241022';
      }

      console.log(`Routing request to Anthropic Claude model: ${claudeModelId}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: claudeModelId,
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: promptText,
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData?.error?.message || `Anthropic API error: ${response.status}`);
      }

      contentText = responseData?.content?.[0]?.text || '';
    } else {
      // Gemini Model execution with robust 503 fallback layers
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

      const genAI = new GoogleGenerativeAI(apiKey);

      // List of fallback models to try if primary model fails with 503
      const geminiModelsToTry = [finalModel];
      if (finalModel === 'gemini-2.5-flash') {
        geminiModelsToTry.push('gemini-1.5-flash', 'gemini-2.5-pro');
      } else if (finalModel === 'gemini-2.5-pro') {
        geminiModelsToTry.push('gemini-1.5-pro', 'gemini-2.5-flash');
      }

      let geminiError: any = null;
      for (const currentGeminiModel of geminiModelsToTry) {
        try {
          console.log(`Attempting generation with Gemini model: ${currentGeminiModel}`);
          const model = genAI.getGenerativeModel({ model: currentGeminiModel });
          const result = await model.generateContent([
            promptText,
            {
              inlineData: {
                data: base64Data,
                mimeType: mediaType,
              },
            },
          ]);
          contentText = result.response.text();
          geminiError = null;
          console.log(`Successfully generated using Gemini: ${currentGeminiModel}`);
          break; // Success! Exit fallback loop
        } catch (err: any) {
          console.warn(`Gemini model ${currentGeminiModel} failed:`, err);
          geminiError = err;
          // Continue to next fallback model
        }
      }

      if (geminiError) {
        throw geminiError;
      }
    }

    return NextResponse.json({
      success: true,
      rawOutput: contentText,
    });
  } catch (error: unknown) {
    console.error('API Generation Error:', error);
    const errObj = error as Error | null;
    return NextResponse.json(
      {
        success: false,
        error: errObj?.message || 'An error occurred during code generation with the selected model. Please try again.',
      },
      { status: 500 }
    );
  }
}
