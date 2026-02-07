// Polyfill for SharedArrayBuffer if not available (common in React Native environments)
// This must be imported before anything else that might depend on it (like Reanimated)
if (typeof SharedArrayBuffer === "undefined") {
  // @ts-ignore - explicitly polyfilling
  (global as any).SharedArrayBuffer = ArrayBuffer;
}
