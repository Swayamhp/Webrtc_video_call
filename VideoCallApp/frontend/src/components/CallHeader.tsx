import React from 'react';
import { FiCopy, FiSettings, FiShare2 } from 'react-icons/fi';
import VideoConnectLogo from './VideoConnectLogo';

interface CallHeaderProps {
  roomId: string | undefined;
  isConnected: boolean;
  onCopyRoomId: () => void;
  onShare: () => void;
  onToggleSettings: () => void;
}

export const CallHeader: React.FC<CallHeaderProps> = ({
  roomId,
  isConnected,
  onCopyRoomId,
  onShare,
  onToggleSettings,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center space-x-4">
        <VideoConnectLogo
          width={150}
          height={40}
          className="opacity-80 hidden md:block"
        />
      </div>

      <div className="flex items-center gap-4">
        <div title="Share Room Url" onClick={onShare} className="cursor-pointer">
          <FiShare2 className="w-6 h-6 text-gray-400 hover:text-gray-500" />
        </div>
        <div
          className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        ></div>
        <div className="bg-gray-800 md:px-4 px-2 py-2 rounded-lg flex-shrink-2">
          <span className="text-gray-300 mr-2">Room:</span>
          <span className="text-white font-mono">{roomId}</span>
          <button
            onClick={onCopyRoomId}
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            <FiCopy className="w-4 h-4 translate-y-0.5" />
          </button>
        </div>
        <div
          className="text-gray-400 cursor-pointer hover:opacity-80"
          onClick={() => {
            const el = document.querySelector('.settings-icon') as HTMLElement;
            el?.classList.add('animate-spin');
            setTimeout(() => {
              el?.classList.remove('animate-spin');
            }, 500);
            onToggleSettings();
          }}
        >
          <FiSettings size={24} className="settings-icon" />
        </div>
      </div>
    </div>
  );
};
