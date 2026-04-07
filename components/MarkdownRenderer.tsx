import React, { memo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const ThinkingBlock = ({ content, isClosed }: { content: string; isClosed: boolean }) => {
  const [isOpen, setIsOpen] = useState(!isClosed);

  useEffect(() => {
    if (!isClosed) {
      setIsOpen(true);
    }
  }, [isClosed]);

  return (
    <div className="my-4 border border-white/10 rounded-lg overflow-hidden bg-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
      >
        <BrainCircuit className={cn("w-4 h-4", !isClosed && "animate-pulse text-blue-400")} />
        <span>{isClosed ? 'Thought Process' : 'Thinking...'}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 text-sm text-white/60 border-t border-white/10 bg-black/20 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="relative rounded-md overflow-hidden border border-white/10 my-4">
        <div className="flex items-center justify-between px-4 py-1.5 bg-white/5 border-b border-white/10 text-xs text-white/50">
          <span>{match[1]}</span>
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code {...props} className={cn("bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-white/90", className)}>
        {children}
      </code>
    );
  },
  p: ({ children }: any) => <p className="mb-4 last:mb-0 leading-relaxed text-white/80">{children}</p>,
  a: ({ children, href }: any) => <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">{children}</a>,
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 text-white/80 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 text-white/80 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  h1: ({ children }: any) => <h1 className="text-2xl font-semibold mt-6 mb-4 text-white/90">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-5 mb-3 text-white/90">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-medium mt-4 mb-2 text-white/90">{children}</h3>,
  blockquote: ({ children }: any) => <blockquote className="border-l-2 border-white/20 pl-4 italic text-white/60 my-4">{children}</blockquote>,
  table: ({ children }: any) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse">{children}</table></div>,
  th: ({ children }: any) => <th className="border border-white/10 px-4 py-2 bg-white/5 font-medium text-white/90">{children}</th>,
  td: ({ children }: any) => <td className="border border-white/10 px-4 py-2 text-white/80">{children}</td>,
  img: ({ src, alt }: any) => (
    <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] my-6 max-w-2xl mx-auto">
      <img src={src} alt={alt} className="w-full h-auto object-cover" />
      {alt && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-sm text-white/90 font-medium">{alt}</p>
        </div>
      )}
    </div>
  ),
};

export const MarkdownRenderer = memo(({ content, className }: MarkdownRendererProps) => {
  // Parse <think> tags
  const parts = content.split(/(<think>[\s\S]*?(?:<\/think>|$))/g).filter(Boolean);

  return (
    <div className={cn("prose prose-invert max-w-none break-words", className)}>
      {parts.map((part, index) => {
        if (part.startsWith('<think>')) {
          const isClosed = part.endsWith('</think>');
          const innerContent = part.replace(/^<think>/, '').replace(/<\/think>$/, '');
          return <ThinkingBlock key={index} content={innerContent} isClosed={isClosed} />;
        }
        
        if (part.trim() === '') return null;

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {part}
          </ReactMarkdown>
        );
      })}
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';
