import { GoogleGenAI, Content } from "@google/genai";
import { ChatMessage } from "../types/chat.js";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function convertToGeminiMessages(messages: ChatMessage[]): Content[] {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

export async function* streamChat(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const contents = convertToGeminiMessages(messages);

  const response = await genai.models.generateContentStream({
    model: "gemini-2.0-flash-lite",
    contents,
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      yield text;
    }
  }
}
