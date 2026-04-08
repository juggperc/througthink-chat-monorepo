import React, { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Settings, Trash2, PanelLeftClose, Library as LibraryIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialModal } from './TutorialModal';

export function Sidebar() {
  const { chats, currentChatId, selectChat, createChat, deleteChat, isSidebarOpen, toggleSidebar, setSettingsOpen, currentView, setCurrentView } = useChatStore();
  const { language } = useLanguageStore();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleChatKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectChat(chatId);
      setCurrentView('chat');
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
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)] z-20 overflow-hidden"
        >
          <div className="w-[260px] h-full flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <Button
                onClick={() => {
                  createChat();
                  setCurrentView('chat');
                }}
                variant="ghost"
                className="flex-1 justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all bg-sidebar-accent/50 border border-sidebar-border h-10"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">{t('newChat', language)}</span>
              </Button>
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                size="icon"
                className="ml-2 h-10 w-10 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-1 py-2">
                <AnimatePresence>
                  {chats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm relative overflow-hidden",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                        currentChatId === chat.id && currentView === 'chat'
                          ? "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-sidebar-border"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/90 border border-transparent"
                      )}
                      onClick={() => {
                        selectChat(chat.id);
                        setCurrentView('chat');
                      }}
                      onKeyDown={(e) => handleChatKeyDown(e, chat.id)}
                      tabIndex={0}
                      role="button"
                      aria-selected={currentChatId === chat.id && currentView === 'chat'}
                      aria-label={`Chat: ${chat.title}`}
                    >
                      {currentChatId === chat.id && currentView === 'chat' && (
                        <motion.div
                          layoutId="activeChatIndicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-sidebar-foreground/50 rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <div className="flex items-center gap-3 overflow-hidden pr-6">
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                        <span className="truncate">{chat.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        onKeyDown={(e) => handleDeleteKeyDown(e, chat.id)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-sidebar-accent rounded-md text-sidebar-foreground/50 hover:text-red-400 transition-all z-10 bg-sidebar group-hover:bg-sidebar-accent"
                        aria-label={`Delete chat: ${chat.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-sidebar-border bg-gradient-to-t from-black/20 to-transparent space-y-1">
              <div className="mb-4 relative group cursor-pointer" onClick={() => setIsTutorialOpen(true)}>
                <div className="absolute -inset-0.5 bg-orange-stripes rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-[1px] rounded-xl bg-orange-stripes">
                  <div className="relative flex items-center justify-center p-3 bg-sidebar rounded-xl overflow-hidden">
                    <span className="font-semibold text-sidebar-foreground relative z-10 tracking-wide">
                      Throughthink
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setCurrentView('files')}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 transition-all",
                  currentView === 'files'
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-sidebar-border"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>{t('files', language) || 'Files'}</span>
              </Button>

              <Button
                onClick={() => setCurrentView('library')}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 transition-all",
                  currentView === 'library'
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-sidebar-border"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <LibraryIcon className="w-4 h-4" />
                <span>{t('library', language)}</span>
              </Button>
              
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="ghost"
                className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>{t('settings', language)}</span>
              </Button>
            </div>
          </div>

          <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
