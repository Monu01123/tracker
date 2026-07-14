import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/schema.js';
import { getUserXPStats } from '../services/xpService.js';
import { getUserActivityStats } from '../services/activityService.js';
import { getUserBadges } from '../services/badgeService.js';

export const apiRouter = Router();

// GET /api/team - comprehensive team data with rankings
apiRouter.get('/team', (_req: Request, res: Response) => {
  try {
    const xpStats = getUserXPStats();

    // Sort to determine allTime rank
    const allTimeSorted = [...xpStats].sort((a, b) => {
      if (b.allTime.xp !== a.allTime.xp) return b.allTime.xp - a.allTime.xp;
      return b.allTime.totalSolved - a.allTime.totalSolved;
    });

    // Sort to determine weekly rank
    const weeklySorted = [...xpStats].sort((a, b) => {
      if (b.weekly.xp !== a.weekly.xp) return b.weekly.xp - a.weekly.xp;
      return b.weekly.totalSolved - a.weekly.totalSolved;
    });

    const team = xpStats.map((u) => {
      const allTimeRank = allTimeSorted.findIndex((item) => item.userId === u.userId) + 1;
      const weeklyRank = weeklySorted.findIndex((item) => item.userId === u.userId) + 1;
      const activity = getUserActivityStats(u.userId);
      const badges = getUserBadges(u.userId);

      return {
        ...u,
        allTimeRank,
        weeklyRank,
        activity,
        badges,
      };
    });

    res.json({ success: true, team });
  } catch (err: any) {
    console.error('Error fetching team data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/team/:id - update team member name or color
const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

apiRouter.put('/team/:id', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId) || userId < 1 || userId > 4) {
      return res.status(400).json({ success: false, error: 'Invalid user ID (must be 1-4)' });
    }

    const parsed = updateTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const newName = parsed.data.name !== undefined ? parsed.data.name : existing.name;
    const newColor = parsed.data.avatarColor !== undefined ? parsed.data.avatarColor : existing.avatar_color;

    db.prepare('UPDATE users SET name = ?, avatar_color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      newName,
      newColor,
      userId
    );

    res.json({ success: true, message: 'Updated team member' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/logs - log new solve entry
const logSchema = z.object({
  userId: z.number().int().min(1).max(4),
  easyCount: z.number().int().min(0).max(500).default(0),
  mediumCount: z.number().int().min(0).max(500).default(0),
  hardCount: z.number().int().min(0).max(500).default(0),
  timestamp: z.string().optional(),
});

apiRouter.post('/logs', (req: Request, res: Response) => {
  try {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const { userId, easyCount, mediumCount, hardCount, timestamp } = parsed.data;

    if (easyCount === 0 && mediumCount === 0 && hardCount === 0) {
      return res.status(400).json({ success: false, error: 'At least one problem count must be greater than 0' });
    }

    const logTime = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    const info = db.prepare(`
      INSERT INTO logs (user_id, easy_count, medium_count, hard_count, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, easyCount, mediumCount, hardCount, logTime);

    res.json({ success: true, logId: info.lastInsertRowid, message: 'Problem counts logged successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/logs/:id - edit existing log entry
const editLogSchema = z.object({
  easyCount: z.number().int().min(0).max(500),
  mediumCount: z.number().int().min(0).max(500),
  hardCount: z.number().int().min(0).max(500),
});

apiRouter.put('/logs/:id', (req: Request, res: Response) => {
  try {
    const logId = parseInt(req.params.id, 10);
    const parsed = editLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const { easyCount, mediumCount, hardCount } = parsed.data;
    const existing = db.prepare('SELECT * FROM logs WHERE id = ?').get(logId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Log entry not found' });
    }

    db.prepare(`
      UPDATE logs SET easy_count = ?, medium_count = ?, hard_count = ? WHERE id = ?
    `).run(easyCount, mediumCount, hardCount, logId);

    res.json({ success: true, message: 'Log updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/logs/latest/:userId - undo most recent log for a user
apiRouter.delete('/logs/latest/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId) || userId < 1 || userId > 4) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const latest = db.prepare(`
      SELECT id, easy_count, medium_count, hard_count, timestamp
      FROM logs
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `).get(userId) as any;

    if (!latest) {
      return res.status(404).json({ success: false, error: 'No logs found for this user to undo' });
    }

    db.prepare('DELETE FROM logs WHERE id = ?').run(latest.id);

    res.json({
      success: true,
      message: 'Last log entry undone',
      undone: latest,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/logs/:id - delete a specific log by ID
apiRouter.delete('/logs/:id', (req: Request, res: Response) => {
  try {
    const logId = parseInt(req.params.id, 10);
    const result = db.prepare('DELETE FROM logs WHERE id = ?').run(logId);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Log entry not found' });
    }
    res.json({ success: true, message: 'Log deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/logs/:userId - get recent history
apiRouter.get('/logs/:userId', (req: Request, res: Response) => {
  try {
    const param = req.params.userId;
    let rows: any[];

    if (param === 'all') {
      rows = db.prepare(`
        SELECT l.*, u.name as user_name, u.avatar_color
        FROM logs l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.timestamp DESC, l.id DESC
        LIMIT 100
      `).all();
    } else {
      const userId = parseInt(param, 10);
      rows = db.prepare(`
        SELECT l.*, u.name as user_name, u.avatar_color
        FROM logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.user_id = ?
        ORDER BY l.timestamp DESC, l.id DESC
        LIMIT 50
      `).all(userId);
    }

    res.json({ success: true, logs: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/stats/heatmap/:userId - get activity stats and heatmap
apiRouter.get('/stats/heatmap/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId) || userId < 1 || userId > 4) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const activity = getUserActivityStats(userId);
    res.json({ success: true, activity });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
