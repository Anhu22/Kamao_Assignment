import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

const MusicDisc = ({ isPlaying, coverImage }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame;
    let lastTime = 0;
    
    if (isPlaying) {
      const rotate = (currentTime) => {
        if (lastTime) {
          setRotation(prev => (prev + 2) % 360);
        }
        lastTime = currentTime;
        animationFrame = requestAnimationFrame(rotate);
      };
      
      animationFrame = requestAnimationFrame(rotate);
    } else {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying]);

  return (
    <div className="absolute bottom-6 right-6 z-10 group">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-purple-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Main disc */}
        <div
          className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-all duration-300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt="Music"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
            />
          ) : (
            <Music size={20} className="text-white" />
          )}
        </div>
        
        {/* Pulsing ring when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75"></div>
        )}
      </div>
    </div>
  );
};

export default MusicDisc;