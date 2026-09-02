import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  SearchIcon,
  PenSquareIcon,
  BellIcon,
} from "lucide-react";

import { getUserFriends } from "../lib/api";

import ChatListTab from "./tabs/ChatListTab";
import DiscoverTab from "./tabs/DiscoverTab";
import NotificationsTab from "./tabs/NotificationsTab";
import StatusTab from "./tabs/StatusTab";
import SettingsPanel from "./tabs/SettingsPanel";
import NewChatPanel from "./tabs/NewChatPanel";
import GroupsTab from "./tabs/GroupsTab";

const TAB_TITLES = {
  chats: "Socialize",
  groups: "Groups",
  status: "Status",
  discover: "Discover",
  notifications: "Notifications",
  settings: "Settings",
  ai: "Gemini AI",
};

const LeftPanel = ({
  activeTab,
  setActiveTab,
  selectedFriend,
  setSelectedFriend,
  onSelectStatusGroup,
  chatClient,
  notifCount = 0,
}) => {
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  // =========================================================
  // FETCH FRIENDS
  // =========================================================

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const showSearch = ["chats", "discover"].includes(activeTab);

  // =========================================================
  // NEW CHAT PANEL
  // =========================================================

  if (showNewChat) {
    return (
      <NewChatPanel
        friends={friends}
        onClose={() => setShowNewChat(false)}
        onSelectFriend={(friend) => {
          setShowNewChat(false);
          setSelectedFriend(friend);
        }}
      />
    );
  }

  // =========================================================
  // MAIN PANEL
  // =========================================================

  return (
    <div className="wa-left-panel">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="wa-panel-header">

        <span className="wa-panel-title">
          {TAB_TITLES[activeTab] || "Socialize"}
        </span>

        {/* ===================================================
            HEADER ACTIONS
            =================================================== */}

        {activeTab === "chats" && (
          <div className="wa-header-actions">

            {/* =================================================
                NOTIFICATIONS
                ================================================= */}

            <button
              type="button"
              className="wa-header-btn notification-header-btn"
              title="Notifications"
              aria-label="Notifications"
              onClick={() =>
                setActiveTab("notifications")
              }
            >
              <BellIcon size={20} />

              {notifCount > 0 && (
                <span className="notification-header-badge">
                  {notifCount > 99
                    ? "99+"
                    : notifCount}
                </span>
              )}
            </button>

            {/* =================================================
                NEW CHAT
                ================================================= */}

            <button
              type="button"
              className="wa-header-btn"
              title="New Chat"
              aria-label="New Chat"
              onClick={() =>
                setShowNewChat(true)
              }
            >
              <PenSquareIcon size={20} />
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          SEARCH BAR
          ===================================================== */}

      {showSearch && (
        <div
          className="wa-search-wrap"
          style={{
            position: "relative",
          }}
        >

          <SearchIcon
            size={16}
            className="search-icon"
            style={{
              position: "absolute",
              left: 22,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--wa-text-muted)",
              pointerEvents: "none",
            }}
          />

          <input
            type="text"
            placeholder={
              activeTab === "chats"
                ? "Search or start a new chat"
                : "Search people..."
            }
            className="wa-search-input"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>
      )}

      {/* =====================================================
          TAB CONTENT
          ===================================================== */}

      <div className="wa-panel-content">

        {/* ===================================================
            CHATS
            =================================================== */}

        {activeTab === "chats" && (
          <ChatListTab
            friends={friends}
            search={search}
            selectedFriend={selectedFriend}
            setSelectedFriend={setSelectedFriend}
          />
        )}

        {/* ===================================================
            GROUPS
            =================================================== */}

        {activeTab === "groups" && (
          <GroupsTab
            chatClient={chatClient}
            onSelectGroupChannel={
              setSelectedFriend
            }
          />
        )}

        {/* ===================================================
            STATUS
            =================================================== */}

        {activeTab === "status" && (
          <StatusTab
            onSelectStatusGroup={
              onSelectStatusGroup
            }
          />
        )}

        {/* ===================================================
            DISCOVER
            =================================================== */}

        {activeTab === "discover" && (
          <DiscoverTab
            search={search}
            friends={friends}
          />
        )}

        {/* ===================================================
            NOTIFICATIONS
            =================================================== */}

        {activeTab === "notifications" && (
          <NotificationsTab />
        )}

        {/* ===================================================
            SETTINGS
            =================================================== */}

        {activeTab === "settings" && (
          <SettingsPanel />
        )}

      </div>
    </div>
  );
};

export default LeftPanel;