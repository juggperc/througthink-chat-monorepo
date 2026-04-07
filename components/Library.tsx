import React, { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Download, Image as ImageIcon } from 'lucide-react';

export function Library() {
  const { chats } = useChatStore();

  const generatedImages = useMemo(() => {
    const images: { url: string; prompt: string; chatId: string; messageId: string }[] = [];
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (message.role === 'tool' && message.tool_name === 'generate_image') {
          const match = message.content.match(/\!\[(.*?)\]\((.*?)\)/);
          if (match) {
            images.push({
              prompt: match[1],
              url: match[2],
              chatId: chat.id,
              messageId: message.id
            });
          }
        }
      });
    });
    return images;
  }, [chats]);

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  if (generatedImages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/50 h-full">
        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-medium text-white/80 mb-2">No media yet</h2>
        <p className="text-sm">Generated images will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-white/90 mb-8 tracking-tight px-2">Library</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
          {generatedImages.map((img, i) => (
            <div key={`${img.chatId}-${img.messageId}-${i}`} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 aspect-square">
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-sm text-white/90 font-medium line-clamp-3 mb-3">{img.prompt}</p>
                <button 
                  onClick={() => handleDownload(img.url, img.prompt)}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
