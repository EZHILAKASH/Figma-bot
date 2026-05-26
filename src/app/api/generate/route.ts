import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BASE_PROMPT, LANDING_PAGE_PROMPT, DASHBOARD_PROMPT, MOBILE_APP_PROMPT } from '@/lib/prompts';

const LANGUAGE_PROMPTS: Record<string, string> = {
  react: `
- OUTPUT LANGUAGE: React TypeScript (.tsx) using Tailwind CSS and Lucide Icons.
- Standard imports: import React, { useState } from 'react'; import { ... } from 'lucide-react';
- Export structure: Export a single default functional component: 'export default function Component()'.
- Styling rules: Use only Tailwind standard utility classes or arbitrary hex styles: bg-[#1e1e24]. Make the component responsive using standard breakpoint prefixes (sm:, md:, lg:).
- Use mockup mock data so it renders immediately and beautifully without external properties.
`,
  vue: `
- OUTPUT LANGUAGE: Vue 3 Single File Component (SFC) layout.
- Structure: Return a single self-contained Vue template with clean HTML structure, Composition API (<script setup lang="ts">), and Tailwind CSS classes for styling.
- Standard imports: import { ref, computed } from 'vue'; import { ... } from 'lucide-react-vue' or simply mock icons.
- Styling rules: Standard Tailwind CSS classes inside template tags.
- Make the component responsive and modern.
`,
  svelte: `
- OUTPUT LANGUAGE: Svelte Component.
- Structure: Return a single self-contained Svelte file containing the script block (<script lang="ts">), markup, and standard style tags or Tailwind CSS classes.
- Styling rules: Modern style layout using Svelte standard components and Tailwind utility classes.
`,
  htmlcss: `
- OUTPUT LANGUAGE: Vanilla HTML/CSS.
- Structure: Return a single clean index.html file containing a complete HTML5 document (<!DOCTYPE html>, <html>, <head>, <body>).
- Styling rules: All custom CSS styles must be embedded inside a <style> block in the <head>. Use modern CSS variables, clean flexbox/grid containers, and standard typography (like Inter/Google Fonts). Do NOT use external files.
- Visuals: Use sleek gradients, border radiuses, dark mode aesthetics, and micro-transitions to wow the user.
`,
  python_tkinter: `
- OUTPUT LANGUAGE: Python 3 code using the native Tkinter and ttk (themed) GUI toolkits.
- Structure: Return a single, complete, executable Python script that defines the complete window, widgets, and layout.
- Code blocks: Wrap the code in \`\`\`python ... \`\`\`.
- Guidelines to prevent syntax errors:
  - Create a modern, rounded, dark mode GUI look by using ttk custom styles.
  - Define custom styles using 'style = ttk.Style()', 'style.theme_use("clam")', and configure options like background, foreground, borderwidth, and font.
  - Use modern layout managers like 'frame.grid(row=x, column=y, padx=p, pady=p, sticky="nsew")' to structure the dashboard, cards, input bars, and labels cleanly.
  - Maintain a clean responsive design by calling 'columnconfigure' and 'rowconfigure' on containers.
  - Avoid complex dependencies outside standard tkinter and ttk libraries.
  - Make sure the script ends with standard root window loop: 'root.mainloop()'.
`,
  python_pyqt: `
- OUTPUT LANGUAGE: Python 3 code using PyQt5 QtWidgets, QtGui, and QtCore.
- Structure: Return a single, complete, executable Python script that builds the application UI inside a QMainWindow or QWidget class.
- Code blocks: Wrap the code in \`\`\`python ... \`\`\`.
- Guidelines to prevent syntax errors:
  - Use stylesheet properties ('self.setStyleSheet(...)') with modern CSS rules (background-color, border-radius, font-weight) to craft high-fidelity dark layouts, glass containers, and neon accents.
  - Use custom layouts ('QVBoxLayout', 'QHBoxLayout', 'QGridLayout') to manage elements cleanly with strict border spacing ('setContentsMargins(12, 12, 12, 12)').
  - Ensure all layout items are properly added to the parent widgets.
  - Make sure the script includes a standard startup blocker:
    'if __name__ == "__main__": app = QApplication(sys.argv); win = MainWindow(); win.show(); sys.exit(app.exec_())'.
`,
  flutter: `
- OUTPUT LANGUAGE: Flutter Dart Widget code.
- Structure: Return a single, self-contained Dart file declaring a primary widget subclassing 'StatelessWidget' or 'StatefulWidget'.
- Code blocks: Wrap the code in \`\`\`dart ... \`\`\`.
- Guidelines to prevent syntax errors:
  - Use modern Material 3 layout widgets ('Scaffold', 'Container', 'Card', 'Row', 'Column', 'ListView').
  - Ensure colors use standard 'Color(0xFF8B5CF6)' hexadecimal integer syntax, and styles use modern 'TextStyle' parameters.
  - Implement beautiful card layout decorators using 'BoxDecoration(borderRadius, border, gradient, boxShadow)'.
  - Do NOT use un-imported external third-party widgets; use standard material widgets.
`,
  swiftui: `
- OUTPUT LANGUAGE: Swift Declarative code for iOS SwiftUI.
- Structure: Return a single complete SwiftUI view hierarchy structure (struct ComponentView: View).
- Code blocks: Wrap the code in \`\`\`swift ... \`\`\`.
- Guidelines to prevent compile errors:
  - Use standard SwiftUI stack elements: VStack, HStack, ZStack, ScrollView, Spacer.
  - Use standard State bindings ('@State private var input = ""') and standard modifier syntax.
  - For styling, use standard SwiftUI modifiers: '.padding()', '.background(Color(...))', '.cornerRadius()', '.font()', '.foregroundColor()', '.shadow()'.
  - Use standard SF Symbols icons via 'Image(systemName: "...")' matching the design.
  - Exclude complex framework references outside standard SwiftUI and Combine.
`,
  kotlin: `
- OUTPUT LANGUAGE: Android Kotlin code using Jetpack Compose declarative UI.
- Structure: Return a single, self-contained Kotlin file containing Composable layout functions ('@Composable fun Component()').
- Code blocks: Wrap the code in \`\`\`kotlin ... \`\`\`.
- Guidelines to prevent compile errors:
  - Use standard Compose Material 3 elements: 'Scaffold', 'Button', 'OutlinedTextField', 'Text', 'Card', 'Row', 'Column', 'Box', 'LazyColumn'.
  - Handle interactive state variables with: 'var text by remember { mutableStateOf("") }'.
  - Utilize 'Modifier' chain layout modifiers: 'Modifier.fillMaxWidth().padding(16.dp).background(color, shape).shadow()'.
  - Standard Kotlin Compose dependencies only (androidx.compose.*).
`,
  rust: `
- OUTPUT LANGUAGE: Rust code using the egui and eframe immediate-mode GUI libraries.
- Structure: Return a single, complete Rust file containing the GUI structure, state bindings, and the 'update' render implementation.
- Code blocks: Wrap the code in \`\`\`rust ... \`\`\`.
- Guidelines to prevent compile errors:
  - Structure state using standard Rust structs, and layout inside 'impl eframe::App for MyUiApp'.
  - Render widgets using immediate-mode UI directives: 'ui.heading()', 'ui.label()', 'ui.add(egui::Button::new())', 'ui.text_edit_singleline()'.
  - Manage colors with 'egui::Color32::from_rgb()' or 'from_rgba()', and apply borders/spacing using 'egui::Frame' container shapes.
`,
  java: `
- OUTPUT LANGUAGE: Java SE Desktop code using standard javax.swing and java.awt libraries.
- Structure: Return a single, self-contained Java source class containing a standard 'public static void main(String[] args)' startup execution.
- Code blocks: Wrap the code in \`\`\`java ... \`\`\`.
- Guidelines to prevent compile errors:
  - Structure elements cleanly inside custom 'JFrame' windows with child panels.
  - Use robust layout managers: 'BorderLayout', 'GridBagLayout' (with GridBagConstraints), or 'BoxLayout'.
  - Enhance styling by customizing fonts, foreground/background colors ('new Color(139, 92, 246)'), and adding borders with 'BorderFactory.createEmptyBorder()'.
  - Ensure all layout operations run safely on the Swing Event Dispatch Thread (EDT) using 'SwingUtilities.invokeLater()'.
`,
  csharp: `
- OUTPUT LANGUAGE: C# (WPF XAML Desktop Layout and C# companion Code-Behind).
- Structure: Return a complete WPF layout containing BOTH the .xaml representation (<Window ...> ... </Window>) AND the .xaml.cs companion code script cleanly separated.
- Code blocks: Wrap the WPF design block in \`\`\`xml ... \`\`\` and the C# actions in \`\`\`csharp ... \`\`\`.
- Guidelines to prevent compile errors:
  - Layout elements inside WPF grids ('<Grid>', '<StackPanel>', '<Border>', '<Button>', '<TextBox>', '<TextBlock>').
  - Apply styling using WPF properties (Background, Foreground, FontSize, Padding, CornerRadius).
  - Use simple Event handles wired to code-behind commands.
`,
  cpp: `
- OUTPUT LANGUAGE: C++ code using the Qt QtWidgets compiler framework.
- Structure: Return a single, complete C++ file containing standard headers, custom GUI layouts, and the 'main' loop setup.
- Code blocks: Wrap the code in \`\`\`cpp ... \`\`\`.
- Guidelines to prevent compile errors:
  - Structure widgets inside QWidgets, QHBoxLayouts, QVBoxLayouts, or QGridLayouts.
  - Style layouts cleanly with custom Qt styling sheets: e.g. 'widget->setStyleSheet("background-color: #1e1e24; border-radius: 8px;");'.
  - Connect actions using Qt signals & slots setup: e.g., 'QObject::connect(btn, &QPushButton::clicked, ...);'.
  - Use standard Qt libraries (QApplication, QWidget, QPushButton, QLabel, QLineEdit).
`
};

