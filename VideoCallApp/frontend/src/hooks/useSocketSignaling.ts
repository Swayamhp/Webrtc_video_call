import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

interface UseSocketSignalingProps {
  roomId: string | undefined;
  userId: string;
  onConnect: () => void;
  onConnectError: (error: Error) => void;
  onDisconnect: (reason: string) => void;
  onUserConnected: () => void;
  onUserDisconnected: () => void;
  onOffer: (data: { offer: RTCSessionDescriptionInit; from: string }) => void;
  onAnswer: (data: { answer: RTCSessionDescriptionInit; from: string }) => void;
  onIceCandidate: (data: { candidate: RTCIceCandidateInit; from: string }) => void;
  onRoomFull: () => void;
}

export const useSocketSignaling = ({
  roomId,
  userId,
  onConnect,
  onConnectError,
  onDisconnect,
  onUserConnected,
  onUserDisconnected,
  onOffer,
  onAnswer,
  onIceCandidate,
  onRoomFull,
}: UseSocketSignalingProps) => {
  const socketRef = useRef<Socket | null>(null);

  const callbacksRef = useRef({
    onConnect,
    onConnectError,
    onDisconnect,
    onUserConnected,
    onUserDisconnected,
    onOffer,
    onAnswer,
    onIceCandidate,
    onRoomFull,
  });

  callbacksRef.current = {
    onConnect,
    onConnectError,
    onDisconnect,
    onUserConnected,
    onUserDisconnected,
    onOffer,
    onAnswer,
    onIceCandidate,
    onRoomFull,
  };

  const addDebugLog = useCallback((message: string) => {
    console.log(`🔍 ${new Date().toLocaleTimeString()}: ${message}`);
  }, []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SIGNALING_SERVER_URL;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      addDebugLog('✅ Connected to signaling server');
      callbacksRef.current.onConnect();

      if (roomId) {
        addDebugLog(`🚪 Joining room: ${roomId}`);
        socket.emit('join-room', roomId, userId);
      }
    });

    socket.on('connect_error', (error) => {
      addDebugLog(`❌ Socket connection error: ${error.message}`);
      callbacksRef.current.onConnectError(error);
    });

    socket.on('disconnect', (reason) => {
      addDebugLog(`🔴 Disconnected from signaling server: ${reason}`);
      callbacksRef.current.onDisconnect(reason);
    });

    socket.on('user-connected', (remoteUserId: string) => {
      addDebugLog(`👤 Remote user connected: ${remoteUserId}`);
      callbacksRef.current.onUserConnected();
    });

    socket.on('user-disconnected', () => {
      addDebugLog('👤 Remote user disconnected');
      callbacksRef.current.onUserDisconnected();
    });

    socket.on(
      'offer',
      (data: { offer: RTCSessionDescriptionInit; from: string }) => {
        addDebugLog(`📥 Received offer from: ${data.from}`);
        callbacksRef.current.onOffer(data);
      }
    );

    socket.on(
      'answer',
      (data: { answer: RTCSessionDescriptionInit; from: string }) => {
        addDebugLog(`📥 Received answer from: ${data.from}`);
        callbacksRef.current.onAnswer(data);
      }
    );

    socket.on(
      'ice-candidate',
      (data: { candidate: RTCIceCandidateInit; from: string }) => {
        addDebugLog(`🧊 Received ICE candidate from: ${data.from}`);
        callbacksRef.current.onIceCandidate(data);
      }
    );

    socket.on('room-full', () => {
      addDebugLog('⚠️ Room is full');
      callbacksRef.current.onRoomFull();
    });

    return () => {
      addDebugLog('🧹 Cleaning up socket connection...');
      socket.disconnect();
    };
  }, [roomId, userId, addDebugLog]);

  const emitOffer = useCallback((data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
    if (socketRef.current) {
      socketRef.current.emit('offer', data);
      addDebugLog('✅ Offer sent via socket');
    }
  }, [addDebugLog]);

  const emitAnswer = useCallback((data: { roomId: string; answer: RTCSessionDescriptionInit; from: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('answer', data);
      addDebugLog('✅ Answer sent via socket');
    }
  }, [addDebugLog]);

  const emitIceCandidate = useCallback((data: { roomId: string; candidate: RTCIceCandidateInit }) => {
    if (socketRef.current) {
      socketRef.current.emit('ice-candidate', data);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    socket: socketRef.current,
    emitOffer,
    emitAnswer,
    emitIceCandidate,
    disconnect,
  };
};
