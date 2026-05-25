export function cn(...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

export function extractCodeFromResponse(response: string): string {
  // Claude returns code in ```tsx ... ``` format or standard ``` ... ```
  const match = response.match(/```(?:tsx|jsx|html)?\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Alternative fallback if code blocks are not standard
  const secondaryMatch = response.match(/```([\s\S]*?)```/);
  if (secondaryMatch && secondaryMatch[1]) {
    return secondaryMatch[1].trim();
  }
  
  return response.trim();
}

export function validateGeneratedCode(code: string): boolean {
  if (!code) return false;
  const hasExport = code.includes('export default');
  const hasReturn = code.includes('return');
  return hasExport && hasReturn;
}

export function parseGenerationResponse(response: string): { code: string; explanation: string } {
  const codeMatch = response.match(/```(?:tsx|jsx|html)?\n([\s\S]*?)\n```/);
  let code = '';
  let explanation = '';

  if (codeMatch) {
    code = codeMatch[1].trim();
    // Explanation is everything after the code block
    explanation = response.substring(codeMatch.index! + codeMatch[0].length).trim();
  } else {
    code = response.trim();
  }

  // Fallback if explanation is empty: extract pre-code text
  if (!explanation && codeMatch) {
    const preText = response.substring(0, codeMatch.index!).trim();
    if (preText) {
      explanation = preText;
    }
  }

  // If still empty, provide a clean default structure
  if (!explanation) {
    explanation = "### Code Explanation\\n\\nThis component was generated using Gemini 2.5 Flash. It utilizes TypeScript, leverages Tailwind CSS styling, incorporates SVG/Lucide icons, and is styled with a responsive design structure.";
  }

  return { code, explanation };
}
