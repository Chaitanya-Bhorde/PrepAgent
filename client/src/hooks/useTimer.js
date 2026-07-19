import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialMinutes, onTimeUp) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      clearInterval(intervalRef.current);
      setIsActive(false);
      if (onTimeUp) onTimeUp();
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, secondsRemaining]);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  
  const reset = (newMinutes) => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setSecondsRemaining((newMinutes || initialMinutes) * 60);
  };

  const formatTime = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    secondsRemaining,
    isActive,
    start,
    stop,
    reset,
    formatTime
  };
};
