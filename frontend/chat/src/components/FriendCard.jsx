import { Link } from "react-router";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-4">
          <div className="avatar size-12 rounded-full overflow-hidden">
            <img src={friend.profilePic} alt={friend.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            {friend.bio && (
              <p className="text-xs opacity-60 truncate mt-0.5">{friend.bio}</p>
            )}
          </div>
        </div>

        <Link to={`/chat/${friend._id}`} className="btn btn-outline btn-sm w-full">
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;