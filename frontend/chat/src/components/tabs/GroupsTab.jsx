import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../../hooks/useAuthUser";
import { getUserFriends } from "../../lib/api";
import { UsersIcon, PlusIcon, XIcon, CheckCircle2Icon } from "lucide-react";
import toast from "react-hot-toast";

const GroupsTab = ({ chatClient, onSelectGroupChannel }) => {
  const { authUser } = useAuthUser();
  const [showBuilder, setShowBuilder] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupChannels, setGroupChannels] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Fetch friends list to invite to the group
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Fetch existing group channels
  const fetchGroups = useCallback(async () => {
    if (!chatClient || !authUser) return;
    setLoadingGroups(true);
    try {
      const filter = {
        type: "messaging",
        members: { $in: [authUser._id] },
        isGroup: true,
      };
      const sort = [{ last_message_at: -1 }];
      const channels = await chatClient.queryChannels(filter, sort, {
        watch: true,
        state: true,
      });
      setGroupChannels(channels);
    } catch (err) {
      console.error("Error fetching group channels:", err);
    } finally {
      setLoadingGroups(false);
    }
  }, [chatClient, authUser]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleToggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      const groupChannelId = `group-${Date.now()}`;
      const channel = chatClient.channel("messaging", groupChannelId, {
        name: groupName,
        members: [authUser._id, ...selectedMembers],
        isGroup: true,
      });

      await channel.create();
      toast.success("Group created successfully!");
      setShowBuilder(false);
      setGroupName("");
      setSelectedMembers([]);

      // Refresh list and auto-select newly created group channel
      fetchGroups();
      if (onSelectGroupChannel) {
        onSelectGroupChannel(channel);
      }
    } catch (err) {
      console.error("Group creation error:", err);
      toast.error("Failed to create group");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header controls */}
      <div className="wa-panel-header" style={{ borderBottom: "1px solid var(--wa-divider)" }}>
        <span className="wa-panel-title">Groups</span>
        <div className="wa-header-actions">
          <button className="wa-header-btn" title="New Group" onClick={() => setShowBuilder(true)}>
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="wa-panel-content">
        {loadingGroups ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : groupChannels.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--wa-text-muted)" }}>
            <UsersIcon size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No groups yet. Click the + icon to create one!</p>
          </div>
        ) : (
          groupChannels.map((ch) => (
            <div
              key={ch.id}
              className="wa-chat-item"
              onClick={() => onSelectGroupChannel && onSelectGroupChannel(ch)}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "var(--wa-green-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <UsersIcon size={24} color="#fff" />
              </div>
              <div className="wa-chat-info" style={{ marginLeft: 12 }}>
                <div className="wa-chat-name" style={{ fontWeight: 600 }}>{ch.data?.name || "Unnamed Group"}</div>
                <div className="wa-chat-preview">
                  {ch.state?.messages?.length > 0
                    ? ch.state.messages[ch.state.messages.length - 1].text
                    : `${ch.state?.members ? Object.keys(ch.state.members).length : 0} members`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Group Creator Modal */}
      {showBuilder && (
        <div className="group-builder-overlay">
          <form onSubmit={handleCreateGroup} className="group-builder-card">
            <div className="status-builder__header">
              <h2>Create New Group</h2>
              <button
                type="button"
                className="wa-header-btn"
                onClick={() => setShowBuilder(false)}
                style={{ color: "var(--wa-text-muted)" }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="status-builder__body" style={{ flex: 1, overflowY: "auto" }}>
              {/* Group Name input */}
              <div>
                <label className="wa-settings-label">Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  className="wa-settings-input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              {/* Members check list */}
              <div style={{ display: "flex", flexDirection: "column", height: "100%", marginTop: 12 }}>
                <label className="wa-settings-label">Add Members</label>
                <div className="group-builder__members-list" style={{ border: "1px solid var(--wa-divider)", borderRadius: 8, marginTop: 6, maxHeight: "250px", overflowY: "auto" }}>
                  {friends.length === 0 ? (
                    <div style={{ padding: 16, textAlign: "center", color: "var(--wa-text-muted)", fontSize: 13 }}>
                      You need friends to create a group.
                    </div>
                  ) : (
                    friends.map((friend) => {
                      const isChecked = selectedMembers.includes(friend._id);
                      return (
                        <div
                          key={friend._id}
                          className="group-builder__member-row"
                          onClick={() => handleToggleMember(friend._id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="group-builder__checkbox"
                          />
                          <img
                            src={friend.profilePic}
                            alt={friend.fullName}
                            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div style={{ fontSize: 14, color: "var(--wa-text)", fontWeight: 500 }}>
                            {friend.fullName}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Create action */}
            <div style={{ padding: 16, borderTop: "1px solid var(--wa-divider)" }}>
              <button
                type="submit"
                className="wa-btn-primary"
                style={{
                  width: "100%",
                  height: 42,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <PlusIcon size={16} />
                Create Group
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GroupsTab;
