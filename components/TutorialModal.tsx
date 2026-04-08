import React, { useState, useEffect } from 'react';
import {
 Dialog,
 DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Zap, Key, Search, Bot, Sparkles } from 'lucide-react';

interface TutorialModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const slides = [
 {
 id: 0,
 title: 'Throughthink',
 subtitle: 'AI without limits',
 graphic: 'brand',
 content: 'Access 300+ AI models. Pay per token. Zero rate limits.',
 },
 {
 id: 1,
 title: 'Pay Less',
 subtitle: '~$2/month average',
 graphic: 'savings',
 content: 'Traditional subscriptions: $20/mo. Throughthink: pay only for what you use.',
 },
 {
 id: 2,
 title: 'Get Started',
 subtitle: '3 simple steps',
 graphic: 'steps',
 content: null,
 },
 {
 id: 3,
 title: 'All Models',
 subtitle: 'One interface',
 graphic: 'models',
 content: 'Claude, GPT-4, Gemini, DeepSeek, Llama—switch instantly without multiple subscriptions.',
 },
];

const BrandGraphic = () => (
 <div className="relative w-48 h-48 mx-auto">
 {/* Outer glow ring */}
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.6 }}
 className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-xl"
 />
 {/* Main card */}
 <motion.div
 initial={{ scale: 0.9, rotateY: -15 }}
 animate={{ scale: 1, rotateY: 0 }}
 transition={{ duration: 0.5, type: 'spring' }}
 className="relative w-full h-full rounded-2xl bg-gradient-to-br from-card to-secondary border border-border flex items-center justify-center overflow-hidden"
 >
 {/* Orange stripes accent */}
 <div className="absolute inset-0 opacity-30 bg-orange-stripes" />
 {/* Content */}
 <div className="relative z-10 text-center px-6">
 <motion.div
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.2 }}
 className="flex items-center justify-center gap-1 mb-2"
 >
 <Sparkles className="w-5 h-5 text-amber-400" />
 </motion.div>
 <motion.h2
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.3 }}
 className="text-2xl font-semibold tracking-tight"
 >
 Throughthink
 </motion.h2>
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4 }}
 className="text-xs text-muted-foreground mt-1"
 >
 Think freely
 </motion.p>
 </div>
 </motion.div>
 </div>
);

const SavingsGraphic = () => (
 <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ duration: 0.5, type: 'spring' }}
 className="relative"
 >
 {/* $20 crossed out */}
 <motion.div
 initial={{ x: -20, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.2 }}
 className="absolute -left-12 top-0 text-3xl font-bold text-muted-foreground/40 line-through"
 >
 $20
 </motion.div>
 {/* $2 highlighted */}
 <motion.div
 initial={{ scale: 0.5, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.4, type: 'spring' }}
 className="text-5xl font-bold text-emerald-400"
 >
 ~$2
 </motion.div>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.6 }}
 className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
 >
 per month
 </motion.div>
 </motion.div>
 {/* Zap icon */}
 <motion.div
 initial={{ scale: 0, rotate: -45 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ delay: 0.5, type: 'spring' }}
 className="absolute -top-4 -right-4 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"
 >
 <Zap className="w-5 h-5 text-emerald-400" />
 </motion.div>
 </div>
);

const StepsGraphic = () => (
 <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center gap-3">
 {[
 { icon: Key, label: 'Get API key', color: 'text-blue-400', bg: 'bg-blue-500/10' },
 { icon: Bot, label: 'Paste in settings', color: 'text-purple-400', bg: 'bg-purple-500/10' },
 { icon: Sparkles, label: 'Start chatting', color: 'text-amber-400', bg: 'bg-amber-500/10' },
 ].map((step, i) => (
 <motion.div
 key={i}
 initial={{ x: -20, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 transition={{ delay: 0.2 + i * 0.15 }}
 className="flex items-center gap-3"
 >
 <div className={`w-8 h-8 rounded-lg ${step.bg} flex items-center justify-center`}>
 <step.icon className={`w-4 h-4 ${step.color}`} />
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs text-muted-foreground">{i + 1}.</span>
 <span className="text-sm font-medium">{step.label}</span>
 </div>
 </motion.div>
 ))}
 </div>
);

const ModelsGraphic = () => (
 <div className="relative w-48 h-48 mx-auto">
 {/* Orbiting model icons */}
 {[0, 1, 2, 3].map((i) => {
 const angle = (i * 90) * (Math.PI / 180);
 const x = Math.cos(angle) * 60;
 const y = Math.sin(angle) * 60;
 const models = ['Claude', 'GPT-4', 'Gemini', 'DeepSeek'];
 const colors = ['text-blue-400', 'text-green-400', 'text-purple-400', 'text-amber-400'];
 
 return (
 <motion.div
 key={i}
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.1 + i * 0.1, type: 'spring' }}
 className="absolute"
 style={{
 left: `calc(50% + ${x}px - 24px)`,
 top: `calc(50% + ${y}px - 24px)`,
 }}
 >
 <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center">
 <span className={`text-[10px] font-medium ${colors[i]}`}>
 {models[i]}
 </span>
 </div>
 </motion.div>
 );
 })}
 {/* Center icon */}
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.5, type: 'spring' }}
 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent flex items-center justify-center"
 >
 <Search className="w-5 h-5 text-foreground" />
 </motion.div>
 </div>
);

