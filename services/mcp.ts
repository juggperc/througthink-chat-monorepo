import { writeVfsFile, readVfsFile, listVfsFiles, deleteVfsFile } from './vfs';
import { runPython } from './python';
import { generateVideo } from './openrouter';

// Input validation helpers
const validateString = (value: unknown, name: string, maxLength: number = 50000): string => {
  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string`);
  }
  if (value.length === 0) {
    throw new Error(`${name} cannot be empty`);
  }
  if (value.length > maxLength) {
    throw new Error(`${name} exceeds maximum length of ${maxLength} characters`);
  }
  return value;
};

const validatePath = (value: unknown): string => {
  const path = validateString(value, 'path', 255);
  // Prevent directory traversal
  if (path.includes('..') || path.startsWith('/') || path.includes('\\')) {
    throw new Error('Invalid path: must be a relative path without directory traversal');
  }
  return path;
};

export const MCP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate a high-quality image from a detailed text prompt using Pollinations AI. Use this whenever the user asks for an image, illustration, diagram, visual concept, or any other visual content. Provide rich, detailed prompts for the best results.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'A detailed, descriptive prompt for the image. Include style (photorealistic, cartoon, watercolor, etc.), subject, composition, lighting, and any other relevant details.' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generate_video',
      description: '(Experimental) Generate a short video clip from a text prompt using OpenRouter video generation models such as minimax/video-01 or google/veo-2. Use this when the user explicitly requests a video or animation. Note: generation may take 30-180 seconds.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'A detailed description of the video to generate. Include subject, action, setting, style, and mood.' },
          model: { type: 'string', description: 'Optional: the video model to use. Defaults to minimax/video-01. Other options: google/veo-2, kling/kling-video-1.0-standard, kling/kling-video-1.0-pro.' },
          image_url: { type: 'string', description: 'Optional: a base64 data URL or publicly accessible image URL to use as the first frame (image-to-video). Leave empty for text-to-video.' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write or overwrite content to a file in the persistent virtual file system. Use this to save code snippets, notes, data files, configuration, or any text content so it can be retrieved later. Files persist across messages in the same session.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative file path including extension (e.g. script.py, notes/ideas.md, data.json). No leading slashes or ".." segments allowed.' },
          content: { type: 'string', description: 'The full text content to write to the file.' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read and return the text content of a file from the virtual file system. Use this to retrieve previously saved files before editing or processing them.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The relative file path to read (e.g. script.py, notes/ideas.md).' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_file',
      description: 'Permanently delete a file from the virtual file system. Use with caution — this cannot be undone.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The relative file path to delete.' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List all files currently stored in the virtual file system. Use this to see what files are available before reading or deleting them.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_python',
      description: 'Execute Python code directly in the browser (via Pyodide) and return stdout/stderr output. Use this for: mathematical calculations, data processing, file manipulation, algorithmic problems, generating charts with matplotlib, or testing code snippets. Standard library and many popular packages (numpy, pandas, matplotlib) are available.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Valid Python code to execute. Use print() to output results. Errors are captured and returned.' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_mini_app',
      description: `Design and render an interactive React mini-application directly inside the chat. Use this for: interactive calculators, data visualisations, forms, games, dashboards, or any rich UI the user requests.

You must export a default functional component. Write clean, complete, self-contained code.

Available in Global Scope (no import needed):
- Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
- Button, Input, Label, Textarea
- Badge, Separator, Progress
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Switch, Slider, Skeleton
- Tabs, TabsContent, TabsList, TabsTrigger

Available via Import:
- lucide-react: All icons (e.g., import { ChevronRight, Star } from 'lucide-react')
- recharts: Charts (e.g., import { LineChart, BarChart, PieChart } from 'recharts')

React Hooks: React.useState, React.useEffect, React.useMemo, React.useCallback, React.useRef

Styling: Tailwind CSS utility classes only. Use dark-mode-friendly colours (bg-background, text-foreground, etc.).

Example:
import { Smile } from 'lucide-react';
export default function App() {
  const [count, setCount] = React.useState(0);
  return (
    <Card>
      <CardHeader><CardTitle>Counter</CardTitle></CardHeader>
      <CardContent className="flex items-center gap-4">
        <Button onClick={() => setCount(c => c - 1)}>-</Button>
        <span className="text-2xl font-bold">{count}</span>
        <Button onClick={() => setCount(c => c + 1)}>+</Button>
      </CardContent>
    </Card>
  );
}`,
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Complete React component code that exports a default component. Must be self-contained and valid JSX/TSX.' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'context7_search',
      description: 'Search official documentation for popular libraries and frameworks. Use this to get accurate, up-to-date API details for React, Next.js, Tailwind CSS, TypeScript, shadcn/ui, Vite, Zustand, and other popular libraries. Always use this before writing code that depends on a specific library API.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Specific documentation query (e.g. "React useCallback hook", "Next.js getServerSideProps", "Tailwind grid utilities")' },
          libraryId: { type: 'string', description: 'Optional Context7 library identifier to narrow the search (e.g. "/facebook/react", "/vercel/next.js", "/tailwindlabs/tailwindcss")' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current news, facts, events, prices, or any real-world information that may be outside your training data. Use this for time-sensitive queries, recent events, or when you need to verify a fact.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'A concise, targeted search query (e.g. "latest React 19 features", "SpaceX launch schedule 2025")' }
        },
        required: ['query']
      }
    }
  }
];

export const executeTool = async (name: string, args: Record<string, unknown>, imageModel: string, apiKey?: string, videoModel?: string): Promise<string> => {
  try {
    switch (name) {
      case 'generate_image': {
        const prompt = validateString(args.prompt, 'prompt', 2000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${imageModel}&nologo=true`;
        return `![${prompt}](${imageUrl})`;
      }

      case 'generate_video': {
        if (!apiKey) throw new Error('API key is required for video generation');
        const prompt = validateString(args.prompt, 'prompt', 2000);
        const model = (typeof args.model === 'string' && args.model.trim()) ? args.model.trim() : (videoModel || 'minimax/video-01');
        const imageUrlArg = typeof args.image_url === 'string' ? args.image_url : undefined;
        const videoUrl = await generateVideo(prompt, apiKey, model, imageUrlArg);
        return `[video:${prompt}](${videoUrl})`;
      }
      
      case 'write_file': {
        const path = validatePath(args.path);
        const content = validateString(args.content, 'content', 1000000);
        return await writeVfsFile(path, content);
      }
      
      case 'read_file': {
        const path = validatePath(args.path);
        return await readVfsFile(path);
      }
      
      case 'delete_file': {
        const path = validatePath(args.path);
        return await deleteVfsFile(path);
      }
      
      case 'list_files': {
        const files = await listVfsFiles();
        return files.length > 0 ? `Files:\n${files.join('\n')}` : 'No files found. Use write_file to create files.';
      }
      
      case 'run_python': {
        const code = validateString(args.code, 'code', 50000);
        return await runPython(code);
      }
      
      case 'create_mini_app': {
        const code = validateString(args.code, 'code', 50000);
        return `[MiniApp Rendered]\n\n\`\`\`react\n${code}\n\`\`\``;
      }
      
      case 'context7_search': {
        const query = validateString(args.query, 'query', 1000);
        const contextResponse = await fetch('/api/context7', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, libraryId: args.libraryId })
        });
        
        if (!contextResponse.ok) {
          throw new Error(`Context7 API error: ${contextResponse.status}`);
        }
        
        const contextData = await contextResponse.json();
        return contextData.result;
      }
      
      case 'web_search': {
        const query = validateString(args.query, 'query', 500);
        const searchResponse = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        if (!searchResponse.ok) {
          throw new Error(`Search API error: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();
        return JSON.stringify(searchData, null, 2);
      }
      
      default:
        return `Error: Unknown tool "${name}". Available tools: ${MCP_TOOLS.map(t => t.function.name).join(', ')}`;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Error executing ${name}: ${message}`;
  }
};
