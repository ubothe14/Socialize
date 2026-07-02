import { MessageSquareIcon, UsersIcon, BellIcon, RadioIcon, SettingsIcon, GlobeIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const tabs = [
  { id: "chats",         icon: MessageSquareIcon, label: "Chats" },
  { id: "groups",        icon: UsersIcon,          label: "Groups" },
  { id: "status",        icon: RadioIcon,          label: "Status" },
  { id: "discover",      icon: GlobeIcon,          label: "Discover" },
  { id: "notifications", icon: BellIcon,           label: "Notifications" },
];

const IconSidebar = ({ activeTab, setActiveTab, notifCount }) => {
  const { authUser } = useAuthUser();

  return (
    <div className="wa-icon-sidebar">
      {/* Navigation icons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            className={`wa-icon-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={22} />
            {id === "notifications" && notifCount > 0 && (
              <span className="badge-count">{notifCount > 9 ? "9+" : notifCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Profile avatar at bottom → opens settings */}
      <button
        title="Settings"
        className={`wa-icon-btn ${activeTab === "settings" ? "active" : ""}`}
        onClick={() => setActiveTab("settings")}
        style={{ marginTop: "auto", marginBottom: 8, padding: 0 }}
      >
        {authUser?.profilePic ? (
          <img
            src={authUser.profilePic}
            alt="Profile"
            className={`wa-icon-avatar ${activeTab === "settings" ? "active" : ""}`}
          />
        ) : (
          <SettingsIcon size={22} />
        )}
      </button>
    </div>
  );
};

export default IconSidebar;
