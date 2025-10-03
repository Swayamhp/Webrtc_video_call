// pages/VideoCallPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";

// Connection monitoring interface
// interface ConnectionStats {
//   videoBytesReceived: number;
//   videoBytesSent: number;
//   audioBytesReceived: number;
//   audioBytesSent: number;
//   packetsLost: number;
//   lastPacketReceived: number;
// }

interface WebRtcDebug {
  pcCreated: boolean;
  localDescriptionSet: boolean;
  remoteDescriptionSet: boolean;
  iceGatheringState: string;
  iceConnectionState: string;
  signalingState: string;
  hasRemoteTrack: boolean;
  connectionState: string;
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
  // const [isIgnoringOffer, setIsIgnoringOffer] = useState(false);
  const [userId] = useState(
    () => `user-${Math.random().toString(36).substr(2, 9)}`
  );

  // // Enhanced connection monitoring state
  // const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");
  // const [iceConnectionStatus, setIceConnectionStatus] = useState<string>("new");
  // const [signalingStatus, setSignalingStatus] = useState<string>("stable");
  // const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
  //   videoBytesReceived: 0,
  //   videoBytesSent: 0,
  //   audioBytesReceived: 0,
  //   audioBytesSent: 0,
  //   packetsLost: 0,
  //   lastPacketReceived: Date.now(),
  // });
  const [connectionQuality, setConnectionQuality] = useState<string>("unknown");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webrtcDebug, setWebrtcDebug] = useState<WebRtcDebug>({
    pcCreated: false,
    localDescriptionSet: false,
    remoteDescriptionSet: false,
    iceGatheringState: 'new',
    iceConnectionState: 'new',
    signalingState: 'stable',
    hasRemoteTrack: false,
    connectionState: 'new'
  });

  // Enhanced WebRTC Configuration
  const rtcConfig :RTCConfiguration= {
    iceServers: [
      // Primary STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
      // Your Metered.ca TURN servers
      // {
      //   urls: "turn:in.relay.metered.ca:80",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "turn:in.relay.metered.ca:443",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "turns:in.relay.metered.ca:443?transport=tcp",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "stun:stun.relay.metered.ca:80",
      // },
      // {
      //   urls: "turn:in.relay.metered.ca:80",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "turn:in.relay.metered.ca:80?transport=tcp",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "turn:in.relay.metered.ca:443",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      // {
      //   urls: "turns:in.relay.metered.ca:443?transport=tcp",
      //   username: "b42da29201cf149bcd63bb44",
      //   credential: "ATmIroK5eNTrT6Ae",
      // },
      
      // Fallback TURN servers
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443'
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: [
        'turn:numb.viagenie.ca:3478',
        'turn:numb.viagenie.ca:3478?transport=tcp'
      ],
      credential: 'muazkh',
      username: 'webrtc@live.com'
    },
    {
      urls: 'turn:relay1.expressturn.com:3478',
      username: 'efSNdhS61TZR72ZR6h',
      credential: 'D5DZj4qEeJ4Z6BZz'
    }
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Connection monitoring refs
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVideoBytesReceivedRef = useRef<number>(0);
  const lastAudioBytesReceivedRef = useRef<number>(0);
  const lastPacketReceivedRef = useRef<number>(Date.now());

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
      let localCandidateType = '';
      let remoteCandidateType = '';
      
      stats.forEach(report => {
        if (report.type === 'candidate-pair' && report.selected) {
          // Get local candidate details
          const localCandidate = stats.get(report.localCandidateId);
          if (localCandidate) {
            localCandidateType = localCandidate.candidateType;
            addDebugLog(`📍 Local candidate type: ${localCandidateType}`);
            if (localCandidateType === 'relay') {
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
      
      addDebugLog(`🔄 TURN Server Usage: ${turnUsed ? '✅ USING TURN' : '❌ NOT using TURN'}`);
      addDebugLog(`📍 Connection type: ${localCandidateType} -> ${remoteCandidateType}`);
      
    } catch (error) {
      console.error('Error checking TURN usage:', error);
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

        if (report.type === "outbound-rtp" && !report.isRemote) {
          if (report.kind === "video") {
            // videoBytesSent = report.bytesSent || 0;
          } else if (report.kind === "audio") {
            // audioBytesSent = report.bytesSent || 0;
          }
        }
      });

      // Check if we're receiving data
      const isReceivingVideo = videoBytesReceived > lastVideoBytesReceivedRef.current;
      const isReceivingAudio = audioBytesReceived > lastAudioBytesReceivedRef.current;

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
      // setConnectionStats({
      //   videoBytesReceived,
      //   videoBytesSent,
      //   audioBytesReceived,
      //   audioBytesSent,
      //   packetsLost,
      //   lastPacketReceived: lastPacketReceivedRef.current,
      // });

      lastVideoBytesReceivedRef.current = videoBytesReceived;
      lastAudioBytesReceivedRef.current = audioBytesReceived;

      // Check for prolonged silence
      if (timeSinceLastPacket > 10000 && hasRemoteUser) {
        addDebugLog("❌ No media received for 10+ seconds - Connection may be dead");
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
    // setConnectionStatus("failed");
    setConnectionQuality("disconnected");
  };

  // Enhanced connection state handlers
  const handleConnectionStateChange = () => {
    if (!peerConnectionRef.current) return;

    const state = peerConnectionRef.current.connectionState;
    addDebugLog(`🔗 Connection state changed: ${state}`);
    // setConnectionStatus(state);
    // setWebrtcDebug(prev => ({ ...prev, connectionState: state }));

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
    // setIceConnectionStatus(state);
    setWebrtcDebug(prev => ({ ...prev, iceConnectionState: state }));

    if (state === 'connected') {
      addDebugLog("🎉 ICE connected successfully!");
    } else if (state === 'failed') {
      addDebugLog("❌ ICE connection failed");
      setTimeout(() => {
        if (peerConnectionRef.current?.iceConnectionState === 'failed') {
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
    // setSignalingStatus(state);
    setWebrtcDebug(prev => ({ ...prev, signalingState: state }));
  };

  // Check if video call is actively transmitting media
  // const isVideoCallActive = (): boolean => {
  //   return (
  //     connectionStatus === "connected" &&
  //     iceConnectionStatus === "connected" &&
  //     connectionQuality !== "disconnected"
  //   );
  // };

  // Initialize Media Stream - AUTO START
  const initializeMedia = async () => {
    try {
      addDebugLog("🔄 Auto-starting media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      localStreamRef.current = stream;

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
      alert("Failed to access camera and microphone. Please check permissions.");
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
      addDebugLog(`📹 Received remote track: ${event.track.kind} (${event.streams.length} streams)`);
      
      if (event.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setWebrtcDebug(prev => ({ ...prev, hasRemoteTrack: true }));
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
        addDebugLog(`🧊 ICE candidate: ${event.candidate.type} - ${event.candidate.protocol}`);
        
        // Check for relay candidates (TURN)
        if (event.candidate.type === 'relay') {
          addDebugLog("✅ TURN server is being used!");
        }
        
        if (socketRef.current) {
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
      setWebrtcDebug(prev => ({ ...prev, iceGatheringState: state }));
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

    setWebrtcDebug(prev => ({ ...prev, pcCreated: true }));
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
        offerToReceiveVideo: true
      });
      addDebugLog(`✅ Offer created: ${offer.type}`);

      await peerConnectionRef.current.setLocalDescription(offer);
      setWebrtcDebug(prev => ({ ...prev, localDescriptionSet: true }));
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
        if (peerConnectionRef.current?.iceConnectionState !== 'connected') {
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
        // setIsIgnoringOffer(true);
        return;
      }

      // setIsIgnoringOffer(false);
      addDebugLog("🔧 Setting remote description (offer)...");

      await peerConnection.setRemoteDescription(offer);
      setWebrtcDebug(prev => ({ ...prev, remoteDescriptionSet: true }));
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
        setWebrtcDebug(prev => ({ ...prev, remoteDescriptionSet: true }));
        addDebugLog("✅ Remote description set successfully");

        processQueuedICECandidates();
      } else {
        addDebugLog(`⚠️ Cannot set remote answer in current state: ${peerConnection.signalingState}`);
      }
    } catch (error) {
      addDebugLog(`❌ Error handling answer: ${error}`);
      console.error("Error handling answer:", error);
    }
  };

  // Process queued ICE candidates
  const processQueuedICECandidates = async () => {
    if (!peerConnectionRef.current || iceCandidateQueueRef.current.length === 0) return;

    addDebugLog(`🔧 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates...`);
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
    console.log("Socket url is ***************8888",socketUrl);
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
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

    // WebRTC Signaling Events
    socket.on("user-connected", (remoteUserId: string) => {
      addDebugLog(`👤 Remote user connected: ${remoteUserId}`);
      setHasRemoteUser(true);
      
      // If we already have media and peer connection, create offer
      if (localStreamRef.current && peerConnectionRef.current) {
        addDebugLog("🤝 Creating offer for new user");
        createOffer();
      }
    });

    socket.on("user-disconnected", () => {
      addDebugLog("👤 Remote user disconnected");
      setHasRemoteUser(false);
    });

    socket.on("offer", async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      addDebugLog(`📥 Received offer from: ${data.from}`);
      setHasRemoteUser(true);
      await handleOffer(data.offer);
    });

    socket.on("answer", async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      addDebugLog(`📥 Received answer from: ${data.from}`);
      await handleAnswer(data.answer);
    });

    socket.on("ice-candidate", async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      addDebugLog(`🧊 Received ICE candidate from: ${data.from}`);
      await handleIceCandidate(data.candidate);
    });

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
    // setIsIgnoringOffer(false);
    // setConnectionStatus("closed");
    // setIceConnectionStatus("closed");
    setConnectionQuality("disconnected");
    setWebrtcDebug({
      pcCreated: false,
      localDescriptionSet: false,
      remoteDescriptionSet: false,
      iceGatheringState: 'new',
      iceConnectionState: 'new',
      signalingState: 'stable',
      hasRemoteTrack: false,
      connectionState: 'new'
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
    alert("Room ID copied to clipboard!");
  };

  // Manual reconnection for debugging
  const handleForceReconnect = () => {
    addDebugLog("🔄 Manual reconnection triggered");
    closePeerConnection();
    setTimeout(() => {
      initializeMedia();
    }, 1000);
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

  // Get connection status color
  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "connected":
  //       return "bg-green-500";
  //     case "connecting":
  //       return "bg-yellow-500";
  //     case "disconnected":
  //       return "bg-yellow-500";
  //     case "failed":
  //       return "bg-red-500";
  //     case "closed":
  //       return "bg-gray-500";
  //     default:
  //       return "bg-gray-500";
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">VideoConnect</h1>
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-gray-300 mr-2">Room:</span>
              <span className="text-white font-mono">{roomId}</span>
              <button
                onClick={handleCopyRoomId}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-500 text-white p-4 rounded-lg mb-4">
            Connecting to server...
          </div>
        )}

        {hasRemoteUser && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
            Remote user joined the call!
          </div>
        )}

        {/* Enhanced Debug Panel */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-white text-lg font-semibold mb-3">WebRTC Debug Panel</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-white text-xs">
            <div className={`p-2 rounded ${webrtcDebug.pcCreated ? 'bg-green-500' : 'bg-red-500'}`}>
              PC Created: {webrtcDebug.pcCreated ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${webrtcDebug.localDescriptionSet ? 'bg-green-500' : 'bg-red-500'}`}>
              Local Desc: {webrtcDebug.localDescriptionSet ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${webrtcDebug.remoteDescriptionSet ? 'bg-green-500' : 'bg-red-500'}`}>
              Remote Desc: {webrtcDebug.remoteDescriptionSet ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${webrtcDebug.hasRemoteTrack ? 'bg-green-500' : 'bg-red-500'}`}>
              Remote Track: {webrtcDebug.hasRemoteTrack ? '✅' : '❌'}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-white text-xs">
            <div>ICE State: <span className="font-mono">{webrtcDebug.iceConnectionState}</span></div>
            <div>Signaling: <span className="font-mono">{webrtcDebug.signalingState}</span></div>
            <div>Gathering: <span className="font-mono">{webrtcDebug.iceGatheringState}</span></div>
            <div>Connection: <span className="font-mono">{webrtcDebug.connectionState}</span></div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={checkTurnUsage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Check TURN Usage
            </button>
            <button
              onClick={handleForceReconnect}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
            >
              Force Reconnect
            </button>
            <button
              onClick={createOffer}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Create Offer
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="bg-black rounded-lg p-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              ></video>

              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-xl">Video Off</span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  You {isMuted ? "🔇" : "🎤"}
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
            </div>

            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
              ></video>

              {/* Waiting for remote participant */}
              {!hasRemoteUser && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="animate-pulse text-white text-center">
                    <p className="text-lg mb-4">Waiting for participant...</p>
                    <p className="text-gray-400 text-sm">
                      Share the room ID to invite someone
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
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
          <div className="flex justify-center gap-4">
            <button
              onClick={handleToggleMute}
              disabled={!isCallActive}
              className={`${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-600 hover:bg-gray-700"
              } ${
                !isCallActive ? "opacity-50 cursor-not-allowed" : ""
              } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
            >
              {isMuted ? "🔇" : "🎤"} {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={handleToggleVideo}
              disabled={!isCallActive}
              className={`${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-600 hover:bg-gray-700"
              } ${
                !isCallActive ? "opacity-50 cursor-not-allowed" : ""
              } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
            >
              {isVideoOff ? "📷 Off" : "📹 On"}
            </button>

            <button
              onClick={handleEndCall}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
            >
              📞 End Call
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="max-w-6xl mx-auto mt-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-3">
              Call Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>Signaling: {isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    hasRemoteUser ? "bg-green-500" : "bg-yellow-500"
                  }`}
                ></div>
                <span>Remote: {hasRemoteUser ? "Connected" : "Waiting"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isCallActive ? "bg-green-500" : "bg-gray-500"
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
    </div>
  );
};

export default VideoCallPage;