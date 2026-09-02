import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MAX_HISTORY = 12;

export const askGemini = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is not configured on the server.",
      });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Message is required.",
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) =>
            item &&
            (item.role === "user" || item.role === "ai") &&
            typeof item.text === "string" &&
            item.text.trim()
          )
          .slice(-MAX_HISTORY)
      : [];

    const contents = [
      ...safeHistory.map((item) => ({
        role: item.role === "ai" ? "model" : "user",
        parts: [{ text: item.text.trim() }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are Gemini AI inside Socialize, a friendly social chat application. Give clear, helpful, concise answers. For coding questions, provide practical and correct examples. Do not claim to have performed actions you cannot perform.",
      },
    });

    return res.status(200).json({
      reply: response.text || "I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      message: "Failed to get a response from Gemini.",
    });
  }
};
