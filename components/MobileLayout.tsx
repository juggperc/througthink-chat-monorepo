import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatArea } from './ChatArea';
import { MessageInput } from './MessageInput';
import { Library } from './Library';
import { FilesView } from './FilesView';
import { Button } from './ui/button';
import { MessageSquare, Clock, Library as LibraryIcon, Settings, Plus, Trash2, FileText } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialModal } from './TutorialModal';

export function MobileLayout() {
 const { chats, currentChatId, selectChat, createChat, deleteChat, setSettingsOpen, currentView, setCurrentView } = useChatStore();
 const [mobileTab, setMobileTab] = useState<'chat' | 'history' | 'library' | 'files'>('chat');
 const [isTutorialOpen, setIsTutorialOpen] = useState(false);

 // Sync mobileTab with currentView if library is selected elsewhere
 React.useEffect(() => {
 if (currentView === 'library' && mobileTab !== 'library') {
 setMobileTab('library');
 } else if (currentView === 'files' && mobileTab !== 'files') {
 setMobileTab('files');
 } else if (currentView === 'chat' && (mobileTab === 'library' || mobileTab === 'files')) {
 setMobileTab('chat');
 }
 }, [currentView]);

 const handleTabChange = (tab: 'chat' | 'history' | 'library' | 'files') => {
 setMobileTab(tab);
 if (tab === 'library') setCurrentView('library');
 else if (tab === 'files') setCurrentView('files');
 else setCurrentView('chat');
 };

 const handleChatKeyDown = (e: React.KeyboardEvent, chatId: string) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 selectChat(chatId);
 handleTabChange('chat');
 }
 };

 const handleDeleteKeyDown = (e: React.KeyboardEvent, chatId: string) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 e.stopPropagation();
 deleteChat(chatId);
 }
 };

 return (
 <div className="md:hidden flex flex-col bg-flowing relative z-50" style={{ height: '100dvh' }}>
 {/* Top Header */}
 <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-sidebar/80 backdrop-blur-md z-10 shrink-0">
 <div className="relative group cursor-pointer" onClick={() => setIsTutorialOpen(true)}>
 <div className="absolute -inset-0.5 bg-orange-stripes rounded-xl blur opacity-40"></div>
 <div className="relative p-[1px] rounded-xl bg-orange-stripes">
 <div className="relative flex items-center justify-center px-3 py-1.5 bg-sidebar rounded-xl overflow-hidden">
 <span className="font-semibold text-sidebar-foreground relative z-10 tracking-wide text-sm">
 Throughthink
 </span>
 </div>
 </div>
 </div>
 <Button
 onClick={() => {
 createChat();
 handleTabChange('chat');
 }}
 variant="ghost"
 size="sm"
 className="text-foreground/80 hover:text-foreground hover:bg-accent"
 >
 <Plus className="w-4 h-4 mr-2" />
 New
 </Button>
 </header>

 {/* Main Content Area */}
 <main className="flex-1 overflow-hidden relative min-h-0">
 <AnimatePresence mode="wait">
 {mobileTab === 'chat' && (
 <motion.div
 key="chat"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 flex flex-col"
 >
 <ChatArea />
 <MessageInput />
 </motion.div>
 )}

 {mobileTab === 'history' && (
 <motion.div
 key="history"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 flex flex-col bg-sidebar"
 >
 <div className="p-4 border-b border-border">
 <h2 className="text-lg font-medium text-foreground">Chat History</h2>
 </div>
 <ScrollArea className="flex-1 px-4 py-2">
 <div className="space-y-2">
 {chats.map((chat) => (
 <div
 key={chat.id}
 className={cn(
 "group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all text-sm border",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 currentChatId === chat.id
 ? "bg-accent text-foreground border-border"
 : "text-foreground/60 hover:bg-accent/50 border-transparent"
 )}
 onClick={() => {
 selectChat(chat.id);
 handleTabChange('chat');
 }}
 onKeyDown={(e) => handleChatKeyDown(e, chat.id)}
 tabIndex={0}
 role="button"
 aria-current={currentChatId === chat.id ? 'page' : undefined}
 >
 <div className="flex items-center gap-3 overflow-hidden pr-6">
 <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
 <span className="truncate font-medium">{chat.title}</span>
 </div>
 <button
 onClick={(e) => {
 e.stopPropagation();
 deleteChat(chat.id);
 }}
 onKeyDown={(e) => handleDeleteKeyDown(e, chat.id)}
 className="p-2 hover:bg-accent rounded-lg text-foreground/50 hover:text-red-400 transition-all"
 aria-label={`Delete chat: ${chat.title}`}
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))}
 {chats.length === 0 && (
 <div className="text-center py-10 text-muted-foreground">
 No chat history yet
 </div>
 )}
 </div>
 </ScrollArea>
 </motion.div>
 )}

 {mobileTab === 'library' && (
 <motion.div
 key="library"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 flex flex-col bg-sidebar"
 >
 <Library />
 </motion.div>
 )}

 {mobileTab === 'files' && (
 <motion.div
 key="files"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 flex flex-col bg-sidebar"
 >
 <FilesView />
 </motion.div>
 )}
 </AnimatePresence>
 </main>

 {/* Bottom Navigation */}
 <nav
  className="border-t border-border bg-sidebar flex items-center justify-around px-2 shrink-0"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
 >
 <button
 onClick={() => handleTabChange('chat')}
 onKeyDown={(e) => e.key === 'Enter' && handleTabChange('chat')}
 className={cn(
 "flex flex-col items-center justify-center w-14 h-12 gap-0.5 transition-colors rounded-lg",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 mobileTab === 'chat' ? "text-foreground" : "text-foreground/40 hover:text-foreground/70"
 )}
 aria-current={mobileTab === 'chat' ? 'page' : undefined}
 aria-label="Chat"
 >
 <MessageSquare className="w-5 h-5" />
 <span className="text-[10px] font-medium">Chat</span>
 </button>
 <button
 onClick={() => handleTabChange('history')}
 onKeyDown={(e) => e.key === 'Enter' && handleTabChange('history')}
 className={cn(
 "flex flex-col items-center justify-center w-14 h-12 gap-0.5 transition-colors rounded-lg",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 mobileTab === 'history' ? "text-foreground" : "text-foreground/40 hover:text-foreground/70"
 )}
 aria-current={mobileTab === 'history' ? 'page' : undefined}
 aria-label="History"
 >
 <Clock className="w-5 h-5" />
 <span className="text-[10px] font-medium">History</span>
 </button>
 <button
 onClick={() => handleTabChange('files')}
 onKeyDown={(e) => e.key === 'Enter' && handleTabChange('files')}
 className={cn(
 "flex flex-col items-center justify-center w-14 h-12 gap-0.5 transition-colors rounded-lg",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 mobileTab === 'files' ? "text-foreground" : "text-foreground/40 hover:text-foreground/70"
 )}
 aria-current={mobileTab === 'files' ? 'page' : undefined}
 aria-label="Files"
 >
 <FileText className="w-5 h-5" />
 <span className="text-[10px] font-medium">Files</span>
 </button>
 <button
 onClick={() => handleTabChange('library')}
 onKeyDown={(e) => e.key === 'Enter' && handleTabChange('library')}
 className={cn(
 "flex flex-col items-center justify-center w-14 h-12 gap-0.5 transition-colors rounded-lg",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 mobileTab === 'library' ? "text-foreground" : "text-foreground/40 hover:text-foreground/70"
 )}
 aria-current={mobileTab === 'library' ? 'page' : undefined}
 aria-label="Library"
 >
 <LibraryIcon className="w-5 h-5" />
 <span className="text-[10px] font-medium">Library</span>
 </button>
 <button
 onClick={() => setSettingsOpen(true)}
 className="flex flex-col items-center justify-center w-14 h-12 gap-0.5 text-foreground/40 hover:text-foreground/70 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 aria-label="Settings"
 >
 <Settings className="w-5 h-5" />
 <span className="text-[10px] font-medium">Settings</span>
 </button>
 </nav>

 <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
 </div>
);
}
