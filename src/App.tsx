import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { MessageInput } from '@/components/MessageInput';
import { SettingsModal } from '@/components/SettingsModal';
import { Library } from '@/components/Library';
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
    document.body.style.backgroundColor = '#212121'; // ChatGPT-like dark bg
    document.body.style.color = '#ececec';
    preloadPython();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#212121] text-[#ececec] font-sans selection:bg-white/20">
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
                className="h-10 w-10 text-white/50 hover:text-white hover:bg-white/10"
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            </div>
          )}

          {currentView === 'library' ? (
            <Library />
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
