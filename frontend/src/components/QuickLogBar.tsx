import React, { useState } from 'react';
import { Plus, Minus, Zap, RotateCcw, Calendar, Check, AlertCircle } from 'lucide-react';
import type { TeamMember } from '../types';

interface QuickLogBarProps {
  activeUser: TeamMember | null;
  onSubmitLog: (easy: number, medium: number, hard: number, timestamp?: string) => Promise<boolean>;
  onUndoLast: (userId: number) => Promise<void>;
  isSubmitting: boolean;
}

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  activeUser,
  onSubmitLog,
  onUndoLast,
  isSubmitting,
}) => {
  const [easy, setEasy] = useState<number>(0);
  const [medium, setMedium] = useState<number>(0);
  const [hard, setHard] = useState<number>(0);
  const [showCustomDate, setShowCustomDate] = useState<boolean>(false);
  const [customTimestamp, setCustomTimestamp] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'undo' | 'error'; message: string } | null>(null);

  const showToastMsg = (type: 'success' | 'undo' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLog = async () => {
    if (easy === 0 && medium === 0 && hard === 0) {
      showToastMsg('error', 'Select at least 1 problem count to log!');
      return;
    }
    const xpGained = easy * 10 + medium * 20 + hard * 30;
    const success = await onSubmitLog(
      easy,
      medium,
      hard,
      showCustomDate && customTimestamp ? new Date(customTimestamp).toISOString() : undefined
    );
    if (success) {
      showToastMsg('success', `Logged ${easy + medium + hard} problem(s)! +${xpGained} XP awarded.`);
      setEasy(0);
      setMedium(0);
      setHard(0);
      if (showCustomDate) {
        setShowCustomDate(false);
        setCustomTimestamp('');
      }
    } else {
      showToastMsg('error', 'Failed to submit log.');
    }
  };

  const handleQuickPreset = async (type: 'easy' | 'medium' | 'hard') => {
    const e = type === 'easy' ? 1 : 0;
    const m = type === 'medium' ? 1 : 0;
    const h = type === 'hard' ? 1 : 0;
    const xp = e * 10 + m * 20 + h * 30;
    const success = await onSubmitLog(e, m, h);
    if (success) {
      showToastMsg('success', `⚡ Quick Log: +1 ${type.toUpperCase()} solved! +${xp} XP`);
    } else {
      showToastMsg('error', 'Failed quick log.');
    }
  };

  const handleUndo = async () => {
    if (!activeUser) return;
    await onUndoLast(activeUser.userId);
    showToastMsg('undo', 'Rolled back most recent log entry.');
  };

  if (!activeUser) {
    return (
      <div className="glass-card quick-log-card" style={{ textAlign: 'center', padding: '32px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Please select your profile from the top right <strong>Select Teammate</strong> button to begin logging problems!
        </p>
      </div>
    );
  }

  const totalSelected = easy + medium + hard;
  const estimatedXP = easy * 10 + medium * 20 + hard * 30;

  return (
    <div className="glass-card quick-log-card">
      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          {toast.type === 'success' && <Check size={16} />}
          {toast.type === 'undo' && <RotateCcw size={16} />}
          {toast.type === 'error' && <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Bar with User & Presets */}
      <div className="quick-log-header">
        <div className="quick-log-user">
          <div
            className="user-avatar"
            style={{ width: '40px', height: '40px', backgroundColor: activeUser.avatarColor, fontSize: '15px' }}
          >
            {activeUser.userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="quick-log-title">
              <span>Log Solved Problems for {activeUser.userName}</span>
              <span className="live-badge">Live Sync</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              XP Formula: Easy = 10 XP | Medium = 20 XP | Hard = 30 XP
            </p>
          </div>
        </div>

        {/* 1-Tap Quick Presets */}
        <div className="quick-log-presets">
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '4px', fontWeight: '700' }}>
            1-TAP PRESETS:
          </span>
          <button
            onClick={() => handleQuickPreset('easy')}
            disabled={isSubmitting}
            className="preset-btn easy"
            title="Immediately log 1 Easy problem"
          >
            <Zap size={14} /> +1 Easy
          </button>
          <button
            onClick={() => handleQuickPreset('medium')}
            disabled={isSubmitting}
            className="preset-btn medium"
            title="Immediately log 1 Medium problem"
          >
            <Zap size={14} /> +1 Med
          </button>
          <button
            onClick={() => handleQuickPreset('hard')}
            disabled={isSubmitting}
            className="preset-btn hard"
            title="Immediately log 1 Hard problem"
          >
            <Zap size={14} /> +1 Hard
          </button>
        </div>
      </div>

      {/* Stepper Counters Grid */}
      <div className="counters-grid">
        {/* Easy Box */}
        <div className="counter-box easy">
          <div>
            <div className="counter-label easy">Easy Problems</div>
            <div className="counter-xp">+10 XP each</div>
          </div>
          <div className="stepper-controls">
            <button
              onClick={() => setEasy(Math.max(0, easy - 1))}
              disabled={easy === 0 || isSubmitting}
              className="stepper-btn"
            >
              <Minus size={18} />
            </button>
            <span className="stepper-val">{easy}</span>
            <button
              onClick={() => setEasy(easy + 1)}
              disabled={isSubmitting}
              className="stepper-btn add easy"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Medium Box */}
        <div className="counter-box medium">
          <div>
            <div className="counter-label medium">Medium Problems</div>
            <div className="counter-xp">+20 XP each</div>
          </div>
          <div className="stepper-controls">
            <button
              onClick={() => setMedium(Math.max(0, medium - 1))}
              disabled={medium === 0 || isSubmitting}
              className="stepper-btn"
            >
              <Minus size={18} />
            </button>
            <span className="stepper-val">{medium}</span>
            <button
              onClick={() => setMedium(medium + 1)}
              disabled={isSubmitting}
              className="stepper-btn add medium"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Hard Box */}
        <div className="counter-box hard">
          <div>
            <div className="counter-label hard">Hard Problems</div>
            <div className="counter-xp">+30 XP each</div>
          </div>
          <div className="stepper-controls">
            <button
              onClick={() => setHard(Math.max(0, hard - 1))}
              disabled={hard === 0 || isSubmitting}
              className="stepper-btn"
            >
              <Minus size={18} />
            </button>
            <span className="stepper-val">{hard}</span>
            <button
              onClick={() => setHard(hard + 1)}
              disabled={isSubmitting}
              className="stepper-btn add hard"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Row */}
      <div className="custom-date-row">
        <button
          onClick={() => setShowCustomDate(!showCustomDate)}
          className="date-toggle-btn"
        >
          <Calendar size={16} />
          <span>
            {showCustomDate ? 'Logging for past date:' : 'Date: Logging for right now (Click to pick past date)'}
          </span>
        </button>

        {showCustomDate && (
          <input
            type="datetime-local"
            value={customTimestamp}
            onChange={(e) => setCustomTimestamp(e.target.value)}
            className="date-input"
          />
        )}
      </div>

      {/* Footer & Actions */}
      <div className="quick-log-footer">
        <div className="summary-pills">
          <div className="summary-item">
            Selected: <strong>{totalSelected} problem(s)</strong>
          </div>
          {totalSelected > 0 && (
            <div className="estimated-gain-pill">
              Estimated Gain: +{estimatedXP} XP
            </div>
          )}
        </div>

        <div className="quick-log-buttons">
          <button
            onClick={handleUndo}
            disabled={isSubmitting || activeUser.allTime.totalSolved === 0}
            className="btn-secondary danger"
            title="Roll back most recent log entry"
          >
            <RotateCcw size={16} />
            <span>Undo Last Log</span>
          </button>

          <button
            onClick={handleLog}
            disabled={isSubmitting || totalSelected === 0}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <Check size={18} />
            <span>{isSubmitting ? 'Submitting...' : `Submit Solves (+${estimatedXP} XP)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
