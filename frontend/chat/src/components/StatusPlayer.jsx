import { useEffect, useState } from "react";
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

/**
 * StatusPlayer
 * Slideshow player for status updates (like WhatsApp Web).
 * Auto-advances every 5 seconds.
 */
const StatusPlayer = ({ activeStatusGroup, onClose, onViewed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const statuses = activeStatusGroup?.statuses || [];
  const currentStatus = statuses[currentIndex];
  const user = activeStatusGroup?.user;

  // Mark the current status as viewed
  useEffect(() => {
    if (currentStatus && onViewed) {
      onViewed(currentStatus._id);
    }
  }, [currentIndex, currentStatus]);

  // Timer for progress bar & auto-advance
  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose(); // last slide done, close
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentStatus) return null;

  const isImage = currentStatus.mediaUrl && (
    currentStatus.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ||
    currentStatus.mediaUrl.startsWith("data:image")
  );

  return (
    <div className="status-player-container">
      {/* Top Header & Progress Bars */}
      <div className="status-player__header">
        {/* Progress bars indicator */}
        <div className="status-player__progress-bars">
          {statuses.map((_, index) => (
            <div key={index} className="status-player__progress-bar-bg">
              <div
                className="status-player__progress-bar-fill"
                style={{
                  width:
                    index < currentIndex
                      ? "100%"
                      : index === currentIndex
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="status-player__user-info">
          <img
            src={user?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id}`}
            alt={user?.fullName}
            className="status-player__avatar"
          />
          <div>
            <div className="status-player__name">{user?.fullName}</div>
            <div className="status-player__time">
              {new Date(currentStatus.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <button className="status-player__close-btn" onClick={onClose}>
            <XIcon size={24} />
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="status-player__body">
        {/* Left/Right Tap zones for navigation */}
        <div className="status-player__nav-zone left" onClick={handlePrev} />
        <div className="status-player__nav-zone right" onClick={handleNext} />

        {isImage ? (
          <div className="status-player__image-wrapper">
            <img src={currentStatus.mediaUrl} alt="Status Media" className="status-player__image" />
            {currentStatus.text && (
              <div className="status-player__caption">{currentStatus.text}</div>
            )}
          </div>
        ) : (
          <div
            className="status-player__text-wrapper"
            style={{ backgroundColor: currentStatus.bgColor || "#075e54" }}
          >
            <div className="status-player__text">{currentStatus.text}</div>
          </div>
        )}
      </div>

      {/* Left/Right arrow desktop controllers */}
      {currentIndex > 0 && (
        <button className="status-player__arrow-btn left" onClick={handlePrev}>
          <ChevronLeftIcon size={30} />
        </button>
      )}
      <button className="status-player__arrow-btn right" onClick={handleNext}>
        <ChevronRightIcon size={30} />
      </button>
    </div>
  );
};

export default StatusPlayer;
