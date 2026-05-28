import { createContext } from 'react';

export interface FocusContextType {
  isDetectionEnabled: boolean;
  setIsDetectionEnabled: (value: boolean) => void;
}

export const FocusContext = createContext<FocusContextType>({
  isDetectionEnabled: false,
  setIsDetectionEnabled: () => {},
});
