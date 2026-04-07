declare global {
  interface Window {
    loadPyodide: any;
  }
}

let pyodideInstance: any = null;
let isLoading = false;

export const preloadPython = async () => {
  if (pyodideInstance || isLoading) return;
  if (!window.loadPyodide) return;
  isLoading = true;
  try {
    pyodideInstance = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
  } catch (e) {
    console.error("Failed to preload Pyodide", e);
  } finally {
    isLoading = false;
  }
};

export const runPython = async (code: string) => {
  if (!pyodideInstance) {
    if (!window.loadPyodide) {
      throw new Error("Pyodide script not loaded in HTML.");
    }
    pyodideInstance = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
  }
  
  let output = '';
  pyodideInstance.setStdout({ batched: (str: string) => { output += str + '\n'; } });
  pyodideInstance.setStderr({ batched: (str: string) => { output += str + '\n'; } });
  
  try {
    await pyodideInstance.loadPackagesFromImports(code);
    const result = await pyodideInstance.runPythonAsync(code);
    return output + (result !== undefined ? `\nResult: ${result}` : '');
  } catch (error: any) {
    return output + `\nError: ${error.message}`;
  }
};
