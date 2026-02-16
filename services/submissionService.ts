
import { Visitor } from '../types';
import { WEBHOOK_URL } from '../constants';

export const submitLeadToCentralHub = async (visitor: Visitor): Promise<boolean> => {
  if (!WEBHOOK_URL) {
    console.warn("No WEBHOOK_URL defined. Data is only being saved locally on this device.");
    return false;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', // Common for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitor),
    });
    
    // Note: with 'no-cors', we can't see the response status, 
    // but the request is sent to the server.
    return true;
  } catch (error) {
    console.error("Central Submission Error:", error);
    return false;
  }
};
