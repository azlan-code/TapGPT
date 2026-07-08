import { Router, Request, Response } from "express";
import { streamChat } from "../services/gemini.js";
import { ChatRequest, SSEEvent } from "../types/chat.js";

const router = Router();

function isValidChatRequest(body: unknown): body is ChatRequest {
  if (!body || typeof body !== "object") return false;
  const req = body as Record<string, unknown>;
  if (!Array.isArray(req.messages)) return false;
  return req.messages.every(
    (msg) =>
      typeof msg === "object" &&
      msg !== null &&
      (msg.role === "user" || msg.role === "assistant") &&
      typeof msg.content === "string"
  );
}

function sendSSE(res: Response, event: SSEEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

router.post("/", async (req: Request, res: Response) => {
  if (!isValidChatRequest(req.body)) {
    res.status(400).json({
      error: "Invalid request. Expected { messages: [{ role, content }] }",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    for await (const chunk of streamChat(req.body.messages)) {
      sendSSE(res, { type: "text", content: chunk });
    }
    sendSSE(res, { type: "done" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    sendSSE(res, { type: "error", message });
  } finally {
    res.end();
  }
});

export default router;
