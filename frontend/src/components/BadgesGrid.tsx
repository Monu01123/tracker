import React, { useState } from 'react';
import {
  Award,
  Zap,
  Crown,
  ShieldAlert,
  Smile,
  Activity,
  Flame,
  Scale,
  TrendingUp,
  Rocket,
  Calendar,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import type { Badge } from '../types';

interface BadgesGridProps {
  badges: Badge[];
  userName: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap size={24} />,
  Award: <Award size={24} />,
  Crown: <Crown size={24} />,
  ShieldAlert: <ShieldAlert size={24} />,
  Smile: <Smile size={24} />,
  Activity: <Activity size={24} />,
  Flame: <Flame size={24} />,
  Scale: <Scale size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Rocket: <Rocket size={24} />,
  Calendar: <Calendar size={24} />,
};

export const BadgesGrid: React.FC<BadgesGridProps> = ({ badges, userName }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const categories: Array<{ key: Badge['category']; label: string }> = [
    { key: 'milestone', label: 'Milestone Achievements' },
    { key: 'difficulty', label: 'Difficulty Mastery' },
    { key: 'streak', label: 'Consistency & Streaks' },
    { key: 'weekly', label: 'Weekly Challenges' },
  ];

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-title">
          <div className="card-icon badges">
            <Award size={22} />
          </div>
          <div className="card-title-text">
            <h2>
              {userName}'s Trophy Cabinet{' '}
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '2px 10px', borderRadius: '50px', marginLeft: '8px' }}>
                {unlockedCount} / {badges.length} Unlocked
              </span>
            </h2>
            <p>Badges automatically unlock as you reach difficulty milestones and maintain streaks.</p>
          </div>
        </div>

        <div className="tab-group">
          <button
            onClick={() => setFilter('all')}
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All ({badges.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`tab-btn ${filter === 'unlocked' ? 'active' : ''}`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`tab-btn ${filter === 'locked' ? 'active' : ''}`}
          >
            Locked ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      <div className="badges-section">
        {categories.map((cat) => {
          const catBadges = filteredBadges.filter((b) => b.category === cat.key);
          if (catBadges.length === 0) return null;

          return (
            <div key={cat.key}>
              <div className="badges-category-title">
                <span>{cat.label}</span>
              </div>

              <div className="badges-grid">
                {catBadges.map((badge) => {
                  const percent = Math.min(100, Math.round((badge.current / badge.target) * 100));

                  return (
                    <div
                      key={badge.id}
                      className={`badge-card ${badge.unlocked ? 'unlocked' : ''}`}
                    >
                      <div>
                        <div className="badge-header">
                          <div className="badge-icon-wrap">
                            {ICON_MAP[badge.icon] || <Award size={24} />}
                          </div>

                          {badge.unlocked ? (
                            <CheckCircle2 size={22} style={{ color: '#fbbf24' }} />
                          ) : (
                            <Lock size={18} style={{ color: 'var(--text-dim)' }} />
                          )}
                        </div>

                        <h4 className="badge-name">{badge.name}</h4>
                        <p className="badge-desc">{badge.description}</p>
                      </div>

                      <div>
                        <div className={`badge-progress-meta ${badge.unlocked ? 'done' : ''}`}>
                          <span>{badge.unlocked ? 'COMPLETED' : `${badge.current} / ${badge.target}`}</span>
                          <span>{percent}%</span>
                        </div>

                        <div className="badge-bar-track">
                          <div
                            className="badge-bar-fill"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: badge.unlocked ? '#f59e0b' : 'var(--accent-cyan)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
