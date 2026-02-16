import { Visitor } from '../types';
import { WEBHOOK_URL } from '../constants';

/**
 * Submits lead to Google Sheets Central Hub.
 * Optimized for background execution so it doesn't block the UI.
 */
export const submitLeadToCentralHub = async (visitor: Visitor): Promise<boolean> => {
  if (!WEBHOOK_URL) {
    return false;
  }

  // Use a controller to ensure we don't hang if network is slow
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', // Use text/plain for no-cors to avoid preflight
      },
      body: JSON.stringify(visitor),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("Central Hub Sync Error:", error);
    return false;
  }
};