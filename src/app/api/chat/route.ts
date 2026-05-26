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
    const systemPrompt = `You are FrameFlow's world-class AI design assistant, an expert UI/UX developer, and React/Tailwind consultant.
Your role is to help the user clear UI design doubts, build/write functional React component code, and suggest the simplest, cleanest layout strategies to achieve their visual goals.

## Core Directives & Styling Philosophy:
1. **The Simplest Way first**: Always suggest and highlight the absolute *simplest* way to achieve a layout or alignment goal. Avoid unnecessary wrappers, bloated classes, or over-engineered CSS. Explain *why* a specific Tailwind class (e.g. "flex", "grid", "gap-4", "items-center") is the cleanest approach.
2. **Design Doubts Clearing**: Provide clear, educational explanations about visual layout decisions, typography scales, accessibility rules (like WCAG contrast levels), color theory, and mobile design safe zones.
3. **Write/Enhance Sandbox Code**: If the user wants to add elements, modify styling, or build components, provide the completed, functional React code.

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
      const geminiModelsToTry = [finalModel];
      
      if (finalModel === 'gemini-2.5-flash') {
        geminiModelsToTry.push('gemini-1.5-flash', 'gemini-2.5-pro');
      } else if (finalModel === 'gemini-2.5-pro') {
        geminiModelsToTry.push('gemini-1.5-pro', 'gemini-2.5-flash');
      }

      let geminiError: any = null;
      for (const currentGeminiModel of geminiModelsToTry) {
        try {
          console.log(`[Chat API] Attempting generation with Gemini model: ${currentGeminiModel}`);
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
          console.log(`[Chat API] Successfully got chat response using Gemini: ${currentGeminiModel}`);
          break; // Success! Exit fallback loop
        } catch (err: any) {
          console.warn(`[Chat API] Gemini model ${currentGeminiModel} failed:`, err);
          geminiError = err;
        }
      }

      if (geminiError) {
        throw geminiError;
      }
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
    });
  } catch (error: unknown) {
    console.error('[Chat API] Fatal Error:', error);
    const errObj = error as Error | null;
    return NextResponse.json(
      {
        success: false,
        error: errObj?.message || 'An error occurred while connecting to the AI model. Please try again.',
      },
      { status: 500 }
    );
  }
}
