import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../../hooks/useAuthUser";
import { getStatuses, createStatus } from "../../lib/api";
import { PlusIcon, MoreVerticalIcon, SmileIcon, ImageIcon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#075e54", "#6366f1", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

const StatusTab = ({ onSelectStatusGroup }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [bgColor, setBgColor] = useState(COLORS[0]);

  // Fetch all statuses
  const { data: allStatuses = [], isLoading } = useQuery({
    queryKey: ["statuses"],
    queryFn: getStatuses,
    refetchInterval: 15000, // refresh every 15s
  });

  // Create status mutation
  const { mutate: addStatus, isPending } = useMutation({
    mutationFn: createStatus,
    onSuccess: () => {
      toast.success("Status updated successfully!");
      setShowBuilder(false);
      setText("");
      setMediaUrl("");
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Group statuses by user
  const groups = {};
  allStatuses.forEach((status) => {
    const userId = status.user?._id;
    if (!userId) return;
    if (!groups[userId]) {
      groups[userId] = {
        user: status.user,
        statuses: [],
        lastUpdated: status.createdAt,
      };
    }
    groups[userId].statuses.push(status);
  });

  // Sort statuses inside each group by createdAt (oldest first for player slideshow)
  Object.values(groups).forEach((group) => {
    group.statuses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    group.lastUpdated = group.statuses[group.statuses.length - 1].createdAt;
  });

  const myGroup = groups[authUser?._id];
  const otherGroups = Object.values(groups).filter((g) => g.user?._id !== authUser?._id);

  // Classify other groups into Recent vs Viewed
  const recentGroups = [];
  const viewedGroups = [];

  otherGroups.forEach((group) => {
    const allViewed = group.statuses.every((s) => s.views?.includes(authUser?._id));
    if (allViewed) {
      viewedGroups.push(group);
    } else {
      recentGroups.push(group);
    }
  });

  const handleCreateStatus = (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaUrl.trim()) {
      toast.error("Please add some text or an image URL");
      return;
    }
    addStatus({ text, mediaUrl, bgColor });
  };

  const handlePlayStatusGroup = (group) => {
    if (onSelectStatusGroup) {
      onSelectStatusGroup(group);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header controls inside Status tab */}
      <div className="wa-panel-header" style={{ borderBottom: "1px solid var(--wa-divider)" }}>
        <span className="wa-panel-title">Status</span>
        <div className="wa-header-actions">
          <button className="wa-header-btn" title="Add Status" onClick={() => setShowBuilder(true)}>
            <PlusIcon size={20} />
          </button>
          <button className="wa-header-btn" title="Menu">
            <MoreVerticalIcon size={20} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {/* My Status Item */}
        <div
          className="wa-chat-item"
          style={{ cursor: "pointer", borderBottom: "8px solid var(--wa-bg-darker)" }}
          onClick={() => (myGroup ? handlePlayStatusGroup(myGroup) : setShowBuilder(true))}
        >
          <div className="wa-status-avatar-wrapper">
            {myGroup && (
              <div
                className={`wa-status-ring ${
                  myGroup.statuses.every((s) => s.views?.includes(authUser?._id)) ? "viewed" : ""
                }`}
              />
            )}
            <img
              src={authUser?.profilePic}
              alt="My Status"
              className="wa-status-avatar"
            />
            {!myGroup && (
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "var(--wa-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--wa-sidebar-bg)",
                }}
              >
                <PlusIcon size={12} color="#fff" />
              </div>
            )}
          </div>
          <div className="wa-chat-info" style={{ marginLeft: 4 }}>
            <div className="wa-chat-name" style={{ fontWeight: 600 }}>My status</div>
            <div className="wa-chat-preview" style={{ fontSize: 13 }}>
              {myGroup ? "Tap to view your updates" : "Click to add status update"}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <span className="loading loading-spinner loading-sm" />
          </div>
        )}

        {/* Recent updates */}
        {!isLoading && recentGroups.length > 0 && (
          <>
            <div className="wa-section-label" style={{ padding: "16px 16px 8px" }}>Recent updates</div>
            {recentGroups.map((group) => (
              <div
                key={group.user?._id}
                className="wa-chat-item"
                onClick={() => handlePlayStatusGroup(group)}
              >
                <div className="wa-status-avatar-wrapper">
                  <div className="wa-status-ring" />
                  <img
                    src={group.user?.profilePic}
                    alt={group.user?.fullName}
                    className="wa-status-avatar"
                  />
                </div>
                <div className="wa-chat-info" style={{ marginLeft: 4 }}>
                  <div className="wa-chat-name" style={{ fontWeight: 600 }}>{group.user?.fullName}</div>
                  <div className="wa-chat-preview">{formatTime(group.lastUpdated)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Viewed updates */}
        {!isLoading && viewedGroups.length > 0 && (
          <>
            <div className="wa-section-label" style={{ padding: "16px 16px 8px" }}>Viewed updates</div>
            {viewedGroups.map((group) => (
              <div
                key={group.user?._id}
                className="wa-chat-item"
                onClick={() => handlePlayStatusGroup(group)}
              >
                <div className="wa-status-avatar-wrapper">
                  <div className="wa-status-ring viewed" />
                  <img
                    src={group.user?.profilePic}
                    alt={group.user?.fullName}
                    className="wa-status-avatar"
                  />
                </div>
                <div className="wa-chat-info" style={{ marginLeft: 4 }}>
                  <div className="wa-chat-name" style={{ fontWeight: 600 }}>{group.user?.fullName}</div>
                  <div className="wa-chat-preview" style={{ color: "var(--wa-text-dim)" }}>
                    {formatTime(group.lastUpdated)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!isLoading && recentGroups.length === 0 && viewedGroups.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--wa-text-muted)", fontSize: 13 }}>
            No status updates available.
          </div>
        )}
      </div>

      {/* WhatsApp Status Creator Modal */}
      {showBuilder && (
        <div className="status-builder-overlay">
          <div className="status-builder-card">
            <div className="status-builder__header">
              <h2>Add Status Update</h2>
              <button
                className="wa-header-btn"
                onClick={() => setShowBuilder(false)}
                style={{ color: "var(--wa-text-muted)" }}
              >
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateStatus} className="status-builder__body">
              {/* Image URL (Optional) */}
              <div>
                <label className="wa-settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ImageIcon size={14} />
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="Paste an image URL here..."
                  className="wa-settings-input"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>

              {/* Status Text */}
              <div>
                <label className="wa-settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <SmileIcon size={14} />
                  Status Message
                </label>
                <textarea
                  placeholder="Type a status update..."
                  className="wa-settings-input"
                  style={{
                    backgroundColor: mediaUrl ? "var(--wa-search-bg)" : bgColor,
                    color: "#ffffff",
                    fontSize: mediaUrl ? 14 : 18,
                    fontWeight: mediaUrl ? 400 : 500,
                    textAlign: mediaUrl ? "left" : "center",
                    minHeight: 120,
                    resize: "none",
                    padding: 16,
                    transition: "all 0.2s",
                  }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {/* Color picker for text status */}
              {!mediaUrl && (
                <div>
                  <label className="wa-settings-label">Background Color</label>
                  <div className="status-builder__color-picker" style={{ marginTop: 6 }}>
                    {COLORS.map((c) => (
                      <div
                        key={c}
                        className={`status-builder__color-circle ${bgColor === c ? "active" : ""}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setBgColor(c)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <button
                type="submit"
                className="wa-btn-primary"
                disabled={isPending}
                style={{
                  width: "100%",
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <SendIcon size={16} />
                {isPending ? "Posting..." : "Share Status"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTab;
