# ALATPay Booth Gamification Web App

An engaging, gamified lead collection application designed for the ALATPay event booth. The app features a lucky visitor counter, automated gift notifications for "odd-numbered" visitors, and personalized AI-generated business growth tips.

## Key Features
- **Gamified Lead Collection**: Clean, branded form to collect visitor details.
- **Lucky Visitor Logic**: Automatically identifies winners based on configurable probability and visitor sequence.
- **AI Growth Insights**: Integration with Gemini API to provide personalized fintech/business tips for every visitor.
- **Centralized Data**: Submits leads to a central Google Sheet (Central Hub) for real-time monitoring.
- **Admin Dashboard**: Real-time analytics and CSV export functionality for booth staff.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Deployment**: Vite, Netlify
- **Data Hub**: Google Apps Script / Webhooks

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Configuration
- Update `constants.ts` to modify the `WEBHOOK_URL` and `WIN_PROBABILITY`.
- Ensure your `VITE_API_KEY` is set in your environment variables for the AI features to function.

---
© 2025 ALATPay Booth Experience. All rights reserved.