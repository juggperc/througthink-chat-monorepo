import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ChatArea } from './ChatArea';
import { MessageInput } from './MessageInput';
import { Library } from './Library';
import { Button } from './ui/button';
import { MessageSquare, Clock, Library as LibraryIcon, Settings, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialModal } from './TutorialModal';

export function MobileLayout() {
  const { chats, currentChatId, selectChat, createChat, deleteChat, setSettingsOpen, currentView, setCurrentView } = useChatStore();
  const [mobileTab, setMobileTab] = useState<'chat' | 'history' | 'library'>('chat');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Sync mobileTab with currentView if library is selected elsewhere
  React.useEffect(() => {
    if (currentView === 'library' && mobileTab !== 'library') {
      setMobileTab('library');
    } else if (currentView === 'chat' && mobileTab === 'library') {
      setMobileTab('chat');
    }
  }, [currentView]);

  const handleTabChange = (tab: 'chat' | 'history' | 'library') => {
    setMobileTab(tab);
    if (tab === 'library') setCurrentView('library');
    else setCurrentView('chat');
  };

  return (
    <div className="md:hidden flex flex-col h-full w-full bg-flowing relative z-50">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-[#171717]/80 backdrop-blur-md z-10 shrink-0">
        <div className="relative group cursor-pointer" onClick={() => setIsTutorialOpen(true)}>
          <div className="absolute -inset-0.5 bg-orange-stripes rounded-xl blur opacity-40"></div>
          <div className="relative p-[1px] rounded-xl bg-orange-stripes">
            <div className="relative flex items-center justify-center px-3 py-1.5 bg-[#171717] rounded-xl overflow-hidden">
               <span className="font-semibold text-white relative z-10 tracking-wide text-sm">
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
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
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
              className="absolute inset-0 flex flex-col bg-[#171717]"
            >
              <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-medium text-white/90">Chat History</h2>
              </div>
              <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all text-sm border",
                        currentChatId === chat.id
                          ? "bg-white/10 text-white border-white/10" 
                          : "text-white/60 hover:bg-white/5 border-transparent"
                      )}
                      onClick={() => {
                        selectChat(chat.id);
                        handleTabChange('chat');
                      }}
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
                        className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {chats.length === 0 && (
                    <div className="text-center py-10 text-white/40">
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
              className="absolute inset-0 flex flex-col bg-[#171717]"
            >
              <Library />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] border-t border-white/5 bg-[#171717] flex items-center justify-around px-2 shrink-0">
        <button 
          onClick={() => handleTabChange('chat')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 gap-1 transition-colors",
            mobileTab === 'chat' ? "text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button 
          onClick={() => handleTabChange('history')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 gap-1 transition-colors",
            mobileTab === 'history' ? "text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </button>
        <button 
          onClick={() => handleTabChange('library')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 gap-1 transition-colors",
            mobileTab === 'library' ? "text-white" : "text-white/40 hover:text-white/70"
          )}
        >
          <LibraryIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button 
          onClick={() => setSettingsOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-16 gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
    </div>
  );
}
