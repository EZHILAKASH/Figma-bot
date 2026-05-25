# Figma-to-Code: AI-Powered Design-to-React Converter
## Senior Developer Specification Document

**Project Status**: Hackathon MVP  
**Timeline**: 12-24 hours  
**Target Deployment**: Vercel  
**Primary Language**: TypeScript  

---

## 1. Project Overview

### Vision
Build an intelligent web application that converts Figma designs (via screenshot or direct API) into production-ready React components with Tailwind CSS styling using Claude's vision capabilities.

### Problem Statement
Designers and developers face a significant communication gap. When designers hand off Figma files:
- Developers manually translate designs into code (2-4 hours per component)
- Inconsistencies emerge between design intent and implementation
- Design systems aren't properly translated into code

### Solution
An AI-powered tool that:
- Analyzes Figma designs (screenshots or direct files)
- Extracts structure, colors, typography, spacing
- Generates semantic, accessible React components
- Produces Tailwind CSS that matches design specifications
- Provides live preview and copy-paste ready code

### Success Metrics
- ✅ Can convert simple-to-moderate Figma designs to usable React code
- ✅ Generated code has 70%+ accuracy to original design
- ✅ Process takes <30 seconds from upload to code generation
- ✅ Generated code is copy-paste ready (no manual fixes needed for MVP)
- ✅ Works on all modern browsers

---

## 2. Technical Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                   │
├─────────────────────────────────────────────────────────────┤
│  - Upload Figma screenshot or connect Figma account          │
│  - View live preview of generated component                  │
│  - Copy/download generated code                              │
├─────────────────────────────────────────────────────────────┤
│                    PROCESSING LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  - Image processing (if screenshot)                          │
│  - Figma API parsing (if direct connection)                  │
│  - Design analysis & extraction                              │
├─────────────────────────────────────────────────────────────┤
│                      AI LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  - Claude 3.5 Sonnet Vision API                              │
│  - Design intent understanding                               │
│  - Code generation                                           │
├─────────────────────────────────────────────────────────────┤
│                    OUTPUT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  - React TSX component                                       │
│  - Tailwind CSS classes                                      │
│  - Live preview rendering                                    │
│  - Code display with syntax highlighting                     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main entry point
│   └── api/
│       └── generate/
│           └── route.ts        # Claude API integration endpoint
├── components/
│   ├── UploadSection.tsx       # File/screenshot upload UI
│   ├── PreviewPane.tsx         # Live component preview
│   ├── CodeEditor.tsx          # Monaco editor for generated code
│   ├── ActionBar.tsx           # Copy/download buttons
│   └── LoadingState.tsx        # Loading spinner & status
├── lib/
│   ├── claude.ts               # Claude API client
│   ├── figma.ts                # Figma API integration (optional)
│   ├── prompts.ts              # AI prompts for code generation
│   └── utils.ts                # Helper functions
├── types/
│   └── index.ts                # TypeScript interfaces
├── styles/
│   └── globals.css             # Tailwind & global styles
└── public/
    └── assets/                 # Icons, images
```

---

## 3. Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3+
- **UI Components**: shadcn/ui (optional, for polish)
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Code Preview**: React Live (or custom iframe approach)
- **State Management**: React hooks (useState, useCallback)
- **HTTP Client**: fetch API (built-in)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **AI Service**: Anthropic Claude API (claude-3-5-sonnet-20241022)

### External APIs
- **Claude Vision API**: Design analysis & code generation
- **Figma REST API**: Optional direct design file parsing (Phase 2)

### Hosting & Deployment
- **Hosting**: Vercel (Next.js native)
- **Environment**: Serverless functions (included in Vercel)
- **Database**: None (stateless MVP)

### Development Tools
- **Package Manager**: npm or yarn
- **Version Control**: Git
- **Browser DevTools**: Chrome/Firefox DevTools

---

## 4. Feature Specifications

### Phase 1: MVP (6-8 hours) - Screenshot Based

#### 4.1.1 Upload Mechanism
```
Input: User uploads image file (JPG, PNG)
- Supported formats: JPEG, PNG, WebP
- Max file size: 20MB
- Dimensions: Any (resized by Claude automatically)

