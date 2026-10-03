/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    runCode: (code: string) => Promise<{ success: boolean; modelPath?: string; logs?: string; error?: string }>;
  };
}
