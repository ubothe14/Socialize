// import { useEffect, useState } from "react";
// import { useNavigate, useParams, useSearchParams } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import { useQuery } from "@tanstack/react-query";
// import { getStreamToken } from "../lib/api";
// import { StreamChat } from "stream-chat";
// import { PhoneOffIcon } from "lucide-react";

// import {
//   StreamVideo,
//   StreamVideoClient,
//   StreamCall,
//   CallControls,
//   SpeakerLayout,
//   StreamTheme,
//   CallingState,
//   useCallStateHooks,
// } from "@stream-io/video-react-sdk";

// import "@stream-io/video-react-sdk/dist/css/styles.css";
// import toast from "react-hot-toast";
// import PageLoader from "../components/PageLoader";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const CallPage = () => {
//   const { id: callId } = useParams();
//   const [searchParams] = useSearchParams();
//   const isCallingMode = searchParams.get("calling") === "true"; // Caller is in calling mode

//   const [client, setClient] = useState(null);
//   const [call, setCall] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [callRejected, setCallRejected] = useState(false);
//   const [participantsCount, setParticipantsCount] = useState(1);

//   const navigate = useNavigate();
//   const { authUser, isLoading } = useAuthUser();

//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!authUser,
//   });

//   // Play dialing tone for caller
//   useEffect(() => {
//     if (!isCallingMode || callRejected || participantsCount > 1) return;

//     // Simple beep sound to simulate a dialing ring
//     const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-84.wav");
//     audio.loop = true;
//     audio.play().catch((err) => console.log("Audio blocked:", err));

//     return () => audio.pause();
//   }, [isCallingMode, callRejected, participantsCount]);

//   // Connect both Chat Client and Video Client
//   useEffect(() => {
//     let listener = null;
//     let channel = null;

//     const initClients = async () => {
//       if (!tokenData?.token || !authUser || !callId) return;

//       try {
//         console.log("Initializing Stream clients...");
//         const user = {
//           id: authUser._id,
//           name: authUser.fullName,
//           image: authUser.profilePic,
//         };

//         // 1. Initialize Stream Video
//         const videoClient = new StreamVideoClient({
//           apiKey: STREAM_API_KEY,
//           user,
//           token: tokenData.token,
//         });

//         const callInstance = videoClient.call("default", callId);
//         await callInstance.join({ create: true });
//         setClient(videoClient);
//         setCall(callInstance);

//         // 2. Initialize Stream Chat (to listen for custom call events)
//         const cClient = StreamChat.getInstance(STREAM_API_KEY);
//         if (!cClient.userID) {
//           await cClient.connectUser(user, tokenData.token);
//         }

//         // Watch the chat channel for rejection
//         channel = cClient.channel("messaging", callId);
//         await channel.watch();

//         listener = channel.on("message.new", (event) => {
//           if (
//             event.message?.customType === "call_reject" &&
//             event.message?.user?.id !== authUser._id
//           ) {
//             setCallRejected(true);
//             toast.error("Call Declined");
//             setTimeout(() => {
//               navigate("/");
//             }, 2000);
//           }
//         });

//       } catch (error) {
//         console.error("Error joining call:", error);
//         toast.error("Could not join the call. Please try again.");
//         navigate("/");
//       } finally {
//         setIsConnecting(false);
//       }
//     };

//     initClients();

//     return () => {
//       if (listener && listener.unsubscribe) {
//         listener.unsubscribe();
//       }
//     };
//   }, [tokenData, authUser, callId, navigate]);

//   const handleCancelCall = async () => {
//     if (call) {
//       await call.leave();
//     }
//     navigate("/");
//   };

//   if (isLoading || isConnecting) return <PageLoader />;

//   // Render Outgoing Call Ring Screen
//   if (isCallingMode && !callRejected && participantsCount === 1) {
//     return (
//       <div className="h-screen w-screen bg-[#0a1014] flex flex-col items-center justify-center font-sans">
//         <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
//           {/* Avatar pulse */}
//           <div className="wa-avatar-pulse-container" style={{ position: "relative", marginBottom: 24 }}>
//             <div className="wa-avatar-pulse-ring" />
//             <div
//               style={{
//                 width: 110,
//                 height: 110,
//                 borderRadius: "50%",
//                 background: "var(--wa-green-dark)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 position: "relative",
//                 zIndex: 2,
//                 border: "3px solid var(--wa-green)",
//                 fontSize: 48,
//                 color: "#fff",
//                 fontWeight: 600,
//               }}
//             >
//               📞
//             </div>
//           </div>

//           <h2 style={{ fontSize: 24, fontWeight: 600, color: "#e9edef", margin: "0 0 8px" }}>
//             Calling...
//           </h2>
//           <p style={{ fontSize: 14, color: "var(--wa-text-muted)", margin: "0 0 48px" }}>
//             Waiting for recipient to accept the call
//           </p>

