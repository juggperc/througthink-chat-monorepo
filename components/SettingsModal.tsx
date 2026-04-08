import React, { useState } from 'react';
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from '@/store/chatStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

// Provider logos using official brand assets
const PROVIDER_LOGOS: Record<string, { svg: string; color: string }> = {
 'google': {
 svg: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
 color: '#4285F4'
 },
 'anthropic': {
 svg: 'M17.304 3.541l-5.434 16.918h-3.866l6.66-20.459h3.64l5.487 20.459h-3.922l-2.565-16.918z',
 color: '#D4A27F'
 },
 'openai': {
 svg: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.1985 6.1985 0 0 0 4.4795 6.11a5.9847 5.9847 0 0 0-3.9977 4.0859 6.0462 6.0462 0 0 0 3.9977 7.4765 5.9847 5.9847 0 0 0 .5157 4.9108 6.0462 6.0462 0 0 0 6.5098 2.9 5.9847 5.9847 0 0 0 4.9108.5157 6.0462 6.0462 0 0 0 2.9-6.5098 5.9847 5.9847 0 0 0 3.9977-4.0859 6.0462 6.0462 0 0 0-3.9977-7.4765Zm-9.2737 12.9323a4.4268 4.4268 0 0 1-2.3645-.6707 4.4268 4.4268 0 0 1-1.6181-1.8813 4.4268 4.4268 0 0 1-.2537-2.4141l.0557-.2497-.2497-.0557a4.4268 4.4268 0 0 1-1.8813-1.6181 4.4268 4.4268 0 0 1-.6707-2.3645 4.4268 4.4268 0 0 1 .6707-2.3645 4.4268 4.4268 0 0 1 1.8813-1.6181l.2497-.0557-.0557-.2497a4.4268 4.4268 0 0 1 .2537-2.4141 4.4268 4.4268 0 0 1 1.6181-1.8813 4.4268 4.4268 0 0 1 2.3645-.6707 4.4268 4.4268 0 0 1 2.3645.6707l.2497.0557.0557-.2497a4.4268 4.4268 0 0 1 1.8813-1.6181 4.4268 4.4268 0 0 1 2.4141-.2537l.2497.0557.0557-.2497a4.4268 4.4268 0 0 1 2.3645.6707 4.4268 4.4268 0 0 1 1.6181 1.8813 4.4268 4.4268 0 0 1 .6707 2.3645 4.4268 4.4268 0 0 1-.6707 2.3645l-.0557.2497.2497.0557a4.4268 4.4268 0 0 1 1.8813 1.6181 4.4268 4.4268 0 0 1 .6707 2.3645 4.4268 4.4268 0 0 1-.6707 2.3645 4.4268 4.4268 0 0 1-1.8813 1.6181l-.2497.0557.0557.2497a4.4268 4.4268 0 0 1-.2537 2.4141 4.4268 4.4268 0 0 1-1.6181 1.8813 4.4268 4.4268 0 0 1-2.3645.6707 4.4268 4.4268 0 0 1-2.3645-.6707l-.2497-.0557-.0557.2497a4.4268 4.4268 0 0 1-1.8813 1.6181 4.4268 4.4268 0 0 1-2.4141.2537Z',
 color: '#ffffff'
 },
 'meta': {
 svg: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5h-9a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5z',
 color: '#0668E1'
 },
 'deepseek': {
 svg: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
 color: '#4D6BFA'
 },
 'mistral': {
 svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.14 5 4.05 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
 color: '#FF7000'
 },
 'xai': {
 svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
 color: '#1DA1F2'
 }
};

