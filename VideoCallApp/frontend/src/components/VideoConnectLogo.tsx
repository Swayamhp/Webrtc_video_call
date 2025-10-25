// components/VideoConnectLogo.tsx
import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const VideoConnectLogo: React.FC<LogoProps> = ({
  width = 400,
  height = 120,
  className = ''
}) => {
  return (
  <div>
    <div className=" flex flex-center">
            <div className="w-12 h-12 bg-blue-700 rounded-full  flex items-center justify-center">
              <svg className="w-8 h-8" fill="white" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
            </div>
        <div className='flex items-center'>
          <div className='hidden md:inline-block'><svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} `}
    >
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      
      <text 
        x="170" 
        y="80" 
        textAnchor="middle" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="60" 
        fontWeight="700" 
        fill="url(#textGradient)"
      >
        VideoConnect
      </text>
    </svg></div>   
    </div> 
              </div>
              </div>

  );
};

export default VideoConnectLogo;