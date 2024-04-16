import React from 'react';

export const UserContext = React.createContext<{
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}>({
  user: null,
  setUser: () => {},
});