Output: Base64 encoded image for Claude API
```

**Implementation**:
```typescript
// components/UploadSection.tsx
- Accept file input (accept="image/*")
- Convert to Base64 using FileReader API
- Display preview of uploaded image
- Show clear/reset button
- Handle errors gracefully
```

#### 4.1.2 AI Code Generation
```
Input: Base64 image + design analysis prompt
Claude analyzes:
  - Layout structure (grid, flexbox, positioning)
  - Colors (exact hex or CSS names)
  - Typography (font family, size, weight, line-height)
  - Spacing (margins, padding, gaps)
  - Components (buttons, cards, forms, etc.)
  - Interactive states (hover, focus, active)
  - Accessibility (semantic HTML, ARIA labels)

Output: React component (TSX) with Tailwind CSS
```

**Prompt Strategy** (See Section 6.2 for full prompt):
- Be extremely specific about Tailwind class usage
- Request semantic HTML structure
- Ask for component props interface
- Request accessibility considerations
- Format: Return ONLY valid JSX, wrapped in code fence

#### 4.1.3 Code Display & Preview
```
Split screen layout:
- Left side: Live component preview (iframe or direct render)
- Right side: Generated code (Monaco editor with syntax highlighting)
- Bottom: Action buttons (Copy, Download, Reset)
```

**Preview Implementation**:
```typescript
// Option A: Direct render (faster, less secure)
<div className="p-8 bg-white border rounded">
  {ReactDOMServer.renderToStaticMarkup(generatedComponent)}
</div>

// Option B: Iframe (safer, but more complex)
<iframe srcDoc={iframeContent} />

// Option C: React-based preview
import { LiveProvider, LiveEditor, LivePreview } from 'react-live'
```

#### 4.1.4 Code Actions
- **Copy to Clipboard**: Copy entire generated code
- **Download as File**: Download as .jsx or .tsx file
- **Reset**: Clear and start over
- **Share**: (Optional) Generate shareable link

---

### Phase 2: Direct Figma Integration (Optional, 6-8 hours)

#### 4.2.1 Figma OAuth Flow
```
User → "Connect Figma" button
  ↓
OAuth 2.0 redirect to Figma
  ↓
User authorizes access
  ↓
Receive access token (store securely)
  ↓
Fetch file list from Figma REST API
  ↓
User selects design file
```

#### 4.2.2 Design Extraction
```
From Figma JSON file, extract:
- Component hierarchy
- Color styles (fills, strokes)
- Typography styles
- Layout constraints
- Instance overrides
- Assets (images, icons)

Output: Structured design metadata
```

#### 4.2.3 Smart Code Generation
```
Input: Structured Figma metadata (not just image)
Claude generates:
- Proper component hierarchy
- Reusable component props
- Design token integration
- TypeScript interfaces
- Better code organization
```

---

### Phase 3: Polish & Enhancement (Optional, 2-4 hours)

- Dark mode for editor
- Code syntax highlighting options
- Component library template generation
- Design token extraction (CSS variables)
- Multi-framework output (React, Vue, Svelte)
- Responsive design generation

---

## 5. API Specifications

### 5.1 Claude Vision API Endpoint

**Endpoint**: `POST /api/generate`

**Request Body**:
```typescript
interface GenerateRequest {
  image: string;           // Base64 encoded image
  imageFormat: 'jpeg' | 'png' | 'webp' | 'gif';
  designContext?: string;  // Optional: "landing page", "dashboard", etc.
  framework?: 'react' | 'vue' | 'svelte'; // Default: 'react'
  styleFramework?: 'tailwind' | 'css-modules'; // Default: 'tailwind'
}
```

**Response**:
```typescript
interface GenerateResponse {
  success: boolean;
  component: {
    code: string;                    // Full React component code
    props: Record<string, string>;   // Component props interface
    dependencies?: string[];         // Required npm packages
    description?: string;            // What the component does
  };
  metadata?: {
    colorsExtracted: string[];
    componentsDetected: string[];
    estimatedAccuracy: number;       // 0-100
  };
  error?: string;
}
```

**Error Handling**:
```typescript
// Handle these errors gracefully:
- 400: Invalid image format
- 401: API key invalid/expired
- 429: Rate limit exceeded (queue request)
- 500: Claude API error (retry with exponential backoff)
```

### 5.2 Claude API Configuration

```typescript
// lib/claude.ts
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const createRequest = async (base64Image: string) => {
  return client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: FIGMA_TO_CODE_PROMPT, // See section 6.2
          },
        ],
      },
    ],
  });
};
```

### 5.3 Figma API (Optional)

**Endpoint**: `https://api.figma.com/v1/files/{file_key}`

