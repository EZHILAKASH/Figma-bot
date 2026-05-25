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
