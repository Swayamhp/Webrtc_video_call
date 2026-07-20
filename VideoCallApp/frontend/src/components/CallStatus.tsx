import React from 'react';

interface CallStatusProps {
  isConnected: boolean;
  hasRemoteUser: boolean;
  isCallActive: boolean;
  connectionQuality: string;
}

export const CallStatus: React.FC<CallStatusProps> = ({
  isConnected,
  hasRemoteUser,
  isCallActive,
  connectionQuality,
}) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-green-400';
      case 'poor':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">
          Call Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span>
              Signaling: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${hasRemoteUser ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></div>
            <span>Remote: {hasRemoteUser ? 'Connected' : 'Waiting'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-gray-500'}`}
            ></div>
            <span>Media: {isCallActive ? 'Active' : 'Starting...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getQualityColor(connectionQuality)}`}
            ></div>
            <span>Quality: {connectionQuality}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
