import { useState } from "react";
import useAuthUser from "../../hooks/useAuthUser";
import { ArrowLeftIcon, SearchIcon, UsersIcon, UserPlusIcon, InfoIcon } from "lucide-react";

/**
 * NewChatPanel
 * Renders the "New Chat" panel with search and alphabetical list of friends,
 * matching the WhatsApp screenshots exactly.
 */
const NewChatPanel = ({ friends, onClose, onSelectFriend }) => {
  const { authUser } = useAuthUser();
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((f) =>
    f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  // Group friends alphabetically
  const grouped = {};
  filteredFriends.forEach((friend) => {
    const firstLetter = friend.fullName.trim()[0].toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(friend);
  });

  // Sort alphabetical keys
  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--wa-sidebar-bg)" }}>
      {/* Header */}
      <div className="wa-panel-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="wa-header-btn" onClick={onClose}>
          <ArrowLeftIcon size={20} />
        </button>
        <span className="wa-panel-title" style={{ fontSize: 18 }}>New chat</span>
      </div>

      {/* Search Input */}
      <div className="wa-search-wrap" style={{ position: "relative" }}>
        <SearchIcon
          size={16}
          className="search-icon"
          style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "var(--wa-text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search name or number"
          className="wa-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Scrollable list */}
      <div className="wa-panel-content">
        {/* Menu Options (WhatsApp mock-up items) */}
        {!search && (
          <>
            <div className="wa-user-row" style={{ cursor: "pointer" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: "var(--wa-green)", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <UsersIcon size={20} color="#fff" />
              </div>
              <div className="wa-user-info">
                <div className="wa-user-name" style={{ fontWeight: 600 }}>New group</div>
              </div>
            </div>

            <div className="wa-user-row" style={{ cursor: "pointer" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: "var(--wa-green)", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <UserPlusIcon size={20} color="#fff" />
              </div>
              <div className="wa-user-info">
                <div className="wa-user-name" style={{ fontWeight: 600 }}>New contact</div>
              </div>
            </div>

            <div className="wa-user-row" style={{ cursor: "pointer" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: "var(--wa-green)", display: "flex",
                alignItems: "center", justifyContent: "center"
              }}>
                <UsersIcon size={20} color="#fff" />
              </div>
              <div className="wa-user-info">
                <div className="wa-user-name" style={{ fontWeight: 600 }}>New community</div>
              </div>
            </div>

            {/* Message Yourself Option */}
            <div
              className="wa-user-row"
              style={{ cursor: "pointer" }}
              onClick={() => {
                onSelectFriend(authUser);
                onClose();
              }}
            >
              <img
                src={authUser?.profilePic}
                alt="Me"
                className="wa-user-avatar"
              />
              <div className="wa-user-info">
                <div className="wa-user-name" style={{ fontWeight: 600 }}>{authUser?.fullName} (You)</div>
                <div className="wa-user-bio">Message yourself</div>
              </div>
            </div>
          </>
        )}

        {/* Categorized Friends List */}
        {sortedKeys.map((key) => (
          <div key={key}>
            {/* Alphabetical category header */}
            <div
              style={{
                padding: "16px 16px 6px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--wa-green)",
              }}
            >
              {key}
            </div>

            {/* Friends list inside category */}
            {grouped[key].map((friend) => (
              <div
                key={friend._id}
                className="wa-user-row"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  onSelectFriend(friend);
                  onClose();
                }}
              >
                <img
                  src={friend.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend._id}`}
                  alt={friend.fullName}
                  className="wa-user-avatar"
                />
                <div className="wa-user-info">
                  <div className="wa-user-name" style={{ fontWeight: 500 }}>{friend.fullName}</div>
                  <div className="wa-user-bio">{friend.bio || "Hey there! I'm using Socialize."}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredFriends.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--wa-text-muted)" }}>
            <InfoIcon size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 13 }}>No contacts found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatPanel;
