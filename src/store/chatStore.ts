import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatState {
  apiKey: string;
  model: string;
  chats: Chat[];
  currentChatId: string | null;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  
  // Actions
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  createChat: () => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessageContent: (chatId: string, messageId: string, content: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  toggleSidebar: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  clearChats: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      model: 'google/gemini-2.5-flash', // Default fast model
      chats: [],
      currentChatId: null,
      isSidebarOpen: true,
      isSettingsOpen: false,

      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      
      createChat: () => {
        const newChat: Chat = {
          id: uuidv4(),
          title: 'New Chat',
          messages: [],
          updatedAt: Date.now(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));
        return newChat.id;
      },

      selectChat: (id) => set({ currentChatId: id }),

      deleteChat: (id) => set((state) => ({
        chats: state.chats.filter((c) => c.id !== id),
        currentChatId: state.currentChatId === id 
          ? (state.chats.find(c => c.id !== id)?.id || null) 
          : state.currentChatId
      })),

      addMessage: (chatId, message) => set((state) => {
        const newMessage: Message = {
          ...message,
          id: uuidv4(),
          timestamp: Date.now(),
        };
        
        return {
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              // Auto-generate title from first user message if it's still "New Chat"
              let title = chat.title;
              if (chat.messages.length === 0 && message.role === 'user') {
                title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
              }
              return {
                ...chat,
                title,
                messages: [...chat.messages, newMessage],
                updatedAt: Date.now(),
              };
            }
            return chat;
          }).sort((a, b) => b.updatedAt - a.updatedAt),
        };
      }),

      updateMessageContent: (chatId, messageId, content) => set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId 
            ? {
                ...chat,
                messages: chat.messages.map((msg) => 
                  msg.id === messageId ? { ...msg, content } : msg
                )
              }
            : chat
        )
      })),

      updateChatTitle: (chatId, title) => set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId ? { ...chat, title } : chat
        )
      })),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      
      clearChats: () => set({ chats: [], currentChatId: null }),
    }),
    {
      name: 'throughthink-chat-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey, 
        model: state.model, 
        chats: state.chats,
        currentChatId: state.currentChatId
      }),
    }
  )
);
