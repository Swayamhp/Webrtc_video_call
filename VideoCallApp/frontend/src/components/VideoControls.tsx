import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiRepeat } from 'react-icons/fi';
import { MdCallEnd } from 'react-icons/md';

interface VideoControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isCallActive: boolean;
  isMobile: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
  onToggleBackCamera: () => void;
  onEndCall: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isMuted,
  isVideoOff,
  isCallActive,
  isMobile,
  onToggleMute,
  onToggleVideo,
  onScreenShare,
  onToggleBackCamera,
  onEndCall,
}) => {
  return (
    <div className="flex justify-center md:gap-4 gap-3 items-center">
      <button
        onClick={onToggleMute}
        title="Mute/Unmute"
        disabled={!isCallActive}
        className={`${
          isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
        } ${
          !isCallActive ? 'opacity-50 cursor-not-allowed' : ''
        } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
      >
        {isMuted ? <FiMicOff className="inline" /> : <FiMic className="inline" />}
      </button>

      <button
        onClick={onToggleVideo}
        disabled={!isCallActive}
        title="Video On/Off"
        className={`${
          isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
        } ${
          !isCallActive ? 'opacity-50 cursor-not-allowed' : ''
        } text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200`}
      >
        {isVideoOff ? <FiVideoOff className="inline" /> : <FiVideo className="inline" />}
      </button>

      <div>
        {!isMobile ? (
          <button
            title="Share Screen"
            onClick={onScreenShare}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
          >
            <FiMonitor className="inline" />
          </button>
        ) : (
          <button
            title="Camera flip"
            onClick={onToggleBackCamera}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
          >
            <FiRepeat className="inline" />
          </button>
        )}
      </div>

      <button
        title="End Call"
        onClick={onEndCall}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition duration-200"
      >
        <MdCallEnd className="inline" />
      </button>
    </div>
  );
};
