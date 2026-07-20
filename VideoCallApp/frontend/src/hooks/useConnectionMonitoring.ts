import { useRef, useState, useCallback } from 'react';

export const useConnectionMonitoring = () => {
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVideoBytesReceivedRef = useRef<number>(0);
  const lastAudioBytesReceivedRef = useRef<number>(0);
  const lastPacketReceivedRef = useRef<number>(Date.now());

  const [connectionQuality, setConnectionQuality] = useState<string>('unknown');
  const [isMonitoring, setIsMonitoring] = useState(false);

  const addDebugLog = useCallback((message: string) => {
    console.log(`🔍 ${new Date().toLocaleTimeString()}: ${message}`);
  }, []);

  const checkTurnUsage = useCallback(async (peerConnection: RTCPeerConnection) => {
    try {
      const stats = await peerConnection.getStats();
      let turnUsed = false;
      let localCandidateType = '';
      let remoteCandidateType = '';

      stats.forEach((report) => {
        if (report.type === 'candidate-pair' && report.selected) {
          const localCandidate = stats.get(report.localCandidateId);
          if (localCandidate) {
            localCandidateType = localCandidate.candidateType || '';
            addDebugLog(`📍 Local candidate type: ${localCandidateType}`);
            if (localCandidateType === 'relay') {
              turnUsed = true;
            }
          }

          const remoteCandidate = stats.get(report.remoteCandidateId);
          if (remoteCandidate) {
            remoteCandidateType = remoteCandidate.candidateType || '';
            addDebugLog(`📍 Remote candidate type: ${remoteCandidateType}`);
          }
        }
      });

      addDebugLog(
        `🔄 TURN Server Usage: ${turnUsed ? '✅ USING TURN' : '❌ NOT using TURN'}`
      );
      addDebugLog(
        `📍 Connection type: ${localCandidateType} -> ${remoteCandidateType}`
      );
    } catch (error) {
      console.error('Error checking TURN usage:', error);
    }
  }, [addDebugLog]);

  const startConnectionMonitoring = useCallback((peerConnection: RTCPeerConnection, hasRemoteUser: boolean) => {
    if (!peerConnection || isMonitoring) return;

    addDebugLog('Starting connection monitoring...');
    setIsMonitoring(true);

    statsIntervalRef.current = setInterval(() => {
      checkConnectionHealth(peerConnection, hasRemoteUser);
    }, 3000);

    healthCheckIntervalRef.current = setInterval(() => {
      performHealthCheck(peerConnection);
    }, 5000);
  }, [isMonitoring, addDebugLog]);

  const stopConnectionMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  const checkConnectionHealth = useCallback(async (peerConnection: RTCPeerConnection, hasRemoteUser: boolean) => {
    try {
      const stats = await peerConnection.getStats();
      let videoBytesReceived = 0;
      let audioBytesReceived = 0;
      let packetsLost = 0;

      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && !report.isRemote) {
          if (report.kind === 'video') {
            videoBytesReceived = report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          } else if (report.kind === 'audio') {
            audioBytesReceived = report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          }
        }
      });

      const isReceivingVideo =
        videoBytesReceived > lastVideoBytesReceivedRef.current;
      const isReceivingAudio =
        audioBytesReceived > lastAudioBytesReceivedRef.current;

      if (isReceivingVideo || isReceivingAudio) {
        lastPacketReceivedRef.current = Date.now();
      }

      let quality = 'unknown';
      const timeSinceLastPacket = Date.now() - lastPacketReceivedRef.current;

      if (timeSinceLastPacket < 3000) {
        quality = 'excellent';
      } else if (timeSinceLastPacket < 8000) {
        quality = 'good';
      } else if (timeSinceLastPacket < 15000) {
        quality = 'poor';
      } else {
        quality = 'disconnected';
      }

      setConnectionQuality((prev) => (prev === quality ? prev : quality));

      lastVideoBytesReceivedRef.current = videoBytesReceived;
      lastAudioBytesReceivedRef.current = audioBytesReceived;

      if (timeSinceLastPacket > 10000 && hasRemoteUser) {
        addDebugLog(
          '❌ No media received for 10+ seconds - Connection may be dead'
        );
        setConnectionQuality('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection stats:', error);
    }
  }, [addDebugLog]);

  const performHealthCheck = useCallback((peerConnection: RTCPeerConnection) => {
    const connectionState = peerConnection.connectionState;
    const iceState = peerConnection.iceConnectionState;

    if (connectionState === 'failed' || iceState === 'failed') {
      addDebugLog('🔄 Connection failed, attempting to restart...');
      setConnectionQuality('disconnected');
    }
  }, [addDebugLog]);

  const handleConnectionStateChange = useCallback((state: RTCPeerConnectionState, peerConnection: RTCPeerConnection) => {
    addDebugLog(`🔗 Connection state changed: ${state}`);

    switch (state) {
      case 'connected':
        addDebugLog('✅ Peer connection established!');
        setConnectionQuality('excellent');
        checkTurnUsage(peerConnection);
        break;
      case 'disconnected':
        addDebugLog('🟡 Peer connection disconnected');
        setConnectionQuality('poor');
        break;
      case 'failed':
        addDebugLog('❌ Peer connection failed');
        setConnectionQuality('disconnected');
        stopConnectionMonitoring();
        break;
      case 'closed':
        addDebugLog('🔴 Peer connection closed');
        setConnectionQuality('disconnected');
        stopConnectionMonitoring();
        break;
      case 'connecting':
        addDebugLog('🔄 Peer connection connecting...');
        setConnectionQuality('unknown');
        break;
    }
  }, [addDebugLog, checkTurnUsage, stopConnectionMonitoring]);

  const handleICEConnectionStateChange = useCallback((state: RTCIceConnectionState, createOffer: () => void) => {
    addDebugLog(`❄️ ICE connection state: ${state}`);

    if (state === 'connected') {
      addDebugLog('🎉 ICE connected successfully!');
    } else if (state === 'failed') {
      addDebugLog('❌ ICE connection failed');
      setTimeout(() => {
        createOffer();
      }, 2000);
    }
  }, [addDebugLog]);

  const handleSignalingStateChange = useCallback((state: RTCSignalingState) => {
    addDebugLog(`📶 Signaling state: ${state}`);
  }, [addDebugLog]);

  return {
    connectionQuality,
    isMonitoring,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    handleConnectionStateChange,
    handleICEConnectionStateChange,
    handleSignalingStateChange,
    checkTurnUsage,
  };
};
