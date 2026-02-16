import { Visitor } from '../types';
import { WEBHOOK_URL } from '../constants';

/**
 * Submits lead to Google Sheets Central Hub.
 */
export const submitLeadToCentralHub = async (visitor: Visitor): Promise<boolean> => {
  if (!WEBHOOK_URL) return false;

  try {
    // mode: 'no-cors' is used to avoid preflight issues with Google Apps Script
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
 * Optimized to handle both JSON objects and raw sheet rows (array of arrays).
 */
export const fetchAllLeads = async (): Promise<Visitor[]> => {
  if (!WEBHOOK_URL) return [];

  try {
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append('action', 'getVisitors');
    url.searchParams.append('_t', Date.now().toString()); // Bypass browser caching

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const rawData = await response.json();
    let dataArray: any[] = [];

    // Handle different response structures
    if (Array.isArray(rawData)) {
      dataArray = rawData;
    } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
      dataArray = rawData.data;
    }

    // Map the raw data into our Visitor interface
    const mappedVisitors: Visitor[] = dataArray.map((item, index) => {
      // If the item is an array (raw sheet rows), map by index based on user's sheet screenshot
      if (Array.isArray(item)) {
        const [timestamp, name, email, phone, organization, outcome] = item;
        
        // Generate a deterministic ID if none exists in the row
        const generatedId = `global-${btoa(email + timestamp).substring(0, 12)}`;
        
        return {
          id: generatedId,
          name: name || 'Unknown',
          email: email || '',
          phone: phone || '',
          organization: organization || '',
          visitorNumber: 100 + index, // Fallback visitor number
          isWinner: String(outcome).toLowerCase().includes('winner') || String(outcome).toLowerCase() === 'yes',
          timestamp: timestamp || new Date().toISOString()
        } as Visitor;
      }

      // If it's already an object, ensure it has the required fields for the UI
      if (typeof item === 'object' && item !== null) {
        return {
          ...item,
          id: item.id || `obj-${index}-${Date.now()}`,
          isWinner: item.isWinner ?? (String(item.outcome || '').toLowerCase().includes('winner')),
          timestamp: item.timestamp || new Date().toISOString()
        } as Visitor;
      }

      return null;
    }).filter((v): v is Visitor => v !== null);

    return mappedVisitors;
  } catch (error) {
    console.error("Critical Sync Error:", error);
    return [];
  }
};
