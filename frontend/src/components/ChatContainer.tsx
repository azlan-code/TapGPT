import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { calculateWaterUsage } from "../utils/waterUsage";
import type { WaterUsageResult } from "../types/waterUsage";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { WaterUsageStats } from "./WaterUsageStats";
import { TapPopup } from "./TapPopup";
import tapOffImage from "../assets/images/tap-off.png";
import asciiSinkImage from "../assets/images/ascii-sink.svg";

export function ChatContainer() {
  const { messages, isLoading, sendMessage } = useChat();
  const [waterUsage, setWaterUsage] = useState<WaterUsageResult>({
    modelUsages: [],
    averageUsage: 0,
    holdDurationMs: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIsLoadingRef = useRef(isLoading);
  const [showPopup, setShowPopup] = useState(false);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detect when loading completes and show popup
  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    // Check for transition from loading to not loading
    if (wasLoading && !isLoading) {
      // Verify last message is an assistant message with content
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant" && lastMessage.content) {
        // Calculate and commit water usage FIRST
        setWaterUsage(calculateWaterUsage(messages));
        // THEN show popup
        setShowPopup(true);
      }
    }
  }, [isLoading, messages]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <img
        src={asciiSinkImage}
        alt=""
        aria-hidden="true"
        className="fixed bottom-0 left-0 pointer-events-none z-0 w-full max-w-[750px]"
      />
      <WaterUsageStats visible={hasMessages} modelUsages={waterUsage.modelUsages} />

      {/* Header - animates from centered to top */}
      <header className={`
        flex items-center justify-center gap-2 transition-all duration-250 ease-out
        ${hasMessages
          ? 'py-6 border-b border-black'
          : 'flex-1'
        }
      `}>
        <img
          src={tapOffImage}
          alt="Tap"
          className={`transition-all duration-250 ${hasMessages ? 'h-8' : 'h-12'}`}
        />
        <h1 className={`
          font-bold text-black transition-all duration-250
          ${hasMessages ? 'text-2xl' : 'text-4xl'}
        `}>
          TapGPT
        </h1>
      </header>

      {/* Messages area - expands when messages exist */}
      <div className={`
        overflow-y-auto px-4 transition-all duration-250
        ${hasMessages ? 'flex-1 py-6 opacity-100' : 'h-0 py-0 opacity-0 overflow-hidden'}
      `}>
        <div className="max-w-2xl mx-auto">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const showTyping = isLoading && isLastMessage && message.content === "" && message.role === "assistant";
            const shouldBlur = isLastMessage && message.role === "assistant" && (isLoading || showPopup);
            return (
              <Message key={index} message={message} isTyping={showTyping} blurred={shouldBlur} />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - animates from centered to bottom */}
      <div className={`
        p-4 transition-all duration-250 bg-white
        ${hasMessages
          ? 'border-t border-black relative z-10'
          : 'flex-1 flex items-start justify-center'
        }
      `}>
        <div className={`
          w-full max-w-2xl mx-auto
          ${hasMessages
            ? ""
            : "relative z-10"
          }
        `}>
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
      
      <TapPopup visible={showPopup} onComplete={() => setShowPopup(false)} holdDurationMs={waterUsage.holdDurationMs} />
    </div>
  );
}
