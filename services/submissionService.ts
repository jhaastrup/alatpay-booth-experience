import { Visitor } from '../types';
import { WEBHOOK_URL } from '../constants';

/**
 * Submits lead to Google Sheets Central Hub.
 */
export const submitLeadToCentralHub = async (visitor: Visitor): Promise<boolean> => {
  if (!WEBHOOK_URL) return false;

  try {
    // mode: 'no-cors' allows us to send data to Apps Script even without explicit CORS headers.
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(visitor)
    });
    return true;
  } catch (error) {
    console.warn("Central Hub Submission Error:", error);
    return false;
  }
};

/**
 * Fetches all leads from the Central Hub.
 * Optimized to handle multiple JSON shapes and bypass browser caching.
 */
export const fetchAllLeads = async (): Promise<Visitor[]> => {
  if (!WEBHOOK_URL) return [];

  try {
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('action', 'getVisitors');
    url.searchParams.append('_t', Date.now().toString()); // Cache busting

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const rawData = await response.json();
    
    // Handle standard array response or wrapped { data: [...] } response
    let visitors: Visitor[] = [];
    if (Array.isArray(rawData)) {
      visitors = rawData;
    } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
      visitors = rawData.data;
    }

    // Basic sanitization: Ensure every visitor has an ID and timestamp
    return visitors.filter(v => v && typeof v === 'object' && v.id);
  } catch (error) {
    console.error("Failed to fetch leads from Google Sheets:", error);
    return [];
  }
};
