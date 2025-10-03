
import React, { useState } from 'react';

interface GenerateIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
}

const GenerateIdModal: React.FC<GenerateIdModalProps> = ({ 
  isOpen, 
  onClose, 
  onJoinRoom 
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'input'>('generate');
  const [inputRoomId, setInputRoomId] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  // Generate random room ID
  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedRoomId(newRoomId);
    return newRoomId;
  };

  // Handle generate room
  const handleGenerateRoom = () => {
    const roomId = generatedRoomId || generateRoomId();
    onJoinRoom(roomId);
    resetForm();
  };

  // Handle join with input room ID
  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      onJoinRoom(inputRoomId.trim());
      resetForm();
    }
  };

  // Reset form state
  const resetForm = () => {
    setInputRoomId('');
    setGeneratedRoomId('');
  };

  // Close modal and reset
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Generate initial room ID when modal opens
  React.useEffect(() => {
    if (isOpen && activeTab === 'generate' && !generatedRoomId) {
      generateRoomId();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Join Video Call</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              activeTab === 'generate'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('generate')}
          >
            Create Room
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              activeTab === 'input'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('input')}
          >
            Join Room
          </button>
        </div>

        {/* Generate Room Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={generatedRoomId}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  placeholder="Click generate to create room ID"
                />
                <button
                  onClick={generateRoomId}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this ID with others to join your room
              </p>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRoom}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={!generatedRoomId}
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {/* Input Room ID Tab */}
        {activeTab === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Room ID
              </label>
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room ID provided by host"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom();
                  }
                }}
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={!inputRoomId.trim()}
              >
                Join Room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateIdModal;