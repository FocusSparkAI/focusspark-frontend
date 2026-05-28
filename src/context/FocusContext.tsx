import React, { useCallback, useState, useEffect } from 'react';
import { FocusContext } from './FocusContextValue';

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDetectionEnabled, setDetectionEnabledState] = useState(() => {
    const saved = localStorage.getItem('focusspark-camera-detection');
    return saved === 'true';
  });

  const setIsDetectionEnabled = useCallback((value: boolean) => {
    setDetectionEnabledState(value);
  }, []);

  useEffect(() => {
    localStorage.setItem('focusspark-camera-detection', isDetectionEnabled.toString());
  }, [isDetectionEnabled]);

  return (
    <FocusContext.Provider
      value={{
        isDetectionEnabled,
        setIsDetectionEnabled,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};
