import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import toast from "react-hot-toast";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken, getFriendRequests, viewStatus } from "../lib/api";
import IconSidebar from "./IconSidebar";
import LeftPanel from "./LeftPanel";
import CustomChannelHeader from "./CustomChannelHeader";
import ChatLoader from "./ChatLoader";
import StatusPlayer from "./StatusPlayer";
import MessageSearchPanel from "./MessageSearchPanel";
import IncomingCallPopup from "./IncomingCallPopup";
import { MessageSquareIcon, ArrowLeftIcon } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const WhatsAppLayout = () => {
  const { authUser } = useAuthUser();
  const [activeTab, setActiveTab]         = useState("chats");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatClient, setChatClient]       = useState(null);
  const [channel, setChannel]             = useState(null);
  const [chatLoading, setChatLoading]     = useState(false);
  const [activeStatusGroup, setActiveStatusGroup] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  // Get stream token
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Get notification count
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 30000,
  });
  const notifCount = friendRequests?.incomingReqs?.length || 0;

  // Init Stream Chat client once and query all user channels to start watching them
  useEffect(() => {
    const initClient = async () => {
      if (!tokenData?.token || !authUser || chatClient) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
          tokenData.token
        );
        setChatClient(client);

        // Watch all of the user's messaging channels globally to receive incoming call events
        await client.queryChannels({
          type: "messaging",
          members: { $in: [authUser._id] },
        }, {}, { watch: true });

      } catch (err) {
        console.error("Stream init error:", err);
      }
    };
    initClient();
  }, [tokenData, authUser]);

  // Set up event listeners for incoming calls globally
  useEffect(() => {
    if (!chatClient || !authUser) return;

    const listener = chatClient.on((event) => {
      if (
        (event.type === "message.new" || event.type === "notification.message_new") &&
        event.message?.customType === "call_invite" &&
        event.message?.user?.id !== authUser._id
      ) {
        setIncomingCall({
          callId: event.message.callId,
          callerName: event.message.callerName,
          callerPic: event.message.callerPic,
          channelId: event.channel_id,
        });
      }
    });

    return () => {
      listener.unsubscribe();
    };
  }, [chatClient, authUser]);

  // Open channel when a friend is selected
  useEffect(() => {
    const openChannel = async () => {
      if (!chatClient || !selectedFriend) return;
      setChatLoading(true);
      setShowSearchPanel(false); // close search panel on contact change
      try {
        if (selectedFriend.cid) {
          await selectedFriend.watch();
          setChannel(selectedFriend);
        } else {
          const channelId = [authUser._id, selectedFriend._id].sort().join("-");
          const ch = chatClient.channel("messaging", channelId, {
            members: [authUser._id, selectedFriend._id],
          });
          await ch.watch();
          setChannel(ch);
        }
      } catch (err) {
        console.error("Channel open error:", err);
        toast.error("Could not open chat. Please try again.");
      } finally {
        setChatLoading(false);
      }
    };
    openChannel();
  }, [selectedFriend, chatClient]);

  // Initiate real-time calling flow
  const handleVideoCall = async () => {
    if (channel) {
      try {
        // Send call invite message instead of custom event to bypass Stream Chat policy constraints
        await channel.sendMessage({
          text: "Incoming video call...",
          customType: "call_invite",
          callId: channel.id,
          callerName: authUser.fullName,
          callerPic: authUser.profilePic,
        });

        // Navigate User A (caller) directly to call page with calling=true
        window.location.href = `/call/${channel.id}?calling=true`;
      } catch (err) {
        console.error("Error starting call:", err);
        toast.error("Failed to start call");
      }
    }
  };

  // Mobile: track if chat is open
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setMobileChatOpen(true);
  };

  const handleBackFromChat = () => {
    setMobileChatOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveStatusGroup(null);
  };

  const handleStatusViewed = async (statusId) => {
    try {
      await viewStatus(statusId);
    } catch (err) {
      console.error("Error marking status as viewed:", err);
    }
  };

  const handleSelectMessage = (messageId) => {
    const element =
      document.querySelector(`[data-message-id="${messageId}"]`) ||
      document.getElementById(`message-${messageId}`) ||
      document.querySelector(`.str-chat__message[data-testid*="${messageId}"]`) ||
      document.querySelector(`[data-testid="message-wrapper"]`);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("flash-highlight");
      setTimeout(() => {
        element.classList.remove("flash-highlight");
      }, 2000);
    } else {
      toast.error("Could not locate message in view");
    }
  };

  return (
    <div className="wa-app">
      {/* Incoming Call Popup overlay */}
      {incomingCall && (
        <IncomingCallPopup
          callerName={incomingCall.callerName}
          callerPic={incomingCall.callerPic}
          onAccept={() => {
            window.location.href = `/call/${incomingCall.callId}`;
          }}
          onDecline={async () => {
            try {
              // Send reject message instead of custom event to bypass Stream Chat policy constraints
              const ch = chatClient.channel("messaging", incomingCall.callId);
              await ch.sendMessage({
                text: "Call declined",
                customType: "call_reject",
                callId: incomingCall.callId,
              });
            } catch (err) {
              console.error("Error declining call:", err);
            } finally {
              setIncomingCall(null);
            }
          }}
        />
      )}

      {/* 1. Narrow Icon Sidebar */}
      <IconSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        notifCount={notifCount}
      />

      {/* 2. Left Panel */}
      <div className={`wa-left-panel ${mobileChatOpen ? "mobile-hidden" : ""}`}
           style={{ display: "flex", flexDirection: "column" }}>
        <LeftPanel
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          selectedFriend={selectedFriend}
          setSelectedFriend={handleSelectFriend}
          onSelectStatusGroup={setActiveStatusGroup}
          chatClient={chatClient}
        />
      </div>

      {/* 3. Right Panel (Chat / Status slideshow / Search Panel) */}
      <div className={`wa-right-panel ${mobileChatOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          {activeTab === "status" ? (
            activeStatusGroup ? (
              <StatusPlayer
                activeStatusGroup={activeStatusGroup}
                onClose={() => setActiveStatusGroup(null)}
                onViewed={handleStatusViewed}
              />
            ) : (
              /* Empty status welcome state */
              <div className="wa-empty-state">
                <div style={{
                  width: 200, height: 200, borderRadius: "50%",
                  background: "rgba(0,168,132,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}>
                  <svg viewBox="0 0 24 24" width="80" height="80" fill="var(--wa-green)" opacity="0.6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h2>Share status updates</h2>
                <p>
                  Share photos, videos and text that disappear after 24 hours.
                </p>
              </div>
            )
          ) : selectedFriend && chatClient ? (
            chatLoading ? (
              <ChatLoader />
            ) : channel ? (
              <Chat client={chatClient}>
                <Channel channel={channel}>
                  <Window hideOnThread>
                    {/* Render custom header navbar INSIDE the Window component so it flows naturally before MessageList */}
                    <div style={{ display: "flex", alignItems: "center", width: "100%", background: "var(--wa-panel-header)", borderBottom: "1px solid var(--wa-divider)" }}>
                      <button
                        onClick={handleBackFromChat}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wa-text-muted)", marginRight: 8, padding: "4px", borderRadius: "50%", display: "flex" }}
                        className="mobile-back-btn"
                      >
                        <ArrowLeftIcon size={20} />
                      </button>
                      <div style={{ flex: 1 }}>
                        <CustomChannelHeader
                          handleVideoCall={handleVideoCall}
                          onSearchClick={() => setShowSearchPanel(!showSearchPanel)}
                        />
                      </div>
                    </div>

                    <MessageList />
                    <MessageInput focus />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
            ) : null
          ) : (
            /* Empty chat state */
            <div className="wa-empty-state">
              <div style={{
                width: 200, height: 200, borderRadius: "50%",
                background: "rgba(0,168,132,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <MessageSquareIcon size={80} color="var(--wa-green)" opacity={0.6} />
              </div>
              <h2>Socialize</h2>
              <p>
                Send and receive messages to your friends.<br />
                Select a contact from the left to start chatting.
              </p>
              <div style={{ fontSize: 12, color: "var(--wa-text-dim)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--wa-green)", display: "inline-block" }} />
                End-to-end encrypted
              </div>
            </div>
          )}
        </div>

        {/* 4. Slide-out Message Search Panel */}
        {showSearchPanel && channel && (
          <MessageSearchPanel
            channel={channel}
            onClose={() => setShowSearchPanel(false)}
            onSelectMessage={handleSelectMessage}
          />
        )}
      </div>
    </div>
  );
};

export default WhatsAppLayout;
