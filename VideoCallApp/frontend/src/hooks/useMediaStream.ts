import { useRef, useState, useCallback } from 'react';

interface ResolutionConstraints {
  [key: string]: MediaTrackConstraints;
}

interface ResolutionBitrates {
  [key: string]: number;
}

export const useMediaStream = () => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [resolution, setResolution] = useState('720p');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const resolutionConstraints: ResolutionConstraints = {
    '360p': { width: 320, height: 240, frameRate: { max: 10 } },
    '480p': { width: 640, height: 480, frameRate: { max: 15 } },
    '720p': { width: 1280, height: 720, frameRate: { max: 20 } },
    '1080p': { width: 1920, height: 1080 },
    '1440p': { width: 2560, height: 1440 },
    '2160p': { width: 3840, height: 2160 },
  };

  const resolutionBitrates: ResolutionBitrates = {
    '360p': 250000,
    '480p': 500000,
    '720p': 1500000,
    '1080p': 3000000,
    '1440p': 6000000,
    '2160p': 12000000,
  };

  const addDebugLog = useCallback((message: string) => {
    console.log(`🔍 ${new Date().toLocaleTimeString()}: ${message}`);
  }, []);

  const initializeMedia = useCallback(async () => {
    try {
      addDebugLog(`🔄 Auto-starting media stream with resolution: ${resolution}`);
      const constraints = resolutionConstraints[resolution] || resolutionConstraints['720p'];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsCallActive(true);
      addDebugLog('✅ Media stream initialized successfully');
      return stream;
    } catch (err) {
      console.error('❌ Failed to access media devices:', err);
      setIsVideoOff(true);
      alert('Failed to access camera and microphone. Please check permissions.');
      return null;
    }
  }, [resolution, resolutionConstraints, addDebugLog]);

  const handleToggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleToggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  const handleScreenSharing = useCallback(async (peerConnection: RTCPeerConnection | null) => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');
      
      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      screenTrack.onended = async () => {
        handleVideoSharing(peerConnection);
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, []);

  const handleVideoSharing = useCallback(async (peerConnection: RTCPeerConnection | null) => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      const sender = peerConnection
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');
      
      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }
    } catch (error) {
      console.error('Error switching to camera:', error);
    }
  }, []);

  const handleToggleBackCamera = useCallback(async (peerConnection: RTCPeerConnection | null) => {
    let backStream: MediaStream;
    try {
      const currentBackCamera = localStreamRef.current?.getVideoTracks()[0]?.getSettings().facingMode;
      
      if (currentBackCamera === 'environment') {
        backStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            sampleRate: 48000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } else {
        backStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },
        });
      }

      if (backStream) {
        const newVideoTrack = backStream.getVideoTracks()[0];
        const sender = peerConnection?.getSenders().find(
          (s) => s.track && s.track.kind === 'video'
        );
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = backStream;
        }

        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  }, []);

  const changeResolution = useCallback(async (newResolution: string, peerConnection: RTCPeerConnection | null) => {
    if (!isCallActive || !localStreamRef.current) return;

    try {
      addDebugLog(`🔄 Changing resolution to ${newResolution}...`);
      const constraints = resolutionConstraints[newResolution] || resolutionConstraints['720p'];

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (oldVideoTrack && localStreamRef.current) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      localStreamRef.current?.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }

      const sender = peerConnection
        ?.getSenders()
        .find((s) => s.track?.kind === 'video');

      if (sender) {
        await sender.replaceTrack(newVideoTrack);

        const parameters = sender.getParameters();
        if (!parameters.encodings) {
          parameters.encodings = [{}];
        }

        parameters.encodings[0].maxBitrate = resolutionBitrates[newResolution] || resolutionBitrates['720p'];
        await sender.setParameters(parameters);

        addDebugLog(`✅ Resolution updated to ${newResolution} with bitrate ${parameters.encodings[0].maxBitrate}`);
      }
    } catch (error) {
      console.error('Error changing resolution:', error);
      addDebugLog(`❌ Error changing resolution: ${error}`);
    }
  }, [isCallActive, resolutionConstraints, resolutionBitrates, addDebugLog]);

  const stopMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setIsCallActive(false);
  }, []);

  return {
    localStream: localStreamRef.current,
    localVideoRef,
    isMuted,
    isVideoOff,
    isCallActive,
    resolution,
    isScreenSharing,
    initializeMedia,
    handleToggleMute,
    handleToggleVideo,
    handleScreenSharing,
    handleVideoSharing,
    handleToggleBackCamera,
    changeResolution,
    stopMedia,
    setResolution,
    setIsScreenSharing,
  };
};
