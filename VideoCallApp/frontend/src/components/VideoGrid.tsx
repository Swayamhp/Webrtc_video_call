import React from 'react';
import { FiVideoOff, FiMic, FiMicOff, FiMaximize, FiMinimize } from 'react-icons/fi';

interface VideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  isVideoOff: boolean;
  isMuted: boolean;
  isCallActive: boolean;
  hasRemoteUser: boolean;
  webrtcDebug: { hasRemoteTrack: boolean };
  selectLayout: string;
  setLayout: (layout: string) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localVideoRef,
  remoteVideoRef,
  isVideoOff,
  isMuted,
  isCallActive,
  hasRemoteUser,
  webrtcDebug,
  selectLayout,
  setLayout,
}) => {
  return (
    <div className={`${selectLayout == 'reset-layout' ? 'grid md:grid-cols-2 grid-cols-1' : 'flex flex-col '} gap-4 `}>
      {/* Local Video */}
      <div className={`aspect-video bg-gray-800 rounded-lg ${selectLayout == 'remote-user-fullscreen' ? 'absolute inset-0 opacity-0 max-h-[300px]' : 'relative'} items-center justify-center localContainer`}>
        <video
          id="localVideo"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full rounded-lg"
        ></video>

        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <span className="text-white text-xl">
              {' '}
              <FiVideoOff className="inline" />{' '}
            </span>
          </div>
        )}

        <div className="absolute md:bottom-4 md:left-4 bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
          <span className="text-white text-sm">
            You{' '}
            {isMuted ? (
              <FiMicOff className="inline" />
            ) : (
              <FiMic className="inline" />
            )}
          </span>
        </div>

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

        {hasRemoteUser && !webrtcDebug.hasRemoteTrack && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
            Connecting...
          </div>
        )}
      </div>
    </div>
  );
};
