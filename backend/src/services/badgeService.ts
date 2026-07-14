import { db } from '../db/schema.js';
import { getUserXPStats } from './xpService.js';
import { getUserActivityStats } from './activityService.js';

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

export function getUserBadges(userId: number): Badge[] {
  const xpStatsList = getUserXPStats(userId);
  if (xpStatsList.length === 0) return [];
  const stats = xpStatsList[0];
  const activity = getUserActivityStats(userId);

  // Check historical max solved in a single 7-day or calendar week (`%Y-%W`)
  const maxWeeklyRow = db.prepare(`
    SELECT COALESCE(MAX(week_total), 0) as max_week
    FROM (
      SELECT strftime('%Y-%W', timestamp) as week_num, SUM(easy_count + medium_count + hard_count) as week_total
      FROM logs
      WHERE user_id = ?
      GROUP BY strftime('%Y-%W', timestamp)
    )
  `).get(userId) as { max_week: number };

  const maxWeeklySolved = Math.max(stats.weekly.totalSolved, maxWeeklyRow.max_week);

  const balancedCurrent = Math.min(stats.allTime.easy, stats.allTime.medium, stats.allTime.hard);

  const badges: Badge[] = [
    // Milestones
    {
      id: 'first_solve',
      name: 'First Blood',
      description: 'Solve your very first problem from the A2Z sheet',
      category: 'milestone',
      target: 1,
      current: stats.allTime.totalSolved,
      unlocked: stats.allTime.totalSolved >= 1,
      icon: 'Zap',
    },
    {
      id: '10_solved',
      name: 'Bronze Coder',
      description: 'Solve 10 total problems',
      category: 'milestone',
      target: 10,
      current: stats.allTime.totalSolved,
      unlocked: stats.allTime.totalSolved >= 10,
      icon: 'Award',
    },
    {
      id: '50_solved',
      name: 'Silver Coder',
      description: 'Solve 50 total problems',
      category: 'milestone',
      target: 50,
      current: stats.allTime.totalSolved,
      unlocked: stats.allTime.totalSolved >= 50,
      icon: 'ShieldAlert',
    },
    {
      id: '100_solved',
      name: 'Gold Centurion',
      description: 'Solve 100 total problems from the sheet',
      category: 'milestone',
      target: 100,
      current: stats.allTime.totalSolved,
      unlocked: stats.allTime.totalSolved >= 100,
      icon: 'Crown',
    },

    // Difficulty
    {
      id: '20_easy',
      name: 'Easy Breeze',
      description: 'Solve at least 20 Easy problems',
      category: 'difficulty',
      target: 20,
      current: stats.allTime.easy,
      unlocked: stats.allTime.easy >= 20,
      icon: 'Smile',
    },
    {
      id: '20_medium',
      name: 'Medium Master',
      description: 'Solve at least 20 Medium problems',
      category: 'difficulty',
      target: 20,
      current: stats.allTime.medium,
      unlocked: stats.allTime.medium >= 20,
      icon: 'Activity',
    },
    {
      id: '10_hard',
      name: 'Hardcore Beast',
      description: 'Conquer at least 10 Hard problems',
      category: 'difficulty',
      target: 10,
      current: stats.allTime.hard,
      unlocked: stats.allTime.hard >= 10,
      icon: 'Flame',
    },
    {
      id: 'balanced',
      name: 'Balanced Master',
      description: 'Solve at least 10 Easy, 10 Medium, and 10 Hard problems',
      category: 'difficulty',
      target: 10,
      current: balancedCurrent,
      unlocked: stats.allTime.easy >= 10 && stats.allTime.medium >= 10 && stats.allTime.hard >= 10,
      icon: 'Scale',
    },

    // Streaks
    {
      id: '3_streak',
      name: 'Consistently Curious',
      description: 'Achieve a 3-day consecutive solve streak',
      category: 'streak',
      target: 3,
      current: activity.maxStreak,
      unlocked: activity.maxStreak >= 3,
      icon: 'TrendingUp',
    },
    {
      id: '7_streak',
      name: 'Week-Long Warrior',
      description: 'Maintain a 7-day consecutive solve streak',
      category: 'streak',
      target: 7,
      current: activity.maxStreak,
      unlocked: activity.maxStreak >= 7,
      icon: 'Zap',
    },
    {
      id: '14_streak',
      name: 'Unstoppable Force',
      description: 'Maintain a 14-day consecutive solve streak',
      category: 'streak',
      target: 14,
      current: activity.maxStreak,
      unlocked: activity.maxStreak >= 14,
      icon: 'Rocket',
    },

    // Weekly
    {
      id: 'weekly_10',
      name: 'Weekly Warrior',
      description: 'Solve 10+ problems in a single week',
      category: 'weekly',
      target: 10,
      current: maxWeeklySolved,
      unlocked: maxWeeklySolved >= 10,
      icon: 'Calendar',
    },
  ];

  return badges;
}
