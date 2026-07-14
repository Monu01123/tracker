import { db } from '../db/schema.js';

export interface UserXPStats {
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
}

export function getMondayStartISO(now = new Date()): string {
  const date = new Date(now);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export function calculateXP(easy: number, medium: number, hard: number): number {
  return easy * 10 + medium * 20 + hard * 30;
}

export function getUserXPStats(userId?: number): UserXPStats[] {
  const usersQuery = userId
    ? db.prepare('SELECT id, name, avatar_color FROM users WHERE id = ?').all(userId)
    : db.prepare('SELECT id, name, avatar_color FROM users ORDER BY id ASC').all();

  const mondayStart = getMondayStartISO();

  const allTimeStmt = db.prepare(`
    SELECT 
      COALESCE(SUM(easy_count), 0) as easy,
      COALESCE(SUM(medium_count), 0) as medium,
      COALESCE(SUM(hard_count), 0) as hard
    FROM logs
    WHERE user_id = ?
  `);

  const weeklyStmt = db.prepare(`
    SELECT 
      COALESCE(SUM(easy_count), 0) as easy,
      COALESCE(SUM(medium_count), 0) as medium,
      COALESCE(SUM(hard_count), 0) as hard
    FROM logs
    WHERE user_id = ? AND timestamp >= ?
  `);

  return (usersQuery as Array<{ id: number; name: string; avatar_color: string }>).map((u) => {
    const allTimeRow = allTimeStmt.get(u.id) as { easy: number; medium: number; hard: number };
    const weeklyRow = weeklyStmt.get(u.id, mondayStart) as { easy: number; medium: number; hard: number };

    const allTimeTotal = allTimeRow.easy + allTimeRow.medium + allTimeRow.hard;
    const weeklyTotal = weeklyRow.easy + weeklyRow.medium + weeklyRow.hard;

    return {
      userId: u.id,
      userName: u.name,
      avatarColor: u.avatar_color,
      allTime: {
        easy: allTimeRow.easy,
        medium: allTimeRow.medium,
        hard: allTimeRow.hard,
        totalSolved: allTimeTotal,
        xp: calculateXP(allTimeRow.easy, allTimeRow.medium, allTimeRow.hard),
      },
      weekly: {
        easy: weeklyRow.easy,
        medium: weeklyRow.medium,
        hard: weeklyRow.hard,
        totalSolved: weeklyTotal,
        xp: calculateXP(weeklyRow.easy, weeklyRow.medium, weeklyRow.hard),
      },
    };
  });
}
