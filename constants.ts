
export const COLORS = {
  PRIMARY: '#be0b27',
  SECONDARY: '#92091d',
  ACCENT: '#ffb703',
  SUCCESS: '#4ade80'
};

export const LINKS = {
  ONBOARDING: 'https://alatpay.ng/merchant-signup',
  COMMUNITY: 'https://bit.ly/ALATPayDevs'
};

export const STORAGE_KEYS = {
  VISITORS: 'alatpay_visitors',
  COUNTER: 'alatpay_visitor_counter'
};

// Controls the percentage of winners (0.70 = 70% chance)
// This aligns with the "Every odd visitor wins" rule by making 70% of numbers generated ODD.
export const WIN_PROBABILITY = 0.70;

/**
 * REPLACE THIS URL with your Google Apps Script Web App URL
 * to centralize all booth leads into one spreadsheet.
 */
export const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxzb-f4dBAStiWt6oX26KAO3QNjLfkyAwfW-QwGBUGFslMuMRKSV4sBXpBNgERaxdLI/exec';
