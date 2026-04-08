// File parsing utilities for extracting text from documents
// For browser-based parsing, we use libraries that work in the browser

export interface ParsedFile {
 name: string;
 type: 'image' | 'pdf' | 'word' | 'excel' | 'text' | 'unknown';
 content: string; // Extracted text or base64 for images
 mimeType: string;
 size: number;
}

const getFileExtension = (filename: string): string => {
 return filename.split('.').pop()?.toLowerCase() || '';
};

const getMimeType = (filename: string): string => {
 const ext = getFileExtension(filename);
 const mimeTypes: Record<string, string> = {
 'pdf': 'application/pdf',
 'doc': 'application/msword',
 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'xls': 'application/vnd.ms-excel',
 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'txt': 'text/plain',
 'md': 'text/markdown',
 'json': 'application/json',
 'js': 'application/javascript',
 'ts': 'application/typescript',
 'py': 'text/x-python',
 'html': 'text/html',
 'css': 'text/css',
 };
 return mimeTypes[ext] || 'application/octet-stream';
};

export const parseFile = async (file: File): Promise<ParsedFile> => {
 const ext = getFileExtension(file.name);
 const mimeType = getMimeType(file.name);

 // Handle images - return as base64
 if (file.type.startsWith('image/')) {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => {
 resolve({
 name: file.name,
 type: 'image',
 content: reader.result as string,
 mimeType: file.type,
 size: file.size,
 });
 };
 reader.onerror = () => reject(new Error('Failed to read image file'));
 reader.readAsDataURL(file);
 });
 }

 // Handle text files
 const textExtensions = ['txt', 'md', 'json', 'js', 'ts', 'py', 'html', 'css', 'xml', 'csv', 'yaml', 'yml'];
 if (textExtensions.includes(ext)) {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => {
 resolve({
 name: file.name,
 type: 'text',
 content: reader.result as string,
 mimeType,
 size: file.size,
 });
 };
 reader.onerror = () => reject(new Error('Failed to read text file'));
 reader.readAsText(file);
 });
 }

 // Handle PDF files - extract text
 if (ext === 'pdf') {
 const content = await extractPdfText(file);
 return {
 name: file.name,
 type: 'pdf',
 content,
 mimeType,
 size: file.size,
 };
 }

 // Handle Word documents
 if (ext === 'doc' || ext === 'docx') {
 const content = await extractWordText(file);
 return {
 name: file.name,
 type: 'word',
 content,
 mimeType,
 size: file.size,
 };
 }

 // Handle Excel files
 if (ext === 'xls' || ext === 'xlsx') {
 const content = await extractExcelText(file);
 return {
 name: file.name,
 type: 'excel',
 content,
 mimeType,
 size: file.size,
 };
 }

 // Fallback - try to read as text
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.onload = () => {
 resolve({
 name: file.name,
 type: 'unknown',
 content: reader.result as string,
 mimeType,
 size: file.size,
 });
 };
 reader.onerror = () => reject(new Error('Failed to read file'));
 reader.readAsText(file);
 });
};

// PDF text extraction using pdf.js (loaded from CDN)
async function extractPdfText(file: File): Promise<string> {
 try {
 // @ts-ignore - pdfjsLib is loaded from CDN
 if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
 const pdfjsLib = (window as any).pdfjsLib;
 const arrayBuffer = await file.arrayBuffer();
 const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
 
 let fullText = '';
 for (let i = 1; i <= pdf.numPages; i++) {
 const page = await pdf.getPage(i);
 const textContent = await page.getTextContent();
 const pageText = textContent.items.map((item: any) => item.str).join(' ');
 fullText += pageText + '\n\n';
 }
 
 return `[PDF: ${file.name}]\n\n${fullText.trim()}`;
 }
 
 // Fallback: indicate PDF needs manual extraction
 return `[PDF file: ${file.name} - ${formatFileSize(file.size)}]\nNote: PDF content extraction requires pdf.js library. The AI can work with the file name and size information.`;
 } catch (error) {
 console.error('PDF extraction error:', error);
 return `[PDF file: ${file.name} - Error extracting content]`;
 }
}

// Word document text extraction
async function extractWordText(file: File): Promise<string> {
 try {
 // For .docx files, we can use mammoth if available
 if (typeof window !== 'undefined' && (window as any).mammoth) {
 const mammoth = (window as any).mammoth;
 const arrayBuffer = await file.arrayBuffer();
 const result = await mammoth.extractRawText({ arrayBuffer });
 return `[Word Document: ${file.name}]\n\n${result.value}`;
 }
 
 // Fallback
 return `[Word document: ${file.name} - ${formatFileSize(file.size)}]\nNote: Word content extraction requires mammoth library. The AI can work with the file name and size information.`;
 } catch (error) {
 console.error('Word extraction error:', error);
 return `[Word document: ${file.name} - Error extracting content]`;
 }
}

// Excel text extraction
async function extractExcelText(file: File): Promise<string> {
 try {
 // For xlsx files, we can use xlsx library if available
 if (typeof window !== 'undefined' && (window as any).XLSX) {
 const XLSX = (window as any).XLSX;
 const arrayBuffer = await file.arrayBuffer();
 const workbook = XLSX.read(arrayBuffer, { type: 'array' });
 
 let fullText = `[Excel file: ${file.name}]\n\n`;
 workbook.SheetNames.forEach((sheetName: string) => {
 const sheet = workbook.Sheets[sheetName];
 const csv = XLSX.utils.sheet_to_csv(sheet);
 fullText += `--- Sheet: ${sheetName} ---\n${csv}\n\n`;
 });
 
 return fullText.trim();
 }
 
 // Fallback
 return `[Excel file: ${file.name} - ${formatFileSize(file.size)}]\nNote: Excel content extraction requires xlsx library. The AI can work with the file name and size information.`;
 } catch (error) {
 console.error('Excel extraction error:', error);
 return `[Excel file: ${file.name} - Error extracting content]`;
 }
}

function formatFileSize(bytes: number): string {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get file icon type for UI display
export const getFileTypeInfo = (filename: string): { icon: string; color: string } => {
 const ext = getFileExtension(filename);
 
 const typeMap: Record<string, { icon: string; color: string }> = {
 'pdf': { icon: 'pdf', color: 'text-red-500' },
 'doc': { icon: 'word', color: 'text-blue-500' },
 'docx': { icon: 'word', color: 'text-blue-500' },
 'xls': { icon: 'excel', color: 'text-green-500' },
 'xlsx': { icon: 'excel', color: 'text-green-500' },
 'txt': { icon: 'text', color: 'text-gray-500' },
 'md': { icon: 'text', color: 'text-gray-500' },
 'json': { icon: 'code', color: 'text-yellow-500' },
 'js': { icon: 'code', color: 'text-yellow-500' },
 'ts': { icon: 'code', color: 'text-blue-400' },
 'py': { icon: 'code', color: 'text-green-400' },
 };
 
 return typeMap[ext] || { icon: 'file', color: 'text-gray-400' };
};
