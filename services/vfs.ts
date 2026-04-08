import { get, set } from 'idb-keyval';

const VFS_KEY = 'throughthink_vfs';

export interface VfsFile {
  path: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  size: number;
}

export const getVfs = async (): Promise<Record<string, string>> => {
  return (await get(VFS_KEY)) || {};
};

export const writeVfsFile = async (path: string, content: string): Promise<string> => {
  const files = await getVfs();
  files[path] = content;
  await set(VFS_KEY, files);
  return `Successfully wrote ${content.length} bytes to ${path}`;
};

export const readVfsFile = async (path: string): Promise<string> => {
  const files = await getVfs();
  if (!(path in files)) {
    throw new Error(`File not found: ${path}`);
  }
  return files[path];
};

export const deleteVfsFile = async (path: string): Promise<string> => {
  const files = await getVfs();
  if (!(path in files)) {
    throw new Error(`File not found: ${path}`);
  }
  delete files[path];
  await set(VFS_KEY, files);
  return `Successfully deleted ${path}`;
};

export const listVfsFiles = async (): Promise<string[]> => {
  const files = await getVfs();
  return Object.keys(files).sort();
};

export const getVfsFileDetails = async (): Promise<Array<{ path: string; size: number }>> => {
  const files = await getVfs();
  return Object.entries(files).map(([path, content]) => ({
    path,
    size: content.length
  })).sort((a, b) => a.path.localeCompare(b.path));
};
