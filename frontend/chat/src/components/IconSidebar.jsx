import {
  MessageSquareIcon,
  UsersIcon,
  BellIcon,
  RadioIcon,
  SettingsIcon,
  GlobeIcon,
  BotIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const tabs = [
  {
    id: "chats",
    icon: MessageSquareIcon,
    label: "Chats",
  },
  {
    id: "groups",
    icon: UsersIcon,
    label: "Groups",
  },
  {
    id: "status",
    icon: RadioIcon,
    label: "Status",
  },
  {
    id: "discover",
    icon: GlobeIcon,
    label: "Discover",
  },
  {
    id: "ai",
    icon: BotIcon,
    label: "Gemini AI",
  },
  {
    id: "notifications",
    icon: BellIcon,
    label: "Notifications",
  },
];

const IconSidebar = ({ activeTab, setActiveTab }) => {
  const { authUser } = useAuthUser();

  return (
    <div className="wa-icon-sidebar">
      {/* Navigation icons */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 8,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              title={tab.label}
              className={`wa-icon-btn ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={22} />
            </button>
          );
        })}
      </div>

      {/* Profile avatar at bottom → opens settings */}
      <button
        title="Settings"
        className={`wa-icon-btn ${
          activeTab === "settings" ? "active" : ""
        }`}
        onClick={() => setActiveTab("settings")}
        style={{
          marginTop: "auto",
          marginBottom: 8,
          padding: 0,
        }}
      >
        {authUser?.profilePic ? (
          <img
            src={authUser.profilePic}
            alt="Profile"
            className={`wa-icon-avatar ${
              activeTab === "settings" ? "active" : ""
            }`}
          />
        ) : (
          <SettingsIcon size={22} />
        )}
      </button>
    </div>
  );
};

export default IconSidebar;