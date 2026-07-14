import React from 'react';
import { Trophy, Users, Settings, History } from 'lucide-react';
import type { TeamMember } from '../types';

interface NavbarProps {
  activeUser: TeamMember | null;
  onOpenSwitcher: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  onOpenSwitcher,
  onOpenSettings,
  onOpenHistory,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left Brand */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <Trophy size={24} />
          </div>
          <div>
            <div className="brand-title-row">
              <span className="brand-title">DSA A2Z Arena</span>
              <span className="brand-tag">Striver Sheet</span>
            </div>
            <p className="brand-subtitle">4-Person Team Competition & XP Leaderboard</p>
          </div>
        </div>

        {/* Right Actions & Active Teammate Pill */}
        <div className="navbar-actions">
          <button onClick={onOpenHistory} className="btn-secondary" title="View Recent Logs & Undo">
            <History size={16} />
            <span>Logs / Undo</span>
          </button>

          <button onClick={onOpenSettings} className="btn-secondary" title="Team Configuration">
            <Settings size={16} />
            <span>Settings</span>
          </button>

          {activeUser ? (
            <div onClick={onOpenSwitcher} className="user-pill" title="Click to Switch Teammate">
              <div
                className="user-avatar"
                style={{ backgroundColor: activeUser.avatarColor }}
              >
                {activeUser.userName.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-pill-info">
                <div className="user-pill-name">
                  <span>{activeUser.userName}</span>
                </div>
                <div className="user-pill-xp">
                  {activeUser.allTime.xp.toLocaleString()} XP
                </div>
              </div>
              <span className="user-pill-switch">Switch</span>
            </div>
          ) : (
            <button onClick={onOpenSwitcher} className="btn-primary">
              <Users size={16} />
              <span>Select Teammate</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
