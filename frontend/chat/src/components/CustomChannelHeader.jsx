import { useChannelStateContext, useTypingContext, useChatContext } from "stream-chat-react";
import { VideoIcon, SearchIcon } from "lucide-react";

/**
 * CustomChannelHeader
 * Renders the chat header with avatar, name, and an inline typing indicator
 * displayed below the name — just like WhatsApp.
 */
const CustomChannelHeader = ({ handleVideoCall }) => {
  const { channel } = useChannelStateContext();
  const { typing } = useTypingContext();
  const { client } = useChatContext();

  // Get the other member in the channel (not the current user)
  const members = Object.values(channel?.state?.members || {});
  const otherMember = members.find((m) => m.user?.id !== client?.userID);
  const otherUser = otherMember?.user;

  // Check if the other user is currently typing
  const typingUsers = Object.values(typing || {}).filter(
    (u) => u.user?.id !== client?.userID
  );
  const isTyping = typingUsers.length > 0;

  return (
    <div className="custom-chat-header">
      {/* Avatar */}
      <div className="custom-chat-header__avatar">
        {otherUser?.image ? (
          <img src={otherUser.image} alt={otherUser?.name || "User"} />
        ) : (
          <div className="custom-chat-header__avatar-fallback">
            {(otherUser?.name || "U")[0].toUpperCase()}
          </div>
        )}
        <span className="custom-chat-header__online-dot" />
      </div>

      {/* Name + Typing indicator */}
      <div className="custom-chat-header__info">
        <h3 className="custom-chat-header__name">
          {otherUser?.name || channel?.data?.name || "Chat"}
        </h3>

        {/* Typing indicator shown BELOW name, like WhatsApp */}
        {isTyping ? (
          <span className="custom-chat-header__typing">
            <span className="typing-dots">
              <span />
              <span />
              <span />
            </span>
            typing...
          </span>
        ) : (
          <span className="custom-chat-header__status">online</span>
        )}
      </div>

      {/* Actions */}
      <div className="custom-chat-header__actions">
        {handleVideoCall && (
          <button
            onClick={handleVideoCall}
            className="custom-chat-header__action-btn"
            title="Video Call"
          >
            <VideoIcon size={20} />
          </button>
        )}
        <button
          className="custom-chat-header__action-btn"
          title="Search"
        >
          <SearchIcon size={18} />
        </button>
      </div>
    </div>
  );
};

export default CustomChannelHeader;
