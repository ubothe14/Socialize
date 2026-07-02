import { MessageSquareIcon } from "lucide-react";

const ChatListTab = ({ friends, search, selectedFriend, setSelectedFriend }) => {
  const filtered = friends.filter((f) =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--wa-text-muted)" }}>
        <MessageSquareIcon size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>
          {search ? "No chats match your search" : "No contacts yet. Go to Discover to add friends!"}
        </p>
      </div>
    );
  }

  return (
    <>
      {filtered.map((friend) => (
        <div
          key={friend._id}
          className={`wa-chat-item ${selectedFriend?._id === friend._id ? "active" : ""}`}
          onClick={() => setSelectedFriend(friend)}
        >
          <img
            src={friend.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend._id}`}
            alt={friend.fullName}
            className="wa-chat-avatar"
          />
          <div className="wa-chat-info">
            <div className="wa-chat-name">{friend.fullName}</div>
            <div className="wa-chat-preview">
              {friend.bio || "Hey there! I'm using Socialize."}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChatListTab;
