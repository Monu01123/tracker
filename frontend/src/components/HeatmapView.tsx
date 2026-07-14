import React, { useState } from 'react';
import { Flame, Calendar, TrendingUp, Info } from 'lucide-react';
import type { UserActivityStats, DayActivity } from '../types';

interface HeatmapViewProps {
  activity: UserActivityStats;
  userName: string;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ activity, userName }) => {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  const getLevelClass = (count: number) => {
    if (count === 0) return 'level-0';
    if (count <= 2) return 'level-1';
    if (count <= 4) return 'level-2';
    if (count <= 7) return 'level-3';
    return 'level-4';
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="card-header">
        <div className="card-header-title">
          <div className="card-icon activity">
            <Flame size={22} />
          </div>
          <div className="card-title-text">
            <h2>{userName}'s Consistency & Activity</h2>
            <p>Daily contribution heatmap covering the past 13 weeks (91 days)</p>
          </div>
        </div>

        {/* Hover/Active Day Tooltip Banner */}
        <div style={{ background: '#070a12', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-medium)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          {hoveredDay ? (
            <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>{hoveredDay.count} problem(s)</span>
              <span style={{ color: 'var(--text-dim)' }}>on {hoveredDay.date}</span>
              {hoveredDay.count > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({hoveredDay.easy}E, {hoveredDay.medium}M, {hoveredDay.hard}H)
                </span>
              )}
            </span>
          ) : (
            <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> Hover over any cell to see daily breakdown
            </span>
          )}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        {/* Current Streak */}
        <div className="stat-card orange">
          <div className="stat-icon">
            <Flame size={24} style={{ fill: 'currentColor' }} />
          </div>
          <div>
            <div className="stat-label">Current Streak</div>
            <div className="stat-val">
              {activity.currentStreak} <span>days</span>
            </div>
          </div>
        </div>

        {/* Max Streak */}
        <div className="stat-card purple">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Max Streak</div>
            <div className="stat-val">
              {activity.maxStreak} <span>days</span>
            </div>
          </div>
        </div>

        {/* Solved This Week */}
        <div className="stat-card emerald">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-label">Solved This Week</div>
            <div className="stat-val">
              {activity.thisWeekSolved} <span>problems</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Wrapper */}
      <div className="heatmap-box">
        <div className="heatmap-flex">
          {/* Weekday Labels */}
          <div className="heatmap-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid Cells */}
          <div className="heatmap-grid">
            {activity.heatmap.map((day, idx) => (
              <div
                key={day.date + idx}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`heatmap-cell ${getLevelClass(day.count)}`}
                title={`${day.count} solved on ${formatDateLabel(day.date)}`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-box level-0" />
          <div className="legend-box level-1" />
          <div className="legend-box level-2" />
          <div className="legend-box level-3" />
          <div className="legend-box level-4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
