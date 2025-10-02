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
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
    </svg>
  );
};

export default VideoConnectLogo;