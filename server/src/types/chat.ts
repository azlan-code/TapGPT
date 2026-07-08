export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export type SSEEvent =
  | { type: "text"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };
