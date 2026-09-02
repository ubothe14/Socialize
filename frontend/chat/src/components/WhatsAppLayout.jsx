// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { StreamChat } from "stream-chat";
// import {
//   Chat,
//   Channel,
//   Window,
//   MessageList,
//   MessageInput,
//   Thread,
// } from "stream-chat-react";
// import toast from "react-hot-toast";

// import useAuthUser from "../hooks/useAuthUser";
// import { getStreamToken, getFriendRequests, viewStatus } from "../lib/api";
// import IconSidebar from "./IconSidebar";
// import LeftPanel from "./LeftPanel";
// import CustomChannelHeader from "./CustomChannelHeader";
// import ChatLoader from "./ChatLoader";
// import StatusPlayer from "./StatusPlayer";
// import MessageSearchPanel from "./MessageSearchPanel";
// import IncomingCallPopup from "./IncomingCallPopup";
// import { MessageSquareIcon, ArrowLeftIcon } from "lucide-react";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const WhatsAppLayout = () => {
//   const { authUser } = useAuthUser();
//   const [activeTab, setActiveTab]         = useState("chats");
//   const [selectedFriend, setSelectedFriend] = useState(null);
//   const [chatClient, setChatClient]       = useState(null);
//   const [channel, setChannel]             = useState(null);
//   const [chatLoading, setChatLoading]     = useState(false);
//   const [activeStatusGroup, setActiveStatusGroup] = useState(null);
//   const [showSearchPanel, setShowSearchPanel] = useState(false);
//   const [incomingCall, setIncomingCall] = useState(null);

//   // Get stream token
//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!authUser,
//   });

//   // Get notification count
//   const { data: friendRequests } = useQuery({
//     queryKey: ["friendRequests"],
//     queryFn: getFriendRequests,
//     refetchInterval: 30000,
//   });
//   const notifCount = friendRequests?.incomingReqs?.length || 0;

//   // Init Stream Chat client once and query all user channels to start watching them
//   useEffect(() => {
//     const initClient = async () => {
//       if (!tokenData?.token || !authUser || chatClient) return;
//       try {
//         const client = StreamChat.getInstance(STREAM_API_KEY);
//         await client.connectUser(
//           { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
//           tokenData.token
//         );
//         setChatClient(client);

//         // Watch all of the user's messaging channels globally to receive incoming call events
//         await client.queryChannels({
//           type: "messaging",
//           members: { $in: [authUser._id] },
//         }, {}, { watch: true });

//       } catch (err) {
//         console.error("Stream init error:", err);
//       }
//     };
//     initClient();
//   }, [tokenData, authUser, chatClient]);

//   // Set up event listeners for incoming calls globally
//   useEffect(() => {
//     if (!chatClient || !authUser) return;

//     const listener = chatClient.on((event) => {
//       if (
//         (event.type === "message.new" || event.type === "notification.message_new") &&
//         event.message?.customType === "call_invite" &&
//         event.message?.user?.id !== authUser._id
//       ) {
//         setIncomingCall({
//           callId: event.message.callId,
//           callerName: event.message.callerName,
//           callerPic: event.message.callerPic,
//           channelId: event.channel_id,
//         });
//       }
//     });

//     return () => {
//       listener.unsubscribe();
//     };
//   }, [chatClient, authUser]);

//   // Open channel when a friend is selected
//   useEffect(() => {
//     const openChannel = async () => {
//       if (!chatClient || !selectedFriend || !authUser) return;
//       setChatLoading(true);
//       setShowSearchPanel(false); // close search panel on contact change
//       try {
//         if (selectedFriend.cid) {
//           await selectedFriend.watch();
//           setChannel(selectedFriend);
//         } else {
//           const memberIds = Array.from(new Set([authUser._id, selectedFriend._id]));
//           const channelId = memberIds.length === 1 ? `self-${authUser._id}` : [...memberIds].sort().join("-");
//           const ch = chatClient.channel("messaging", channelId, {
//             members: memberIds,
//           });
//           await ch.watch();
//           setChannel(ch);
//         }
//       } catch (err) {
//         console.error("Channel open error:", err);
//         toast.error("Could not open chat. Please try again.");
//       } finally {
//         setChatLoading(false);
//       }
//     };
//     openChannel();
//   }, [selectedFriend, chatClient, authUser]);

//   // Initiate real-time calling flow
//   const handleVideoCall = async () => {
//     if (channel) {
//       try {
//         // Send call invite message instead of custom event to bypass Stream Chat policy constraints
//         await channel.sendMessage({
//           text: "Incoming video call...",
//           customType: "call_invite",
//           callId: channel.id,
//           callerName: authUser.fullName,
//           callerPic: authUser.profilePic,
//         });

//         // Navigate User A (caller) directly to call page with calling=true
//         window.location.href = `/call/${channel.id}?calling=true`;
//       } catch (err) {
//         console.error("Error starting call:", err);
//         toast.error("Failed to start call");
//       }
//     }
//   };

//   // Mobile: track if chat is open
//   const [mobileChatOpen, setMobileChatOpen] = useState(false);

//   const handleSelectFriend = (friend) => {
//     setSelectedFriend(friend);
//     setMobileChatOpen(true);
//   };

//   const handleBackFromChat = () => {
//     setMobileChatOpen(false);
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setActiveStatusGroup(null);
//   };

//   const handleStatusViewed = async (statusId) => {
//     try {
//       await viewStatus(statusId);
//     } catch (err) {
//       console.error("Error marking status as viewed:", err);
//     }
//   };

//   const handleSelectMessage = (messageId) => {
//     const element =
//       document.querySelector(`[data-message-id="${messageId}"]`) ||
//       document.getElementById(`message-${messageId}`) ||
//       document.querySelector(`.str-chat__message[data-testid*="${messageId}"]`) ||
//       document.querySelector(`[data-testid="message-wrapper"]`);

//     if (element) {
//       element.scrollIntoView({ behavior: "smooth", block: "center" });
//       element.classList.add("flash-highlight");
//       setTimeout(() => {
//         element.classList.remove("flash-highlight");
//       }, 2000);
//     } else {
//       toast.error("Could not locate message in view");
//     }
//   };

//   return (
//     <div className="wa-app">
//       {/* Incoming Call Popup overlay */}
//       {incomingCall && (
//         <IncomingCallPopup
//           callerName={incomingCall.callerName}
//           callerPic={incomingCall.callerPic}
//           onAccept={() => {
//             window.location.href = `/call/${incomingCall.callId}`;
//           }}
//           onDecline={async () => {
//             try {
//               // Send reject message instead of custom event to bypass Stream Chat policy constraints
//               const ch = chatClient.channel("messaging", incomingCall.callId);
//               await ch.sendMessage({
//                 text: "Call declined",
//                 customType: "call_reject",
//                 callId: incomingCall.callId,
//               });
//             } catch (err) {
//               console.error("Error declining call:", err);
//             } finally {
//               setIncomingCall(null);
//             }
//           }}
//         />
//       )}

//       {/* 1. Narrow Icon Sidebar */}
//       <IconSidebar
//         activeTab={activeTab}
//         setActiveTab={handleTabChange}
//         notifCount={notifCount}
//       />

//       {/* 2. Left Panel */}
//       <div className={`wa-left-panel ${mobileChatOpen ? "mobile-hidden" : ""}`}
//            style={{ display: "flex", flexDirection: "column" }}>
//         <LeftPanel
//           activeTab={activeTab}
//           setActiveTab={handleTabChange}
//           selectedFriend={selectedFriend}
//           setSelectedFriend={handleSelectFriend}
//           onSelectStatusGroup={setActiveStatusGroup}
//           chatClient={chatClient}
//         />
//       </div>

//       {/* 3. Right Panel (Chat / Status slideshow / Search Panel) */}
//       <div className={`wa-right-panel ${mobileChatOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%" }}>
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
//           {activeTab === "status" ? (
//             activeStatusGroup ? (
//               <StatusPlayer
//                 activeStatusGroup={activeStatusGroup}
//                 onClose={() => setActiveStatusGroup(null)}
//                 onViewed={handleStatusViewed}
//               />
//             ) : (
//               /* Empty status welcome state */
//               <div className="wa-empty-state">
//                 <div style={{
//                   width: 200, height: 200, borderRadius: "50%",
//                   background: "rgba(0,168,132,0.08)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   marginBottom: 16,
//                 }}>
//                   <svg viewBox="0 0 24 24" width="80" height="80" fill="var(--wa-green)" opacity="0.6">
//                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
//                   </svg>
//                 </div>
//                 <h2>Share status updates</h2>
//                 <p>
//                   Share photos, videos and text that disappear after 24 hours.
//                 </p>
//               </div>
//             )
//           ) : selectedFriend && chatClient ? (
//             chatLoading ? (
//               <ChatLoader />
//             ) : channel ? (
//               <Chat client={chatClient}>
//                 <Channel channel={channel}>
//                   <Window hideOnThread>
//                     {/* Render custom header navbar INSIDE the Window component so it flows naturally before MessageList */}
//                     <div style={{ display: "flex", alignItems: "center", width: "100%", background: "var(--wa-panel-header)", borderBottom: "1px solid var(--wa-divider)" }}>
//                       <button
//                         onClick={handleBackFromChat}
//                         style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wa-text-muted)", marginRight: 8, padding: "4px", borderRadius: "50%", display: "flex" }}
//                         className="mobile-back-btn"
//                       >
//                         <ArrowLeftIcon size={20} />
//                       </button>
//                       <div style={{ flex: 1 }}>
//                         <CustomChannelHeader
//                           handleVideoCall={handleVideoCall}
//                           onSearchClick={() => setShowSearchPanel(!showSearchPanel)}
//                         />
//                       </div>
//                     </div>

//                     <MessageList />
//                     <MessageInput focus />
//                   </Window>
//                   <Thread />
//                 </Channel>
//               </Chat>
//             ) : null
//           ) : (
//             /* Empty chat state */
//             <div className="wa-empty-state">
//               <div style={{
//                 width: 200, height: 200, borderRadius: "50%",
//                 background: "rgba(0,168,132,0.08)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 marginBottom: 16,
//               }}>
//                 <MessageSquareIcon size={80} color="var(--wa-green)" opacity={0.6} />
//               </div>
//               <h2>Socialize</h2>
//               <p>
//                 Send and receive messages to your friends.<br />
//                 Select a contact from the left to start chatting.
//               </p>
//               <div style={{ fontSize: 12, color: "var(--wa-text-dim)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
//                 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--wa-green)", display: "inline-block" }} />
//                 End-to-end encrypted
//               </div>
//             </div>
//           )}
//         </div>

//         {/* 4. Slide-out Message Search Panel */}
//         {showSearchPanel && channel && (
//           <MessageSearchPanel
//             channel={channel}
//             onClose={() => setShowSearchPanel(false)}
//             onSelectMessage={handleSelectMessage}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default WhatsAppLayout;


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
import {
  getStreamToken,
  getFriendRequests,
  viewStatus,
} from "../lib/api";

import IconSidebar from "./IconSidebar";
import LeftPanel from "./LeftPanel";
import CustomChannelHeader from "./CustomChannelHeader";
import ChatLoader from "./ChatLoader";
import StatusPlayer from "./StatusPlayer";
import MessageSearchPanel from "./MessageSearchPanel";
import IncomingCallPopup from "./IncomingCallPopup";

import {
  MessageSquareIcon,
  ArrowLeftIcon,
} from "lucide-react";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

