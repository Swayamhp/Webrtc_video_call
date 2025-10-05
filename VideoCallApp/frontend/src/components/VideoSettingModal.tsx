import { useState } from "react";

interface VideoSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectLayout: string;
  setLayout: (layout: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  micVolume: number;
  setMicVolume: (volume: number) => void;
}

export default function VideoSettingModal({
  isOpen,
  onClose,
  selectLayout,
  setLayout,
  resolution,
  setResolution,
  micVolume,
  setMicVolume,
}: VideoSettingModalProps) {
  const layoutOptions = [
    { label: "Reset Layout", value: "reset-layout", description: "Return to default layout" },
    { label: "User Fullscreen", value: "user-fullscreen", description: "Show user in full screen" },
    { label: "Remote User Fullscreen", value: "remote-user-fullscreen", description: "Show remote user full screen" },
  ];

  const resolutionOptions = [
    { label: "480p", value: "480p", description: "Standard Definition" },
    { label: "720p", value: "720p", description: "HD Resolution" },
    { label: "1080p", value: "1080p", description: "Full HD" },
    { label: "1440p", value: "1440p", description: "2K Quality" },
    { label: "2160p", value: "2160p", description: "4K Ultra HD" },
  ];

  const [layoutOpen, setLayoutOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);

  const handleLayoutSelect = (value: string) => {
    setLayout(value);
    setLayoutOpen(false);
  };

  const handleResolutionSelect = (value: string) => {
    setResolution(value);
    setResOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-6 w-80 shadow-xl text-white">
            <h2 className="text-lg font-semibold mb-4 text-cyan-400">Video Settings</h2>

            {/* Layout Grid */}
            <div className="mb-4 relative">
              <label className="block mb-1 text-sm font-medium text-gray-300">Layout Grid</label>
              <div
                className="px-3 py-2 bg-gray-700 rounded-lg cursor-pointer relative"
                onClick={() => setLayoutOpen(!layoutOpen)}
              >
                {layoutOptions.find((o) => o.value === selectLayout)?.label || "Select Layout"}
              </div>
              {layoutOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-800 rounded-lg mt-1 z-10 shadow-lg">
                  {layoutOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex flex-col"
                      onClick={() => handleLayoutSelect(option.value)}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-400">{option.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Resolution */}
            <div className="mb-4 relative">
              <label className="block mb-1 text-sm font-medium text-gray-300">Video Resolution</label>
              <div
                className="px-3 py-2 bg-gray-700 rounded-lg cursor-pointer relative"
                onClick={() => setResOpen(!resOpen)}
              >
                {resolutionOptions.find((o) => o.value === resolution)?.label || "Select Resolution"}
              </div>
              {resOpen && (
                <div className="absolute top-full left-0 w-full bg-gray-800 rounded-lg mt-1 z-10 shadow-lg">
                  {resolutionOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 hover:bg-gray-600 cursor-pointer flex flex-col"
                      onClick={() => handleResolutionSelect(option.value)}
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-400">{option.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Microphone Volume */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Mic Volume: {micVolume}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={micVolume}
                onChange={(e) => setMicVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Buttons */}
            <div className="w-full">
              <button
                onClick={() => { onClose(); setLayoutOpen(false); setResOpen(false); }}
                className="px-4 py-2 w-full rounded-lg bg-cyan-500 hover:bg-cyan-600 transition-colors"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
