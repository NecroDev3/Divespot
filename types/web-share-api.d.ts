// Web Share API type definitions
declare global {
  interface Navigator {
    share?: (data: ShareData) => Promise<void>;
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }
}

export {};


