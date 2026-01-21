// pages/VideoCallPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { Mail, Phone, Linkedin } from "lucide-react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import roomBg from "../assets/room.jpg";
import beachBg from "../assets/beach_background.jpg";
import forestBg from "../assets/forest_background.jpg";
import {
  FiCopy,
  FiSettings,
  FiVideo,
  FiVideoOff,
  FiRepeat,
  FiMaximize, FiMinimize,
  FiShare2, FiMic, FiMicOff, FiMonitor,
} from "react-icons/fi";
import VideoConnectLogo from "../components/VideoConnectLogo";
import toast from "react-hot-toast";
import VideoSettingModal from "../components/VideoSettingModal";
import { MdCallEnd } from "react-icons/md";
import userJoinedSound from "../assets/userJoined.mp3";
import userLeftSound from "../assets/userLeft.mp3";

interface WebRtcDebug {
  hasRemoteTrack: boolean;
}

const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [userId] = useState(
    () => `user-${Math.random().toString(36).substr(2, 9)}`
  );
  const [connectionQuality, setConnectionQuality] = useState<string>("unknown");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webrtcDebug, setWebrtcDebug] = useState<WebRtcDebug>({
    hasRemoteTrack: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectLayout, setLayout] = useState("reset-layout");
  const [resolution, setResolution] = useState("720p");
  const [background, setBackground] = useState("none");

  const resolutionConstraints: Record<string, MediaTrackConstraints> = {
    "360p": { width: 320, height: 240, frameRate: { max: 10 } },
    "480p": { width: 640, height: 480, frameRate: { max: 15 } },
    "720p": { width: 1280, height: 720, frameRate: { max: 20 } },
    "1080p": { width: 1920, height: 1080 },
    "1440p": { width: 2560, height: 1440 },
    "2160p": { width: 3840, height: 2160 },

  };

  const resolutionBitrates: Record<string, number> = {
    "360p": 250000,
    "480p": 500000,   // 500 Kbps
    "720p": 1500000,  // 1.5 Mbps
    "1080p": 3000000, // 3 Mbps
    "1440p": 6000000, // 6 Mbps
    "2160p": 12000000 // 12 Mbps
  };

  // Enhanced WebRTC Configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      // Primary STUN servers
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      // Your Metered.ca TURN servers
      {
        urls: "turn:in.relay.metered.ca:80",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "turn:in.relay.metered.ca:443",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "turns:in.relay.metered.ca:443?transport=tcp",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:in.relay.metered.ca:80",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "turn:in.relay.metered.ca:80?transport=tcp",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "turn:in.relay.metered.ca:443",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },
      {
        urls: "turns:in.relay.metered.ca:443?transport=tcp",
        username: "b42da29201cf149bcd63bb44",
        credential: "ATmIroK5eNTrT6Ae",
      },

      // Fallback TURN servers
      {
        urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443"],
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: [
          "turn:openrelay.metered.ca:80",
          "turn:openrelay.metered.ca:443",
          "turn:openrelay.metered.ca:443?transport=tcp",
        ],
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: [
          "turn:numb.viagenie.ca:3478",
          "turn:numb.viagenie.ca:3478?transport=tcp",
        ],
        credential: "muazkh",
        username: "webrtc@live.com",
      },
      {
        urls: "turn:relay1.expressturn.com:3478",
        username: "efSNdhS61TZR72ZR6h",
        credential: "D5DZj4qEeJ4Z6BZz",
      },
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: "all",
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  };

  // Connection monitoring refs
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVideoBytesReceivedRef = useRef<number>(0);
  const lastAudioBytesReceivedRef = useRef<number>(0);
  const lastPacketReceivedRef = useRef<number>(Date.now());
  const joinSound = useRef(new Audio(userJoinedSound));
  const leaveSound = useRef(new Audio(userLeftSound));
  const bgImage = new Image();
  bgImage.src = roomBg;
  // Debug logging function
  const addDebugLog = (message: string) => {
    console.log(`🔍 ${new Date().toLocaleTimeString()}: ${message}`);
  };

  // Enhanced TURN usage checking
  const checkTurnUsage = async () => {
    if (!peerConnectionRef.current) return;

    try {
      const stats = await peerConnectionRef.current.getStats();
      let turnUsed = false;
      let localCandidateType = "";
      let remoteCandidateType = "";

      stats.forEach((report) => {
        if (report.type === "candidate-pair" && report.selected) {
          // Get local candidate details
          const localCandidate = stats.get(report.localCandidateId);
          if (localCandidate) {
            localCandidateType = localCandidate.candidateType;
            addDebugLog(`📍 Local candidate type: ${localCandidateType}`);
            if (localCandidateType === "relay") {
              turnUsed = true;
            }
          }

          // Get remote candidate details
          const remoteCandidate = stats.get(report.remoteCandidateId);
          if (remoteCandidate) {
            remoteCandidateType = remoteCandidate.candidateType;
            addDebugLog(`📍 Remote candidate type: ${remoteCandidateType}`);
          }
        }
      });

      addDebugLog(
        `🔄 TURN Server Usage: ${turnUsed ? "✅ USING TURN" : "❌ NOT using TURN"
        }`
      );
      addDebugLog(
        `📍 Connection type: ${localCandidateType} -> ${remoteCandidateType}`
      );
    } catch (error) {
      console.error("Error checking TURN usage:", error);
    }
  };

  // Initialize Connection Monitoring
  const startConnectionMonitoring = () => {
    if (!peerConnectionRef.current || isMonitoring) return;

    addDebugLog("Starting connection monitoring...");
    setIsMonitoring(true);

    // Monitor stats every 3 seconds
    statsIntervalRef.current = setInterval(() => {
      checkConnectionHealth();
    }, 3000);

    // Comprehensive health check every 5 seconds
    healthCheckIntervalRef.current = setInterval(() => {
      performHealthCheck();
    }, 5000);
  };

  const stopConnectionMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    setIsMonitoring(false);
  };

  // Check connection health using WebRTC statistics
  const checkConnectionHealth = async () => {
    if (!peerConnectionRef.current) return;

    try {
      const stats = await peerConnectionRef.current.getStats();
      let videoBytesReceived = 0;
      // let videoBytesSent = 0;
      let audioBytesReceived = 0;
      // let audioBytesSent = 0;
      let packetsLost = 0;

      stats.forEach((report) => {
        if (report.type === "inbound-rtp" && !report.isRemote) {
          if (report.kind === "video") {
            videoBytesReceived = report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          } else if (report.kind === "audio") {
            audioBytesReceived = report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          }
        }
      });

      // Check if we're receiving data
      const isReceivingVideo =
        videoBytesReceived > lastVideoBytesReceivedRef.current;
      const isReceivingAudio =
        audioBytesReceived > lastAudioBytesReceivedRef.current;

      if (isReceivingVideo || isReceivingAudio) {
        lastPacketReceivedRef.current = Date.now();
      }

      // Update connection quality
      let quality = "unknown";
      const timeSinceLastPacket = Date.now() - lastPacketReceivedRef.current;

      if (timeSinceLastPacket < 3000) {
        quality = "excellent";
      } else if (timeSinceLastPacket < 8000) {
        quality = "good";
      } else if (timeSinceLastPacket < 15000) {
        quality = "poor";
      } else {
        quality = "disconnected";
      }

      setConnectionQuality(quality);

      lastVideoBytesReceivedRef.current = videoBytesReceived;
      lastAudioBytesReceivedRef.current = audioBytesReceived;

      // Check for prolonged silence
      if (timeSinceLastPacket > 10000 && hasRemoteUser) {
        addDebugLog(
          "❌ No media received for 10+ seconds - Connection may be dead"
        );
        setConnectionQuality("disconnected");
      }
    } catch (error) {
      console.error("Error checking connection stats:", error);
    }
  };

  // Perform comprehensive health check
  const performHealthCheck = () => {
    if (!peerConnectionRef.current) return;

    const connectionState = peerConnectionRef.current.connectionState;
    const iceState = peerConnectionRef.current.iceConnectionState;

    // Check if we need to reconnect
    if (connectionState === "failed" || iceState === "failed") {
      addDebugLog("🔄 Connection failed, attempting to restart...");
      handleConnectionFailure();
    }
  };

  const handleConnectionFailure = () => {
    setConnectionQuality("disconnected");
  };

  // Enhanced connection state handlers
  const handleConnectionStateChange = () => {
    if (!peerConnectionRef.current) return;

    const state = peerConnectionRef.current.connectionState;
    addDebugLog(`🔗 Connection state changed: ${state}`);

    switch (state) {
      case "connected":
        addDebugLog("✅ Peer connection established!");
        setConnectionQuality("excellent");
        startConnectionMonitoring();
        checkTurnUsage();
        break;
      case "disconnected":
        addDebugLog("🟡 Peer connection disconnected");
        setConnectionQuality("poor");
        break;
      case "failed":
        addDebugLog("❌ Peer connection failed");
        setConnectionQuality("disconnected");
        stopConnectionMonitoring();
        break;
      case "closed":
        addDebugLog("🔴 Peer connection closed");
        setConnectionQuality("disconnected");
        stopConnectionMonitoring();
        break;
      case "connecting":
        addDebugLog("🔄 Peer connection connecting...");
        setConnectionQuality("unknown");
        break;
    }
  };

  const handleICEConnectionStateChange = () => {
    if (!peerConnectionRef.current) return;

    const state = peerConnectionRef.current.iceConnectionState;
    addDebugLog(`❄️ ICE connection state: ${state}`);

    if (state === "connected") {
      addDebugLog("🎉 ICE connected successfully!");
    } else if (state === "failed") {
      addDebugLog("❌ ICE connection failed");
      setTimeout(() => {
        if (peerConnectionRef.current?.iceConnectionState === "failed") {
          addDebugLog("🔄 Attempting to restart ICE...");
          createOffer();
        }
      }, 2000);
    }
  };

  const handleSignalingStateChange = () => {
    if (!peerConnectionRef.current) return;

    const state = peerConnectionRef.current.signalingState;
    addDebugLog(`📶 Signaling state: ${state}`);
  };

  //   function startBackgroundBlur(stream: MediaStream, onReady: (track: MediaStreamTrack) => void) {
  //     const video = document.createElement("video");
  //     video.srcObject = stream;
  //     video.play();

  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d")!;

  //     const segmentation = new SelfieSegmentation({
  //       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
  //     });

  //     segmentation.setOptions({ modelSelection: 1 });

  //     segmentation.onResults((res) => {
  //   if (!ctx) return;

  //   const vw = video.videoWidth;
  //   const vh = video.videoHeight;
  //   canvas.width = vw;
  //   canvas.height = vh;

  //   // draw blurred scene
  //   ctx.globalCompositeOperation = "source-over";
  //   ctx.filter = "blur(12px)";
  //   ctx.drawImage(video, 0, 0, vw, vh);

  //   // remove person from blurred layer
  //   ctx.globalCompositeOperation = "destination-out";
  //   ctx.drawImage(res.segmentationMask, 0, 0, vw, vh);

  //   // draw sharp person back
  //   ctx.globalCompositeOperation = "destination-over";
  //   ctx.filter = "none";
  //   ctx.drawImage(video, 0, 0, vw, vh);

  //   // reset
  //   ctx.globalCompositeOperation = "source-over";
  // });




  //     const process = async () => {
  //       await segmentation.send({ image: video });
  //       requestAnimationFrame(process);
  //     };
  //     process();

  //     const blurredStream = canvas.captureStream(30);
  //     const blurredTrack = blurredStream.getVideoTracks()[0];

  //     onReady(blurredTrack);
  //   }

  // Initialize Media Stream - AUTO START
  const initializeMedia = async () => {
    try {
      addDebugLog(`🔄 Auto-starting media stream with resolution: ${resolution}`);
      const constraints = resolutionConstraints[resolution] || resolutionConstraints["720p"];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: true
      });

      localStreamRef.current = stream;
      //  createPeerConnection()

      // // blur starts here
      // startBackgroundBlur(stream, (blurredTrack) => {
      //   // replace local preview
      //   if (localVideoRef.current) {
      //     const blurredStream = new MediaStream([blurredTrack, ...stream.getAudioTracks()]);
      //     localVideoRef.current.srcObject = blurredStream;
      //   }

      //   // send to peer connection
      //   const sender = peerConnectionRef.current
      //     ?.getSenders()
      //     .find((s) => s.track?.kind === "video");
      //   if (sender) {
      //     sender.replaceTrack(blurredTrack);
      //   } else {
      //     peerConnectionRef.current?.addTrack(blurredTrack);
      //   }
      // });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsCallActive(true);
      addDebugLog("✅ Media stream initialized successfully");

      // Create peer connection immediately after getting media
      createPeerConnection();
    } catch (err) {
      console.error("❌ Failed to access media devices:", err);
      setIsVideoOff(true);

      // Show error to user
      alert(
        "Failed to access camera and microphone. Please check permissions."
      );
    }
  };

  // Enhanced Create Peer Connection with monitoring
  const createPeerConnection = (): RTCPeerConnection => {
    // Close existing connection if any
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    addDebugLog("🔄 Creating peer connection with enhanced logging");
    const peerConnection = new RTCPeerConnection(rtcConfig);

    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
        addDebugLog(`➕ Added local ${track.kind} track: ${track.id}`);
      });
    }

    // Enhanced remote track handling
    peerConnection.ontrack = (event) => {
      addDebugLog(
        `📹 Received remote track: ${event.track.kind} (${event.streams.length} streams)`
      );

      if (event.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setWebrtcDebug((prev) => ({ ...prev, hasRemoteTrack: true }));
        addDebugLog("✅ Remote video stream set successfully");
        lastPacketReceivedRef.current = Date.now();

        // Enhanced video event listeners
        remoteVideoRef.current.onloadedmetadata = () => {
          addDebugLog("🎥 Remote video metadata loaded");
        };

        remoteVideoRef.current.onplay = () => {
          addDebugLog("▶️ Remote video started playing");
        };
      }
    };

    // Enhanced ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDebugLog(
          `🧊 ICE candidate: ${event.candidate.type} - ${event.candidate.protocol}`
        );

        // Check for relay candidates (TURN)
        if (event.candidate.type === "relay") {
          addDebugLog("✅ TURN server is being used!");
        }

        if (socketRef.current && event.candidate) {
          socketRef.current.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      } else {
        addDebugLog("✅ All ICE candidates gathered");
      }
    };

    // ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      const state = peerConnection.iceGatheringState;
      addDebugLog(`🧊 ICE gathering state: ${state}`);
    };

    // Enhanced monitoring event listeners
    peerConnection.onconnectionstatechange = handleConnectionStateChange;
    peerConnection.oniceconnectionstatechange = handleICEConnectionStateChange;
    peerConnection.onsignalingstatechange = handleSignalingStateChange;

    // Handle negotiation needed - AUTO CREATE OFFER
    peerConnection.onnegotiationneeded = async () => {
      addDebugLog("🤝 Negotiation needed, creating offer...");
      await createOffer();
    };

    peerConnectionRef.current = peerConnection;
    addDebugLog("✅ Peer connection created successfully");
    return peerConnection;
  };

  // Create Offer
  const createOffer = async () => {
    if (!peerConnectionRef.current) {
      addDebugLog("❌ No peer connection when trying to create offer");
      return;
    }

    // Prevent multiple simultaneous offers
    if (isMakingOffer) {
      addDebugLog("⏳ Already making an offer, skipping...");
      return;
    }

    try {
      setIsMakingOffer(true);
      addDebugLog("📤 Creating offer...");

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      addDebugLog("✅ Local description set");

      if (socketRef.current) {
        socketRef.current.emit("offer", {
          roomId,
          offer: offer,
        });
        addDebugLog("✅ Offer sent via socket");
      }

      // Set timeout to check connection
      setTimeout(() => {
        if (peerConnectionRef.current?.iceConnectionState !== "connected") {
          addDebugLog("⏰ Offer timeout - checking connection status");
          checkTurnUsage();
        }
      }, 10000);
    } catch (error) {
      addDebugLog(`❌ Error creating offer: ${error}`);
      console.error("Error creating offer:", error);
    } finally {
      setIsMakingOffer(false);
    }
  };

  // Handle Offer
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    addDebugLog("📥 Handling offer from remote user");

    if (!peerConnectionRef.current) {
      addDebugLog("🔄 Creating new peer connection for incoming offer");
      await initializeMedia();
    }

    const peerConnection = peerConnectionRef.current!;

    try {
      // Check if we should ignore this offer (race condition prevention)
      if (isMakingOffer || peerConnection.signalingState !== "stable") {
        addDebugLog("🚫 Ignoring offer - already making offer or not stable");
        return;
      }

      addDebugLog("🔧 Setting remote description (offer)...");

      await peerConnection.setRemoteDescription(offer);
      addDebugLog("✅ Remote description set");

      // Process queued ICE candidates after remote description is set
      processQueuedICECandidates();

      addDebugLog("📤 Creating answer...");
      const answer = await peerConnection.createAnswer();
      addDebugLog("✅ Answer created");

      await peerConnection.setLocalDescription(answer);
      addDebugLog("✅ Local description set for answer");

      if (socketRef.current) {
        socketRef.current.emit("answer", {
          roomId,
          answer: answer,
          from: userId,
        });
        addDebugLog("✅ Answer sent via socket");
      }
    } catch (error) {
      addDebugLog(`❌ Error handling offer: ${error}`);
      console.error("Error handling offer:", error);
    }
  };

  // Handle Answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      addDebugLog("❌ No peer connection when handling answer");
      return;
    }

    const peerConnection = peerConnectionRef.current;
    addDebugLog("📥 Handling answer");

    try {
      if (peerConnection.signalingState === "have-local-offer") {
        addDebugLog("🔧 Setting remote description (answer)...");
        await peerConnection.setRemoteDescription(answer);
        addDebugLog("✅ Remote description set successfully");

        processQueuedICECandidates();
      } else {
        addDebugLog(
          `⚠️ Cannot set remote answer in current state: ${peerConnection.signalingState}`
        );
      }
    } catch (error) {
      addDebugLog(`❌ Error handling answer: ${error}`);
      console.error("Error handling answer:", error);
    }
  };

  // Process queued ICE candidates
  const processQueuedICECandidates = async () => {
    if (!peerConnectionRef.current || iceCandidateQueueRef.current.length === 0)
      return;

    addDebugLog(
      `🔧 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates...`
    );
    const queue = [...iceCandidateQueueRef.current];
    iceCandidateQueueRef.current = [];

    for (const candidate of queue) {
      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
        addDebugLog("✅ Queued ICE candidate added successfully");
      } catch (error) {
        addDebugLog(`❌ Error adding queued ICE candidate: ${error}`);
      }
    }
  };

  // Handle ICE Candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      addDebugLog("❌ No peer connection when handling ICE candidate");
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    // If remote description is not set, queue the candidate
    if (!peerConnection.remoteDescription) {
      addDebugLog("⏳ Queuing ICE candidate - no remote description");
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    try {
      addDebugLog("🧊 Adding ICE candidate...");
      await peerConnection.addIceCandidate(candidate);
      addDebugLog("✅ ICE candidate added successfully");
    } catch (error) {
      addDebugLog(`❌ Error adding ICE candidate: ${error}`);
    }
  };

  // Initialize Socket Connection - AUTO START MEDIA
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SIGNALING_SERVER_URL;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      addDebugLog("✅ Connected to signaling server");
      setIsConnected(true);

      if (roomId) {
        addDebugLog(`🚪 Joining room: ${roomId}`);
        socket.emit("join-room", roomId, userId);

        // AUTO START MEDIA WHEN JOINING ROOM
        addDebugLog("🎬 Auto-initializing media...");
        initializeMedia();
      }
    });

    socket.on("connect_error", (error) => {
      addDebugLog(`❌ Socket connection error: ${error.message}`);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      addDebugLog(`🔴 Disconnected from signaling server: ${reason}`);
      setIsConnected(false);
    });

    const handleJoin = () => joinSound.current.play().catch(e => console.error(e));
    const handleLeave = () => leaveSound.current.play().catch(e => console.error(e));

    // WebRTC Signaling Events
    socket.on("user-connected", (remoteUserId: string) => {

      addDebugLog(`👤 Remote user connected: ${remoteUserId}`);
      toast.success("Remote user has joined the call!", {
        duration: 5000,
      });
      handleJoin();

      setHasRemoteUser(true);

      // If we already have media and peer connection, create offer
      if (localStreamRef.current && peerConnectionRef.current) {
        addDebugLog("🤝 Creating offer for new user");
        createOffer();
      }

    });

    socket.on("user-disconnected", () => {
      addDebugLog("👤 Remote user disconnected");
      toast.error("Remote user has left the call", { duration: 5000 });
      handleLeave();
      setHasRemoteUser(false);
    });

    socket.on(
      "offer",
      async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
        addDebugLog(`📥 Received offer from: ${data.from}`);
        setHasRemoteUser(true);
        await handleOffer(data.offer);
      }
    );

    socket.on(
      "answer",
      async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
        addDebugLog(`📥 Received answer from: ${data.from}`);
        await handleAnswer(data.answer);
      }
    );

    socket.on(
      "ice-candidate",
      async (data: { candidate: RTCIceCandidateInit; from: string }) => {
        addDebugLog(`🧊 Received ICE candidate from: ${data.from}`);
        await handleIceCandidate(data.candidate);
      }
    );

    socket.on("room-full", () => {
      alert("Room is full! Only two users allowed per room.");
      navigate("/");
    });

    return () => {
      addDebugLog("🧹 Cleaning up connections...");
      socket.disconnect();
      closePeerConnection();
      stopConnectionMonitoring();
    };
  }, [roomId, userId, navigate]);

  // Close Peer Connection
  const closePeerConnection = () => {
    stopConnectionMonitoring();

    if (peerConnectionRef.current) {
      addDebugLog("🔴 Closing peer connection");
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setHasRemoteUser(false);
    setIsMakingOffer(false);
    setConnectionQuality("disconnected");
    setWebrtcDebug({
      hasRemoteTrack: false,
    });
    iceCandidateQueueRef.current = [];
  };

  // Event Handlers
  const handleEndCall = () => {
    closePeerConnection();

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    navigate("/");
  };


  const handleScreenSharing = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender) sender.replaceTrack(screenTrack);

    screenTrack.onended = async () => {
      handleVideoSharing();
    };
  };
  const handleVideoSharing = async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: {
        sampleRate: 48000,   // standard WebRTC sample rate
        channelCount: 1,     // mono is fine
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    const cameraTrack = cameraStream.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender) sender.replaceTrack(cameraTrack);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = cameraStream;
    }
  };
  useEffect(() => {
    if (isScreenSharing) {
      handleScreenSharing();
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || "");
    toast.success("Room ID copied to clipboard!", { duration: 2000 });
  };

  // Get connection quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-green-400";
      case "poor":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Video Call",
        text: "Join my video call",
        url: window.location.href,
      });
    }
  }
  useEffect(() => {
    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
    const remoteVidContainer = document.querySelector(".remoteContainer") as HTMLElement;
    const localVidContainer = document.querySelector(".localContainer") as HTMLElement;

    const handleLayout = async () => {
      try {
        // Always exit PiP before switching
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        }

        // Reset both visibility first
        remoteVidContainer?.classList.remove('hidden');
        localVidContainer?.classList.remove("hidden");
        console.log("Selected layout:", selectLayout);


        if (selectLayout === "user-fullscreen") {
          // Local fullscreen, remote PiP
          localVideo.className = "w-full h-full ";
          remoteVidContainer.classList.add("hidden");
          await remoteVideo.requestPictureInPicture();

        } else if (selectLayout === "remote-user-fullscreen") {
          // Remote fullscreen, local PiP
          remoteVideo.className = "w-full h-full ";
          await localVideo.requestPictureInPicture();

        }
      } catch (err) {
        console.error("PiP error:", err);
      }
    };

    handleLayout();

    // ✅ Reset state when PiP is closed
    const handlePiPExit = () => {
      console.log("PiP stopped, resetting layout");
      setLayout("reset-layout");
    };

    localVideo?.addEventListener("leavepictureinpicture", handlePiPExit);
    remoteVideo?.addEventListener("leavepictureinpicture", handlePiPExit);

    return () => {
      localVideo?.removeEventListener("leavepictureinpicture", handlePiPExit);
      remoteVideo?.removeEventListener("leavepictureinpicture", handlePiPExit);
    };
  }, [selectLayout]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [backCameraEnabled, setBackCameraEnabled] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, [])
  const handleToggleBackCamera = async () => {
    console.log("clicked back camera");

    let backStream: MediaStream;
    try {
      if (backCameraEnabled) {
        backStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            sampleRate: 48000,   // standard WebRTC sample rate
            channelCount: 1,     // mono is fine
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        setBackCameraEnabled(false);
      } else {
        backStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } }
        });
        setBackCameraEnabled(true);

      }

      if (backStream) {
        const newVideoTrack = backStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(
          (s) => s.track && s.track.kind === "video"
        );
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = backStream;
        }

        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }
    } catch (error) {
      console.log(error);
      return;
    }

  }
  // Add these refs at the top with your other refs
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const processingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Update the createBlurTrack function
  function createBlurTrack(
    stream: MediaStream,
    background: string
  ): Promise<MediaStreamTrack> {
    return new Promise((resolve) => {
      // Stop any existing processing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Clean up previous segmentation
      if (segmentationRef.current) {
        segmentationRef.current.close();
        segmentationRef.current = null;
      }

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      const segmentation = new SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      segmentationRef.current = segmentation;
      segmentation.setOptions({ modelSelection: 1 });

      let firstFrame = false;
      let bgImageLoaded = false;
      const bgImage = new Image();

      // Preload background image if needed
      if (background !== "blur" && background !== "none") {
        if (background === "office-room") {
          bgImage.src = roomBg;
        } else if (background === "beach") {
          bgImage.src = beachBg;
        } else if (background === "forest") {
          bgImage.src = forestBg;
        }

        bgImage.onload = () => {
          bgImageLoaded = true;
        };
      } else {
        bgImageLoaded = true; // No image needed for blur mode
      }

      segmentation.onResults((res) => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh || !bgImageLoaded) return;

        canvas.width = vw;
        canvas.height = vh;

        // Clear canvas
        ctx.clearRect(0, 0, vw, vh);

        if (background === "blur") {
          // Draw blurred background
          ctx.filter = "blur(12px)";
          ctx.drawImage(video, 0, 0, vw, vh);
          ctx.filter = "none";
        } else if (background !== "none") {
          // Draw background image
          ctx.drawImage(bgImage, 0, 0, vw, vh);
        } else {
          // For "none", just draw the video directly
          ctx.drawImage(video, 0, 0, vw, vh);
        }

        if (background !== "none") {
          // Remove person from background (cut out)
          ctx.globalCompositeOperation = "destination-out";
          ctx.drawImage(res.segmentationMask, 0, 0, vw, vh);

          // Draw sharp person on top
          ctx.globalCompositeOperation = "destination-over";
          ctx.drawImage(video, 0, 0, vw, vh);

          // Reset composite operation
          ctx.globalCompositeOperation = "source-over";
        }

        if (!firstFrame) {
          firstFrame = true;
          const blurredStream = canvas.captureStream(30);
          resolve(blurredStream.getVideoTracks()[0]);
        }
      });

      let last = 0;
      const FPS = 15;

      function processFrame(ts: number) {
        if (!processingRef.current || !segmentationRef.current) return;

        if (ts - last > 1000 / FPS) {
          last = ts;
          try {
            segmentation.send({ image: video });
          } catch (error) {
            console.error("Segmentation error:", error);
            stopProcessing();
          }
        }

        if (processingRef.current) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      }

      function stopProcessing() {
        processingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }

      video.onloadedmetadata = () => {
        video.play().catch(console.error);
        processingRef.current = true;
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      video.onerror = (error) => {
        console.error("Video error:", error);
        stopProcessing();
      };
    });
  }





  // Handle resolution change
  useEffect(() => {
    if (!isCallActive || !localStreamRef.current) return;

    const changeResolution = async () => {
      try {
        addDebugLog(`🔄 Changing resolution to ${resolution}...`);
        const constraints = resolutionConstraints[resolution] || resolutionConstraints["720p"];

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: true
        });

        const newVideoTrack = newStream.getVideoTracks()[0];

        // Replace track in local stream
        const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (oldVideoTrack && localStreamRef.current) {
          localStreamRef.current.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localStreamRef.current?.addTrack(newVideoTrack);

        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }

        // Replace track in peer connection
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(newVideoTrack);

          const parameters = sender.getParameters();
          if (!parameters.encodings) {
            parameters.encodings = [{}];
          }

          parameters.encodings[0].maxBitrate = resolutionBitrates[resolution] || resolutionBitrates["720p"];
          await sender.setParameters(parameters);

          addDebugLog(`✅ Resolution updated to ${resolution} with bitrate ${parameters.encodings[0].maxBitrate}`);
        }

      } catch (error) {
        console.error("Error changing resolution:", error);
        addDebugLog(`❌ Error changing resolution: ${error}`);
      }
    };

    changeResolution();
  }, [resolution]);

  // Update the background useEffect with proper cleanup
  useEffect(() => {
    const applyBackground = async () => {
      if (!localStreamRef.current || !peerConnectionRef.current) return;

      const baseStream = localStreamRef.current;
      const originalVideoTrack = baseStream.getVideoTracks()[0];

      // Store original track if not already stored
      if (!originalVideoTrackRef.current) {
        originalVideoTrackRef.current = originalVideoTrack.clone();
      }

      // Stop current processing
      stopBackgroundProcessing();

      // Get sender for remote
      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      let finalTrack: MediaStreamTrack;

      if (background !== "none") {
        try {
          // Create new track with background effect
          finalTrack = await createBlurTrack(baseStream, background);
          currentVideoTrackRef.current = finalTrack;

          // Update local preview
          const previewStream = new MediaStream([
            finalTrack,
            ...baseStream.getAudioTracks(),
          ]);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = previewStream;
          }

          // Update remote sender
          if (sender) {
            await sender.replaceTrack(finalTrack);
          } else {
            peerConnectionRef.current.addTrack(finalTrack, baseStream);
          }
        } catch (error) {
          console.error("Failed to apply background:", error);
          // Fallback to original track
          finalTrack = originalVideoTrack;
        }
      } else {
        // Revert to original camera
        finalTrack = originalVideoTrack;

        // Update local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = baseStream;
        }

        // Update remote sender
        if (sender) {
          await sender.replaceTrack(originalVideoTrack);
        }
      }

      // Clean up old track if it exists
      if (currentVideoTrackRef.current && currentVideoTrackRef.current !== finalTrack) {
        currentVideoTrackRef.current.stop();
      }

      currentVideoTrackRef.current = finalTrack;
    };

    applyBackground();

    // Cleanup function
    return () => {
      stopBackgroundProcessing();
    };
  }, [background]);
  // Add this cleanup function
  const stopBackgroundProcessing = () => {
    processingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (segmentationRef.current) {
      segmentationRef.current.close();
      segmentationRef.current = null;
    }
  };








  return (
    <div className="min-h-screen  bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <VideoConnectLogo
              width={150}
              height={40}
              className="opacity-80 hidden md:block"
            />
          </div>

          <div className="flex items-center gap-4">
            <div title="Share Room Url" onClick={handleShare} className="cursor-pointer">
              <FiShare2 className="w-6 h-6 text-gray-400 hover:text-gray-500" />
            </div>
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                }`}
            ></div>
            <div className="bg-gray-800 md:px-4 px-2 py-2 rounded-lg flex-shrink-2">
              <span className="text-gray-300 mr-2">Room:</span>
              <span className="text-white font-mono">{roomId}</span>
              <button
                onClick={handleCopyRoomId}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                <FiCopy className="w-4 h-4 translate-y-0.5" />
              </button>
            </div>
            <div
              className="text-gray-400 cursor-pointer hover:opacity-80"
              onClick={() => {
                const el = document.querySelector(
                  ".settings-icon"
                ) as HTMLElement;
                el?.classList.add("animate-spin");
                setTimeout(() => {
                  el?.classList.remove("animate-spin");
                }, 500);
                setIsSettingsOpen(!isSettingsOpen);
              }}
            >
              <FiSettings size={24} className="settings-icon" />
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-500 text-white p-4 rounded-lg mb-4">
            Connecting to server...
          </div>
        )}

        {/* Video Grid */}
        <div className={`bg-black rounded-lg p-4 max-w-7xl flex flex-col gap-4 mx-auto`}>
          <div className={`${selectLayout == 'reset-layout' ? 'grid md:grid-cols-2 grid-cols-1' : 'flex flex-col '} gap-4 `}>


            {/* Local Video */}
            <div className={`aspect-video bg-gray-800 rounded-lg ${selectLayout == 'remote-user-fullscreen' ? 'absolute inset-0 opacity-0 max-h-[300px]' : 'relative'}   items-center justify-center localContainer`}>
              <video
                id="localVideo"
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className=" w-full h-full rounded-lg scale-x-[-1]" // Mirror effect for self-view
              ></video>

              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-xl">
                    {" "}
                    <FiVideoOff className="inline" />{" "}
                  </span>
                </div>
              )}

              <div className="absolute md:bottom-4 md:left-4 bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  You{" "}
                  {isMuted ? (
                    <FiMicOff className="inline" />
                  ) : (
                    <FiMic className="inline" />
                  )}
                </span>
              </div>

              {/* Loading state */}
              {!isCallActive && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}
              <div
                onClick={() => selectLayout == "user-fullscreen" ? setLayout("reset-layout") : setLayout("user-fullscreen")}
                className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full cursor-pointer text-white">
                {selectLayout == "user-fullscreen" ? <FiMinimize /> : <FiMaximize />}
              </div>


            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 md:h-full rounded-lg aspect-video flex items-center justify-center remoteContainer z-50">
              <video
                id="remoteVideo"
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full rounded-lg"
              ></video>

              {/* Waiting for remote participant */}
              {!hasRemoteUser && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="animate-pulse text-white text-center">
                    <p className="md:text-lg md:mb-4 mb-2 text-sm ">Waiting for participant...</p>
                    <p className="text-gray-400 text-sm">
                      Share the room ID to invite someone
                    </p>
                  </div>
                </div>
              )}
              <div
                onClick={() => selectLayout == "remote-user-fullscreen" ? setLayout("reset-layout") : setLayout("remote-user-fullscreen")}
                className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full cursor-pointer text-white"
              >
                {selectLayout == "remote-user-fullscreen" ? <FiMinimize /> : <FiMaximize />}
              </div>

              <div className="absolute md:bottom-4 md:left-4 bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  {hasRemoteUser ? "Remote User" : "Waiting..."}
                </span>
              </div>

              {/* Remote connection status */}
              {hasRemoteUser && !webrtcDebug.hasRemoteTrack && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                  Connecting...
                </div>
              )}
            </div>

          </div>
          {/* Controls */}
          <div className="flex justify-center md:gap-4 gap-3 items-center">
            <button
              onClick={handleToggleMute}
              title="Mute/Unmute"
              disabled={!isCallActive}
              className={`${isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-600 hover:bg-gray-700"
                } ${!isCallActive ? "opacity-50 cursor-not-allowed" : ""
                } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
            >
              {isMuted ? (
                <FiMicOff className="inline" />
              ) : (
                <FiMic className="inline" />
              )}
            </button>

            <button
              onClick={handleToggleVideo}
              disabled={!isCallActive}
              title="Video On/Off"
              className={`${isVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-600 hover:bg-gray-700"
                } ${!isCallActive ? "opacity-50 cursor-not-allowed" : ""
                } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
            >
              {isVideoOff ? (
                <FiVideoOff className="inline" />
              ) : (
                <FiVideo className="inline" />
              )}
            </button>
            <div>
              {!isMobile ?
                <button
                  title="Share Screen"
                  onClick={() => setIsScreenSharing(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
                >
                  <FiMonitor className="inline" />
                </button> :
                <button
                  title="Camera flip"
                  onClick={handleToggleBackCamera}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
                >
                  <FiRepeat className="inline" />
                </button>}

            </div>

            <button
              title="End Call"
              onClick={handleEndCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
            >
              <MdCallEnd className="inline" />
            </button>
          </div>
        </div>
        {isSettingsOpen && (
          <div className=" absolute bottom-13 right-[36%]">
            <VideoSettingModal
              isOpen={true}
              onClose={() => setIsSettingsOpen(false)}
              selectLayout={selectLayout}
              setLayout={setLayout}
              resolution={resolution}
              setResolution={setResolution}
              background={background}
              setBackground={setBackground}
            />
          </div>
        )}
        {/* Status Info */}
        <div className="max-w-6xl mx-auto mt-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-3">
              Call Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                ></div>
                <span>
                  Signaling: {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${hasRemoteUser ? "bg-green-500" : "bg-yellow-500"
                    }`}
                ></div>
                <span>Remote: {hasRemoteUser ? "Connected" : "Waiting"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${isCallActive ? "bg-green-500" : "bg-gray-500"
                    }`}
                ></div>
                <span>Media: {isCallActive ? "Active" : "Starting..."}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getQualityColor(
                    connectionQuality
                  )}`}
                ></div>
                <span>Quality: {connectionQuality}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center p-4 bg-gray-700 text-white">
        <p>© 2025 VideoConnect. All rights reserved.</p>

        <div className="flex justify-center gap-6 mt-2">
          <a
            href="mailto:hgouda244@gmail.com"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <Mail size={18} />
            <span>Email</span>
          </a>

          <a
            href="tel:6371400124"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <Phone size={18} />
            <span>Call</span>
          </a>

          <a
            href="https://www.linkedin.com/in/hara-prasad-gouda-9b458a2a9/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <Linkedin size={18} />
            <span>LinkedIn</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default VideoCallPage;