const WhatsAppLayout = () => {
  // =========================================================
  // AUTH USER
  // =========================================================

  const { authUser } = useAuthUser();

  // =========================================================
  // STATES
  // =========================================================

  const [activeTab, setActiveTab] =
    useState("chats");

  const [selectedFriend, setSelectedFriend] =
    useState(null);

  const [chatClient, setChatClient] =
    useState(null);

  const [channel, setChannel] =
    useState(null);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [activeStatusGroup, setActiveStatusGroup] =
    useState(null);

  const [showSearchPanel, setShowSearchPanel] =
    useState(false);

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [mobileChatOpen, setMobileChatOpen] =
    useState(false);

  // =========================================================
  // STREAM TOKEN
  // =========================================================

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // =========================================================
  // FRIEND REQUESTS / NOTIFICATIONS
  // =========================================================

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 30000,
    enabled: !!authUser,
  });

  const notifCount =
    friendRequests?.incomingReqs?.length || 0;

  // =========================================================
  // INITIALIZE STREAM CHAT
  // =========================================================

  useEffect(() => {
    const initClient = async () => {
      if (
        !tokenData?.token ||
        !authUser ||
        chatClient ||
        !STREAM_API_KEY
      ) {
        return;
      }

      try {
        console.log(
          "Initializing Stream Chat..."
        );

        const client =
          StreamChat.getInstance(
            STREAM_API_KEY
          );

        // Connect user only if not already connected
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );

          console.log(
            "✅ Stream Chat connected"
          );
        } else {
          console.log(
            "✅ Stream Chat already connected"
          );
        }

        setChatClient(client);

        // =====================================================
        // WATCH USER'S MESSAGING CHANNELS
        // =====================================================

        await client.queryChannels(
          {
            type: "messaging",
            members: {
              $in: [authUser._id],
            },
          },
          {},
          {
            watch: true,
          }
        );

        console.log(
          "✅ User channels are being watched"
        );
      } catch (err) {
        console.error(
          "❌ Stream initialization error:",
          err
        );

        toast.error(
          "Could not connect to chat"
        );
      }
    };

    initClient();
  }, [
    tokenData?.token,
    authUser,
    chatClient,
  ]);

  // =========================================================
  // GLOBAL INCOMING CALL LISTENER
  // =========================================================

  useEffect(() => {
    if (!chatClient || !authUser) {
      return;
    }

    console.log(
      "Setting up incoming call listener..."
    );

    const listener = chatClient.on(
      (event) => {
        // -----------------------------------------------------
        // CHECK FOR INCOMING VIDEO CALL
        // -----------------------------------------------------

        if (
          (
            event.type === "message.new" ||
            event.type ===
              "notification.message_new"
          ) &&
          event.message?.customType ===
            "call_invite" &&
          event.message?.user?.id !==
            authUser._id
        ) {
          console.log(
            "📞 Incoming video call received"
          );

          console.log(
            "Call ID:",
            event.message.callId
          );

          setIncomingCall({
            callId:
              event.message.callId,

            callerName:
              event.message.callerName,

            callerPic:
              event.message.callerPic,

            channelId:
              event.channel_id,
          });
        }
      }
    );

    // =======================================================
    // CLEANUP LISTENER
    // =======================================================

    return () => {
      console.log(
        "Removing incoming call listener"
      );

      if (listener?.unsubscribe) {
        listener.unsubscribe();
      }
    };
  }, [
    chatClient,
    authUser,
  ]);

  // =========================================================
  // OPEN CHAT CHANNEL
  // =========================================================

  useEffect(() => {
    const openChannel = async () => {
      if (
        !chatClient ||
        !selectedFriend ||
        !authUser
      ) {
        return;
      }

      setChatLoading(true);

      // Close search when changing contact
      setShowSearchPanel(false);

      try {
        // =====================================================
        // EXISTING CHANNEL
        // =====================================================

        if (selectedFriend.cid) {
          await selectedFriend.watch();

          setChannel(selectedFriend);

          console.log(
            "✅ Existing channel opened"
          );

          return;
        }

        // =====================================================
        // CREATE / OPEN NEW CHANNEL
        // =====================================================

        const memberIds = Array.from(
          new Set([
            authUser._id,
            selectedFriend._id,
          ])
        );

        const channelId =
          memberIds.length === 1
            ? `self-${authUser._id}`
            : [...memberIds]
                .sort()
                .join("-");

        const ch = chatClient.channel(
          "messaging",
          channelId,
          {
            members: memberIds,
          }
        );

        await ch.watch();

        setChannel(ch);

        console.log(
          "✅ New channel opened"
        );
      } catch (err) {
        console.error(
          "❌ Channel open error:",
          err
        );

        toast.error(
          "Could not open chat. Please try again."
        );
      } finally {
        setChatLoading(false);
      }
    };

    openChannel();
  }, [
    selectedFriend,
    chatClient,
    authUser,
  ]);

  // =========================================================
  // START VIDEO CALL
  // =========================================================

  const handleVideoCall = async () => {
    if (!channel) {
      toast.error(
        "Please select a chat first."
      );

      return;
    }

    if (!authUser) {
      toast.error(
        "User information is not available."
      );

      return;
    }

    try {
      console.log(
        "================================="
      );

      console.log(
        "📞 Starting video call..."
      );

      console.log(
        "Call ID:",
        channel.id
      );

      console.log(
        "Caller:",
        authUser.fullName
      );

      console.log(
        "================================="
      );

      // =====================================================
      // SEND INCOMING CALL INVITATION
      // =====================================================

      await channel.sendMessage({
        text: "Incoming video call...",
        customType: "call_invite",

        // Same ID will be used by Stream Video
        callId: channel.id,

        callerName:
          authUser.fullName,

        callerPic:
          authUser.profilePic,
      });

      console.log(
        "✅ Call invitation sent"
      );

      // =====================================================
      // GO TO CALL PAGE
      // =====================================================

      window.location.href =
        `/call/${channel.id}?calling=true`;
    } catch (err) {
      console.error(
        "❌ Error starting call:",
        err
      );

      toast.error(
        "Failed to start call"
      );
    }
  };

  // =========================================================
  // ACCEPT INCOMING CALL
  // =========================================================

  const handleAcceptCall = () => {
    if (!incomingCall?.callId) {
      console.error(
        "No incoming call ID found"
      );

      return;
    }

    const callId =
      incomingCall.callId;

    console.log(
      "📞 Accepting call:",
      callId
    );

    // Clear popup before navigation
    setIncomingCall(null);

    // Receiver joins same Stream Video call
    window.location.href =
      `/call/${callId}`;
  };

  // =========================================================
  // DECLINE INCOMING CALL
  // =========================================================

  const handleDeclineCall = async () => {
    if (!incomingCall?.callId) {
      setIncomingCall(null);
      return;
    }

    const callId =
      incomingCall.callId;

    try {
      console.log(
        "📞 Declining call:",
        callId
      );

      if (!chatClient) {
        console.error(
          "Chat client unavailable"
        );

        return;
      }

      // Get the same messaging channel
      const ch =
        chatClient.channel(
          "messaging",
          callId
        );

      await ch.watch();

      // Send rejection message
      await ch.sendMessage({
        text: "Call declined",
        customType: "call_reject",
        callId: callId,
      });

      console.log(
        "✅ Call rejection sent"
      );
    } catch (err) {
      console.error(
        "❌ Error declining call:",
        err
      );
    } finally {
      // Close popup
      setIncomingCall(null);
    }
  };

  // =========================================================
  // MOBILE CHAT
  // =========================================================

  const handleSelectFriend = (
    friend
  ) => {
    setSelectedFriend(friend);
    setMobileChatOpen(true);
  };

  const handleBackFromChat = () => {
    setMobileChatOpen(false);
  };

  // =========================================================
  // TAB CHANGE
  // =========================================================

  const handleTabChange = (
    tab
  ) => {
    setActiveTab(tab);
    setActiveStatusGroup(null);
  };

  // =========================================================
  // STATUS VIEW
  // =========================================================

  const handleStatusViewed = async (
    statusId
  ) => {
    try {
      await viewStatus(statusId);
    } catch (err) {
      console.error(
        "❌ Error marking status as viewed:",
        err
      );
    }
  };

  // =========================================================
  // MESSAGE SEARCH
  // =========================================================

  const handleSelectMessage = (
    messageId
  ) => {
    const element =
      document.querySelector(
        `[data-message-id="${messageId}"]`
      ) ||
      document.getElementById(
        `message-${messageId}`
      ) ||
      document.querySelector(
        `.str-chat__message[data-testid*="${messageId}"]`
      ) ||
      document.querySelector(
        `[data-testid="message-wrapper"]`
      );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      element.classList.add(
        "flash-highlight"
      );

      setTimeout(() => {
        element.classList.remove(
          "flash-highlight"
        );
      }, 2000);
    } else {
      toast.error(
        "Could not locate message in view"
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="wa-app">

      {/* =====================================================
          INCOMING CALL POPUP
          ===================================================== */}

      {incomingCall && (
        <IncomingCallPopup
          callerName={
            incomingCall.callerName
          }
          callerPic={
            incomingCall.callerPic
          }

          onAccept={
            handleAcceptCall
          }

          onDecline={
            handleDeclineCall
          }
        />
      )}

      {/* =====================================================
          1. ICON SIDEBAR
          ===================================================== */}

      <IconSidebar
        activeTab={activeTab}
        setActiveTab={
          handleTabChange
        }
        notifCount={notifCount}
      />

      {/* =====================================================
          2. LEFT PANEL
          ===================================================== */}

      <div
        className={`wa-left-panel ${
          mobileChatOpen
            ? "mobile-hidden"
            : ""
        }`}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LeftPanel
          activeTab={activeTab}
          setActiveTab={
            handleTabChange
          }
          selectedFriend={
            selectedFriend
          }
          setSelectedFriend={
            handleSelectFriend
          }
          onSelectStatusGroup={
            setActiveStatusGroup
          }
          chatClient={chatClient}
        />
      </div>

      {/* =====================================================
          3. RIGHT PANEL
          ===================================================== */}

      <div
        className={`wa-right-panel ${
          mobileChatOpen
            ? "mobile-open"
            : ""
        }`}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >

          {/* =================================================
              STATUS TAB
              ================================================= */}

          {activeTab === "status" ? (

            activeStatusGroup ? (

              <StatusPlayer
                activeStatusGroup={
                  activeStatusGroup
                }
                onClose={() =>
                  setActiveStatusGroup(
                    null
                  )
                }
                onViewed={
                  handleStatusViewed
                }
              />

            ) : (

              <div className="wa-empty-state">

                <div
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background:
                      "rgba(0,168,132,0.08)",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    marginBottom: 16,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="80"
                    height="80"
                    fill="var(--wa-green)"
                    opacity="0.6"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39-2.1 1.42z" />
                  </svg>
                </div>

                <h2>
                  Share status updates
                </h2>

                <p>
                  Share photos, videos and
                  text that disappear after
                  24 hours.
                </p>

              </div>
            )

          ) : selectedFriend &&
            chatClient ? (

            /* =================================================
               CHAT TAB
               ================================================= */

            chatLoading ? (

              <ChatLoader />

            ) : channel ? (

              <Chat client={chatClient}>

                <Channel
                  channel={channel}
                >

                  <Window hideOnThread>

                    {/* =================================================
                        CHAT HEADER
                        ================================================= */}

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        width: "100%",
                        background:
                          "var(--wa-panel-header)",
                        borderBottom:
                          "1px solid var(--wa-divider)",
                      }}
                    >

                      {/* Mobile back button */}

                      <button
                        onClick={
                          handleBackFromChat
                        }
                        style={{
                          background:
                            "none",
                          border: "none",
                          cursor:
                            "pointer",
                          color:
                            "var(--wa-text-muted)",
                          marginRight: 8,
                          padding: 4,
                          borderRadius:
                            "50%",
                          display:
                            "flex",
                        }}
                        className="mobile-back-btn"
                      >
                        <ArrowLeftIcon
                          size={20}
                        />
                      </button>

                      {/* Header */}

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <CustomChannelHeader
                          handleVideoCall={
                            handleVideoCall
                          }
                          onSearchClick={() =>
                            setShowSearchPanel(
                              !showSearchPanel
                            )
                          }
                        />
                      </div>

                    </div>

                    {/* =================================================
                        MESSAGE LIST
                        ================================================= */}

                    <MessageList />

                    {/* =================================================
                        MESSAGE INPUT
                        ================================================= */}

                    <MessageInput
                      focus
                    />

                  </Window>

                  {/* Thread */}

                  <Thread />

                </Channel>

              </Chat>

            ) : null

          ) : (

            /* =================================================
               EMPTY CHAT STATE
               ================================================= */

            <div className="wa-empty-state">

              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                    "rgba(0,168,132,0.08)",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  marginBottom: 16,
                }}
              >
                <MessageSquareIcon
                  size={80}
                  color="var(--wa-green)"
                  opacity={0.6}
                />
              </div>

              <h2>
                Socialize
              </h2>

              <p>
                Send and receive messages
                to your friends.
                <br />
                Select a contact from the
                left to start chatting.
              </p>

              <div
                style={{
                  fontSize: 12,
                  color:
                    "var(--wa-text-dim)",
                  marginTop: 8,
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      "var(--wa-green)",
                    display:
                      "inline-block",
                  }}
                />

                End-to-end encrypted
              </div>

            </div>
          )}

        </div>

        {/* =====================================================
            4. SEARCH PANEL
            ===================================================== */}

        {showSearchPanel &&
          channel && (
            <MessageSearchPanel
              channel={channel}
              onClose={() =>
                setShowSearchPanel(false)
              }
              onSelectMessage={
                handleSelectMessage
              }
            />
          )}

      </div>
    </div>
  );
};

export default WhatsAppLayout;