import { createContext, useContext, useEffect, useState } from "react";
import { createApp } from "@shopify/app-bridge";

// Create App Bridge context
const AppBridgeContext = createContext(null);

/**
 * AppBridgeProvider - Manually initializes App Bridge
 * App Bridge React v4 doesn't have Provider, so we create it manually
 */
export function AppBridgeProvider({ children }) {
  const [app, setApp] = useState(null);

  useEffect(() => {
    // Get API key from meta tag
    const apiKey = document.querySelector('meta[name="shopify-api-key"]')?.getAttribute('content') || '';
    
    // Get host from URL query params (Shopify admin provides this)
    const host = new URLSearchParams(window.location.search).get('host') || '';

    if (apiKey && host && !app) {
      // Manually create App Bridge instance
      const appBridge = createApp({
        apiKey,
        host,
      });
      setApp(appBridge);
    }
  }, []);

  return (
    <AppBridgeContext.Provider value={app}>
      {children}
    </AppBridgeContext.Provider>
  );
}

// Hook to get App Bridge instance
export function useAppBridgeInstance() {
  return useContext(AppBridgeContext);
}

