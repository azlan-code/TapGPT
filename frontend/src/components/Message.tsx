import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types/chat";
import { TypingIndicator } from "./TypingIndicator";

interface MessageProps {
  message: ChatMessage;
  isTyping?: boolean;
  blurred?: boolean;
}

export function Message({ message, isTyping, blurred }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg border border-black ${
          isUser ? "bg-[#02A0DF]" : "bg-gray-100"
        }`}
      >
        <div className="transition-all duration-300">
          {isUser ? (
            <p className="text-black whitespace-pre-wrap">{message.content}</p>
          ) : isTyping ? (
            <TypingIndicator />
          ) : (
            <div className={`text-black prose prose-sm max-w-none prose-pre:bg-gray-100 prose-pre:border prose-pre:border-black prose-code:before:content-none prose-code:after:content-none ${blurred ? "blur-sm select-none" : ""}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
