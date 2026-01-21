import React, { useState, useEffect } from 'react';

interface GenerateIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, callType: 'private' | 'group' | undefined) => void;
  setCallType: (type: 'private' | 'group') => void;
  callType?: 'private' | 'group';
}

const GenerateIdModal: React.FC<GenerateIdModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  setCallType,
  callType
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'input'>('generate');
  const [inputRoomId, setInputRoomId] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedRoomId(newRoomId);
    return newRoomId;
  };

  const handleGenerateRoom = () => {
    const roomId = generatedRoomId || generateRoomId();
    onJoinRoom(roomId, callType);
    resetForm();
    
  };

  const handleJoinRoom = () => {

    if (inputRoomId.trim()) {
      onJoinRoom(inputRoomId.trim(), callType);
      resetForm();
    }
  };

  const resetForm = () => {
    setInputRoomId('');
    setGeneratedRoomId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen && activeTab === 'generate' && !generatedRoomId) {
      generateRoomId();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-3xl bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Join Video Call</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        {/* Call Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Call Type
          </label>
          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value as 'private' | 'group')}
            className="w-full border px-3 py-2 rounded-md bg-white"
          >
            <option value="private">Private (1 to 1)</option>
            <option value="group">Group (Multi User)</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'generate'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('generate')}
          >
            Create Room
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'input'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('input')}
          >
            Join Room
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <input
              type="text"
              value={generatedRoomId}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
            <div className="flex space-x-2">
              <button
                onClick={generateRoomId}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-md"
              >
                Refresh
              </button>
              <button
                onClick={handleGenerateRoom}
                disabled={!generatedRoomId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Create Room
              </button>
            </div>
          </div>
        )}

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="space-y-4">
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter Room ID"
            />

            <div className="flex space-x-2">
              <button onClick={handleClose} className="flex-1 px-4 py-2 bg-gray-200 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!inputRoomId.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateIdModal;
