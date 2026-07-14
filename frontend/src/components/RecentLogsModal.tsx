import React, { useState, useEffect } from 'react';
import { X, History, Trash2, Edit3, Check } from 'lucide-react';
import type { LogEntry, TeamMember } from '../types';

interface RecentLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: TeamMember | null;
  team: TeamMember[];
  onRefreshTeam: () => void;
}

export const RecentLogsModal: React.FC<RecentLogsModalProps> = ({
  isOpen,
  onClose,
  activeUser,
  onRefreshTeam,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEasy, setEditEasy] = useState<number>(0);
  const [editMedium, setEditMedium] = useState<number>(0);
  const [editHard, setEditHard] = useState<number>(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' ? '/api/logs/all' : `/api/logs/${activeUser?.userId || 'all'}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, filter, activeUser]);

  const handleDelete = async (logId: number) => {
    if (!window.confirm('Are you sure you want to delete this log entry? XP will be adjusted.')) return;
    try {
      const res = await fetch(`/api/logs/${logId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((l) => l.id !== logId));
        onRefreshTeam();
      }
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const startEditing = (log: LogEntry) => {
    setEditingId(log.id);
    setEditEasy(log.easy_count);
    setEditMedium(log.medium_count);
    setEditHard(log.hard_count);
  };

  const saveEdit = async (logId: number) => {
    try {
      const res = await fetch(`/api/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ easyCount: editEasy, mediumCount: editMedium, hardCount: editHard }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchLogs();
        onRefreshTeam();
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content large">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <History size={20} />
            </div>
            <div className="modal-title">
              <h3>Recent Problem Submissions</h3>
              <p>View history across all devices, inline edit solve counts, or delete entries</p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="tab-group">
            <button
              onClick={() => setFilter('all')}
              className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            >
              All Team Logs
            </button>
            {activeUser && (
              <button
                onClick={() => setFilter('mine')}
                className={`tab-btn ${filter === 'mine' ? 'active' : ''}`}
              >
                {activeUser.userName}'s Logs
              </button>
            )}
          </div>

          <button onClick={fetchLogs} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            🔄 Refresh History
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Loading log history...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No problem logs recorded yet. Use the quick logger to submit solves!
            </div>
          ) : (
            logs.map((log) => {
              const isEditing = editingId === log.id;
              const total = log.easy_count + log.medium_count + log.hard_count;
              const xp = log.easy_count * 10 + log.medium_count * 20 + log.hard_count * 30;
              const d = new Date(log.timestamp);

              return (
                <div
                  key={log.id}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      className="member-avatar"
                      style={{ width: '40px', height: '40px', backgroundColor: log.avatar_color, fontSize: '14px' }}
                    >
                      {log.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{log.user_name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-cyan)', background: 'rgba(0, 240, 255, 0.15)', padding: '2px 8px', borderRadius: '50px' }}>
                          +{xp} XP
                        </span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {d.toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#070a12', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-medium)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>E:</span>
                        <input
                          type="number"
                          min={0}
                          value={editEasy}
                          onChange={(e) => setEditEasy(parseInt(e.target.value || '0', 10))}
                          style={{ width: '48px', background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        <span style={{ color: 'var(--accent-emerald)' }}>M:</span>
                        <input
                          type="number"
                          min={0}
                          value={editMedium}
                          onChange={(e) => setEditMedium(parseInt(e.target.value || '0', 10))}
                          style={{ width: '48px', background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        <span style={{ color: 'var(--accent-amber)' }}>H:</span>
                        <input
                          type="number"
                          min={0}
                          value={editHard}
                          onChange={(e) => setEditHard(parseInt(e.target.value || '0', 10))}
                          style={{ width: '48px', background: '#000', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', textAlign: 'center' }}
                        />
                      </div>
                      <button onClick={() => saveEdit(log.id)} className="btn-primary" style={{ padding: '6px 12px' }} title="Save">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary" style={{ padding: '6px 10px' }} title="Cancel">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        <span style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                          {log.easy_count}E
                        </span>
                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          {log.medium_count}M
                        </span>
                        <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          {log.hard_count}H
                        </span>
                        <strong style={{ color: '#fff', marginLeft: '4px' }}>({total} total)</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => startEditing(log)}
                          className="btn-secondary"
                          style={{ padding: '8px 10px' }}
                          title="Edit counts"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="btn-secondary danger"
                          style={{ padding: '8px 10px' }}
                          title="Delete log entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer">
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Total logs shown: <strong>{logs.length}</strong>
          </span>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
