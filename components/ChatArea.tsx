import React, { useEffect, useRef, memo } from 'react';
import { useChatStore, Message } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MiniAppRenderer } from './MiniAppRenderer';
import { Bot, User, ImageIcon, FileCode2, FileText, Terminal, Search, LayoutTemplate } from 'lucide-react';

const ChatMessage = memo(({ message, isLast, isGenerating }: { message: Message, isLast: boolean, isGenerating: boolean }) => {
  const isTool = message.role === 'tool';

  if (isTool) {
    if (message.tool_name === 'generate_image') {
      const match = message.content.match(/\!\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <div className="py-2 w-full flex justify-start">
            <div className="w-full pl-12">
              <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] max-w-md">
                <img src={match[2]} alt={match[1]} className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-sm text-white/90 font-medium">{match[1]}</p>
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
    if (message.tool_name === 'write_file' || message.tool_name === 'read_file' || message.tool_name === 'list_files') Icon = FileText;
    if (message.tool_name === 'run_python') Icon = FileCode2;
    if (message.tool_name === 'context7_search') Icon = Search;
    if (message.tool_name === 'create_mini_app') Icon = LayoutTemplate;

    return (
      <div className="py-1 w-full flex justify-start">
        <div className="flex flex-col w-full items-start pl-12">
           <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
             <Icon className="w-3.5 h-3.5" />
             <span className="font-mono">Tool Result: {message.tool_name}</span>
           </div>
           {message.tool_name === 'run_python' && message.content && (
             <pre className="mt-2 text-xs text-white/70 bg-black/40 p-3 rounded-lg border border-white/5 max-w-full overflow-x-auto font-mono whitespace-pre-wrap">
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
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 mt-0">
          <Bot className="w-5 h-5 text-white/80" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-[#2f2f2f] text-white px-5 py-3.5 rounded-3xl rounded-tr-sm' : 'text-white/90 pt-0.5'}`}>
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.images.map((img, i) => (
              <img key={i} src={img} alt="Attached" className="max-w-[250px] max-h-[250px] rounded-xl border border-white/10 object-cover shadow-md" />
            ))}
          </div>
        )}
        
        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {message.tool_calls.map((tc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-2 rounded-lg border border-white/10 w-fit">
                <div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                <span>Using tool: {tc.function.name}...</span>
              </div>
            ))}
          </div>
        )}

        {message.role === 'user' ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <>
            {isLast && isGenerating && !message.content && (!message.tool_calls || message.tool_calls.length === 0) ? (
              <div className="space-y-3 mt-2 w-full min-w-[200px] max-w-md">
                <div className="h-4 bg-white/10 rounded-md animate-pulse w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-md animate-pulse w-full"></div>
                <div className="h-4 bg-white/10 rounded-md animate-pulse w-5/6"></div>
              </div>
            ) : (
              <MarkdownRenderer content={displayContent} />
            )}
          </>
        )}
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
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
      <div className="flex-1 flex flex-col items-center justify-center text-white/50">
        <h1 className="text-3xl font-medium text-white/80 mb-2 tracking-tight">{t('ready', language)}</h1>
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