**Implementation**:
```typescript
// lib/figma.ts
const getFigmaFile = async (fileKey: string, token: string) => {
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}`,
    {
      headers: {
        'X-FIGMA-TOKEN': token,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
};

// Extract design data
const extractDesignData = (figmaFile) => {
  return {
    colors: figmaFile.styles?.filter(s => s.styleType === 'FILL'),
    typography: figmaFile.styles?.filter(s => s.styleType === 'TEXT'),
    components: Object.values(figmaFile.components || {}),
  };
};
```

---

## 6. AI Integration Strategy

### 6.1 Prompt Engineering

**Principle**: Be extremely explicit. Don't assume Claude knows your coding standards.

**Prompt Structure**:
1. Role definition ("You are an expert React developer")
2. Task clarity ("Convert this Figma design to React")
3. Technical requirements (Tailwind, TypeScript, accessibility)
4. Output format (code fence, no explanation)
5. Edge cases (responsive, dark mode, states)

### 6.2 Core Prompt Template

```
FIGMA_TO_CODE_PROMPT = `You are an expert React developer and UI engineer. Your task is to convert a Figma design screenshot into a production-ready React component.

## Instructions

1. **Analyze the design carefully**:
   - Identify the main layout structure (flexbox or grid-based)
   - Extract exact colors (as hex codes or CSS color names)
   - Note typography details (font family, size, weight, line-height)
   - Identify spacing patterns (margins, padding, gaps)
   - Recognize components (buttons, cards, inputs, etc.)

2. **Generate React component**:
   - Use React 18+ with hooks
   - Write TypeScript (.tsx)
   - Use semantic HTML elements
   - Add proper accessibility attributes (aria-*, role, etc.)
   - Include component prop types interface
   - Write comments for complex logic

3. **Style requirements**:
   - ONLY use Tailwind CSS classes (no CSS modules, no styled-components)
   - Use responsive Tailwind classes (sm:, md:, lg:, xl:, 2xl:)
   - For custom colors not in Tailwind palette, use arbitrary values: [#abc123]
   - Default to light mode; support dark mode if design shows it
   - Use Tailwind's spacing scale (1 = 0.25rem, 4 = 1rem, etc.)

4. **Component structure**:
   - Create a functional component with clear props interface
   - Export as default export
   - Include placeholder props for dynamic content
   - Add mock data if the design shows lists/tables

5. **Accessibility & Quality**:
   - Use semantic HTML (button, nav, section, article, etc.)
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - High contrast text (WCAG AA minimum)
   - Include alt text for images
   - Make interactive elements properly sized (min 44px touch target)

6. **Output format**:
   - Return ONLY the React component code
   - Wrap in triple backticks: \`\`\`tsx
   - No additional explanation or commentary
   - Start with the imports, then component definition
   - End with export statement

## Example Output Format

\`\`\`tsx
import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export default function Card({ title, description, onClick }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
\`\`\`

## Common Patterns

- **Buttons**: Use \`<button>\`, not \`<div>\` with click handlers
- **Inputs**: Include \`<label>\` with \`htmlFor\` attribute
- **Images**: Use \`<img>\` with \`alt\` attribute
- **Icons**: If design shows icons, use placeholder elements or comments
- **Responsive**: Always include responsive Tailwind classes

Now, analyze the provided Figma design screenshot and generate the React component.`
```

### 6.3 Prompt Variations

**For Different Design Types**:

```typescript
// Landing page variant
const LANDING_PAGE_PROMPT = BASE_PROMPT + `
Additional requirements:
- Include CTAs (Call-to-Action buttons)
- Proper hero section structure
- SEO-friendly semantic HTML
- Mobile-first responsive design
`;

// Dashboard variant
const DASHBOARD_PROMPT = BASE_PROMPT + `
Additional requirements:
- Use data visualization components mindfully
- Include state management examples
- Add loading and empty states
- Use card-based layouts for data
`;

// Mobile app screen variant
const MOBILE_APP_PROMPT = BASE_PROMPT + `
Additional requirements:
- Mobile-first, then scale to tablet/desktop
- Include safe area considerations
- Use touch-friendly sizing (48px+)
- Proper mobile navigation patterns
`;
```

### 6.4 Response Parsing

```typescript
// lib/utils.ts
const extractCodeFromResponse = (response: string): string => {
  // Claude returns code in ```tsx ... ``` format
  const match = response.match(/```(?:tsx|jsx)?\n([\s\S]*?)\n```/);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Fallback: return the entire response if no fence found
  return response;
};

const validateGeneratedCode = (code: string): boolean => {
  // Basic validation
  const hasExport = code.includes('export default');
  const hasFunction = code.includes('function') || code.includes('=>');
  const hasReturn = code.includes('return');
  return hasExport && hasFunction && hasReturn;
};
```

---

## 7. Database & State Management

### 7.1 For MVP: Stateless Architecture

No database needed. All state lives in React component state:

```typescript
// app/page.tsx
const [uploadedImage, setUploadedImage] = useState<string | null>(null);
const [generatedCode, setGeneratedCode] = useState<string>('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [previewComponent, setPreviewComponent] = useState<any>(null);
```

### 7.2 Optional: For Phase 3 (User History)

```typescript
// types/index.ts
interface SavedComponent {
  id: string;
  createdAt: Date;
  imageUrl: string;
  code: string;
  metadata: {
    colors: string[];
    componentsDetected: string[];
  };
}

// Store in:
// - localStorage (client-side, limited to 5-10MB)
// - Vercel KV (Redis, fast key-value store)
// - Supabase (PostgreSQL, more robust)
```

---

## 8. Development Phases

### Phase 1: Foundation (Hours 1-4)

```
Task 1: Project Setup
- Create Next.js app: npx create-next-app@latest --typescript --tailwind
- Set up directory structure
- Install dependencies: monaco-editor, clsx, tailwind-merge
- Configure environment variables (.env.local)

Task 2: UI Scaffolding
- Create main layout with split pane (upload | preview | code)
- Build UploadSection component with drag-and-drop
- Style with Tailwind (use shadcn/ui if time permits)
- Add LoadingState component for better UX

Task 3: Image Processing
- Implement file upload handler
- Convert image to Base64
- Handle errors (invalid format, file too large)
- Display preview of uploaded image
```

### Phase 2: Core AI Integration (Hours 5-8)

```
Task 1: Claude API Setup
- Create /api/generate endpoint
- Integrate Claude client library
- Implement request/response handling
- Add error handling and retry logic

Task 2: Code Generation
- Call Claude with image + prompt
- Parse response and extract code
- Validate generated code
- Display in Monaco editor

Task 3: Live Preview
- Implement component preview rendering
- Handle code execution safely
- Show loading states
- Display errors clearly
```

### Phase 3: Polish & Testing (Hours 9-12)

```
Task 1: UX Improvements
- Add copy-to-clipboard button
- Implement download as .jsx/.tsx file
- Add code formatter (Prettier)
- Add syntax highlighting themes

Task 2: Error Handling
- Handle Claude API errors gracefully
- Show user-friendly error messages
- Implement retry mechanism
- Add timeout handling

Task 3: Testing & Demo Prep
- Test with various Figma designs
- Ensure code quality
- Record demo video
- Create example gallery
```

### Phase 4 (Optional): Figma Integration (Hours 13-24)

```
Task 1: OAuth Setup
- Implement Figma OAuth flow
- Secure token storage (backend session)
- Build Figma file browser UI

Task 2: Design Extraction
- Parse Figma file structure
- Extract colors, typography, components
- Build smart code generator based on structured data

Task 3: Advanced Features
- Component library generation
- Design token extraction
- Multi-framework support
```

---

## 9. Development Checklist

### Setup Phase
- [ ] Next.js project initialized with TypeScript
- [ ] Tailwind CSS configured
- [ ] Environment variables set up (.env.local with ANTHROPIC_API_KEY)
- [ ] Monaco editor installed
- [ ] Project structure created

### Frontend Phase
- [ ] UploadSection component with file input
- [ ] Image preview display
- [ ] Split pane layout (upload | preview | code)
- [ ] LoadingState component
- [ ] Error display UI

### Backend Phase
- [ ] /api/generate endpoint created
- [ ] Claude client initialized
- [ ] Image to Base64 conversion
- [ ] Request validation
- [ ] Response parsing & validation
- [ ] Error handling with proper HTTP codes

### Integration Phase
- [ ] Upload → API call flow working
- [ ] Code generation → display in editor
- [ ] Live preview rendering
- [ ] Copy to clipboard functionality
- [ ] Download file functionality

### Polish Phase
- [ ] Code syntax highlighting
- [ ] Responsive design for mobile
- [ ] Accessibility review (keyboard nav, ARIA labels)
- [ ] Error messages user-friendly
- [ ] Loading indicators clear
- [ ] Demo ready

### Testing Phase
- [ ] Test with 5+ different Figma designs
- [ ] Test error scenarios
- [ ] Test on mobile browsers
- [ ] Test copy/download functionality
- [ ] Performance check (load time <3s)

### Deployment Phase
- [ ] All environment variables set in Vercel
- [ ] ANTHROPIC_API_KEY configured
- [ ] Deploy to Vercel
- [ ] Test live deployment
- [ ] Share shareable link with judges

---

## 10. Implementation Guidelines

### 10.1 Code Quality Standards

```typescript
// TypeScript: Strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}

// Use interfaces for all props
interface Props {
  isLoading: boolean;
  onGenerate: (code: string) => void;
  error?: string;
}

// Proper error handling
try {
  const response = await generateCode(image);
  setGeneratedCode(response.component.code);
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  setError(errorMessage);
}

// Avoid prop drilling: use React Context if needed
export const GenerationContext = createContext<GenerationContextType | null>(null);
```

### 10.2 Performance Considerations

```typescript
// Use React.memo to prevent unnecessary re-renders
const CodeEditor = React.memo(({ code }: Props) => {
  return <MonacoEditor value={code} />;
});

// Use useCallback for event handlers
const handleGenerate = useCallback(async (image: string) => {
  // Handle generation
}, []);

// Optimize image size before sending to Claude
const compressImage = async (file: File): Promise<string> => {
  const canvas = await createCanvas(file);
  return canvas.toDataURL('image/jpeg', 0.8); // 80% quality
};

// Debounce preview rendering if needed
const [debouncedCode, setDebouncedCode] = useState(code);
useEffect(() => {
  const timer = setTimeout(() => setDebouncedCode(code), 500);
  return () => clearTimeout(timer);
}, [code]);
```

### 10.3 Security Considerations

```typescript
// Environment variables: Never expose API keys in frontend code
// ❌ WRONG
const response = fetch('...', {
  headers: { 'Authorization': process.env.ANTHROPIC_API_KEY }
});

// ✅ RIGHT
const response = fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ image })
});