//           {/* Cancel button */}
//           <button
//             onClick={handleCancelCall}
//             style={{
//               width: 60,
//               height: 60,
//               borderRadius: "50%",
//               backgroundColor: "#ea0038",
//               border: "none",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//             }}
//             className="call-btn-hover"
//             title="Cancel Call"
//           >
//             <PhoneOffIcon size={24} />
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Render Declined screen
//   if (callRejected) {
//     return (
//       <div className="h-screen w-screen bg-[#0a1014] flex flex-col items-center justify-center font-sans">
//         <h2 style={{ fontSize: 24, fontWeight: 600, color: "#ea0038", marginBottom: 8 }}>
//           Call Declined
//         </h2>
//         <p style={{ fontSize: 14, color: "var(--wa-text-muted)" }}>
//           Redirecting you back to Socialize...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a1014]">
//       {client && call ? (
//         <StreamVideo client={client}>
//           <StreamTheme>
//             <StreamCall call={call}>
//               <CallContent setParticipantsCount={setParticipantsCount} />
//             </StreamCall>
//           </StreamTheme>
//         </StreamVideo>
//       ) : (
//         <div className="flex items-center justify-center h-full text-white">
//           <p>Could not initialize call. Please refresh or try again.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// const CallContent = ({ setParticipantsCount }) => {
//   const { useCallCallingState, useCallParticipants } = useCallStateHooks();
//   const callingState = useCallCallingState();
//   const participants = useCallParticipants();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (participants) {
//       setParticipantsCount(participants.length);
//     }
//   }, [participants, setParticipantsCount]);

//   if (callingState === CallingState.LEFT) {
//     return navigate("/");
//   }

//   return (
//     <div className="relative flex flex-col w-full h-full">
//       <SpeakerLayout />
//       <CallControls />
//     </div>
//   );
// };

// export default CallPage;



import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";

import useAuthUser from "../hooks/useAuthUser";

import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import { StreamChat } from "stream-chat";

