import { writeVfsFile, readVfsFile, listVfsFiles, deleteVfsFile } from './vfs';
import { runPython } from './python';

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
      description: 'Generate an image based on a descriptive prompt. Use this to create visual content, illustrations, diagrams, or any imagery the user requests.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'The detailed prompt for the image generation. Be specific about style, composition, and content.' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file in the virtual file system. Use this to save code, notes, or any text content that should persist.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path (e.g., script.py, notes.txt, data.json)' },
          content: { type: 'string', description: 'The content to write to the file' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read content from a file in the virtual file system. Use this to retrieve previously saved content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path to read' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_file',
      description: 'Delete a file from the virtual file system.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path to delete' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List all files in the virtual file system.',
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
      description: 'Execute Python code in the browser environment and return the output. Useful for calculations, data processing, visualizations, or running scripts created with write_file.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'The Python code to execute. Supports standard library modules.' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_mini_app',
      description: `Design and render a mini React application directly in the chat. Creates beautiful, interactive UI components.

You must provide valid React code that exports a default functional component.

Available in Global Scope (no import needed):
- Card, CardHeader, CardTitle, CardContent, CardDescription
- Button, Input, Label, Textarea
- Badge, Separator, Progress
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Switch, Slider, Skeleton
- Tabs, TabsContent, TabsList, TabsTrigger

Available via Import:
- lucide-react: All icons (e.g., import { ChevronRight } from 'lucide-react')
- recharts: Charts (e.g., import { LineChart, BarChart } from 'recharts')

React Hooks: Use React.useState, React.useEffect, React.useMemo, React.useCallback, React.useRef

Styling: Use Tailwind CSS classes for all styling.

Example:
import { Smile } from 'lucide-react';
export default function App() {
  const [count, setCount] = React.useState(0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter App</CardTitle>
      </CardHeader>
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
          code: { type: 'string', description: 'The React component code to render. Must export a default component.' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'context7_search',
      description: 'Search documentation for libraries, frameworks, and APIs. Use this to get accurate, up-to-date information about React, Next.js, Tailwind CSS, TypeScript, shadcn/ui, and other popular libraries.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query (e.g., "React useState hook", "Next.js App Router")' },
          libraryId: { type: 'string', description: 'Optional library identifier (e.g., "/facebook/react", "/vercel/next.js")' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information, news, or any topic not covered by other tools.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      }
    }
  }
];

export const executeTool = async (name: string, args: Record<string, unknown>, imageModel: string): Promise<string> => {
  try {
    switch (name) {
      case 'generate_image': {
        const prompt = validateString(args.prompt, 'prompt', 2000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${imageModel}&nologo=true`;
        return `![${prompt}](${imageUrl})`;
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
