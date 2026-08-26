import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOutgoingFriendReqs, getRecommendedUsers, sendFriendRequest } from "../../lib/api";
import { CheckCircleIcon, UserPlusIcon, UsersIcon } from "lucide-react";

const DiscoverTab = ({ search, friends }) => {
  const queryClient = useQueryClient();

  const { data: recommendedUsers = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequest, isPending: sendingRequest } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const friendIds = new Set(friends.map((f) => f._id));
  const outgoingIds = new Set(outgoingReqs.map((r) => r.recipient._id));

  const filtered = recommendedUsers.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--wa-text-muted)" }}>
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--wa-text-muted)" }}>
        <UsersIcon size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>
          {search ? "No people match your search" : "You're connected with everyone!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="wa-section-label">People you may know</div>
      {filtered.map((user) => {
        const isAlreadyFriend = friendIds.has(user._id);
        const isRequestPending = outgoingIds.has(user._id);

        return (
          <div key={user._id} className="wa-user-row">
            <img
              src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`}
              alt={user.fullName}
              className="wa-user-avatar"
            />
            <div className="wa-user-info">
              <div className="wa-user-name">{user.fullName}</div>
              <div className="wa-user-bio">{user.bio || "Hey there! I'm using Socialize."}</div>
            </div>

            {isAlreadyFriend ? (
              <button className="wa-btn-ghost" disabled>
                <CheckCircleIcon size={14} style={{ display: "inline", marginRight: 4 }} />
                Friends
              </button>
            ) : isRequestPending ? (
              <button className="wa-btn-ghost" disabled>
                Pending
              </button>
            ) : (
              <button
                className="wa-btn-primary"
                onClick={() => sendRequest(user._id)}
                disabled={sendingRequest}
              >
                <UserPlusIcon size={14} style={{ display: "inline", marginRight: 4 }} />
                Add
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default DiscoverTab;
