import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#121212] border-white/10 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium tracking-tight text-white">
            Welcome to Throughthink
          </DialogTitle>
          <DialogDescription className="text-white/60 text-base mt-2">
            Your high-performance, cost-effective gateway to the world's best AI models.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white/90">Faster & Cheaper</h3>
            <div className="space-y-2 text-sm text-white/70 leading-relaxed">
              <p>
                Unlike standard subscriptions which cost $20/month and limit your messages, Throughthink connects directly to <strong>OpenRouter</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-white/60">
                <li><strong>Pay per use:</strong> You only pay for the exact tokens you use. Most users spend less than $2/month.</li>
                <li><strong>No rate limits:</strong> Never get locked out for "sending too many messages."</li>
                <li><strong>All models in one place:</strong> Switch instantly between Claude 3.5 Sonnet, GPT-4o, DeepSeek R1, and hundreds more without multiple subscriptions.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white/90">How to get an OpenRouter Key</h3>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Go to <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-white hover:underline inline-flex items-center gap-1">OpenRouter.ai <ExternalLink className="w-3 h-3" /></a> and sign up.
                </li>
                <li>Add a small amount of credit (e.g., $5) to your account.</li>
                <li>
                  Navigate to the <strong>Keys</strong> section and click <strong>Create Key</strong>.
                </li>
                <li>Copy the key (it starts with <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/90">sk-or-v1-</code>) and paste it into the Settings menu (gear icon) in Throughthink.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-white/90">Finding Custom Model IDs</h3>
            <div className="space-y-2 text-sm text-white/70 leading-relaxed">
              <p>
                We provide a default list of the best models, but OpenRouter has hundreds more. You can add any model using its ID.
              </p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Browse models at <a href="https://openrouter.ai/models" target="_blank" rel="noreferrer" className="text-white hover:underline inline-flex items-center gap-1">OpenRouter Models <ExternalLink className="w-3 h-3" /></a>.
                </li>
                <li>
                  Click on a model you like. Look for the API ID near the top (e.g., <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/90">anthropic/claude-3.5-sonnet</code>).
                </li>
                <li>
                  Open Throughthink Settings, paste that ID into the <strong>Add Custom Model ID</strong> field, and click the plus button.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
