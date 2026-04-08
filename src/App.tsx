import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { MessageInput } from '@/components/MessageInput';
import { SettingsModal } from '@/components/SettingsModal';
import { Library } from '@/components/Library';
import { FilesView } from '@/components/FilesView';
import { MobileLayout } from '@/components/MobileLayout';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { Toaster } from 'sonner';
import { preloadPython } from '@/services/python';

export default function App() {
 const { isSidebarOpen, toggleSidebar, currentView } = useChatStore();

 // Force dark mode on body
 useEffect(() => {
 document.documentElement.classList.add('dark');
 preloadPython();
 }, []);

 return (
 <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-foreground/20">
 {/* Desktop Layout */}
 <div className="hidden md:flex h-full w-full">
 <Sidebar />

 <main className="flex-1 flex flex-col relative h-full min-w-0 bg-flowing">
 {/* Top Bar for Mobile/Toggle */}
 {!isSidebarOpen && (
 <div className="absolute top-4 left-4 z-10">
 <Button
 onClick={toggleSidebar}
 variant="ghost"
 size="icon"
 className="h-10 w-10 text-foreground/50 hover:text-foreground hover:bg-accent"
 aria-label="Open sidebar"
 >
 <PanelLeft className="w-5 h-5" />
 </Button>
 </div>
 )}

 {currentView === 'library' ? (
 <Library />
 ) : currentView === 'files' ? (
 <FilesView />
 ) : (
 <>
 <ChatArea />
 <MessageInput />
 </>
 )}
 </main>
 </div>

 {/* Mobile Layout */}
 <MobileLayout />

 <SettingsModal />
 <Toaster theme="dark" position="top-center" />
 </div>
);
}
