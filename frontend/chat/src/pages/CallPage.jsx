import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
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

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [searchParams] = useSearchParams();
  const isCallingMode = searchParams.get("calling") === "true"; // Caller is in calling mode

  const [client, setClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callRejected, setCallRejected] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1);

  const navigate = useNavigate();
  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Play dialing tone for caller
  useEffect(() => {
    if (!isCallingMode || callRejected || participantsCount > 1) return;

    // Simple beep sound to simulate a dialing ring
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-84.wav");
    audio.loop = true;
    audio.play().catch((err) => console.log("Audio blocked:", err));

    return () => audio.pause();
  }, [isCallingMode, callRejected, participantsCount]);

  // Connect both Chat Client and Video Client
  useEffect(() => {
    const initClients = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream clients...");
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        // 1. Initialize Stream Video
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });
        setClient(videoClient);
        setCall(callInstance);

        // 2. Initialize Stream Chat (to listen for custom call events)
        const cClient = StreamChat.getInstance(STREAM_API_KEY);
        if (!cClient.userID) {
          await cClient.connectUser(user, tokenData.token);
        }
        setChatClient(cClient);

        // Watch the chat channel for rejection
        const channel = cClient.channel("messaging", callId);
        await channel.watch();

        channel.on("message.new", (event) => {
          if (
            event.message?.customType === "call_reject" &&
            event.message?.user?.id !== authUser._id
          ) {
            setCallRejected(true);
            toast.error("Call Declined");
            setTimeout(() => {
              navigate("/");
            }, 2000);
          }
        });

      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
        navigate("/");
      } finally {
        setIsConnecting(false);
      }
    };

    initClients();

    return () => {
      // Clean up chat listeners if needed
    };
  }, [tokenData, authUser, callId]);

  const handleCancelCall = async () => {
    if (call) {
      await call.leave();
    }
    navigate("/");
  };

  if (isLoading || isConnecting) return <PageLoader />;

  // Render Outgoing Call Ring Screen
  if (isCallingMode && !callRejected && participantsCount === 1) {
    return (
      <div className="h-screen w-screen bg-[#0a1014] flex flex-col items-center justify-center font-sans">
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Avatar pulse */}
          <div className="wa-avatar-pulse-container" style={{ position: "relative", marginBottom: 24 }}>
            <div className="wa-avatar-pulse-ring" />
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "var(--wa-green-dark)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
                border: "3px solid var(--wa-green)",
                fontSize: 48,
                color: "#fff",
                fontWeight: 600,
              }}
            >
              📞
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#e9edef", margin: "0 0 8px" }}>
            Calling...
          </h2>
          <p style={{ fontSize: 14, color: "var(--wa-text-muted)", margin: "0 0 48px" }}>
            Waiting for recipient to accept the call
          </p>

          {/* Cancel button */}
          <button
            onClick={handleCancelCall}
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: "#ea0038",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            className="call-btn-hover"
            title="Cancel Call"
          >
            <PhoneOffIcon size={24} />
          </button>
        </div>
      </div>
    );
  }

  // Render Declined screen
  if (callRejected) {
    return (
      <div className="h-screen w-screen bg-[#0a1014] flex flex-col items-center justify-center font-sans">
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#ea0038", marginBottom: 8 }}>
          Call Declined
        </h2>
        <p style={{ fontSize: 14, color: "var(--wa-text-muted)" }}>
          Redirecting you back to Socialize...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a1014]">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamTheme>
            <StreamCall call={call}>
              <CallContent setParticipantsCount={setParticipantsCount} />
            </StreamCall>
          </StreamTheme>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <p>Could not initialize call. Please refresh or try again.</p>
        </div>
      )}
    </div>
  );
};

const CallContent = ({ setParticipantsCount }) => {
  const { useCallCallingState, useCallParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useCallParticipants();
  const navigate = useNavigate();

  useEffect(() => {
    if (participants) {
      setParticipantsCount(participants.length);
    }
  }, [participants, setParticipantsCount]);

  if (callingState === CallingState.LEFT) {
    return navigate("/");
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <SpeakerLayout />
      <CallControls />
    </div>
  );
};

export default CallPage;