import { PhoneOffIcon } from "lucide-react";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();

  const [searchParams] = useSearchParams();

  const isCallingMode =
    searchParams.get("calling") === "true";

  // Chat channel ID sent from WhatsAppLayout
  const chatChannelId =
    searchParams.get("channelId");

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  const [isConnecting, setIsConnecting] =
    useState(true);

  const [callRejected, setCallRejected] =
    useState(false);

  const [participantsCount, setParticipantsCount] =
    useState(1);

  const [errorMessage, setErrorMessage] =
    useState("");

  const navigate = useNavigate();

  const {
    authUser,
    isLoading,
  } = useAuthUser();

  // =========================================================
  // STREAM TOKEN
  // =========================================================

  const {
    data: tokenData,
    isLoading: tokenLoading,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // =========================================================
  // RINGING SOUND FOR CALLER
  // =========================================================

  useEffect(() => {
    if (
      !isCallingMode ||
      callRejected ||
      participantsCount > 1
    ) {
      return;
    }

    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/1359/1359-84.wav"
    );

    audio.loop = true;

    audio.play().catch(() => {
      console.log(
        "Audio autoplay blocked"
      );
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [
    isCallingMode,
    callRejected,
    participantsCount,
  ]);

  // =========================================================
  // INITIALIZE VIDEO CALL
  // =========================================================

  useEffect(() => {
    let videoClient = null;
    let callInstance = null;

    let chatClient = null;
    let listener = null;

    let cancelled = false;

    const initCall = async () => {
      if (
        !tokenData?.token ||
        !authUser ||
        !callId ||
        !STREAM_API_KEY
      ) {
        return;
      }

      try {
        console.log(
          "===================================="
        );

        console.log(
          "📹 INITIALIZING VIDEO CALL"
        );

        console.log(
          "Call ID:",
          callId
        );

        console.log(
          "User ID:",
          authUser._id
        );

        console.log(
          "Mode:",
          isCallingMode
            ? "CALLER"
            : "RECEIVER"
        );

        console.log(
          "Chat Channel ID:",
          chatChannelId
        );

        console.log(
          "===================================="
        );

        // =====================================================
        // USER
        // =====================================================

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        // =====================================================
        // CREATE VIDEO CLIENT
        // =====================================================

        videoClient =
          new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user,
            token: tokenData.token,
          });

        console.log(
          "✅ Stream Video client created"
        );

        // =====================================================
        // GET VIDEO CALL
        // =====================================================

        callInstance =
          videoClient.call(
            "default",
            callId
          );

        console.log(
          "✅ Call instance created"
        );

        // =====================================================
        // JOIN FIRST
        // =====================================================

        console.log(
          "🔵 Joining video call..."
        );

        await callInstance.join({
          create: true,
        });

        console.log(
          "✅ Successfully joined video call"
        );

        if (cancelled) {
          return;
        }

        // =====================================================
        // ENABLE CAMERA AFTER JOIN
        // =====================================================

        try {
          console.log(
            "📷 Enabling camera..."
          );

          await callInstance.camera.enable();

          console.log(
            "✅ Camera enabled"
          );
        } catch (cameraError) {
          console.error(
            "❌ Camera error:",
            cameraError
          );

          toast.error(
            "Camera permission is required."
          );
        }

        // =====================================================
        // ENABLE MICROPHONE AFTER JOIN
        // =====================================================

        try {
          console.log(
            "🎤 Enabling microphone..."
          );

          await callInstance.microphone.enable();

          console.log(
            "✅ Microphone enabled"
          );
        } catch (micError) {
          console.error(
            "❌ Microphone error:",
            micError
          );

          toast.error(
            "Microphone permission is required."
          );
        }

        if (cancelled) {
          return;
        }

        // =====================================================
        // SAVE CLIENT + CALL
        // =====================================================

        setClient(videoClient);
        setCall(callInstance);

        console.log(
          "✅ Video client and call saved"
        );

        // =====================================================
        // STREAM CHAT
        // =====================================================

        if (chatChannelId) {
          console.log(
            "🔵 Connecting to chat channel..."
          );

          chatClient =
            StreamChat.getInstance(
              STREAM_API_KEY
            );

          if (!chatClient.userID) {
            await chatClient.connectUser(
              user,
              tokenData.token
            );

            console.log(
              "✅ Stream Chat connected"
            );
          }

          const channel =
            chatClient.channel(
              "messaging",
              chatChannelId
            );

          await channel.watch();

          console.log(
            "✅ Watching chat channel:",
            chatChannelId
          );

          // ===================================================
          // LISTEN FOR CALL REJECTION
          // ===================================================

          listener = channel.on(
            "message.new",
            (event) => {
              if (
                event.message?.customType ===
                  "call_reject" &&
                event.message?.user?.id !==
                  authUser._id &&
                event.message?.callId ===
                  callId
              ) {
                console.log(
                  "📞 CALL WAS REJECTED"
                );

                setCallRejected(true);

                toast.error(
                  "Call Declined"
                );

                setTimeout(() => {
                  navigate("/");
                }, 1500);
              }
            }
          );

          console.log(
            "✅ Rejection listener added"
          );
        } else {
          console.log(
            "ℹ️ No chat channel ID supplied"
          );
        }

        console.log(
          "===================================="
        );

        console.log(
          "🎉 VIDEO CALL READY"
        );

        console.log(
          "===================================="
        );

      } catch (error) {
        console.error(
          "===================================="
        );

        console.error(
          "❌ VIDEO CALL INITIALIZATION FAILED"
        );

        console.error(
          error
        );

        console.error(
          "===================================="
        );

        if (!cancelled) {
          setErrorMessage(
            error?.message ||
              "Could not join the video call."
          );

          toast.error(
            "Could not join the video call."
          );
        }
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    };

    initCall();

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      cancelled = true;

      console.log(
        "🧹 Cleaning up video call"
      );

      if (listener?.unsubscribe) {
        listener.unsubscribe();
      }

      if (callInstance) {
        callInstance
          .leave()
          .catch((error) => {
            console.log(
              "Call leave error:",
              error
            );
          });
      }

      if (videoClient) {
        videoClient
          .disconnectUser()
          .catch((error) => {
            console.log(
              "Video client disconnect error:",
              error
            );
          });
      }
    };

  }, [
    tokenData?.token,
    authUser,
    callId,
    chatChannelId,
    isCallingMode,
    navigate,
  ]);

  // =========================================================
  // CANCEL CALL
  // =========================================================

  const handleCancelCall =
    async () => {
      try {
        console.log(
          "📞 Cancelling call..."
        );

        if (call) {
          await call.leave();
        }
      } catch (error) {
        console.error(
          "Cancel call error:",
          error
        );
      } finally {
        navigate("/");
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    isLoading ||
    tokenLoading ||
    isConnecting
  ) {
    return <PageLoader />;
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (errorMessage) {
    return (
      <div
        className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a1014] text-white"
        style={{
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            marginBottom: 12,
          }}
        >
          Video Call Error
        </h2>

        <p
          style={{
            color: "#8696a0",
            maxWidth: 600,
            marginBottom: 20,
          }}
        >
          {errorMessage}
        </p>

        <button
          onClick={() =>
            navigate("/")
          }
          style={{
            background:
              "#00a884",
            color: "#fff",
            border: "none",
            padding:
              "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // =========================================================
  // CALL DECLINED
  // =========================================================

  if (callRejected) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a1014] text-white">
        <h2
          style={{
            color: "#ea0038",
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Call Declined
        </h2>

        <p
          style={{
            color:
              "var(--wa-text-muted)",
          }}
        >
          Returning to Socialize...
        </p>
      </div>
    );
  }

  // =========================================================
  // CALLER WAITING SCREEN
  // =========================================================

  if (
    isCallingMode &&
    participantsCount === 1
  ) {
    return (
      <div className="h-screen w-screen bg-[#0a1014] flex flex-col items-center justify-center font-sans">
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
          }}
        >
          {/* Avatar */}

          <div
            className="wa-avatar-pulse-container"
            style={{
              position:
                "relative",
              marginBottom: 24,
            }}
          >
            <div className="wa-avatar-pulse-ring" />

            <div
              style={{
                width: 110,
                height: 110,
                borderRadius:
                  "50%",
                background:
                  "var(--wa-green-dark)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                position:
                  "relative",
                zIndex: 2,
                border:
                  "3px solid var(--wa-green)",
                fontSize: 48,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              📞
            </div>
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#e9edef",
              margin:
                "0 0 8px",
            }}
          >
            Calling...
          </h2>

          <p
            style={{
              fontSize: 14,
              color:
                "var(--wa-text-muted)",
              margin:
                "0 0 48px",
            }}
          >
            Waiting for recipient
            to accept the call
          </p>

          <button
            onClick={
              handleCancelCall
            }
            style={{
              width: 60,
              height: 60,
              borderRadius:
                "50%",
              backgroundColor:
                "#ea0038",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor: "pointer",
            }}
            className="call-btn-hover"
            title="Cancel Call"
          >
            <PhoneOffIcon
              size={24}
            />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIDEO CALL
  // =========================================================

  return (
    <div
      className="h-screen w-screen bg-[#0a1014]"
      style={{
        overflow: "hidden",
      }}
    >
      {client && call ? (
        <StreamVideo
          client={client}
        >
          <StreamTheme>
            <StreamCall
              call={call}
            >
              <CallContent
                setParticipantsCount={
                  setParticipantsCount
                }
              />
            </StreamCall>
          </StreamTheme>
        </StreamVideo>
      ) : (
        <div
          className="flex items-center justify-center w-full h-full text-white"
        >
          <p>
            Could not initialize
            video call.
          </p>
        </div>
      )}
    </div>
  );
};

// ===========================================================
// CALL CONTENT
// ===========================================================

const CallContent = ({
  setParticipantsCount,
}) => {
  const {
    useCallCallingState,
    useCallParticipants,
  } =
    useCallStateHooks();

  const callingState =
    useCallCallingState();

  const participants =
    useCallParticipants();

  const navigate =
    useNavigate();

  // =========================================================
  // PARTICIPANT COUNT
  // =========================================================

  useEffect(() => {
    if (!participants) {
      return;
    }

    console.log(
      "👥 Participants:",
      participants.length
    );

    setParticipantsCount(
      participants.length
    );
  }, [
    participants,
    setParticipantsCount,
  ]);

  // =========================================================
  // CALL LEFT
  // =========================================================

  useEffect(() => {
    if (
      callingState ===
      CallingState.LEFT
    ) {
      console.log(
        "📞 Call ended"
      );

      navigate("/");
    }
  }, [
    callingState,
    navigate,
  ]);

  // =========================================================
  // DEBUG CALL STATE
  // =========================================================

  useEffect(() => {
    console.log(
      "📹 Calling State:",
      callingState
    );
  }, [callingState]);

  // =========================================================
  // JOINING
  // =========================================================

  if (
    callingState ===
      CallingState.JOINING ||
    callingState ===
      CallingState.RECONNECTING
  ) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a1014] text-white">
        <div className="text-center">
          <div
            style={{
              fontSize: 22,
              marginBottom: 8,
            }}
          >
            Connecting to video
            call...
          </div>

          <p
            style={{
              color: "#8696a0",
              fontSize: 14,
            }}
          >
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT JOINED
  // =========================================================

  if (
    callingState !==
    CallingState.JOINED
  ) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a1014] text-white">
        <div className="text-center">
          <p
            style={{
              fontSize: 20,
              marginBottom: 8,
            }}
          >
            Preparing video call...
          </p>

          <p
            style={{
              color: "#8696a0",
              fontSize: 14,
            }}
          >
            Call status:{" "}
            {callingState}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACTIVE CALL
  // =========================================================

  return (
    <div
      className="relative w-full h-full flex flex-col bg-[#0a1014]"
      style={{
        minHeight: "100vh",
      }}
    >
      {/* =====================================================
          VIDEO
          ===================================================== */}

      <div
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <SpeakerLayout />
      </div>

      {/* =====================================================
          CONTROLS
          ===================================================== */}

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          padding:
            "12px 0 20px",
          background:
            "#0a1014",
        }}
      >
        <CallControls />
      </div>
    </div>
  );
};

export default CallPage;