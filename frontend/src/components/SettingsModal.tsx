import React, { useState } from 'react';
import { X, Settings, Check, Palette } from 'lucide-react';
import type { TeamMember } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  onRefreshTeam: () => void;
}

const COLOR_PRESETS = [
  '#00f0ff', // Neon Cyan
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Orange
  '#ec4899', // Magenta Pink
  '#8b5cf6', // Violet Purple
  '#3b82f6', // Bright Blue
  '#ef4444', // Ruby Red
  '#eab308', // Gold Yellow
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  team,
  onRefreshTeam,
}) => {
  const [editingNames, setEditingNames] = useState<Record<number, string>>({});
  const [editingColors, setEditingColors] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveMember = async (userId: number, currentName: string, currentColor: string) => {
    setSavingId(userId);
    try {
      const name = editingNames[userId] !== undefined ? editingNames[userId] : currentName;
      const avatarColor = editingColors[userId] !== undefined ? editingColors[userId] : currentColor;

      const res = await fetch(`/api/team/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarColor }),
      });

      const data = await res.json();
      if (data.success) {
        setToast(`Successfully updated profile for ${name}!`);
        setTimeout(() => setToast(null), 2500);
        onRefreshTeam();
      }
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Settings size={20} />
            </div>
            <div className="modal-title">
              <h3>Team Roster & Theme Configuration</h3>
              <p>Customize the names and neon accent colors of the 4 fixed teammates</p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {toast && (
          <div style={{ margin: '16px 24px 0', padding: '12px 18px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#a7f3d0', fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> {toast}
          </div>
        )}

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {team.map((member) => {
            const currentName = editingNames[member.userId] !== undefined ? editingNames[member.userId] : member.userName;
            const currentColor = editingColors[member.userId] !== undefined ? editingColors[member.userId] : member.avatarColor;

            return (
              <div
                key={member.userId}
                style={{
                  padding: '18px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      className="member-avatar"
                      style={{ width: '44px', height: '44px', backgroundColor: currentColor }}
                    >
                      {currentName.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Member #{member.userId} Name
                      </label>
                      <input
                        type="text"
                        value={currentName}
                        onChange={(e) => setEditingNames({ ...editingNames, [member.userId]: e.target.value })}
                        style={{
                          background: '#070a12',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '15px',
                          outline: 'none',
                          width: '200px',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveMember(member.userId, currentName, currentColor)}
                    disabled={savingId === member.userId}
                    className="btn-primary"
                    style={{ padding: '10px 18px' }}
                  >
                    <Check size={16} />
                    <span>{savingId === member.userId ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={14} /> Color Palette:
                  </span>
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingColors({ ...editingColors, [member.userId]: color })}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: currentColor === color ? '3px solid #fff' : 'none',
                        boxShadow: currentColor === color ? `0 0 12px ${color}` : 'none',
                        cursor: 'pointer',
                        transform: currentColor === color ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Changes immediately broadcast across all devices.
          </span>
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
