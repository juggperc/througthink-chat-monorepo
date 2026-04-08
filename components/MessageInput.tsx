import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, Attachment } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowUp, Square, Image as ImageIcon, X, FileText, Loader2 } from 'lucide-react';
import { streamOpenRouterResponse, OpenRouterMessage, OpenRouterContent } from '@/services/openrouter';
import { executeTool } from '@/services/mcp';
import { parseFile, ParsedFile } from '@/services/fileParser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MessageInput() {
 const [input, setInput] = useState('');
 const [attachments, setAttachments] = useState<Attachment[]>([]);
 const [isUploading, setIsUploading] = useState(false);
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 const abortControllerRef = useRef<AbortController | null>(null);

 const {
 apiKey,
 model,
 imageModel,
 videoModel,
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

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []);
 if (files.length === 0) return;

 setIsUploading(true);
 
 try {
 const parsedFiles = await Promise.all(files.map(file => parseFile(file)));
 
 const newAttachments: Attachment[] = parsedFiles.map(pf => ({
 type: pf.type,
 name: pf.name,
 content: pf.content,
 mimeType: pf.mimeType,
 size: pf.size
 }));

 setAttachments(prev => [...prev, ...newAttachments]);
 } catch (error) {
 console.error('File upload error:', error);
 toast.error('Upload Error', {
 description: 'Failed to process one or more files.',
 });
 } finally {
 setIsUploading(false);
 if (fileInputRef.current) {
 fileInputRef.current.value = '';
 }
 }
 };

 const removeAttachment = (index: number) => {
 setAttachments(prev => prev.filter((_, i) => i !== index));
 };

 const handleSend = async () => {
 if ((!input.trim() && attachments.length === 0) || isGenerating) return;
 if (!apiKey) {
 setSettingsOpen(true);
 return;
 }

 let activeChatId = currentChatId;
 if (!activeChatId) {
 activeChatId = createChat();
 }

 const userMessageContent = input.trim();
 const userAttachments = [...attachments];

 setInput('');
 setAttachments([]);

 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto';
 }

 // Add user message with attachments
 addMessage(activeChatId, { 
 role: 'user', 
 content: userMessageContent, 
 images: userAttachments.filter(a => a.type === 'image').map(a => a.content),
 attachments: userAttachments.filter(a => a.type !== 'image')
 });

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
 // Handle images
 if (m.role === 'user' && m.images && m.images.length > 0) {
 const content: OpenRouterContent[] = [];
 if (m.content) content.push({ type: 'text', text: m.content });
 m.images.forEach(img => {
 content.push({ type: 'image_url', image_url: { url: img } });
 });
 // Include document attachments as text
 if (m.attachments && m.attachments.length > 0) {
 m.attachments.forEach(att => {
 content.push({ type: 'text', text: `\n\n--- Attached: ${att.name} ---\n${att.content}` });
 });
 }
 return { role: m.role, content };
 }

 // Handle document attachments only
 if (m.role === 'user' && m.attachments && m.attachments.length > 0) {
 let content = m.content;
 m.attachments.forEach(att => {
 content += `\n\n--- Attached: ${att.name} ---\n${att.content}`;
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
 const toolResult = await executeTool(tc.function.name, args, imageModel, apiKey, videoModel);

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
 className: 'bg-destructive/80 border-destructive/50 text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md',
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

 const getAttachmentIcon = (type: Attachment['type']) => {
 switch (type) {
 case 'pdf':
 return <FileText className="w-4 h-4 text-red-400" />;
 case 'word':
 return <FileText className="w-4 h-4 text-blue-400" />;
 case 'excel':
 return <FileText className="w-4 h-4 text-green-400" />;
 default:
 return <FileText className="w-4 h-4" />;
 }
 };

 const formatFileSize = (bytes: number): string => {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
 };

 return (
 <div className="relative w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
 {attachments.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-2 p-2 bg-secondary rounded-xl border border-border">
 {attachments.map((att, index) => (
 <div key={index} className="relative group flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
 {att.type === 'image' ? (
 <img src={att.content} alt={att.name} className="w-8 h-8 object-cover rounded" />
 ) : (
 getAttachmentIcon(att.type)
 )}
 <div className="flex flex-col">
 <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{att.name}</span>
 {att.type !== 'image' && (
 <span className="text-[10px] text-muted-foreground">{formatFileSize(att.size)}</span>
 )}
 </div>
 <button
 onClick={() => removeAttachment(index)}
 className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
 aria-label={`Remove ${att.name}`}
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}
 </div>
 )}

 <div className="relative flex items-end w-full bg-secondary rounded-[32px] border border-border shadow-lg focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden">
 <input
 type="file"
 accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.json,.js,.ts,.py"
 multiple
 className="hidden"
 ref={fileInputRef}
 onChange={handleFileUpload}
 />
 <Button
 variant="ghost"
 size="icon"
 className="absolute left-2.5 bottom-2.5 h-9 w-9 text-foreground/50 hover:text-foreground hover:bg-accent rounded-full"
 onClick={() => fileInputRef.current?.click()}
 disabled={isUploading}
 aria-label="Attach file"
 >
 {isUploading ? (
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 <ImageIcon className="w-5 h-5" />
 )}
 </Button>

 <textarea
 ref={textareaRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder={t('typeMessage', language)}
 className="w-full max-h-[200px] min-h-[56px] py-4 pl-14 pr-14 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
 rows={1}
 aria-label="Message input"
 />
 <div className="absolute right-2.5 bottom-2.5">
 {isGenerating ? (
 <Button
 onClick={handleStop}
 size="icon"
 className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
 aria-label="Stop generating"
 >
 <Square className="h-4 w-4 fill-current" />
 </Button>
 ) : (
 <Button
 onClick={handleSend}
 disabled={!input.trim() && attachments.length === 0}
 size="icon"
 className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-colors"
 aria-label="Send message"
 >
 <ArrowUp className="h-5 w-5" />
 </Button>
 )}
 </div>
 </div>
 <div className="text-center mt-2 text-[11px] text-muted-foreground">
 AI can make mistakes. Consider verifying important information.
 </div>
 </div>
);
}
