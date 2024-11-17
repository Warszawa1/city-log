import { createContext } from 'react'

export interface User {
  username: string;
  points: number;
  rank: string;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const defaultContext: AuthContextType = {
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
}

export const AuthContext = createContext<AuthContextType>(defaultContext)