import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest } from "../../lib/api";
import { BellIcon, CheckIcon, XIcon } from "lucide-react";

const NotificationsTab = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptReq } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { mutate: rejectReq } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const incomingReqs  = friendRequests?.incomingReqs  || [];
  const acceptedReqs  = friendRequests?.acceptedReqs  || [];

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--wa-text-muted)" }}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (incomingReqs.length === 0 && acceptedReqs.length === 0) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--wa-text-muted)" }}>
        <BellIcon size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>No notifications yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Incoming requests */}
      {incomingReqs.length > 0 && (
        <>
          <div className="wa-section-label">
            Friend Requests ({incomingReqs.length})
          </div>
          {incomingReqs.map((req) => (
            <div key={req._id} className="wa-notif-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={req.sender.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender._id}`}
                  alt={req.sender.fullName}
                  className="wa-user-avatar"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wa-user-name">{req.sender.fullName}</div>
                  <div className="wa-user-bio">Wants to connect with you</div>
                </div>
              </div>

              {/* Accept / Reject buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, paddingLeft: 58 }}>
                <button
                  className="wa-btn-primary"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => acceptReq(req._id)}
                >
                  <CheckIcon size={14} />
                  Accept
                </button>
                <button
                  className="wa-btn-danger"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => rejectReq(req._id)}
                >
                  <XIcon size={14} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Accepted (new connections) */}
      {acceptedReqs.length > 0 && (
        <>
          <div className="wa-section-label">New Connections</div>
          {acceptedReqs.map((n) => (
            <div key={n._id} className="wa-notif-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={n.recipient.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.recipient._id}`}
                  alt={n.recipient.fullName}
                  className="wa-user-avatar"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="wa-user-name">{n.recipient.fullName}</div>
                  <div className="wa-user-bio" style={{ color: "var(--wa-green)" }}>
                    ✓ Accepted your friend request
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default NotificationsTab;
