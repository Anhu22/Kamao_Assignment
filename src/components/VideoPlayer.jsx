import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VideoPlayer = ({ video, isActive, onPlay, onPause, onLike }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  let controlsTimeout;
  let longPressTimer;

  // Handle video activation/deactivation - RESTART FROM BEGINNING
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        if (isActive) {
          // Reset video to beginning when it becomes active
          if (video.currentTime !== 0) {
            video.currentTime = 0;
            setProgress(0);
          }
          
          setIsLoading(true);
          
          if (video.readyState >= 2) {
            await video.play();
            setIsPlaying(true);
            onPlay?.();
          } else {
            const canPlayHandler = async () => {
              try {
                await video.play();
                setIsPlaying(true);
                onPlay?.();
              } catch (error) {
                console.log('Autoplay failed:', error);
                setIsPlaying(false);
              }
              video.removeEventListener('canplay', canPlayHandler);
            };
            video.addEventListener('canplay', canPlayHandler);
          }
        } else {
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
            onPause?.();
          }
        }
      } catch (error) {
        console.log('Playback error:', error);
        setIsPlaying(false);
      }
    };

    playVideo();

    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [isActive, onPlay, onPause]);

  // Update progress and buffer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    const handleLoadedData = () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      if (isActive) {
        video.currentTime = 0;
        video.play().catch(e => console.log('Play after load failed:', e));
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isActive && video.paused) {
        video.currentTime = 0;
        video.play().catch(e => console.log('CanPlay play failed:', e));
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (isActive) {
        video.currentTime = 0;
        video.play().catch(e => console.log('Loop play failed:', e));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isActive, isSeeking]);

  // Seek functionality
  const handleSeek = useCallback((e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;
    
    video.currentTime = seekTime;
    setProgress(percentage * 100);
  }, [duration]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log('Play failed:', error);
          setIsPlaying(false);
        });
    }
    showControlsTemporarily();
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  const handleTap = useCallback(() => {
    showControlsTemporarily();
    togglePlay();
  }, [togglePlay]);

  // FIXED: Double tap triggers like, pauses video, and shows heart animation only
  const handleDoubleTap = useCallback((e) => {
    e.stopPropagation();
    
    // Show heart animation on double tap
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
    
    // Call the onLike callback to update like count
    onLike && onLike(true);
    
    // Pause the video if it's playing
    if (isPlaying) {
      const video = videoRef.current;
      if (video) {
        video.pause();
        setIsPlaying(false);
      }
    }
    
    // Don't show controls overlay on double-tap - only heart animation
  }, [onLike, isPlaying]);

  const handleMouseDown = useCallback(() => {
    longPressTimer = setTimeout(() => {
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
        showControlsTemporarily();
      }
    }, 500);
  }, [isPlaying]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }, []);

  // Reset video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      setProgress(0);
    }
  }, []);

  return (
    <div 
      className="relative w-full h-full bg-black cursor-pointer"
      onClick={handleTap}
      onDoubleClick={handleDoubleTap}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover"
        loop={false}
        muted={isMuted}
        playsInline
        preload="auto"
        data-id={video.id}
      />
      
      {/* Heart Animation for Double Tap */}
      {showHeartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="animate-heartPop">
            <svg
              className="w-32 h-32 text-red-500 drop-shadow-2xl"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Loading Skeleton with Shimmer Animation */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
          <div className="absolute inset-0 shimmer" 
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              animation: 'shimmer 1.5s infinite'
            }}
          />
        </div>
      )}
      
      {/* Sophisticated Play/Pause Overlay Animation */}
      {(showControls || !isPlaying) && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
          <div className="relative">
            {/* Ripple Effect Background */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            
            {/* Main Icon Container */}
            <div className="relative bg-white/20 backdrop-blur-md rounded-full p-5 transform transition-all duration-300 hover:scale-110 animate-scaleIn">
              {isPlaying ? (
                <Pause size={56} className="text-white drop-shadow-lg" />
              ) : (
                <Play size={56} className="text-white drop-shadow-lg ml-1" />
              )}
            </div>
            
            {/* Outer Ring Pulse */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Mute Button with Animation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2.5 rounded-full z-20 hover:bg-black/70 transition-all hover:scale-110 active:scale-95"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-white" />
        ) : (
          <Volume2 size={20} className="text-white" />
        )}
      </button>

      {/* Enhanced Progress Bar with Buffer Indicator and Seek Functionality */}
      <div className="absolute bottom-0 left-0 right-0 z-20 group">
        {/* Progress Bar Container */}
        <div 
          className="relative w-full h-1 bg-gray-700 cursor-pointer hover:h-1.5 transition-all duration-200"
          onClick={handleSeek}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onMouseLeave={handleSeekEnd}
        >
          {/* Buffer Indicator */}
          <div
            className="absolute left-0 top-0 h-full bg-gray-500 transition-all duration-200"
            style={{ width: `${buffered}%` }}
          />
          
          {/* Playback Progress */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
          
          {/* Seek Handle - Shows on hover */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        
        {/* Time Display */}
        <div className="absolute -top-8 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {Math.floor((progress / 100) * duration / 60)}:{(Math.floor((progress / 100) * duration) % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;