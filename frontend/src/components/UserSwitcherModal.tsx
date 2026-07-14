import React from 'react';
import { X, CheckCircle, Trophy } from 'lucide-react';
import type { TeamMember } from '../types';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  activeUserId: number;
  onSelectUser: (userId: number) => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  team,
  activeUserId,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon">
              <Trophy size={20} />
            </div>
            <div className="modal-title">
              <h3>Select Teammate Profile</h3>
              <p>Click any teammate name to instantly switch and log problems under their account</p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="switcher-grid">
            {team.map((member) => {
              const isSelected = member.userId === activeUserId;

              return (
                <div
                  key={member.userId}
                  onClick={() => {
                    onSelectUser(member.userId);
                    onClose();
                  }}
                  className={`switcher-card ${isSelected ? 'active' : ''}`}
                >
                  <div
                    className="member-avatar"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.userName.substring(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                        {member.userName}
                      </span>
                      {isSelected && <CheckCircle size={18} style={{ color: 'var(--accent-cyan)' }} />}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-amber)', fontWeight: '700', marginTop: '2px' }}>
                      {member.allTime.xp.toLocaleString()} XP
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {member.allTime.totalSolved} solved ({member.allTime.easy}E / {member.allTime.medium}M / {member.allTime.hard}H)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            💡 Names & avatar themes can be edited anytime in <strong>Settings</strong>.
          </span>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
