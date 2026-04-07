import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowUp, Square, Image as ImageIcon, X } from 'lucide-react';
import { streamOpenRouterResponse, OpenRouterMessage, OpenRouterContent } from '@/services/openrouter';
import { executeTool } from '@/services/mcp';
import { toast } from 'sonner';

export function MessageInput() {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { 
    apiKey, 
    model, 
    imageModel,
    systemPrompt,
    currentChatId, 
    chats, 
    addMessage, 
    updateMessageContent,
    updateMessageToolCalls,
    removeMessage,
    createChat,
    setSettingsOpen,
    setIsGenerating,
    isGenerating
  } = useChatStore();
  const { language } = useLanguageStore();

  const currentChat = chats.find(c => c.id === currentChatId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!input.trim() && images.length === 0) || isGenerating) return;
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = createChat();
    }

    const userMessageContent = input.trim();
    const userImages = [...images];
    
    setInput('');
    setImages([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message
    addMessage(activeChatId, { role: 'user', content: userMessageContent, images: userImages });
    
    // Add empty assistant message placeholder
    addMessage(activeChatId, { role: 'assistant', content: '' });
    
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const updatedChat = useChatStore.getState().chats.find(c => c.id === activeChatId);
      if (!updatedChat) throw new Error("Chat not found");

      const apiMessages: OpenRouterMessage[] = [];
      
      if (systemPrompt.trim()) {
        apiMessages.push({ role: 'system', content: systemPrompt.trim() });
      }

      // Format history for OpenRouter
      const historyMessages = updatedChat.messages.slice(0, -1).map(m => {
        if (m.role === 'user' && m.images && m.images.length > 0) {
          const content: OpenRouterContent[] = [];
          if (m.content) content.push({ type: 'text', text: m.content });
          m.images.forEach(img => {
            content.push({ type: 'image_url', image_url: { url: img } });
          });
          return { role: m.role, content };
        }
        
        const msg: OpenRouterMessage = { role: m.role, content: m.content };
        if (m.tool_calls) msg.tool_calls = m.tool_calls;
        if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
        if (m.tool_name) msg.name = m.tool_name;
        return msg;
      });

      apiMessages.push(...historyMessages);

      const processStream = async (messagesToProcess: OpenRouterMessage[], assistantMessageId: string) => {
        const stream = streamOpenRouterResponse(messagesToProcess, apiKey, model);
        let fullResponse = '';
        let receivedToolCalls: any[] | null = null;

        for await (const chunk of stream) {
          if (abortControllerRef.current?.signal.aborted) break;
          
          if (chunk.type === 'content') {
            fullResponse += chunk.content;
            updateMessageContent(activeChatId!, assistantMessageId, fullResponse);
          } else if (chunk.type === 'tool_calls') {
            receivedToolCalls = chunk.toolCalls;
          }
        }

        if (receivedToolCalls && !abortControllerRef.current?.signal.aborted) {
          // Update assistant message with tool calls
          updateMessageToolCalls(activeChatId!, assistantMessageId, receivedToolCalls);
          
          const newApiMessages = [
            ...messagesToProcess, 
            { role: 'assistant' as const, content: fullResponse, tool_calls: receivedToolCalls }
          ];
          
          // Execute tools
          for (const tc of receivedToolCalls) {
            try {
              const args = JSON.parse(tc.function.arguments || '{}');
              const toolResult = await executeTool(tc.function.name, args, imageModel);
              
              addMessage(activeChatId!, { role: 'tool', content: toolResult, tool_call_id: tc.id, tool_name: tc.function.name });
              newApiMessages.push({ role: 'tool', content: toolResult, tool_call_id: tc.id, name: tc.function.name });
            } catch (e: any) {
              console.error("Tool execution failed", e);
              const errorResult = `Failed to execute tool: ${e.message}`;
              addMessage(activeChatId!, { role: 'tool', content: errorResult, tool_call_id: tc.id, tool_name: tc.function.name });
              newApiMessages.push({ role: 'tool', content: errorResult, tool_call_id: tc.id, name: tc.function.name });
            }
          }
          
          // Add new assistant message for final response
          addMessage(activeChatId!, { role: 'assistant', content: '' });
          const latestChat = useChatStore.getState().chats.find(c => c.id === activeChatId);
          const newAssistantMessageId = latestChat!.messages[latestChat!.messages.length - 1].id;
          
          // Recurse to get final response
          await processStream(newApiMessages, newAssistantMessageId);
        }
      };

      const initialAssistantMessageId = updatedChat.messages[updatedChat.messages.length - 1].id;
      await processStream(apiMessages, initialAssistantMessageId);

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Streaming error:", error);
      
      const updatedChat = useChatStore.getState().chats.find(c => c.id === activeChatId);
      if (updatedChat) {
        const assistantMessageId = updatedChat.messages[updatedChat.messages.length - 1].id;
        const msg = updatedChat.messages[updatedChat.messages.length - 1];
        if (!msg.content) {
          removeMessage(activeChatId, assistantMessageId);
        }
      }

      toast.error('API Error', {
        description: error.message || 'Something went wrong while communicating with OpenRouter.',
        className: 'bg-red-950/80 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md',
      });
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-[#2f2f2f] rounded-xl border border-white/5">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img src={img} alt="Upload preview" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative flex items-end w-full bg-[#2f2f2f] rounded-[32px] border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] focus-within:ring-1 focus-within:ring-white/20 transition-all overflow-hidden">
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2.5 bottom-2.5 h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('typeMessage', language)}
          className="w-full max-h-[200px] min-h-[56px] py-4 pl-14 pr-14 bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
          rows={1}
        />
        <div className="absolute right-2.5 bottom-2.5">
          {isGenerating ? (
            <Button 
              onClick={handleStop}
              size="icon" 
              className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button 
              onClick={handleSend}
              disabled={!input.trim() && images.length === 0}
              size="icon" 
              className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:bg-white/20 disabled:text-white/50 transition-colors"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="text-center mt-2 text-[11px] text-white/30">
        AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
