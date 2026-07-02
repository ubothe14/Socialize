import { useEffect } from "react";
import { PhoneIcon, PhoneOffIcon } from "lucide-react";

/**
 * IncomingCallPopup
 * Overlay popup showing incoming call with caller avatar, name, accept/decline buttons
 * and playing a ringing sound.
 */
const IncomingCallPopup = ({ callerName, callerPic, onAccept, onDecline }) => {

  // Play ringing sound
  useEffect(() => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-84.wav");
    audio.loop = true;
    
    // Play audio safely
    audio.play().catch((err) => {
      console.log("Audio play blocked by browser autoplay policy:", err);
    });

    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 16, 20, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          width: 320,
          background: "#111b21",
          border: "1px solid #222e35",
          borderRadius: 24,
          padding: "32px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Pulsing avatar */}
        <div className="wa-avatar-pulse-container" style={{ position: "relative", marginBottom: 20 }}>
          <div className="wa-avatar-pulse-ring" />
          <img
            src={callerPic || "https://api.dicebear.com/7.x/avataaars/svg"}
            alt={callerName}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              position: "relative",
              zIndex: 2,
              border: "3px solid var(--wa-green)",
            }}
          />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#e9edef", margin: "0 0 4px" }}>
          {callerName}
        </h2>
        <p style={{ fontSize: 14, color: "var(--wa-green)", fontWeight: 500, margin: "0 0 32px", letterSpacing: 0.5 }}>
          Incoming Video Call...
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", width: "100%" }}>
          {/* Reject */}
          <button
            onClick={onDecline}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#ea0038",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            className="call-btn-hover"
            title="Decline"
          >
            <PhoneOffIcon size={24} />
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "var(--wa-green)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            className="call-btn-hover"
            title="Accept"
          >
            <PhoneIcon size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallPopup;
