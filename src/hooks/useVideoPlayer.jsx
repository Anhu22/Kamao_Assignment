import { useState, useRef, useEffect } from 'react';

export const useVideoPlayer = (video) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const videoRef = useRef(null);
  const lastTapTime = useRef(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const longPressTimer = useRef(null);
  const isLongPressing = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
      setShowPlayPauseOverlay(true);
      setTimeout(() => setShowPlayPauseOverlay(false), 1000);
    }
  };

  const handleLike = () => {
    setShowHeartAnimation(true);
    setIsLiked(!isLiked);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleVideoClick = (e) => {
    if (e.target === videoRef.current) {
      handlePlayPause();
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, 500);
  };

  const handleTouchEnd = (e) => {
    clearTimeout(longPressTimer.current);
    
    if (isLongPressing) {
      setIsLongPressing(false);
      if (videoRef.current && !isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const deltaX = e.changedTouches[0].clientX - (touchStartX.current || e.changedTouches[0].clientX);

    if (!touchStartX.current) {
      touchStartX.current = e.changedTouches[0].clientX;
    }

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    
    // Only handle as tap if minimal movement
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (tapLength < 300 && tapLength > 0) {
        // This is a double-tap - only like, don't pause
        handleLike();
        lastTapTime.current = currentTime;
      } else if (tapLength > 300) {
        // This is a single tap - only play/pause
        handlePlayPause();
        lastTapTime.current = currentTime;
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return {
    videoRef,
    isPlaying,
    isMuted,
    progress,
    isLoading,
    showPlayPauseOverlay,
    showHeartAnimation,
    isLiked,
    handlePlayPause,
    handleLike,
    toggleMute,
    handleVideoClick,
    handleTouchStart,
    handleTouchEnd,
    setIsPlaying,
    setIsMuted,
    setProgress,
    setIsLoading
  };
};
