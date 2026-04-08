import React, { useState, useEffect, useMemo } from 'react';
import { listVfsFiles, readVfsFile, deleteVfsFile, getVfsFileDetails } from '@/services/vfs';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, FileCode, FileJson, File, RefreshCw, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
 path: string;
 size: number;
}

const getFileIcon = (path: string) => {
 const ext = path.split('.').pop()?.toLowerCase();
 switch (ext) {
 case 'js':
 case 'jsx':
 case 'ts':
 case 'tsx':
 return FileCode;
 case 'json':
 return FileJson;
 case 'py':
 return FileCode;
 default:
 return FileText;
 }
};

const formatFileSize = (bytes: number): string => {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FilesView() {
 const [files, setFiles] = useState<FileItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const loadFiles = async () => {
 setLoading(true);
 setError(null);
 try {
 const fileDetails = await getVfsFileDetails();
 setFiles(fileDetails);
 } catch (err) {
 setError('Failed to load files');
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadFiles();
 }, []);

 const handleDownload = async (path: string) => {
 try {
 const content = await readVfsFile(path);
 const blob = new Blob([content], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = path;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 } catch (err) {
 console.error('Download failed:', err);
 }
 };

 const handleDelete = async (path: string) => {
 try {
 await deleteVfsFile(path);
 setFiles(prev => prev.filter(f => f.path !== path));
 } catch (err) {
 console.error('Delete failed:', err);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 action();
 }
 };

 if (loading) {
 return (
 <div className="flex-1 flex items-center justify-center">
 <div className="flex items-center gap-3 text-muted-foreground">
 <RefreshCw className="w-5 h-5 animate-spin" />
 <span>Loading files...</span>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
 <File className="w-12 h-12 mb-4 opacity-20" />
 <p className="text-destructive mb-4">{error}</p>
 <Button onClick={loadFiles} variant="outline">
 Try Again
 </Button>
 </div>
 );
 }

 return (
 <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-8">
 <div className="max-w-4xl mx-auto">
 <div className="flex items-center justify-between mb-8 px-2">
 <h1 className="text-3xl font-semibold text-foreground/90 tracking-tight">Files</h1>
 <Button
 onClick={loadFiles}
 variant="ghost"
 size="sm"
 className="text-muted-foreground hover:text-foreground"
 >
 <RefreshCw className="w-4 h-4 mr-2" />
 Refresh
 </Button>
 </div>

 {files.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
 <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
 <h2 className="text-xl font-medium text-foreground/80 mb-2">No files yet</h2>
 <p className="text-sm text-center max-w-md">
 Files created by the AI (using write_file tool) will appear here.
 <br />
 Try asking the AI to create a file!
 </p>
 </div>
 ) : (
 <div className="space-y-2">
 {files.map((file) => {
 const Icon = getFileIcon(file.path);
 return (
 <div
 key={file.path}
 className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors"
 >
 <div className="flex items-center gap-4 min-w-0">
 <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
 <Icon className="w-5 h-5 text-foreground/70" />
 </div>
 <div className="min-w-0">
 <p className="font-medium text-foreground truncate">{file.path}</p>
 <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDownload(file.path)}
 onKeyDown={(e) => handleKeyDown(e, () => handleDownload(file.path))}
 className="text-muted-foreground hover:text-foreground"
 aria-label={`Download ${file.path}`}
 >
 <Download className="w-4 h-4" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(file.path)}
 onKeyDown={(e) => handleKeyDown(e, () => handleDelete(file.path))}
 className="text-muted-foreground hover:text-destructive"
 aria-label={`Delete ${file.path}`}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
);
}
