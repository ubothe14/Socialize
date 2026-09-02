import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY || process.env.STEAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET || process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.warn("⚠️ Stream API key or Secret is missing in environment variables");
}

const streamClient = apiKey && apiSecret ? StreamChat.getInstance(apiKey, apiSecret) : null;

export const upsertStreamUser = async (userData) => {
  if (!streamClient) return userData;
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error.message || error);
  }
};

export const generateStreamToken = (userId) => {
  if (!streamClient) {
    console.error("Stream client is not initialized.");
    return null;
  }
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error.message || error);
    return null;
  }
};