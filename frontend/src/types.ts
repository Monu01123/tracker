export interface DayActivity {
  date: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface UserActivityStats {
  userId: number;
  currentStreak: number;
  maxStreak: number;
  thisWeekSolved: number;
  heatmap: DayActivity[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'milestone' | 'difficulty' | 'streak' | 'weekly';
  target: number;
  current: number;
  unlocked: boolean;
  icon: string;
}

export interface TeamMember {
  userId: number;
  userName: string;
  avatarColor: string;
  allTime: {
    easy: number;
    medium: number;
    hard: number;
    totalSolved: number;
    xp: number;
  };
  weekly: {
    easy: number;
    medium: number;
    hard: number;
    totalSolved: number;
    xp: number;
  };
  allTimeRank: number;
  weeklyRank: number;
  activity: UserActivityStats;
  badges: Badge[];
}

export interface LogEntry {
  id: number;
  user_id: number;
  user_name: string;
  avatar_color: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  timestamp: string;
  created_at: string;
}
