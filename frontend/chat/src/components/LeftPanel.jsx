import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, PenSquareIcon } from "lucide-react";
import { getUserFriends } from "../lib/api";
import ChatListTab    from "./tabs/ChatListTab";
import DiscoverTab    from "./tabs/DiscoverTab";
import NotificationsTab from "./tabs/NotificationsTab";
import StatusTab      from "./tabs/StatusTab";
import SettingsPanel  from "./tabs/SettingsPanel";
import NewChatPanel   from "./tabs/NewChatPanel";
import GroupsTab      from "./tabs/GroupsTab";

const TAB_TITLES = {
  chats:         "Socialize",
  groups:        "Groups",
  status:        "Status",
  discover:      "Discover",
  notifications: "Notifications",
  settings:      "Settings",
};

const LeftPanel = ({ activeTab, setActiveTab, selectedFriend, setSelectedFriend, onSelectStatusGroup, chatClient }) => {
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  // Fetch friends list for both Chat list and New Chat sliding panel
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const showSearch = ["chats", "discover"].includes(activeTab);

  // Renders the New Chat slide-out list if active
  if (showNewChat) {
    return (
      <NewChatPanel
        friends={friends}
        onClose={() => setShowNewChat(false)}
        onSelectFriend={setSelectedFriend}
      />
    );
  }

  return (
    <div className="wa-left-panel">
      {/* Header */}
      <div className="wa-panel-header">
        <span className="wa-panel-title">{TAB_TITLES[activeTab] || "Socialize"}</span>
        <div className="wa-header-actions">
          {activeTab === "chats" && (
            <button
              className="wa-header-btn"
              title="New Chat"
              onClick={() => setShowNewChat(true)}
            >
              <PenSquareIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="wa-search-wrap" style={{ position: "relative" }}>
          <SearchIcon
            size={16}
            className="search-icon"
            style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "var(--wa-text-muted)" }}
          />
          <input
            type="text"
            placeholder={activeTab === "chats" ? "Search or start a new chat" : "Search people..."}
            className="wa-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Tab content */}
      <div className="wa-panel-content">
        {activeTab === "chats" && (
          <ChatListTab
            friends={friends}
            search={search}
            selectedFriend={selectedFriend}
            setSelectedFriend={setSelectedFriend}
          />
        )}
        {activeTab === "groups" && (
          <GroupsTab
            chatClient={chatClient}
            onSelectGroupChannel={setSelectedFriend}
          />
        )}
        {activeTab === "status" && (
          <StatusTab onSelectStatusGroup={onSelectStatusGroup} />
        )}
        {activeTab === "discover"      && <DiscoverTab search={search} friends={friends} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "settings"      && <SettingsPanel />}
      </div>
    </div>
  );
};

export default LeftPanel;
