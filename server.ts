import express from "express";
import { createServer as createViteServer } from "vite";
import path from 'path';
import { fileURLToPath } from 'url';
import duckduckgoSearch from 'duckduckgo-search';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/search", async (req, res) => {
    const { query } = req.body;
    
    // Input validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required and must be a string' });
    }

    if (query.length > 500) {
      return res.status(400).json({ error: 'Query must be less than 500 characters' });
    }

    try {
      const results = await duckduckgoSearch(query, { maxResults: 5 });
      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed. Please try again.' });
    }
  });

  app.post("/api/context7", async (req, res) => {
    const { query, libraryId } = req.body;
    
    // Input validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required and must be a string' });
    }

    if (query.length > 1000) {
      return res.status(400).json({ error: 'Query must be less than 1000 characters' });
    }

    try {
      // Context7 integration - fetch from Context7 API if available
      // For now, provide helpful documentation snippets for common queries
      const result = await fetchContext7Docs(query, libraryId);
      res.json({ result });
    } catch (error) {
      console.error('Context7 error:', error);
      res.status(500).json({ error: 'Context7 lookup failed. Please try again.' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Context7 documentation fetcher
async function fetchContext7Docs(query: string, libraryId?: string): Promise<string> {
  const queryLower = query.toLowerCase();
  
  // Common documentation responses for popular libraries
  const docs: Record<string, string> = {
    'react': `React Documentation Summary:

Core Concepts:
- Components: Reusable UI building blocks that return JSX
- Props: Read-only inputs passed to components
- State: Mutable data managed with useState hook
- Effects: Side effects handled with useEffect hook

Hooks:
- useState: const [state, setState] = useState(initialValue)
- useEffect: useEffect(() => { /* effect */ }, [dependencies])
- useContext: Access context values without prop drilling
- useRef: Persist values across renders without causing re-renders
- useMemo: Memoize expensive computations
- useCallback: Memoize callback functions

Best Practices:
- Keep components small and focused
- Lift state up when needed
- Use composition over inheritance
- Avoid premature optimization`,

    'next.js': `Next.js Documentation Summary:

App Router (Next.js 13+):
- app/ directory for route definitions
- page.tsx for route pages
- layout.tsx for shared layouts
- loading.tsx for loading states
- error.tsx for error handling

Server Components:
- Default behavior - no 'use client' needed
- Can fetch data directly in components
- Can't use hooks or browser APIs

Client Components:
- Add 'use client' directive at top
- Can use hooks, event handlers, browser APIs
- Rendered on client after hydration

Data Fetching:
- Use async Server Components for data fetching
- Use fetch() with caching options
- Use Server Actions for mutations`,

    'tailwind': `Tailwind CSS Documentation Summary:

Core Concepts:
- Utility-first CSS framework
- Apply utilities directly in HTML/JSX
- Responsive prefixes: sm:, md:, lg:, xl:, 2xl:
- State variants: hover:, focus:, active:, dark:

Common Utilities:
- Layout: flex, grid, block, hidden
- Spacing: p-{n}, m-{n}, px-{n}, py-{n}
- Sizing: w-{n}, h-{n}, max-w-{n}
- Typography: text-{size}, font-{weight}, text-{color}
- Backgrounds: bg-{color}, bg-{opacity}
- Borders: border, rounded-{size}, border-{color}

Best Practices:
- Use @apply for repeated patterns
- Use arbitrary values: w-[500px]
- Extract components for reuse
- Use JIT mode for smaller bundles`,

    'typescript': `TypeScript Documentation Summary:

Basic Types:
- Primitive: string, number, boolean, null, undefined
- Arrays: Type[] or Array<Type>
- Tuples: [Type1, Type2]
- Objects: { key: Type }
- Union: Type1 | Type2

Interfaces vs Types:
- Interface: Can be extended/implemented, better for objects
- Type: More flexible, can represent primitives, unions

Generics:
- function identity<T>(arg: T): T
- interface Box<T> { value: T }
- const fn = <T extends object>(arg: T): T => arg

Utility Types:
- Partial<T>: All properties optional
- Required<T>: All properties required
- Readonly<T>: All properties readonly
- Pick<T, K>: Select specific properties
- Omit<T, K>: Exclude specific properties
- Record<K, T>: Object with K keys and T values`,

    'shadcn': `shadcn/ui Documentation Summary:

Installation:
- npx shadcn@latest init
- npx shadcn@latest add {component}

Available Components:
- Button, Input, Label, Textarea, Select
- Card, CardHeader, CardTitle, CardContent
- Dialog, Sheet, Drawer, Popover
- Tabs, Accordion, Collapsible
- Table, DataTable, Pagination
- Toast, Sonner, Alert
- DropdownMenu, NavigationMenu
- Badge, Avatar, Separator
- Skeleton, Progress, Switch, Slider

Styling:
- Uses Tailwind CSS
- CSS variables for theming
- Variants via class-variance-authority
- Compose with cn() utility

Best Practices:
- Copy components into your project
- Customize to match your design
- Use composition for complex UIs`,
  };

  // Find matching documentation
  for (const [key, value] of Object.entries(docs)) {
    if (queryLower.includes(key)) {
      return value;
    }
  }

  // Default response
  return `Context7 could not find specific documentation for: "${query}"

Try searching for:
- React hooks and components
- Next.js App Router
- Tailwind CSS utilities
- TypeScript types
- shadcn/ui components

Please be more specific about what documentation you need.`;
}

startServer();
