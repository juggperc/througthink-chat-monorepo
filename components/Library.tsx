import React, { useMemo, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Download, Image as ImageIcon, Code, LayoutTemplate } from 'lucide-react';
import { MiniAppRenderer } from './MiniAppRenderer';
import { cn } from '@/lib/utils';

type ViewTab = 'images' | 'miniapps';

export function Library() {
 const { chats } = useChatStore();
 const [activeTab, setActiveTab] = useState<ViewTab>('images');

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

 const miniApps = useMemo(() => {
 const apps: { code: string; chatId: string; messageId: string }[] = [];
 chats.forEach(chat => {
 chat.messages.forEach(message => {
 if (message.role === 'tool' && message.tool_name === 'create_mini_app') {
 const match = message.content.match(/```react\n([\s\S]*?)\n```/);
 if (match) {
 apps.push({
 code: match[1],
 chatId: chat.id,
 messageId: message.id
 });
 }
 }
 });
 });
 return apps;
 }, [chats]);

 const handleDownloadImage = async (url: string, prompt: string) => {
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
 window.open(url, '_blank');
 }
 };

 const handleDownloadCode = (code: string, index: number) => {
 const blob = new Blob([code], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `mini-app-${index + 1}.tsx`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };

 const totalItems = generatedImages.length + miniApps.length;

 if (totalItems === 0) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full">
 <div className="flex gap-4 mb-6">
 <ImageIcon className="w-12 h-12 opacity-20" />
 <LayoutTemplate className="w-12 h-12 opacity-20" />
 </div>
 <h2 className="text-xl font-medium text-foreground/80 mb-2">No media yet</h2>
 <p className="text-sm text-center max-w-md">
 Generated images and mini-apps will appear here.
 <br />
 Try asking the AI to create an image or build a mini-app!
 </p>
 </div>
 );
 }

 return (
 <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-8">
 <div className="max-w-7xl mx-auto">
 <h1 className="text-3xl font-semibold text-foreground/90 mb-6 tracking-tight px-2">Library</h1>

 {/* Tabs */}
 <div className="flex gap-2 mb-8 px-2">
 <button
 onClick={() => setActiveTab('images')}
 className={cn(
 "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 activeTab === 'images'
 ? "bg-accent text-foreground"
 : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
 )}
 aria-selected={activeTab === 'images'}
 role="tab"
 >
 <span className="flex items-center gap-2">
 <ImageIcon className="w-4 h-4" />
 Images ({generatedImages.length})
 </span>
 </button>
 <button
 onClick={() => setActiveTab('miniapps')}
 className={cn(
 "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
 "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
 activeTab === 'miniapps'
 ? "bg-accent text-foreground"
 : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
 )}
 aria-selected={activeTab === 'miniapps'}
 role="tab"
 >
 <span className="flex items-center gap-2">
 <LayoutTemplate className="w-4 h-4" />
 Mini Apps ({miniApps.length})
 </span>
 </button>
 </div>

 {/* Images Grid */}
 {activeTab === 'images' && (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
 {generatedImages.map((img, i) => (
 <div
 key={`${img.chatId}-${img.messageId}-${i}`}
 className="group relative rounded-2xl overflow-hidden bg-card border border-border aspect-square"
 >
 <img
 src={img.url}
 alt={img.prompt}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 loading="lazy"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
 <p className="text-sm text-foreground font-medium line-clamp-3 mb-3">{img.prompt}</p>
 <button
 onClick={() => handleDownloadImage(img.url, img.prompt)}
 className="flex items-center justify-center gap-2 w-full py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg backdrop-blur-md transition-colors text-sm font-medium"
 aria-label={`Download image: ${img.prompt}`}
 >
 <Download className="w-4 h-4" />
 Download
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Mini Apps Grid */}
 {activeTab === 'miniapps' && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
 {miniApps.map((app, i) => (
 <div
 key={`${app.chatId}-${app.messageId}-${i}`}
 className="group relative rounded-2xl overflow-hidden bg-card border border-border"
 >
 <div className="p-4">
 <MiniAppRenderer code={app.code} />
 </div>
 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 onClick={() => handleDownloadCode(app.code, i)}
 className="flex items-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/80 text-foreground rounded-lg backdrop-blur-md transition-colors text-sm font-medium"
 aria-label={`Download mini-app ${i + 1} source code`}
 >
 <Code className="w-4 h-4" />
 Source
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
);
}
