import { useState, useCallback } from "react";
import type { ChatMessage } from "../types/chat";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: "user", content };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "text" && parsed.content) {
                setMessages((prev) => {
                  const lastIndex = prev.length - 1;
                  const lastMessage = prev[lastIndex];
                  if (lastMessage.role === "assistant") {
                    return [
                      ...prev.slice(0, lastIndex),
                      { ...lastMessage, content: lastMessage.content + parsed.content }
                    ];
                  }
                  return prev;
                });
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        const lastMessage = prev[lastIndex];
        if (lastMessage.role === "assistant" && !lastMessage.content) {
          return [
            ...prev.slice(0, lastIndex),
            { ...lastMessage, content: "Sorry, something went wrong. Please try again." }
          ];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, isLoading, sendMessage };
}
