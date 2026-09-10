export {};

declare global {
  type GtagCommand = 'config' | 'event' | 'js';

  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: GtagCommand,
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;

    /**
     * Native App (Webview)에서 주입해주는 위치 정보
     */
    nativeLocation?: {
      coords: {
        latitude: number;
        longitude: number;
      };
    };

    /**
     * React Native WebView와 통신하기 위한 객체
     */
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
