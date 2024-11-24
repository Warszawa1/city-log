import { createContext } from 'react'

export interface User {
  id: number;
  username: string;
  points: number;
  rank: string;
  reports_count: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
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