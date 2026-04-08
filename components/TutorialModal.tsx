import React from 'react';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, Zap, Key, Search } from 'lucide-react';

interface TutorialModalProps {
 isOpen: boolean;
 onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground shadow-2xl max-h-[85vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle className="text-2xl font-semibold tracking-tight flex items-center gap-3">
 <Sparkles className="w-6 h-6 text-amber-400" />
 Welcome to Throughthink
 </DialogTitle>
 <DialogDescription className="text-muted-foreground text-base mt-2">
 Your high-performance, cost-effective gateway to the world's best AI models.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-8 py-6">
 {/* Benefits Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
 <Zap className="w-5 h-5 text-emerald-400" />
 </div>
 <h3 className="text-lg font-semibold">Faster & Cheaper</h3>
 </div>
 <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-[52px]">
 <p>
 Unlike standard subscriptions which cost $20/month and limit your messages, Throughthink connects directly to <strong className="text-foreground">OpenRouter</strong>.
 </p>
 <ul className="space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-emerald-400 mt-0.5">•</span>
 <span><strong className="text-foreground">Pay per use:</strong> You only pay for the exact tokens you use. Most users spend less than $2/month.</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-emerald-400 mt-0.5">•</span>
 <span><strong className="text-foreground">No rate limits:</strong> Never get locked out for "sending too many messages."</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-emerald-400 mt-0.5">•</span>
 <span><strong className="text-foreground">All models in one place:</strong> Switch instantly between Claude 3.5 Sonnet, GPT-4o, DeepSeek R1, and hundreds more.</span>
 </li>
 </ul>
 </div>
 </div>

 {/* API Key Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
 <Key className="w-5 h-5 text-blue-400" />
 </div>
 <h3 className="text-lg font-semibold">How to get an OpenRouter Key</h3>
 </div>
 <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-[52px] list-decimal list-inside">
 <li>
 Go to{' '}
 <a
 href="https://openrouter.ai"
 target="_blank"
 rel="noreferrer"
 className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 underline-offset-4 hover:underline"
 >
 OpenRouter.ai
 <ExternalLink className="w-3 h-3" />
 </a>{' '}
 and sign up.
 </li>
 <li>Add a small amount of credit (e.g., $5) to your account.</li>
 <li>
 Navigate to the <strong className="text-foreground">Keys</strong> section and click <strong className="text-foreground">Create Key</strong>.
 </li>
 <li>
 Copy the key (it starts with{' '}
 <code className="bg-secondary px-2 py-0.5 rounded text-foreground font-mono text-xs">sk-or-v1-</code>
 ) and paste it into the Settings menu in Throughthink.
 </li>
 </ol>
 </div>

 {/* Custom Models Section */}
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
 <Search className="w-5 h-5 text-purple-400" />
 </div>
 <h3 className="text-lg font-semibold">Finding Custom Model IDs</h3>
 </div>
 <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-[52px]">
 <p>
 We provide a default list of the best models, but OpenRouter has hundreds more. You can add any model using its ID.
 </p>
 <ol className="space-y-2 list-decimal list-inside">
 <li>
 Browse models at{' '}
 <a
 href="https://openrouter.ai/models"
 target="_blank"
 rel="noreferrer"
 className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 underline-offset-4 hover:underline"
 >
 OpenRouter Models
 <ExternalLink className="w-3 h-3" />
 </a>.
 </li>
 <li>
 Click on a model you like. Look for the API ID near the top (e.g.,{' '}
 <code className="bg-secondary px-2 py-0.5 rounded text-foreground font-mono text-xs">anthropic/claude-3.5-sonnet</code>
 ).
 </li>
 <li>
 Open Throughthink Settings, paste that ID into the <strong className="text-foreground">Add Custom Model ID</strong> field.
 </li>
 </ol>
 </div>
 </div>

 {/* Features Highlight */}
 <div className="pt-4 border-t border-border">
 <h4 className="text-sm font-semibold text-foreground mb-3">Available AI Tools</h4>
 <div className="flex flex-wrap gap-2">
 {['Image Generation', 'Mini Apps', 'Python Runner', 'Web Search', 'File System', 'Doc Search'].map((tool) => (
 <span
 key={tool}
 className="px-3 py-1.5 bg-secondary rounded-full text-xs text-muted-foreground"
 >
 {tool}
 </span>
 ))}
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="pt-4 border-t border-border flex justify-end">
 <Button onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
 Get Started
 </Button>
 </div>
 </DialogContent>
 </Dialog>
);
}