export async function POST(req: Request) {
  try {
    const { image, context, language, prompt, framework, styleFramework, model: requestedModel } = await req.json();

    if (!image && !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing design image or text prompt' },
        { status: 400 }
      );
    }

    const finalModel = requestedModel || 'gemini-2.5-flash';
    let contentText = '';

    // Parse base64 image data and determine media type (if image is present)
    let mediaType = 'image/jpeg';
    let base64Data = '';

    if (image) {
      base64Data = image;
      if (image.startsWith('data:')) {
        const parts = image.split(',');
        const match = parts[0].match(/data:([^;]+);base64/);
        if (match) {
          mediaType = match[1];
        }
        base64Data = parts[1];
      }
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

    let promptText = selectedPrompt;

    if (prompt) {
      promptText += `\n\n## USER DESIGN SPECIFICATIONS / COMPONENT DESCRIPTION (CRITICAL TARGET):\n- Structure, style, layout, elements, and dynamic interactivity must be guided by: "${prompt}"\n`;
    }

    // Append dynamic language rules
    const selectedLanguage = language || 'react';
    const langRules = LANGUAGE_PROMPTS[selectedLanguage] || LANGUAGE_PROMPTS.react;
    promptText += `\n\n## PLATFORM-SPECIFIC COMPILER DIRECTIVES:\n${langRules}`;

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
      
      const contentList: any[] = [
        {
          type: 'text',
          text: promptText,
        }
      ];

      if (image) {
        contentList.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        });
      }

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
              content: contentList,
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
            console.log(`[API Generate] Attempting generation with Gemini model: ${currentGeminiModel} (Key Index: ${keyIndex})`);
            const model = genAI.getGenerativeModel({ model: currentGeminiModel });
            
            const promptParts: any[] = [promptText];
            if (image) {
              promptParts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: mediaType,
                },
              });
            }

            const result = await model.generateContent(promptParts);
            contentText = result.response.text();
            geminiError = null;
            success = true;
            console.log(`[API Generate] Successfully generated using Gemini: ${currentGeminiModel} (Key Index: ${keyIndex})`);
            break; // Success! Exit model loop
          } catch (err: any) {
            const errMessage = err.message || JSON.stringify(err);
            console.warn(`[API Generate] Gemini model ${currentGeminiModel} failed with Key Index ${keyIndex}:`, errMessage);
            geminiError = err;

            // If the error is key-specific (expired or invalid), roll over to the next key immediately
            if (errMessage.includes('API key expired') || errMessage.includes('API_KEY_INVALID') || errMessage.includes('API key not found')) {
              console.warn(`[API Generate] API key index ${keyIndex} is expired or invalid. Rolling over to next available key...`);
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
      rawOutput: contentText,
    });
  } catch (error: unknown) {
    console.error('API Generation Error:', error);
    let errorMessage = 'An error occurred during code generation with the selected model. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      errorMessage = (error as any).message || JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Make key expired errors user-friendly
    if (errorMessage.includes('API key expired') || errorMessage.includes('API_KEY_INVALID')) {
      errorMessage = 'Your Google Gemini API Key is expired or invalid. Please update the GEMINI_API_KEY in your .env.local file to resume generation.';
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
