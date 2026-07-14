import { db } from '../db/schema.js';
import { getMondayStartISO } from './xpService.js';

export interface DayActivity {
  date: string; // YYYY-MM-DD
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

export function getUserActivityStats(userId: number): UserActivityStats {
  // 1. Get all logs grouped by YYYY-MM-DD (UTC date)
  const rows = db.prepare(`
    SELECT 
      substr(timestamp, 1, 10) as date,
      SUM(easy_count) as easy,
      SUM(medium_count) as medium,
      SUM(hard_count) as hard,
      SUM(easy_count + medium_count + hard_count) as count
    FROM logs
    WHERE user_id = ?
    GROUP BY substr(timestamp, 1, 10)
    ORDER BY date ASC
  `).all(userId) as Array<{ date: string; easy: number; medium: number; hard: number; count: number }>;

  const dateMap = new Map<string, DayActivity>();
  for (const row of rows) {
    dateMap.set(row.date, {
      date: row.date,
      count: row.count,
      easy: row.easy,
      medium: row.medium,
      hard: row.hard,
    });
  }

  // 2. Generate 13-week (91 days) heatmap up to today
  const now = new Date();
  const heatmap: DayActivity[] = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().substring(0, 10);
    const existing = dateMap.get(dateStr);
    if (existing) {
      heatmap.push(existing);
    } else {
      heatmap.push({ date: dateStr, count: 0, easy: 0, medium: 0, hard: 0 });
    }
  }

  // 3. Calculate Streaks (current & max) across all unique active dates
  const activeDates = Array.from(dateMap.values())
    .filter((a) => a.count > 0)
    .map((a) => a.date)
    .sort();

  let maxStreak = 0;
  let currentStreak = 0;

  if (activeDates.length > 0) {
    let tempStreak = 1;
    maxStreak = 1;

    for (let i = 1; i < activeDates.length; i++) {
      const prev = new Date(activeDates[i - 1] + 'T00:00:00Z');
      const curr = new Date(activeDates[i] + 'T00:00:00Z');
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    // Check if current streak is active (last active date is today or yesterday in UTC)
    const todayStr = now.toISOString().substring(0, 10);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    const lastActive = activeDates[activeDates.length - 1];
    if (lastActive === todayStr || lastActive === yesterdayStr) {
      currentStreak = 1;
      for (let i = activeDates.length - 1; i > 0; i--) {
        const p = new Date(activeDates[i - 1] + 'T00:00:00Z');
        const c = new Date(activeDates[i] + 'T00:00:00Z');
        const diff = Math.round((c.getTime() - p.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  // 4. Calculate this week's total solved
  const mondayStart = getMondayStartISO();
  const weeklyRow = db.prepare(`
    SELECT COALESCE(SUM(easy_count + medium_count + hard_count), 0) as total
    FROM logs
    WHERE user_id = ? AND timestamp >= ?
  `).get(userId, mondayStart) as { total: number };

  return {
    userId,
    currentStreak,
    maxStreak,
    thisWeekSolved: weeklyRow ? weeklyRow.total : 0,
    heatmap,
  };
}
