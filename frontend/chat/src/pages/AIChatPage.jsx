import { useEffect, useRef, useState } from "react";
import { BotIcon, SendIcon, SparklesIcon, Trash2Icon, UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { askGemini } from "../lib/api";

const STORAGE_KEY = "socialize-gemini-chat";

const initialMessages = [
  {
    role: "ai",
    text: "Hi! I'm Gemini AI. Ask me anything — coding, ideas, explanations, writing, or general questions.",
  },
];

const AIChatPage = () => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (event) => {
    event?.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage = { role: "user", text: message };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askGemini({
        message,
        history: messages.slice(-12),
      });

      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: response.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Gemini request failed:", error);
      toast.error(error?.response?.data?.message || "Gemini is unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages(initialMessages);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("AI chat cleared");
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-header">
        <div className="ai-chat-title-wrap">
          <div className="ai-chat-avatar">
            <BotIcon size={22} />
          </div>
          <div>
            <h2>Gemini AI</h2>
            <span><span className="ai-online-dot" /> AI Assistant</span>
          </div>
        </div>
        <button className="ai-clear-btn" onClick={clearChat} title="Clear chat">
          <Trash2Icon size={18} />
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`ai-message-row ${message.role}`}>
            <div className={`ai-message-avatar ${message.role}`}>
              {message.role === "ai" ? <BotIcon size={16} /> : <UserIcon size={16} />}
            </div>
            <div className={`ai-message-bubble ${message.role}`}>
              <div className="ai-message-label">{message.role === "ai" ? "Gemini" : "You"}</div>
              <div className="ai-message-text">{message.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-message-row ai">
            <div className="ai-message-avatar ai"><BotIcon size={16} /></div>
            <div className="ai-message-bubble ai ai-typing">
              <SparklesIcon size={15} />
              <span>Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="ai-input-area" onSubmit={handleSend}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend(event);
            }
          }}
          placeholder="Ask Gemini anything..."
          rows={1}
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading} title="Send">
          <SendIcon size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIChatPage;