const graphicComponents: Record<string, React.FC> = {
 brand: BrandGraphic,
 savings: SavingsGraphic,
 steps: StepsGraphic,
 models: ModelsGraphic,
};

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
 const [currentSlide, setCurrentSlide] = useState(0);
 const [direction, setDirection] = useState(0);

 const currentData = slides[currentSlide];
 const GraphicComponent = graphicComponents[currentData.graphic];

 const handleNext = () => {
 if (currentSlide < slides.length - 1) {
 setDirection(1);
 setCurrentSlide(prev => prev + 1);
 }
 };

 const handlePrev = () => {
 if (currentSlide > 0) {
 setDirection(-1);
 setCurrentSlide(prev => prev - 1);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'ArrowRight') handleNext();
 if (e.key === 'ArrowLeft') handlePrev();
 };

 const variants = {
 enter: (direction: number) => ({
 x: direction > 0 ? 100 : -100,
 opacity: 0,
 }),
 center: {
 x: 0,
 opacity: 1,
 },
 exit: (direction: number) => ({
 x: direction > 0 ? -100 : 100,
 opacity: 0,
 }),
 };

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent
 className="sm:max-w-[420px] bg-card border-border text-foreground shadow-2xl overflow-hidden p-0"
 onKeyDown={handleKeyDown}
 >
 <div className="p-8 pb-4">
 {/* Slideshow */}
 <AnimatePresence mode="wait" custom={direction}>
 <motion.div
 key={currentSlide}
 custom={direction}
 variants={variants}
 initial="enter"
 animate="center"
 exit="exit"
 transition={{ duration: 0.3, ease: 'easeInOut' }}
 className="text-center"
 >
 {/* Graphic */}
 <div className="mb-6">
 {GraphicComponent && <GraphicComponent />}
 </div>

 {/* Title */}
 <motion.h2
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.2 }}
 className="text-2xl font-semibold tracking-tight mb-1"
 >
 {currentData.title}
 </motion.h2>

 {/* Subtitle */}
 <motion.p
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.25 }}
 className="text-sm text-muted-foreground mb-4"
 >
 {currentData.subtitle}
 </motion.p>

 {/* Content */}
 {currentData.content && (
 <motion.p
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.3 }}
 className="text-sm text-foreground/70 leading-relaxed"
 >
 {currentData.content}
 </motion.p>
 )}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Navigation */}
 <div className="px-8 pb-6">
 {/* Progress dots */}
 <div className="flex justify-center gap-2 mb-4">
 {slides.map((_, i) => (
 <button
 key={i}
 onClick={() => {
 setDirection(i > currentSlide ? 1 : -1);
 setCurrentSlide(i);
 }}
 className={`w-2 h-2 rounded-full transition-all ${
 i === currentSlide
 ? 'bg-foreground w-6'
 : 'bg-foreground/20 hover:bg-foreground/40'
 }`}
 aria-label={`Go to slide ${i + 1}`}
 />
 ))}
 </div>

 {/* Arrows & Button */}
 <div className="flex items-center justify-between">
 <Button
 variant="ghost"
 size="icon"
 onClick={handlePrev}
 disabled={currentSlide === 0}
 className="text-muted-foreground hover:text-foreground"
 aria-label="Previous slide"
 >
 <ChevronLeft className="w-5 h-5" />
 </Button>

 {currentSlide === slides.length - 1 ? (
 <Button
 onClick={onClose}
 className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
 >
 Get Started
 </Button>
 ) : (
 <Button
 variant="ghost"
 size="icon"
 onClick={handleNext}
 className="text-muted-foreground hover:text-foreground"
 aria-label="Next slide"
 >
 <ChevronRight className="w-5 h-5" />
 </Button>
 )}
 </div>
 </div>
 </DialogContent>
 </Dialog>
);
}
