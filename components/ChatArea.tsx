import React, { useEffect, useRef, memo } from 'react';
import { useChatStore, Message, Attachment } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MiniAppRenderer } from './MiniAppRenderer';
import { Bot, User, FileCode2, FileText, Terminal, Search, LayoutTemplate, Image as ImageIcon, FileSpreadsheet, Video } from 'lucide-react';

const getAttachmentIcon = (type: Attachment['type']) => {
 switch (type) {
 case 'pdf':
 return <FileText className="w-3.5 h-3.5 text-red-400" />;
 case 'word':
 return <FileText className="w-3.5 h-3.5 text-blue-400" />;
 case 'excel':
 return <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />;
 case 'text':
 return <FileText className="w-3.5 h-3.5 text-gray-400" />;
 default:
 return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
 }
};

const formatFileSize = (bytes: number): string => {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatMessage = memo(({ message, isLast, isGenerating }: { message: Message, isLast: boolean, isGenerating: boolean }) => {
 const isTool = message.role === 'tool';

 if (isTool) {
 if (message.tool_name === 'generate_image') {
 const match = message.content.match(/\!\[(.*?)\]\((.*?)\)/);
 if (match) {
 return (
 <div className="py-2 w-full flex justify-start">
 <div className="w-full pl-12">
 <div className="relative group rounded-2xl overflow-hidden border border-border shadow-lg max-w-md">
 <img src={match[2]} alt={match[1]} className="w-full h-auto object-cover" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
 <p className="text-sm text-foreground font-medium">{match[1]}</p>
 </div>
 </div>
 </div>
 </div>
 );
 }
 }

 if (message.tool_name === 'generate_video') {
 const match = message.content.match(/\[video:(.*?)\]\((.*?)\)/);
 if (match) {
 return (
 <div className="py-2 w-full flex justify-start">
 <div className="w-full pl-12">
 <div className="relative group rounded-2xl overflow-hidden border border-border shadow-lg max-w-lg">
 <video
 src={match[2]}
 controls
 autoPlay
 loop
 muted
 playsInline
 className="w-full h-auto"
 aria-label={match[1]}
 />
 <div className="px-3 py-2 bg-card/80 backdrop-blur-sm border-t border-border">
 <p className="text-xs text-muted-foreground truncate">{match[1]}</p>
 </div>
 </div>
 </div>
 </div>
 );
 }
 }

 if (message.tool_name === 'create_mini_app') {
 const codeMatch = message.content.match(/```react\n([\s\S]*?)\n```/);
 if (codeMatch) {
 return (
 <div className="py-2 w-full flex justify-start">
 <div className="w-full pl-12 max-w-2xl">
 <MiniAppRenderer code={codeMatch[1]} />
 </div>
 </div>
 );
 }
 }

 let Icon = Terminal;
 if (message.tool_name === 'write_file' || message.tool_name === 'read_file' || message.tool_name === 'list_files' || message.tool_name === 'delete_file') Icon = FileText;
 if (message.tool_name === 'run_python') Icon = FileCode2;
 if (message.tool_name === 'context7_search') Icon = Search;
 if (message.tool_name === 'create_mini_app') Icon = LayoutTemplate;
 if (message.tool_name === 'generate_image') Icon = ImageIcon;
 if (message.tool_name === 'generate_video') Icon = Video;

 const toolNameDisplay = message.tool_name?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || message.tool_name;

 return (
 <div className="py-1 w-full flex justify-start">
 <div className="flex flex-col w-full items-start pl-12">
 <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
 <Icon className="w-3.5 h-3.5" />
 <span className="font-mono">{toolNameDisplay}</span>
 </div>
 {message.tool_name === 'run_python' && message.content && (
 <pre className="mt-2 text-xs text-foreground/70 bg-card p-3 rounded-lg border border-border max-w-full overflow-x-auto font-mono whitespace-pre-wrap">
 {message.content}
 </pre>
 )}
 </div>
 </div>
 );
 }

 const displayContent = message.content + (isLast && isGenerating && message.role === 'assistant' ? ' ▍' : '');

 return (
 <div
 className={`flex gap-4 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
 style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100px' }}
 >
 {message.role === 'assistant' && (
 <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border mt-0">
 <Bot className="w-5 h-5 text-foreground/80" />
 </div>
 )}

 <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-secondary text-foreground px-5 py-3.5 rounded-3xl rounded-tr-sm' : 'text-foreground/90 pt-0.5'}`}>
 {/* Images */}
 {message.images && message.images.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-3">
 {message.images.map((img, i) => (
 <img key={i} src={img} alt={`Attached image ${i + 1}`} className="max-w-[250px] max-h-[250px] rounded-xl border border-border object-cover shadow-md" />
 ))}
 </div>
 )}

 {/* Document attachments */}
 {message.attachments && message.attachments.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-3">
 {message.attachments.map((att, i) => (
 <div key={i} className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
 {getAttachmentIcon(att.type)}
 <div className="flex flex-col">
 <span className="text-xs font-medium text-foreground truncate max-w-[150px]">{att.name}</span>
 <span className="text-[10px] text-muted-foreground">{formatFileSize(att.size)}</span>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Tool calls */}
 {message.tool_calls && message.tool_calls.length > 0 && (
 <div className="flex flex-col gap-2 mb-3">
 {message.tool_calls.map((tc, i) => {
 const toolName = tc.function.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
 return (
 <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border w-fit">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
 <span>{toolName}</span>
 </div>
 );
 })}
 </div>
 )}

 {message.role === 'user' ? (
 <div className="whitespace-pre-wrap">{message.content}</div>
 ) : (
 <>
 {isLast && isGenerating && !message.content && (!message.tool_calls || message.tool_calls.length === 0) ? (
 <div className="space-y-3 mt-2 w-full min-w-[200px] max-w-md">
 <div className="h-4 bg-secondary rounded-md animate-pulse w-3/4"></div>
 <div className="h-4 bg-secondary rounded-md animate-pulse w-full"></div>
 <div className="h-4 bg-secondary rounded-md animate-pulse w-5/6"></div>
 </div>
 ) : (
 <MarkdownRenderer content={displayContent} />
 )}
 </>
 )}
 </div>

 {message.role === 'user' && (
 <div className="w-8 h-8 rounded-full bg-foreground/20 flex items-center justify-center shrink-0">
 <User className="w-5 h-5 text-foreground" />
 </div>
 )}
 </div>
);
});

ChatMessage.displayName = 'ChatMessage';

export function ChatArea() {
 const { chats, currentChatId, isGenerating } = useChatStore();
 const { language } = useLanguageStore();
 const scrollRef = useRef<HTMLDivElement>(null);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const currentChat = chats.find(c => c.id === currentChatId);

 useEffect(() => {
 if (messagesEndRef.current) {
 messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
 }
 }, [currentChat?.messages, isGenerating]);

 if (!currentChat || currentChat.messages.length === 0) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
 <h1 className="text-3xl font-medium text-foreground/80 mb-2 tracking-tight">{t('ready', language)}</h1>
 </div>
 );
 }

 return (
 <div className="flex-1 w-full overflow-y-auto" ref={scrollRef}>
 <div className="max-w-3xl mx-auto w-full py-8 px-4 space-y-8">
 {currentChat.messages.map((message, index) => (
 <ChatMessage
 key={message.id}
 message={message}
 isLast={index === currentChat.messages.length - 1}
 isGenerating={isGenerating}
 />
 ))}
 <div ref={messagesEndRef} />
 </div>
 </div>
 );
}
