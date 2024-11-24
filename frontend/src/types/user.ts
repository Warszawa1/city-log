export interface Achievement {
    id: number;
    name: string;
    description: string;
    points: number;
    icon: string;
    earned_at?: string;
  }
  
  export interface User {
    id: number;
    username: string;
    points: number;
    rank: string;
    reports_count: number;  // Added this field
    achievements?: Achievement[];
    email?: string;
  }
  
  export interface UserStats {
    total_points: number;
    rank: string;
    reports_count: number;
    achievements_earned: number;
  }
  
  export type UserContextType = {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
  };
  