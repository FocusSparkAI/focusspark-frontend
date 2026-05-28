import { useContext } from 'react';
import { FocusContext } from '../context/FocusContextValue';

export const useFocus = () => useContext(FocusContext);