// Sanitize user input
import DOMPurify from 'dompurify';
const safeName = DOMPurify.sanitize(userInput);

// Rate limiting (optional, for production)
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});
```

### 10.4 Accessibility Standards

```typescript
// Use semantic HTML
// ❌ WRONG
<div onClick={upload}><p>Upload</p></div>

// ✅ RIGHT
<button onClick={upload} aria-label="Upload Figma screenshot">
  <img src="upload.svg" alt="" aria-hidden="true" />
  Upload
</button>

// ARIA labels for screen readers
<input
  type="file"
  accept="image/*"
  aria-label="Upload design screenshot"
  aria-describedby="upload-help"
/>
<p id="upload-help" className="text-sm text-gray-600">
  Supported formats: JPG, PNG (max 20MB)
</p>

// Focus management
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);

// Test with keyboard navigation only
// Test with screen reader (NVDA, JAWS)
```

---

## 11. Deployment & Hosting

### 11.1 Vercel Deployment

```bash
# 1. Create GitHub repository
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Connect to Vercel
npm install -g vercel
vercel

# 3. Configure environment variables in Vercel dashboard
# ANTHROPIC_API_KEY = your_actual_api_key

# 4. Deploy
vercel --prod
```

### 11.2 Environment Setup

```bash
# .env.local (for development)
ANTHROPIC_API_KEY=sk-ant-...

