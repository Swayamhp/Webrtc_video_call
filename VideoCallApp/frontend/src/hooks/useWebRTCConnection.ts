import { useRef, useState, useCallback } from 'react';

interface WebRTCDebug {
  hasRemoteTrack: boolean;
}

export const useWebRTCConnection = (rtcConfig: RTCConfiguration) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [webrtcDebug, setWebrtcDebug] = useState<WebRTCDebug>({
    hasRemoteTrack: false,
  });

  const addDebugLog = useCallback((message: string) => {
    console.log(`🔍 ${new Date().toLocaleTimeString()}: ${message}`);
  }, []);

  const createPeerConnection = useCallback((
    localStream: MediaStream | null,
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>,
    onIceCandidate: (candidate: RTCIceCandidateInit) => void,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void,
    onICEConnectionStateChange?: (state: RTCIceConnectionState) => void,
    onSignalingStateChange?: (state: RTCSignalingState) => void,
    onAnswerCreated?: (answer: RTCSessionDescriptionInit) => void
  ): RTCPeerConnection => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    addDebugLog('🔄 Creating peer connection with enhanced logging');
    const peerConnection = new RTCPeerConnection(rtcConfig);

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
        addDebugLog(`➕ Added local ${track.kind} track: ${track.id}`);
      });
    }

    peerConnection.ontrack = (event) => {
      addDebugLog(
        `📹 Received remote track: ${event.track.kind} (${event.streams.length} streams)`
      );

      if (event.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setWebrtcDebug((prev) => ({ ...prev, hasRemoteTrack: true }));
        addDebugLog('✅ Remote video stream set successfully');

        remoteVideoRef.current.onloadedmetadata = () => {
          addDebugLog('🎥 Remote video metadata loaded');
        };

        remoteVideoRef.current.onplay = () => {
          addDebugLog('▶️ Remote video started playing');
        };
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDebugLog(
          `🧊 ICE candidate: ${event.candidate.type} - ${event.candidate.protocol}`
        );

        if (event.candidate.type === 'relay') {
          addDebugLog('✅ TURN server is being used!');
        }

        onIceCandidate(event.candidate);
      } else {
        addDebugLog('✅ All ICE candidates gathered');
      }
    };

    peerConnection.onicegatheringstatechange = () => {
      const state = peerConnection.iceGatheringState;
      addDebugLog(`🧊 ICE gathering state: ${state}`);
    };

    if (onConnectionStateChange) {
      peerConnection.onconnectionstatechange = () => {
        onConnectionStateChange(peerConnection.connectionState);
      };
    }

    if (onICEConnectionStateChange) {
      peerConnection.oniceconnectionstatechange = () => {
        onICEConnectionStateChange(peerConnection.iceConnectionState);
      };
    }

    if (onSignalingStateChange) {
      peerConnection.onsignalingstatechange = () => {
        onSignalingStateChange(peerConnection.signalingState);
      };
    }

    peerConnection.onnegotiationneeded = async () => {
      addDebugLog('🤝 Negotiation needed, creating offer...');
      // This will be handled by the parent component
    };

    peerConnectionRef.current = peerConnection;
    addDebugLog('✅ Peer connection created successfully');

    // Process pending offer if one was queued before PC was created
    if (pendingOfferRef.current) {
      const offer = pendingOfferRef.current;
      pendingOfferRef.current = null;

      (async () => {
        try {
          addDebugLog('📥 Processing queued offer...');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          addDebugLog('✅ Remote description set from queued offer');

          if (iceCandidateQueueRef.current.length > 0) {
            const queue = [...iceCandidateQueueRef.current];
            iceCandidateQueueRef.current = [];
            for (const candidate of queue) {
              await peerConnection.addIceCandidate(candidate);
            }
          }

          const answer = await peerConnection.createAnswer();
          addDebugLog('✅ Answer created from queued offer');
          await peerConnection.setLocalDescription(answer);
          addDebugLog('✅ Local description set from queued offer');

          if (onAnswerCreated) {
            onAnswerCreated(answer);
          }
        } catch (error) {
          addDebugLog(`❌ Error processing queued offer: ${error}`);
        }
      })();
    }

    return peerConnection;
  }, [rtcConfig, addDebugLog]);

  const createOffer = useCallback(async (socketEmit: (data: { roomId: string; offer: RTCSessionDescriptionInit }) => void, roomId: string) => {
    if (!peerConnectionRef.current) {
      addDebugLog('❌ No peer connection when trying to create offer');
      return;
    }

    if (isMakingOffer) {
      addDebugLog('⏳ Already making an offer, skipping...');
      return;
    }

    try {
      setIsMakingOffer(true);
      addDebugLog('📤 Creating offer...');

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);
      addDebugLog('✅ Local description set');

      socketEmit({ roomId, offer });
      addDebugLog('✅ Offer sent via socket');
    } catch (error) {
      addDebugLog(`❌ Error creating offer: ${error}`);
      console.error('Error creating offer:', error);
    } finally {
      setIsMakingOffer(false);
    }
  }, [isMakingOffer, addDebugLog]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    addDebugLog('📥 Handling offer from remote user');

    if (!peerConnectionRef.current) {
      addDebugLog('📥 Queuing offer - no peer connection yet');
      pendingOfferRef.current = offer;
      return;
    }

    const peerConnection = peerConnectionRef.current;

    try {
      if (isMakingOffer || peerConnection.signalingState !== 'stable') {
        addDebugLog('🚫 Ignoring offer - already making offer or not stable');
        return;
      }

      addDebugLog('🔧 Setting remote description (offer)...');
      await peerConnection.setRemoteDescription(offer);
      addDebugLog('✅ Remote description set');

      processQueuedICECandidates();

      addDebugLog('📤 Creating answer...');
      const answer = await peerConnection.createAnswer();
      addDebugLog('✅ Answer created');

      await peerConnection.setLocalDescription(answer);
      addDebugLog('✅ Local description set for answer');

      return answer;
    } catch (error) {
      addDebugLog(`❌ Error handling offer: ${error}`);
      console.error('Error handling offer:', error);
      return null;
    }
  }, [isMakingOffer, addDebugLog]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      addDebugLog('❌ No peer connection when handling answer');
      return;
    }

    const peerConnection = peerConnectionRef.current;
    addDebugLog('📥 Handling answer');

    try {
      if (peerConnection.signalingState === 'have-local-offer') {
        addDebugLog('🔧 Setting remote description (answer)...');
        await peerConnection.setRemoteDescription(answer);
        addDebugLog('✅ Remote description set successfully');

        processQueuedICECandidates();
      } else {
        addDebugLog(
          `⚠️ Cannot set remote answer in current state: ${peerConnection.signalingState}`
        );
      }
    } catch (error) {
      addDebugLog(`❌ Error handling answer: ${error}`);
      console.error('Error handling answer:', error);
    }
  }, [addDebugLog]);

  const processQueuedICECandidates = useCallback(async () => {
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
        addDebugLog('✅ Queued ICE candidate added successfully');
      } catch (error) {
        addDebugLog(`❌ Error adding queued ICE candidate: ${error}`);
      }
    }
  }, [addDebugLog]);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      addDebugLog('❌ No peer connection when handling ICE candidate');
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    if (!peerConnection.remoteDescription) {
      addDebugLog('⏳ Queuing ICE candidate - no remote description');
      iceCandidateQueueRef.current.push(candidate);
      return;
    }

    try {
      addDebugLog('🧊 Adding ICE candidate...');
      await peerConnection.addIceCandidate(candidate);
      addDebugLog('✅ ICE candidate added successfully');
    } catch (error) {
      addDebugLog(`❌ Error adding ICE candidate: ${error}`);
    }
  }, [addDebugLog]);

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      addDebugLog('🔴 Closing peer connection');
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setWebrtcDebug({
      hasRemoteTrack: false,
    });
    iceCandidateQueueRef.current = [];
    pendingOfferRef.current = null;
    setIsMakingOffer(false);
  }, [addDebugLog]);

  const replaceTrack = useCallback((track: MediaStreamTrack) => {
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track?.kind === track.kind);
    
    if (sender) {
      return sender.replaceTrack(track);
    }
    
    return null;
  }, []);

  const getPeerConnection = useCallback(() => peerConnectionRef.current, []);

  return {
    peerConnection: peerConnectionRef.current,
    getPeerConnection,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    replaceTrack,
    webrtcDebug,
    isMakingOffer,
  };
};
