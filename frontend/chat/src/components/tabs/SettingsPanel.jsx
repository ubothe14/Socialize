import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../../hooks/useAuthUser";
import useLogout from "../../hooks/useLogout";
import { axiosInstance } from "../../lib/axios";
import { useThemeStore } from "../../store/useThemeStore";
import { THEMES } from "../../constants";
import toast from "react-hot-toast";
import { CameraIcon, LogOutIcon, PaletteIcon, SaveIcon, ShuffleIcon } from "lucide-react";

const SettingsPanel = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const { theme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();

  const [fullName, setFullName]     = useState(authUser?.fullName || "");
  const [bio, setBio]               = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [showThemes, setShowThemes] = useState(false);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/onboarding", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const handleRandomAvatar = () => {
    const styles = ["avataaars", "fun-emoji", "bottts", "lorelei", "micah"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const idx = Math.floor(Math.random() * 70) + 1;
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${idx}`;
    setProfilePic(url);
  };

  return (
    <div className="wa-settings">
      {/* Profile picture */}
      <div className="wa-settings-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 24 }}>
        <div style={{ position: "relative", width: 96, height: 96 }}>
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--wa-green)" }}
            />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--wa-search-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid var(--wa-green)" }}>
              <CameraIcon size={32} color="var(--wa-text-muted)" />
            </div>
          )}
        </div>
        <button className="wa-btn-ghost" onClick={handleRandomAvatar} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShuffleIcon size={14} />
          New Avatar
        </button>
      </div>

      {/* Profile info */}
      <div className="wa-settings-section">
        <h3>Profile</h3>

        <label className="wa-settings-label">Your Name</label>
        <input
          className="wa-settings-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />

        <label className="wa-settings-label" style={{ marginTop: 12 }}>About</label>
        <textarea
          className="wa-settings-input"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself..."
          style={{ resize: "none", minHeight: 80 }}
        />

        <button
          className="wa-btn-primary"
          style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          onClick={() => saveProfile({ fullName, bio, profilePic })}
          disabled={isPending}
        >
          <SaveIcon size={14} />
          {isPending ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* Theme selector */}
      <div className="wa-settings-section">
        <h3>
          <button
            onClick={() => setShowThemes(!showThemes)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wa-green)", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}
          >
            <PaletteIcon size={14} />
            Theme
            <span style={{ fontSize: 12, color: "var(--wa-text-muted)", textTransform: "none", fontWeight: 400, marginLeft: 4 }}>
              (current: {theme})
            </span>
          </button>
        </h3>

        {showThemes && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            {THEMES.slice(0, 12).map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: theme === t.name ? "rgba(0,168,132,0.15)" : "var(--wa-search-bg)",
                  border: theme === t.name ? "1px solid var(--wa-green)" : "1px solid transparent",
                  color: "var(--wa-text)",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", gap: 2 }}>
                  {t.colors.map((c, i) => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="wa-settings-section" style={{ marginTop: "auto" }}>
        <button
          onClick={logoutMutation}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            background: "rgba(241,92,109,0.1)",
            border: "1px solid var(--wa-red)",
            color: "var(--wa-red)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOutIcon size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
