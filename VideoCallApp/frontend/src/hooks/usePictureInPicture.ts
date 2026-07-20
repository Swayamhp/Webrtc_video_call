import { useCallback, useEffect } from 'react';

export const usePictureInPicture = (
  selectLayout: string,
  setLayout: (layout: string) => void
) => {
  const handleLayout = useCallback(async () => {
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    const remoteContainer = document.querySelector('.remoteContainer') as HTMLElement;
    const localContainer = document.querySelector('.localContainer') as HTMLElement;

    if (!localVideo || !remoteVideo) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }

      remoteContainer?.classList.remove('hidden');
      localContainer?.classList.remove('hidden');

      if (selectLayout === 'user-fullscreen') {
        localVideo.className = 'w-full h-full';
        remoteContainer?.classList.add('hidden');
        await remoteVideo.requestPictureInPicture();
      } else if (selectLayout === 'remote-user-fullscreen') {
        remoteVideo.className = 'w-full h-full';
        await localVideo.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, [selectLayout]);

  useEffect(() => {
    handleLayout();
  }, [handleLayout]);

  useEffect(() => {
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;

    const handlePiPExit = () => setLayout('reset-layout');

    localVideo?.addEventListener('leavepictureinpicture', handlePiPExit);
    remoteVideo?.addEventListener('leavepictureinpicture', handlePiPExit);

    return () => {
      localVideo?.removeEventListener('leavepictureinpicture', handlePiPExit);
      remoteVideo?.removeEventListener('leavepictureinpicture', handlePiPExit);
    };
  }, [setLayout]);
};