# Vercel Environment Variables (via dashboard)
ANTHROPIC_API_KEY = [paste your key]

# Next.js Config
// next.config.js
module.exports = {
  images: {
    domains: ['example.com'], // If using external images
  },
  // Optimize for serverless
  experimental: {
    optimizePackageImports: ['@/components'],
  },
};
```

### 11.3 Build & Runtime

```bash
# Development
npm run dev          # http://localhost:3000

# Production build
npm run build
npm start

# Size analysis
npm run build -- --analyze

# Deployment
vercel --prod
```

---

## 12. Hackathon Demo Strategy

### 12.1 Demo Script (2 minutes)

```
[00:00] "Designers send Figma files, developers manually code for hours. 
         This tool makes that instant."

[00:10] SHOW: Simple Figma design (screenshot)
        "Here's a landing page design I created in Figma."

[00:15] UPLOAD: Screenshot to app
        "I upload a screenshot..."

[00:20] GENERATE: Click generate button
        "...and in seconds..."

[00:25] SHOW: Generated React code in editor
        "...we have production-ready React code with Tailwind CSS."

[00:40] SHOW: Live preview
        "And here's the live preview matching the design."

[00:50] "This bridges the designer-developer gap, saves hours, 
         and ensures design fidelity in code."

[01:00] SHOW: Download button
        "Developers can download and use immediately in their projects."

