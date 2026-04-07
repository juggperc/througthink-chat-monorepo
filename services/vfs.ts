import { get, set } from 'idb-keyval';

const VFS_KEY = 'throughthink_vfs';

export const getVfs = async (): Promise<Record<string, string>> => {
  return (await get(VFS_KEY)) || {};
};

export const writeVfsFile = async (path: string, content: string) => {
  const files = await getVfs();
  files[path] = content;
  await set(VFS_KEY, files);
  return `Successfully wrote ${content.length} bytes to ${path}`;
};

export const readVfsFile = async (path: string) => {
  const files = await getVfs();
  if (!(path in files)) throw new Error(`File not found: ${path}`);
  return files[path];
};

export const listVfsFiles = async () => {
  const files = await getVfs();
  return Object.keys(files);
};
