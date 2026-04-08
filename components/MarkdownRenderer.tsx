import React, { memo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { BrainCircuit, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
 content: string;
 className?: string;
}

const CopyButton = ({ code }: { code: string }) => {
 const [copied, setCopied] = useState(false);

 const handleCopy = async () => {
 await navigator.clipboard.writeText(code);
 setCopied(true);
 toast.success('Copied to clipboard');
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <button
 onClick={handleCopy}
 className="p-1.5 rounded-md hover:bg-foreground/10 transition-colors"
 aria-label="Copy code"
 >
 {copied ? (
 <Check className="w-3.5 h-3.5 text-emerald-400" />
 ) : (
 <Copy className="w-3.5 h-3.5 text-muted-foreground" />
 )}
 </button>
 );
};

const ThinkingBlock = ({ content, isClosed }: { content: string; isClosed: boolean }) => {
 const [isOpen, setIsOpen] = useState(!isClosed);

 useEffect(() => {
 if (!isClosed) {
 setIsOpen(true);
 }
 }, [isClosed]);

 return (
 <div className="my-4 border border-border rounded-lg overflow-hidden bg-secondary/50">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
 aria-expanded={isOpen}
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
 <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border bg-card/50">
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
 const codeString = String(children).replace(/\n$/, '');
 
 return !inline && match ? (
 <div className="relative rounded-lg overflow-hidden border border-border my-4">
 <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border text-xs text-muted-foreground">
 <span className="font-mono">{match[1]}</span>
 <CopyButton code={codeString} />
 </div>
 <SyntaxHighlighter
 {...props}
 style={vscDarkPlus}
 language={match[1]}
 PreTag="div"
 customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}
 >
 {codeString}
 </SyntaxHighlighter>
 </div>
 ) : (
 <code {...props} className={cn("bg-secondary rounded px-1.5 py-0.5 text-sm font-mono text-foreground/90", className)}>
 {children}
 </code>
 );
 },
 p: ({ children }: any) => <p className="mb-4 last:mb-0 leading-relaxed text-foreground/80">{children}</p>,
 a: ({ children, href }: any) => (
 <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
 {children}
 </a>
 ),
 ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-1">{children}</ul>,
 ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 text-foreground/80 space-y-1">{children}</ol>,
 li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
 h1: ({ children }: any) => <h1 className="text-2xl font-semibold mt-6 mb-4 text-foreground">{children}</h1>,
 h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>,
 h3: ({ children }: any) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
 blockquote: ({ children }: any) => (
 <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground my-4">
 {children}
 </blockquote>
 ),
 table: ({ children }: any) => (
 <div className="overflow-x-auto my-4 rounded-lg border border-border">
 <table className="w-full text-left border-collapse">{children}</table>
 </div>
 ),
 th: ({ children }: any) => (
 <th className="border-b border-border px-4 py-2 bg-secondary/50 font-medium text-foreground">
 {children}
 </th>
 ),
 td: ({ children }: any) => (
 <td className="border-b border-border px-4 py-2 text-foreground/80 last:border-b-0">
 {children}
 </td>
 ),
 img: ({ src, alt }: any) => (
 <div className="relative group rounded-xl overflow-hidden border border-border shadow-lg my-6 max-w-2xl mx-auto">
 <img src={src} alt={alt || 'Image'} className="w-full h-auto object-cover" loading="lazy" />
 {alt && (
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
 <p className="text-sm text-foreground font-medium">{alt}</p>
 </div>
 )}
 </div>
 ),
};

export const MarkdownRenderer = memo(({ content, className }: MarkdownRendererProps) => {
 // Parse <arg_key> tags
 const parts = content.split(/(占了[\s\S]*?(?:<\/think>|$))/g).filter(Boolean);

 return (
 <div className={cn("prose prose-invert max-w-none break-words", className)}>
 {parts.map((part, index) => {
 if (part.startsWith('
')) {
 const isClosed = part.endsWith('</think>');
 const innerContent = part.replace(/^
/, '').replace(/<\/think>$/, '');
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
