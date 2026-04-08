import React, { useState, useEffect } from 'react';
import { transform } from 'sucrase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as Recharts from 'recharts';

interface MiniAppRendererProps {
 code: string;
}

const UI_COMPONENTS = {
 // Card components
 Card,
 CardHeader,
 CardTitle,
 CardContent,
 CardDescription,
 // Form components
 Button,
 Input,
 Label,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 // Feedback components
 Badge,
 Separator,
 Progress,
 Skeleton,
 Switch,
 Slider,
 // Navigation components
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
 constructor(props: {children: React.ReactNode}) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error) {
 return { hasError: true, error };
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm font-mono">
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
 <div className="overflow-x-auto whitespace-pre-wrap">Runtime Error: {this.state.error?.message}</div>
 </div>
 );
 }
 return this.props.children;
 }
}

export function MiniAppRenderer({ code }: MiniAppRendererProps) {
 const [Component, setComponent] = useState<React.ComponentType | null>(null);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 try {
 // Transform JSX and ES modules to standard JS
 const compiled = transform(code, {
 transforms: ['jsx', 'imports'],
 production: true,
 }).code;

 // Create a module execution environment
 const exports: any = {};
 const require = (moduleName: string) => {
 if (moduleName === 'react') return React;
 if (moduleName === 'lucide-react') return LucideIcons;
 if (moduleName === 'recharts') return Recharts;
 throw new Error(`Module ${moduleName} not found`);
 };

 // Inject React and UI components into the scope
 const scopeNames = ['React', 'exports', 'require', ...Object.keys(UI_COMPONENTS)];
 const scopeValues = [React, exports, require, ...Object.values(UI_COMPONENTS)];

 const evaluate = new Function(...scopeNames, compiled);
 evaluate(...scopeValues);

 if (exports.default) {
 setComponent(() => exports.default);
 setError(null);
 } else {
 setError("The code must export a default component (e.g., 'export default function App() {...}')");
 }
 } catch (err: any) {
 console.error("MiniApp compilation error:", err);
 setError(err.message || String(err));
 }
 }, [code]);

 if (error) {
 return (
 <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm font-mono mt-2">
 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
 <div className="overflow-x-auto whitespace-pre-wrap">{error}</div>
 </div>
 );
 }

 if (!Component) {
 return (
 <div className="p-8 flex justify-center items-center text-muted-foreground animate-pulse">
 Building app...
 </div>
 );
 }

 return (
 <div className="mt-4 mb-2 p-1 bg-gradient-to-b from-foreground/10 to-transparent rounded-2xl border border-border shadow-xl overflow-hidden">
 <div className="bg-card rounded-xl p-4 sm:p-6">
 <ErrorBoundary>
 <Component />
 </ErrorBoundary>
 </div>
 </div>
);
}
