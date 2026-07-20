import { useRef, useEffect, useCallback } from 'react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import roomBg from '../assets/room.jpg';
import beachBg from '../assets/beach_background.jpg';
import forestBg from '../assets/forest_background.jpg';

export const useBackgroundProcessing = () => {
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const processingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const stopBackgroundProcessing = useCallback(() => {
    processingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (segmentationRef.current) {
      segmentationRef.current.close();
      segmentationRef.current = null;
    }
  }, []);

  const createBlurTrack = useCallback((
    stream: MediaStream,
    background: string
  ): Promise<MediaStreamTrack> => {
    return new Promise((resolve, reject) => {
      stopBackgroundProcessing();

      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        reject(new Error('Failed to get canvas context'));
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

      if (background !== 'blur' && background !== 'none') {
        if (background === 'office-room') {
          bgImage.src = roomBg;
        } else if (background === 'beach') {
          bgImage.src = beachBg;
        } else if (background === 'forest') {
          bgImage.src = forestBg;
        }

        bgImage.onload = () => {
          bgImageLoaded = true;
        };
      } else {
        bgImageLoaded = true;
      }

      segmentation.onResults((res) => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh || !bgImageLoaded) return;

        canvas.width = vw;
        canvas.height = vh;

        ctx.clearRect(0, 0, vw, vh);

        if (background === 'blur') {
          ctx.filter = 'blur(12px)';
          ctx.drawImage(video, 0, 0, vw, vh);
          ctx.filter = 'none';
        } else if (background !== 'none') {
          ctx.drawImage(bgImage, 0, 0, vw, vh);
        } else {
          ctx.drawImage(video, 0, 0, vw, vh);
        }

        if (background !== 'none') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.drawImage(res.segmentationMask, 0, 0, vw, vh);

          ctx.globalCompositeOperation = 'destination-over';
          ctx.drawImage(video, 0, 0, vw, vh);

          ctx.globalCompositeOperation = 'source-over';
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
            console.error('Segmentation error:', error);
            stopBackgroundProcessing();
          }
        }

        if (processingRef.current) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      }

      video.onloadedmetadata = () => {
        video.play().catch(console.error);
        processingRef.current = true;
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      video.onerror = (error) => {
        console.error('Video error:', error);
        stopBackgroundProcessing();
        reject(error);
      };
    });
  }, [stopBackgroundProcessing]);

  const applyBackground = useCallback(async (
    localStream: MediaStream | null,
    peerConnection: RTCPeerConnection | null,
    background: string,
    localVideoRef: React.RefObject<HTMLVideoElement | null>
  ) => {
    if (!localStream || !peerConnection) return;

    const baseStream = localStream;
    const originalVideoTrack = baseStream.getVideoTracks()[0];

    if (!originalVideoTrackRef.current) {
      originalVideoTrackRef.current = originalVideoTrack.clone();
    }

    stopBackgroundProcessing();

    const sender = peerConnection
      .getSenders()
      .find((s) => s.track?.kind === 'video');

    let finalTrack: MediaStreamTrack;

    if (background !== 'none') {
      try {
        finalTrack = await createBlurTrack(baseStream, background);
        currentVideoTrackRef.current = finalTrack;

        const previewStream = new MediaStream([
          finalTrack,
          ...baseStream.getAudioTracks(),
        ]);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = previewStream;
        }

        if (sender) {
          await sender.replaceTrack(finalTrack);
        } else {
          peerConnection.addTrack(finalTrack, baseStream);
        }
      } catch (error) {
        console.error('Failed to apply background:', error);
        finalTrack = originalVideoTrack;
      }
    } else {
      finalTrack = originalVideoTrack;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = baseStream;
      }

      if (sender) {
        await sender.replaceTrack(originalVideoTrack);
      }
    }

    if (currentVideoTrackRef.current && currentVideoTrackRef.current !== finalTrack) {
      currentVideoTrackRef.current.stop();
    }

    currentVideoTrackRef.current = finalTrack;
  }, [createBlurTrack, stopBackgroundProcessing]);

  useEffect(() => {
    return () => {
      stopBackgroundProcessing();
    };
  }, [stopBackgroundProcessing]);

  return {
    applyBackground,
    stopBackgroundProcessing,
  };
};
