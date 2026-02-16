
import { GoogleGenAI } from "@google/genai";

export const getPersonalizedMessage = async (name: string, isWinner: boolean, organization?: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const context = organization ? `from ${organization}` : "";
    
    const prompt = isWinner 
      ? `Write a super enthusiastic, short 1-sentence congratulatory message for ${name} ${context} who just won a prize at the ALATPay tech booth. Keep it fun and fintech-focused.`
      : `Write a friendly, short 1-sentence motivational tech/business tip for ${name} ${context} visiting the ALATPay booth. Use an encouraging tone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Thank you for visiting ALATPay!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return isWinner 
      ? `🎉 Congratulations ${name}! You're one of our lucky winners!`
      : `Thanks for stopping by, ${name}! Stay tuned for more opportunities.`;
  }
};