const DEFAULT_MODELS = [
 { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash (Fast)', provider: 'google' },
 { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
 { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
 { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
 { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
 { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
 { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'meta' },
];

export function SettingsModal() {
 const {
 isSettingsOpen,
 setSettingsOpen,
 apiKey,
 setApiKey,
 model,
 setModel,
 imageModel,
 setImageModel,
 systemPrompt,
 setSystemPrompt,
 customModels,
 addCustomModel,
 removeCustomModel
 } = useChatStore();
 const { language, setLanguage } = useLanguageStore();

 const [newModelId, setNewModelId] = useState('');

 const handleAddCustomModel = (e: React.FormEvent) => {
 e.preventDefault();
 if (newModelId.trim()) {
 addCustomModel(newModelId.trim());
 setNewModelId('');
 }
 };

 const handleDeleteKeyDown = (e: React.KeyboardEvent, modelId: string) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 e.stopPropagation();
 removeCustomModel(modelId);
 }
 };

 const renderModelItem = (id: string, name: string, provider?: string, isCustom?: boolean) => {
 const logoData = provider ? PROVIDER_LOGOS[provider] : null;

 return (
 <div className="flex items-center justify-between w-full gap-2">
 <div className="flex items-center gap-2">
 {logoData ? (
 <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: logoData.color }}>
 <path d={logoData.svg} />
 </svg>
 ) : (
 <div className="w-4 h-4 rounded-full bg-foreground/20" />
 )}
 <span>{name}</span>
 </div>
 {isCustom && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 removeCustomModel(id);
 }}
 onKeyDown={(e) => handleDeleteKeyDown(e, id)}
 className="text-foreground/40 hover:text-red-400 p-1 rounded hover:bg-accent transition-colors"
 aria-label={`Remove custom model ${name}`}
 >
 <Trash2 className="w-3 h-3" />
 </button>
 )}
 </div>
 );
 };

 return (
 <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
 <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground shadow-[0_0_40px_rgba(0,0,0,0.5)]">
 <DialogHeader>
 <DialogTitle className="text-xl font-medium tracking-tight">{t('settingsTitle', language)}</DialogTitle>
 <DialogDescription className="text-muted-foreground">
 {t('settingsDesc', language)}
 </DialogDescription>
 </DialogHeader>
 <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
 <div className="grid gap-2">
 <Label htmlFor="language" className="text-foreground/70">{t('language', language)}</Label>
 <Select value={language} onValueChange={(val: 'en' | 'zh') => setLanguage(val)}>
 <SelectTrigger className="bg-secondary border-border focus:ring-1 focus:ring-ring text-foreground">
 <SelectValue placeholder={t('language', language)} />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border text-foreground">
 <SelectItem value="en">{t('english', language)}</SelectItem>
 <SelectItem value="zh">{t('chinese', language)}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="grid gap-2 pt-2 border-t border-border">
 <Label htmlFor="apiKey" className="text-foreground/70">{t('apiKeyLabel', language)}</Label>
 <Input
 id="apiKey"
 type="password"
 value={apiKey}
 onChange={(e) => setApiKey(e.target.value)}
 placeholder="sk-or-v1-..."
 className="bg-secondary border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
 />
 </div>

 <div className="grid gap-2">
 <Label htmlFor="model" className="text-foreground/70">{t('modelLabel', language)}</Label>
 <Select value={model} onValueChange={setModel}>
 <SelectTrigger className="bg-secondary border-border focus:ring-1 focus:ring-ring text-foreground">
 <SelectValue placeholder={t('selectModelPlaceholder', language)} />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border text-foreground max-h-[300px]">
 {DEFAULT_MODELS.map((m) => (
 <SelectItem key={m.id} value={m.id}>
 {renderModelItem(m.id, m.name, m.provider)}
 </SelectItem>
 ))}

 {customModels.length > 0 && (
 <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 border-t border-border pt-2">
 {t('customModelsHeader', language)}
 </div>
 )}

 {customModels.map((m) => (
 <SelectItem key={m} value={m}>
 {renderModelItem(m, m, undefined, true)}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="grid gap-2 pt-2 border-t border-border">
 <Label htmlFor="customModel" className="text-foreground/70">{t('customModelLabel', language)}</Label>
 <form onSubmit={handleAddCustomModel} className="flex gap-2">
 <Input
 id="customModel"
 value={newModelId}
 onChange={(e) => setNewModelId(e.target.value)}
 placeholder={t('customModelPlaceholder', language)}
 className="bg-secondary border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
 />
 <Button type="submit" variant="secondary" className="bg-accent hover:bg-accent/80 text-foreground border border-border">
 <Plus className="w-4 h-4" aria-label="Add custom model" />
 </Button>
 </form>
 </div>

 <div className="grid gap-2 pt-2 border-t border-border">
 <Label htmlFor="imageModel" className="text-foreground/70">{t('imageModelLabel', language)}</Label>
 <Input
 id="imageModel"
 value={imageModel}
 onChange={(e) => setImageModel(e.target.value)}
 placeholder={t('imageModelPlaceholder', language)}
 className="bg-secondary border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground"
 />
 </div>

 <div className="grid gap-2 pt-2 border-t border-border">
 <Label htmlFor="systemPrompt" className="text-foreground/70">{t('systemPromptLabel', language)}</Label>
 <Textarea
 id="systemPrompt"
 value={systemPrompt}
 onChange={(e) => setSystemPrompt(e.target.value)}
 placeholder={t('systemPromptPlaceholder', language)}
 className="bg-secondary border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground min-h-[120px] resize-y"
 />
 </div>
 </div>
 </DialogContent>
 </Dialog>
);
}
