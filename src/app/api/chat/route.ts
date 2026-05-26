import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { messages, code, model: requestedModel } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid chat messages' },
        { status: 400 }
      );
    }

    // Filter out the static welcome message if the conversation starts with an assistant greeting,
    // since both Gemini startChat and Claude Messages API strictly require the first message to be from 'user'.
    let activeMessages = [...messages];
    if (activeMessages.length > 0 && activeMessages[0].role === 'assistant') {
      activeMessages.shift();
    }

    const finalModel = requestedModel || 'gemini-2.5-flash';
    const activeCode = code || '';

    // System instruction defining chatbot's role, rules, and presenting the sandbox code context
    const systemPrompt = `You are FrameFlow's world-class AI design assistant, an expert UI/UX developer, and multi-language compiler consultant.
Your role is to help the user clear UI design doubts, build/write functional code, translate sandbox styles into any requested programming language, and suggest the simplest layout strategies to achieve visual goals.

## Core Directives & Styling Philosophy:
1. **The Simplest Way first**: Always suggest and highlight the absolute *simplest* way to achieve a layout or alignment goal. Avoid unnecessary wrappers, bloated classes, or over-engineered CSS. Explain *why* a specific code element (e.g. "flex", "grid" or platform-equivalents) is the cleanest approach.
2. **Cross-Language Code Conversion**: If the user asks to get the code or translate the screen into **any computer programming language or framework** (such as React, Vue SFC, Svelte, Angular, Vanilla HTML/CSS, Flutter, React Native, iOS SwiftUI, Android Kotlin/Jetpack Compose, Swift, etc.), immediately convert the active sandbox component code into high-fidelity, complete, compile-ready code in that requested language!
3. **Design Doubts Clearing**: Provide clear, educational explanations about visual layout decisions, typography scales, accessibility rules (like WCAG contrast levels), color theory, and mobile design safe zones.
4. **Write/Enhance Sandbox Code**: By default, code additions or sandbox tweaks should be written in React TypeScript & Tailwind CSS. But if requested otherwise, write in the user's preferred language.

## Active Sandbox Context:
The user is currently viewing/editing a React component in their visual sandbox. Here is the exact component code currently loaded:
\`\`\`tsx
${activeCode}
\`\`\`

## Output Format Rules:
- Address the user's questions contextually using the above code.
- If suggesting code changes, ALWAYS wrap your React TypeScript code in standard markdown code fences: \`\`\`tsx ... \`\`\`.
- Keep explanations structured, punchy, and professional. Avoid filler words. Use bold headers, bullet lists, or inline \`code\` references where appropriate.`;

    let replyText = '';

    if (finalModel.startsWith('claude-')) {
      // Claude Routing Channel
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

      console.log(`[Chat API] Routing chat request to Anthropic Claude model: ${claudeModelId}`);
      
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
          system: systemPrompt,
          messages: activeMessages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData?.error?.message || `Anthropic Chat API error: ${response.status}`);
      }

      replyText = responseData?.content?.[0]?.text || '';
    } else {
      // Gemini Routing Channel with 503 fallbacks
      const apiKey = process.env.GEMINI_API_KEY;
      // Collect all configured Gemini API keys for seamless rollover / redundancy
      const apiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
      ].filter(Boolean) as string[];

      if (apiKeys.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No Gemini API keys are configured. Please add GEMINI_API_KEY to your .env.local file.',
          },
          { status: 500 }
        );
      }

      // Only use the requested gemini-2.5-flash model as requested by the user
      const geminiModelsToTry = ['gemini-2.5-flash'];

      let geminiError: any = null;
      let success = false;

      for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];
        const genAI = new GoogleGenerativeAI(apiKey);

        for (const currentGeminiModel of geminiModelsToTry) {
          try {
            console.log(`[Chat API] Attempting generation with Gemini model: ${currentGeminiModel} (Key Index: ${keyIndex})`);
            const model = genAI.getGenerativeModel({
              model: currentGeminiModel,
              systemInstruction: systemPrompt,
            });

            // Convert history format to Gemini format
            // Gemini expects: history = [{ role: 'user'|'model', parts: [{ text: string }] }]
            const history = activeMessages.slice(0, -1).map((msg: any) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            }));
            const lastMessage = activeMessages[activeMessages.length - 1].content;

            const chat = model.startChat({ history });
            const result = await chat.sendMessage(lastMessage);
            
            replyText = result.response.text();
            geminiError = null;
            success = true;
            console.log(`[Chat API] Successfully got chat response using Gemini: ${currentGeminiModel} (Key Index: ${keyIndex})`);
            break; // Success! Exit model loop
          } catch (err: any) {
            const errMessage = err.message || JSON.stringify(err);
            console.warn(`[Chat API] Gemini model ${currentGeminiModel} failed with Key Index ${keyIndex}:`, errMessage);
            geminiError = err;

            // If the error is key-specific (expired or invalid), roll over to the next key immediately
            if (errMessage.includes('API key expired') || errMessage.includes('API_KEY_INVALID') || errMessage.includes('API key not found')) {
              console.warn(`[Chat API] API key index ${keyIndex} is expired or invalid. Rolling over to next available key...`);
              break; // Break model fallback loop to try next key in the outer loop
            }
          }
        }

        if (success) {
          break; // Success! Exit key rotation loop
        }
      }

      if (!success && geminiError) {
        throw geminiError;
      }
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
    });
  } catch (error: unknown) {
    console.error('[Chat API] Fatal Error:', error);
    let errorMessage = 'An error occurred while connecting to the AI model. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      errorMessage = (error as any).message || JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Make key expired errors user-friendly
    if (errorMessage.includes('API key expired') || errorMessage.includes('API_KEY_INVALID')) {
      errorMessage = 'Your Google Gemini API Key is expired or invalid. Please update the GEMINI_API_KEY in your .env.local file to resume chat.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
