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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // We use no-cors because Apps Script often doesn't handle preflight well
    // but the data still hits the spreadsheet.
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
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

/**
 * Fetches all leads from the Central Hub (Google Sheets).
 * Includes cache-busting to ensure fresh data from other devices.
 */
export const fetchAllLeads = async (): Promise<Visitor[]> => {
  if (!WEBHOOK_URL) return [];

  try {
    // Add cache-busting timestamp to bypass browser/CDN caching
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('action', 'getVisitors');
    url.searchParams.append('_t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate that we received an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // Some Apps Script setups return { status: 'success', data: [...] }
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    }

    console.error("Unexpected data format from Central Hub:", data);
    return [];
  } catch (error) {
    console.error("Failed to sync global data:", error);
    // Return empty array instead of throwing to keep the UI stable
    return [];
  }
};
