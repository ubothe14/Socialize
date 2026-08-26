import { useState } from "react";
import { XIcon, SearchIcon } from "lucide-react";

/**
 * MessageSearchPanel
 * WhatsApp-style right-side slide-out panel for searching keywords in active chat.
 */
const MessageSearchPanel = ({ channel, onClose, onSelectMessage }) => {
  const [query, setQuery] = useState("");

  const messages = channel?.state?.messages || [];
  const filtered = query.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleResultClick = (messageId) => {
    if (onSelectMessage) {
      onSelectMessage(messageId);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="wa-search-panel">
      {/* Header */}
      <div className="wa-panel-header" style={{ borderBottom: "1px solid var(--wa-divider)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="wa-panel-title" style={{ fontSize: 16 }}>Search messages</span>
        <button className="wa-header-btn" onClick={onClose}>
          <XIcon size={20} />
        </button>
      </div>

      {/* Input */}
      <div className="wa-search-wrap" style={{ position: "relative" }}>
        <SearchIcon
          size={16}
          className="search-icon"
          style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "var(--wa-text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search..."
          className="wa-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Results List */}
      <div className="wa-panel-content">
        {query.trim() && filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--wa-text-muted)", fontSize: 13 }}>
            No messages found
          </div>
        ) : query.trim() ? (
          <>
            <div className="wa-section-label" style={{ padding: "16px 16px 8px" }}>
              {filtered.length} messages found
            </div>
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className="wa-search-result-item"
                onClick={() => handleResultClick(msg.id)}
              >
                <span className="wa-search-result-time">{formatTime(msg.created_at)}</span>
                <div className="wa-search-result-user">{msg.user?.name || "User"}</div>
                <div className="wa-search-result-text">{msg.text}</div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--wa-text-muted)", fontSize: 13, lineHeight: 1.6 }}>
            Search for messages in this chat.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSearchPanel;