[01:15] "Future plans: Figma API integration for direct file parsing,
         design token extraction, multi-framework support."

[01:45] Q&A
```

### 12.2 Demo Preparation

```
Prepare:
- [ ] Screenshot of simple Figma design (button, card, form)
- [ ] Live app URL (Vercel link)
- [ ] Pre-generated code example (in case of API issues)
- [ ] GitHub repo link (for code inspection)
- [ ] Screen recording backup (if live demo fails)

Test:
- [ ] App loads quickly
- [ ] Image upload works
- [ ] Code generation completes <30s
- [ ] Preview renders correctly
- [ ] Copy/download work
- [ ] Mobile responsive
```

### 12.3 Key Talking Points

```
✅ "Solves real problem": Designer → Dev handoff is slow, error-prone
✅ "Clear AI value": Claude's vision understands design intent
✅ "Practical solution": Generated code is immediately usable
✅ "Scalable": Foundation for design tokens, component libraries
✅ "User-centric": Respects designers and developers
✅ "Technical excellence": Proper error handling, accessibility, performance
```

---

## 13. Troubleshooting & Common Issues

### 13.1 Claude API Issues

```typescript
// Issue: "Invalid API key"
Solution: 
- Check ANTHROPIC_API_KEY in .env.local
- Verify key is active on Anthropic dashboard
- Restart dev server

