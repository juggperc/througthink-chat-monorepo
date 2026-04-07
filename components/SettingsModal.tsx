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

const PROVIDER_LOGOS: Record<string, string> = {
  'google': 'https://cdn.simpleicons.org/google',
  'anthropic': 'https://cdn.simpleicons.org/anthropic/white',
  'openai': 'https://cdn.simpleicons.org/openai/white',
  'meta': 'https://cdn.simpleicons.org/meta/white',
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

  const renderModelItem = (id: string, name: string, provider?: string, isCustom?: boolean) => {
    const logoUrl = provider ? PROVIDER_LOGOS[provider] : null;
    
    return (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={provider} className="w-4 h-4 object-contain" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-white/20" />
          )}
          <span>{name}</span>
        </div>
        {isCustom && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeCustomModel(id);
            }}
            className="text-white/40 hover:text-red-400 p-1 rounded hover:bg-white/10"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121212] border-white/10 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">{t('settingsTitle', language)}</DialogTitle>
          <DialogDescription className="text-white/50">
            {t('settingsDesc', language)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          <div className="grid gap-2">
            <Label htmlFor="language" className="text-white/70">{t('language', language)}</Label>
            <Select value={language} onValueChange={(val: 'en' | 'zh') => setLanguage(val)}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:ring-1 focus:ring-white/20 text-white">
                <SelectValue placeholder={t('language', language)} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="en">{t('english', language)}</SelectItem>
                <SelectItem value="zh">{t('chinese', language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 pt-2 border-t border-white/10">
            <Label htmlFor="apiKey" className="text-white/70">{t('apiKeyLabel', language)}</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/30"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="model" className="text-white/70">{t('modelLabel', language)}</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:ring-1 focus:ring-white/20 text-white">
                <SelectValue placeholder={t('selectModelPlaceholder', language)} />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-[300px]">
                {DEFAULT_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {renderModelItem(m.id, m.name, m.provider)}
                  </SelectItem>
                ))}
                
                {customModels.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider mt-2 border-t border-white/10 pt-2">
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

          <div className="grid gap-2 pt-2 border-t border-white/10">
            <Label htmlFor="customModel" className="text-white/70">{t('customModelLabel', language)}</Label>
            <form onSubmit={handleAddCustomModel} className="flex gap-2">
              <Input
                id="customModel"
                value={newModelId}
                onChange={(e) => setNewModelId(e.target.value)}
                placeholder={t('customModelPlaceholder', language)}
                className="bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/30"
              />
              <Button type="submit" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                <Plus className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <div className="grid gap-2 pt-2 border-t border-white/10">
            <Label htmlFor="imageModel" className="text-white/70">{t('imageModelLabel', language)}</Label>
            <Input
              id="imageModel"
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              placeholder={t('imageModelPlaceholder', language)}
              className="bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/30"
            />
          </div>

          <div className="grid gap-2 pt-2 border-t border-white/10">
            <Label htmlFor="systemPrompt" className="text-white/70">{t('systemPromptLabel', language)}</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('systemPromptPlaceholder', language)}
              className="bg-white/5 border-white/10 focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/30 min-h-[120px] resize-y"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
