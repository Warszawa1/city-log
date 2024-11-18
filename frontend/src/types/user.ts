export interface User {
    username: string;
    points: number;
    rank: string;
    reports_count: number;
    achievements?: Achievement[];
  }
  
  export interface Achievement {
    id: number;
    name: string;
    description: string;
    points: number;
    icon: string;
    earned_at?: string;
  }