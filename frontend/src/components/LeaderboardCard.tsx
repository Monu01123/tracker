import React, { useState } from 'react';
import { Trophy, Crown, Medal, Flame, Zap } from 'lucide-react';
import type { TeamMember } from '../types';

interface LeaderboardCardProps {
  team: TeamMember[];
  activeUserId: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ team, activeUserId }) => {
  const [tab, setTab] = useState<'allTime' | 'weekly'>('allTime');

  const sortedTeam = [...team].sort((a, b) => {
    const statsA = tab === 'allTime' ? a.allTime : a.weekly;
    const statsB = tab === 'allTime' ? b.allTime : b.weekly;
    if (statsB.xp !== statsA.xp) return statsB.xp - statsA.xp;
    return statsB.totalSolved - statsA.totalSolved;
  });

  const topXP = sortedTeam.length > 0 ? (tab === 'allTime' ? sortedTeam[0].allTime.xp : sortedTeam[0].weekly.xp) : 1;

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Crown size={22} style={{ color: '#fbbf24', fill: '#fbbf24' }} />;
    if (rank === 2) return <Medal size={20} style={{ color: '#cbd5e1' }} />;
    if (rank === 3) return <Medal size={20} style={{ color: '#d97706' }} />;
    return <span className="rank-badge">#{rank}</span>;
  };

  return (
    <div className="glass-card">
      {/* Header & Tabs */}
      <div className="card-header">
        <div className="card-header-title">
          <div className="card-icon trophy">
            <Trophy size={22} />
          </div>
          <div className="card-title-text">
            <h2>Arena Leaderboard</h2>
            <p>Ranked strictly by XP (Easy=10, Med=20, Hard=30)</p>
          </div>
        </div>

        <div className="tab-group">
          <button
            onClick={() => setTab('allTime')}
            className={`tab-btn ${tab === 'allTime' ? 'active' : ''}`}
          >
            All-Time Rank
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`tab-btn ${tab === 'weekly' ? 'active weekly' : ''}`}
          >
            <Zap size={14} />
            <span>This Week</span>
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="leaderboard-list">
        {sortedTeam.map((member, index) => {
          const stats = tab === 'allTime' ? member.allTime : member.weekly;
          const rank = index + 1;
          const isTop = rank === 1 && stats.xp > 0;
          const isMe = member.userId === activeUserId;
          const progressPercent = topXP > 0 ? Math.round((stats.xp / topXP) * 100) : 0;

          return (
            <div
              key={member.userId}
              className={`leaderboard-item ${isTop ? 'is-top' : ''} ${isMe ? 'is-me' : ''}`}
            >
              <div className="leaderboard-item-row">
                {/* Left side: Rank, Avatar, Name & Pills */}
                <div className="leaderboard-left">
                  <div className="rank-badge">
                    {getRankMedal(rank)}
                  </div>

                  <div
                    className="member-avatar"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.userName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="member-info">
                    <div className="member-name-row">
                      <span className="member-name">{member.userName}</span>
                      {isTop && <span className="badge-pill top">👑 Spotlight #1</span>}
                      {isMe && <span className="badge-pill you">YOU</span>}
                    </div>

                    <div className="member-stats-row">
                      <span className="solved-pill">
                        <strong>{stats.totalSolved}</strong> solved
                      </span>
                      <span style={{ color: 'var(--accent-cyan)' }}>{stats.easy}E</span>
                      <span>/</span>
                      <span style={{ color: 'var(--accent-emerald)' }}>{stats.medium}M</span>
                      <span>/</span>
                      <span style={{ color: 'var(--accent-amber)' }}>{stats.hard}H</span>

                      {member.activity.currentStreak > 0 && (
                        <span className="streak-pill">
                          <Flame size={13} style={{ fill: 'currentColor' }} /> {member.activity.currentStreak}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: XP score */}
                <div className="leaderboard-right">
                  <div className="xp-score">
                    {stats.xp.toLocaleString()} <span>XP</span>
                  </div>
                  <div className="xp-sub">
                    {progressPercent}% of leader
                  </div>
                </div>
              </div>

              {/* Progress bar fill */}
              <div className="xp-bar-track">
                <div
                  className="xp-bar-fill"
                  style={{
                    width: `${progressPercent}%`,
                    background: isTop
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : `linear-gradient(90deg, ${member.avatarColor}, var(--accent-cyan))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {tab === 'weekly' && (
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ⚡ Weekly Leaderboard resets automatically every Monday at 00:00 local time.
        </div>
      )}
    </div>
  );
};
