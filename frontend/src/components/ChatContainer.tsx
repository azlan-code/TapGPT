import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { WaterUsageStats } from "./WaterUsageStats";
import { TapPopup } from "./TapPopup";
import tapOffImage from "../assets/images/tap-off.png";

export function ChatContainer() {
  const { messages, isLoading, sendMessage } = useChat();
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
        setShowPopup(true);
      }
    }
  }, [isLoading, messages]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <WaterUsageStats visible={hasMessages} />

      {/* Header - animates from centered to top */}
      <header className={`
        flex items-center justify-center gap-2 transition-all duration-250 ease-out
        ${hasMessages
          ? 'py-4 border-b border-black'
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
        p-4 transition-all duration-250
        ${hasMessages
          ? 'border-t border-black'
          : 'flex-1 flex items-start justify-center'
        }
      `}>
        <div className="w-full max-w-2xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
      <TapPopup visible={showPopup} onComplete={() => setShowPopup(false)} />
    </div>
  );
}
