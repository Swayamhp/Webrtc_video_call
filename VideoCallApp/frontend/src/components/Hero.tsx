// components/Hero.tsx
import React, { useEffect, useState } from "react";
import videoCallImage1 from "../assets/edited_firstImage.png";
import videoCallImage2 from "../assets/edited_secondImage.png";
import videoCallImage3 from "../assets/edited_thirdImage.png";
import GenerateIdModal from "./GenerateIdModal";

const Hero: React.FC = () => {
  const images = ['',videoCallImage1,videoCallImage2,videoCallImage3];
  const [imageIndex,setImageIndex] = useState(0);
  const [videoModal, setVideoModal] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [callType, setCallType] = useState<'private' | 'group'>('private');

  useEffect( ()=>{
    const timeInterval = setInterval(()=>{
      console.log(imageIndex);
      setImageIndex((index)=>(index+1)%images.length);
    },3000)
        return () => clearInterval(timeInterval);
  },[])

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setVideoModal(false);
    // Here you can add navigation logic to the video call room
    // Example: navigate to video call page with room ID
    if(callType === 'private')
    window.location.href = `/video-call/${roomId}`;
    else if(callType === 'group')
    window.location.href = `/group-video-call/${roomId}`;
  };

  const handleStartCall = () => {
    setVideoModal(true);
  };

  return (
    <section className="py-12 px-4 bg-gray-900 ">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-300 leading-tight">
              Connect with <span className="text-blue-600">Friends</span>
              <br />
              Like Never Before
            </h1>
            <p className="text-xl text-gray-400 mt-6 mb-8 leading-relaxed">
              Crystal-clear video calls, instant friend connections, and
              seamless communication. Experience the future of video chatting
              with our intuitive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl"
                onClick={handleStartCall}
              >
                Start Free Call
              </button>
              {/* <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all">
                Download App
              </button> */}
            </div>

            {/* Display current room info if available */}
            {currentRoomId && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg">
                <p className="text-green-800 text-sm">
                  Ready to join room: <strong>{currentRoomId}</strong>
                </p>
                <button 
                  onClick={() => {
                    // Navigate to video call page
                    console.log(`Navigating to room: ${currentRoomId}`);
                    // Add your navigation logic here
                  }}
                  className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Join Room Now
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free forever plan</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-2 transform rotate-2">
              <div
                className="rounded-xl bg-black aspect-video flex items-center justify-center bg-cover bg-center "
                style={{ backgroundImage: `url(${images[imageIndex]})` }}
              >
                {" "}
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold">
                    Live Video Call Preview
                  </p>
                  <p className="text-gray-400">1080p • 60 FPS</p>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>
      
      {/* GenerateIdModal */}
      <GenerateIdModal 
        isOpen={videoModal} 
        onClose={() => setVideoModal(false)}
        onJoinRoom={handleJoinRoom}
        setCallType={setCallType}
        callType={callType}
      />
    </section>
  );
};

export default Hero;