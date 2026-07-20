// pages/VideoCallPage.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import userJoinedSound from "../assets/userJoined.mp3";
import userLeftSound from "../assets/userLeft.mp3";
import { useWebRTCConnection } from "../hooks/useWebRTCConnection";
import { useSocketSignaling } from "../hooks/useSocketSignaling";
import { useMediaStream } from "../hooks/useMediaStream";
import { useBackgroundProcessing } from "../hooks/useBackgroundProcessing";
import { useConnectionMonitoring } from "../hooks/useConnectionMonitoring";
import { usePictureInPicture } from "../hooks/usePictureInPicture";
import { VideoControls } from "../components/VideoControls";
import { VideoGrid } from "../components/VideoGrid";
import { CallStatus } from "../components/CallStatus";
import { CallHeader } from "../components/CallHeader";
import { CallFooter } from "../components/CallFooter";
import VideoSettingModal from "../components/VideoSettingModal";
import { RTC_CONFIG } from "../config/rtcConfig";

const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectLayout, setLayout] = useState("reset-layout");
  const [background, setBackground] = useState("none");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const joinSound = useRef(new Audio(userJoinedSound));
  const leaveSound = useRef(new Audio(userLeftSound));
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callInitializedRef = useRef(false);
  const resolutionInitializedRef = useRef(false);

  const webRTC = useWebRTCConnection(RTC_CONFIG);
  const media = useMediaStream();
  const { applyBackground } = useBackgroundProcessing();
  const { connectionQuality, stopConnectionMonitoring, handleConnectionStateChange, handleICEConnectionStateChange } = useConnectionMonitoring();

  const handleJoin = useCallback(() => {
    joinSound.current.play().catch((e) => console.error(e));
  }, []);

  const handleLeave = useCallback(() => {
    leaveSound.current.play().catch((e) => console.error(e));
  }, []);

  const { emitOffer, emitAnswer, emitIceCandidate, disconnect } = useSocketSignaling({
    roomId,
    userId,
    onConnect: () => setIsConnected(true),
    onConnectError: () => setIsConnected(false),
    onDisconnect: () => setIsConnected(false),
    onUserConnected: () => {
      handleJoin();
      setHasRemoteUser(true);
      const peerConnection = webRTC.getPeerConnection();
      if (peerConnection) {
        webRTC.createOffer((data) => emitOffer(data), roomId || "");
      }
    },
    onUserDisconnected: () => {
      handleLeave();
      setHasRemoteUser(false);
    },
    onOffer: async (data) => {
      setHasRemoteUser(true);
      const answer = await webRTC.handleOffer(data.offer);
      if (answer) {
        emitAnswer({ roomId: roomId || "", answer, from: userId });
      }
    },
    onAnswer: async (data) => {
      await webRTC.handleAnswer(data.answer);
    },
    onIceCandidate: async (data) => {
      await webRTC.handleIceCandidate(data.candidate);
    },
    onRoomFull: () => {
      alert("Room is full! Only two users allowed per room.");
      navigate("/");
    },
  });

  // Initialize media and peer connection once when socket connects
  useEffect(() => {
    if (!isConnected || !roomId || callInitializedRef.current) {
      return;
    }

    callInitializedRef.current = true;

    const initializeCall = async () => {
      const stream = await media.initializeMedia();
      if (stream) {
        webRTC.createPeerConnection(
          stream,
          remoteVideoRef,
          (candidate) => emitIceCandidate({ roomId, candidate }),
          (state) => {
            const peerConnection = webRTC.getPeerConnection();
            if (peerConnection) {
              handleConnectionStateChange(state, peerConnection);
            }
          },
          (state) =>
            handleICEConnectionStateChange(state, () =>
              webRTC.createOffer((data) => emitOffer(data), roomId || "")
            ),
          (state) => console.log(`Signaling state: ${state}`),
          (answer) => emitAnswer({ roomId, answer, from: userId })
        );
      }
    };

    initializeCall();
  }, [isConnected, roomId]);

  // Handle resolution changes (skip initial mount value)
  useEffect(() => {
    if (!resolutionInitializedRef.current) {
      resolutionInitializedRef.current = true;
      return;
    }

    const peerConnection = webRTC.getPeerConnection();
    if (media.isCallActive && peerConnection) {
      media.changeResolution(media.resolution, peerConnection);
    }
  }, [media.resolution, media.isCallActive]);

  // Handle background changes
  useEffect(() => {
    const peerConnection = webRTC.getPeerConnection();
    if (background !== "none" && media.localStream && peerConnection) {
      applyBackground(media.localStream, peerConnection, background, media.localVideoRef);
    }
  }, [background]);

  // Handle screen sharing
  useEffect(() => {
    if (!media.isScreenSharing) {
      return;
    }

    const peerConnection = webRTC.getPeerConnection();
    if (peerConnection) {
      media.handleScreenSharing(peerConnection);
    }
    media.setIsScreenSharing(false);
  }, [media.isScreenSharing]);

  usePictureInPicture(selectLayout, setLayout);

  // Handle mobile resize
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEndCall = () => {
    callInitializedRef.current = false;
    resolutionInitializedRef.current = false;
    webRTC.closePeerConnection();
    media.stopMedia();
    stopConnectionMonitoring();
    disconnect();
    navigate("/");
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || "");
    toast.success("Room ID copied to clipboard!", { duration: 2000 });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Video Call",
        text: "Join my video call",
        url: window.location.href,
      });
    }
  };

  const handleToggleBackCamera = async () => {
    const peerConnection = webRTC.getPeerConnection();
    if (peerConnection) {
      await media.handleToggleBackCamera(peerConnection);
    }
  };

  const handleScreenShare = () => {
    media.setIsScreenSharing(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <CallHeader
          roomId={roomId}
          isConnected={isConnected}
          onCopyRoomId={handleCopyRoomId}
          onShare={handleShare}
          onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        />

        {!isConnected && (
          <div className="bg-yellow-500 text-white p-4 rounded-lg mb-4">
            Connecting to server...
          </div>
        )}

        <div className="bg-black rounded-lg p-4 max-w-7xl flex flex-col gap-4 mx-auto">
          <VideoGrid
            localVideoRef={media.localVideoRef}
            remoteVideoRef={remoteVideoRef}
            isVideoOff={media.isVideoOff}
            isMuted={media.isMuted}
            isCallActive={media.isCallActive}
            hasRemoteUser={hasRemoteUser}
            webrtcDebug={webRTC.webrtcDebug}
            selectLayout={selectLayout}
            setLayout={setLayout}
          />

          <VideoControls
            isMuted={media.isMuted}
            isVideoOff={media.isVideoOff}
            isCallActive={media.isCallActive}
            isMobile={isMobile}
            onToggleMute={media.handleToggleMute}
            onToggleVideo={media.handleToggleVideo}
            onScreenShare={handleScreenShare}
            onToggleBackCamera={handleToggleBackCamera}
            onEndCall={handleEndCall}
          />
        </div>

        {isSettingsOpen && (
          <div className="absolute bottom-13 right-[36%]">
            <VideoSettingModal
              isOpen={true}
              onClose={() => setIsSettingsOpen(false)}
              selectLayout={selectLayout}
              setLayout={setLayout}
              resolution={media.resolution}
              setResolution={media.setResolution}
              background={background}
              setBackground={setBackground}
            />
          </div>
        )}

        <CallStatus
          isConnected={isConnected}
          hasRemoteUser={hasRemoteUser}
          isCallActive={media.isCallActive}
          connectionQuality={connectionQuality}
        />
      </div>

      <CallFooter />
    </div>
  );
};

export default VideoCallPage;
