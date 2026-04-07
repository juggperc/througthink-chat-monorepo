import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { get, set, del } from 'idb-keyval';

// Custom IndexedDB storage for AFAF performance (non-blocking, unlimited size)
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  images?: string[]; // Array of base64 image strings
  tool_calls?: any[];
  tool_call_id?: string;
  tool_name?: string;
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
  imageModel: string;
  systemPrompt: string;
  customModels: string[];
  chats: Chat[];
  currentChatId: string | null;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  isGenerating: boolean;
  currentView: 'chat' | 'library';
  
  // Actions
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setImageModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  addCustomModel: (model: string) => void;
  removeCustomModel: (model: string) => void;
  createChat: () => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessageContent: (chatId: string, messageId: string, content: string) => void;
  updateMessageToolCalls: (chatId: string, messageId: string, tool_calls: any[]) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  toggleSidebar: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentView: (view: 'chat' | 'library') => void;
  clearChats: () => void;
}

const DEFAULT_SYSTEM_PROMPT = `You are an exceptionally intelligent, concise, and highly capable AI assistant. 
Your primary goal is to provide accurate, direct, and highly efficient answers without unnecessary fluff or robotic pleasantries.
- Use markdown formatting extensively for readability (code blocks, bolding, lists).
- When writing code, provide complete, production-ready snippets.
- Think deeply before answering complex queries, but present the final output clearly.
- Assume the user is an expert unless context suggests otherwise.`;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      model: 'google/gemini-2.5-flash', // Default fast model
      imageModel: 'flux', // Default image generation model for pollinations
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      customModels: [],
      chats: [],
      currentChatId: null,
      isSidebarOpen: true,
      isSettingsOpen: false,
      isGenerating: false,
      currentView: 'chat',

      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setImageModel: (imageModel) => set({ imageModel }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setCurrentView: (currentView) => set({ currentView }),
      
      addCustomModel: (model) => set((state) => ({
        customModels: state.customModels.includes(model) 
          ? state.customModels 
          : [...state.customModels, model],
        model: model // Auto-select the newly added model
      })),

      removeCustomModel: (model) => set((state) => ({
        customModels: state.customModels.filter(m => m !== model),
        model: state.model === model ? 'google/gemini-2.5-flash' : state.model
      })),
      
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

      updateMessageToolCalls: (chatId, messageId, tool_calls) => set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId 
            ? {
                ...chat,
                messages: chat.messages.map((msg) => 
                  msg.id === messageId ? { ...msg, tool_calls } : msg
                )
              }
            : chat
        )
      })),

      removeMessage: (chatId, messageId) => set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId 
            ? {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== messageId)
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
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        apiKey: state.apiKey, 
        model: state.model,
        imageModel: state.imageModel,
        systemPrompt: state.systemPrompt,
        customModels: state.customModels,
        chats: state.chats,
        currentChatId: state.currentChatId
      }),
    }
  )
);
