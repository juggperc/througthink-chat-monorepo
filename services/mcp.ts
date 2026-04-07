import { writeVfsFile, readVfsFile, listVfsFiles } from './vfs';
import { runPython } from './python';

export const MCP_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an image based on a descriptive prompt.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'The detailed prompt for the image generation.' }
        },
        required: ['prompt']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file in the virtual file system.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The file path (e.g., script.py, notes.txt)' },
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
      description: 'Read content from a file in the virtual file system.',
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
      description: 'Execute Python code in the browser environment and return the output. Useful for calculations, data processing, or running scripts created with write_file.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'The Python code to execute' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_mini_app',
      description: 'Design and render a mini React application directly in the chat. You must provide valid React code. The code should export a default functional component. You have access to standard React hooks (useState, useEffect, etc.) via the \'React\' object. You can use Tailwind CSS classes for styling. Prebuilt UI components are available directly in the global scope (DO NOT import them, just use them directly): Card, CardHeader, CardTitle, CardContent, Button, Input, Label. You can import from \'lucide-react\' and \'recharts\'. Example: `import { LineChart } from "recharts"; export default function App() { const [c, setC] = React.useState(0); return <Card><CardContent><Button onClick={() => setC(c+1)}>Count: {c}</Button></CardContent></Card>; }`',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'The React component code to render' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'context7_search',
      description: 'Context7 MCP: Search the baked-in context knowledge base.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information.',
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

export const executeTool = async (name: string, args: any, imageModel: string): Promise<string> => {
  try {
    switch (name) {
      case 'generate_image':
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(args.prompt)}?model=${imageModel}&nologo=true`;
        return `![${args.prompt}](${imageUrl})`;
      case 'write_file':
        return await writeVfsFile(args.path, args.content);
      case 'read_file':
        return await readVfsFile(args.path);
      case 'list_files':
        const files = await listVfsFiles();
        return files.length > 0 ? `Files:\n${files.join('\n')}` : 'No files found.';
      case 'run_python':
        return await runPython(args.code);
      case 'create_mini_app':
        return `[MiniApp Rendered]\n\n\`\`\`react\n${args.code}\n\`\`\``;
      case 'context7_search':
        const contextResponse = await fetch('/api/context7', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: args.query })
        });
        const contextData = await contextResponse.json();
        return contextData.result;
      case 'web_search':
        const searchResponse = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: args.query })
        });
        const searchData = await searchResponse.json();
        return JSON.stringify(searchData);
      default:
        return `Error: Tool ${name} not found.`;
    }
  } catch (error: any) {
    return `Error executing ${name}: ${error.message}`;
  }
};