// Issue: Rate limited (429 error)
Solution:
- Implement exponential backoff retry
- Add request queuing for hackathon
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000); // exponential backoff
    }
  }
};

// Issue: "Image too large"
Solution:
- Compress before sending
- Resize to max 2000x2000px
```

### 13.2 Code Generation Issues

```typescript
// Issue: "Code doesn't compile"
Solution:
- Add validation before displaying
- Show error message with suggestion
- Ask user to refine image/try again

// Issue: "Generated code doesn't match design"
Solution:
- Use more specific prompt
- Ask Claude to explain its choices
- Add feedback mechanism

// Issue: "Styling looks off"
Solution:
- Check Tailwind classes are valid
- Verify color format (hex vs RGB)
- Test in different browsers
```

### 13.3 Deployment Issues

```bash
# Issue: "Build fails on Vercel"
Solution:
- Check logs in Vercel dashboard
- Verify all dependencies in package.json
- Test locally: npm run build

# Issue: "App loads but shows errors"
Solution:
- Check browser console
- Check Vercel function logs
- Verify environment variables set

# Issue: "API calls failing in production"
Solution:
- Verify ANTHROPIC_API_KEY in Vercel
- Check CORS settings (shouldn't be needed for same-origin)
- Add logging to API route
```

---

## 14. Success Criteria Checklist

### MVP Success
- [ ] Upload Figma screenshot → Get React code in <30s
- [ ] Generated code is valid React (no syntax errors)
- [ ] Code uses Tailwind CSS properly
- [ ] Live preview renders generated component
- [ ] Copy/download functionality works
- [ ] Handles errors gracefully
- [ ] Mobile responsive
- [ ] Accessibility meets WCAG AA
- [ ] Deploy to Vercel (public URL)
- [ ] Demo works without live coding

### Stretch Goals
- [ ] Figma OAuth integration
- [ ] Multiple design screenshots support
- [ ] Design token extraction
- [ ] Component library generation
- [ ] Responsive design scaffolding
- [ ] Dark mode support
- [ ] Code formatting options

### Hackathon Judging Criteria Met
- [ ] **Innovation**: AI for design-to-code automation ✓
- [ ] **Execution**: Working MVP deployed ✓
- [ ] **Impact**: Solves real designer-developer problem ✓
- [ ] **Technical Quality**: Clean code, proper error handling ✓
- [ ] **Presentation**: Clear demo, compelling story ✓

---

## 15. Resources & References

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Anthropic Claude: https://docs.anthropic.com
- Monaco Editor: https://microsoft.github.io/monaco-editor/

### Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "@anthropic-ai/sdk": "^0.8.0",
  "@monaco-editor/react": "^4.5.0",
  "tailwindcss": "^3.4.0",
  "clsx": "^2.0.0"
}
```

### Tools
- Figma: https://figma.com
- Vercel: https://vercel.com
- GitHub: https://github.com

---

## 16. Final Notes

### Philosophy
"Simple is better than complex." For MVP, focus on core flow:
1. Upload → 2. Generate → 3. Copy

Don't over-engineer. Iterate based on feedback.

### Time Management
- 0-4h: Setup + UI scaffolding
- 4-8h: Claude integration + code generation
- 8-12h: Preview + polish + deployment
- 12-24h: Optional features + demo prep

### When to Cut Scope
If falling behind, cut in this order:
1. Figma API integration → Keep screenshot-only
2. Download feature → Keep copy-to-clipboard
3. Syntax highlighting → Keep basic code display
4. Dark mode → Keep light mode only
5. Error recovery → Add later if time permits

Keep the core flow working.

### Mental Model
You're building a "code generation assistant" that:
- Takes visual input (design screenshot)
- Uses AI to understand intent
- Produces actionable output (React code)
- Lets users iterate/refine

This is powerful because it respects both designers and developers while using AI thoughtfully.

---

**Good luck! 🚀**

Build something makers will love.
