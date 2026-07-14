import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { QuickLogBar } from './components/QuickLogBar';
import { LeaderboardCard } from './components/LeaderboardCard';
import { HeatmapView } from './components/HeatmapView';
import { BadgesGrid } from './components/BadgesGrid';
import { RecentLogsModal } from './components/RecentLogsModal';
import { SettingsModal } from './components/SettingsModal';
import type { TeamMember } from './types';
import { RefreshCw } from 'lucide-react';

export function App() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [activeUserId, setActiveUserId] = useState<number>(() => {
    const saved = localStorage.getItem('dsa_tracker_active_user');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Modal toggles
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const activeUser = team.find((m) => m.userId === activeUserId) || null;

  const fetchTeamData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error('Error fetching team live data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
    const interval = setInterval(() => {
      fetchTeamData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTeamData]);

  const handleSelectUser = (id: number) => {
    setActiveUserId(id);
    localStorage.setItem('dsa_tracker_active_user', id.toString());
  };

  const handleSubmitLog = async (easy: number, medium: number, hard: number, timestamp?: string): Promise<boolean> => {
    if (!activeUser) return false;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.userId,
          easyCount: easy,
          mediumCount: medium,
          hardCount: hard,
          timestamp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTeamData(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to log problem:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndoLast = async (userId: number): Promise<void> => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/logs/latest/${userId}`, { method: 'DELETE' });
      await fetchTeamData(true);
    } catch (err) {
      console.error('Failed to undo log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeUser={activeUser}
        onOpenSwitcher={() => setIsSwitcherOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Sync Status Bar */}
        <div className="sync-bar">
          <div className="sync-status">
            <span className="pulse-dot" />
            <span>Live Sync Active — All 4 Teammates Connected</span>
          </div>
          <button
            onClick={() => fetchTeamData(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)' }}
            title="Force refresh data"
          >
            <RefreshCw size={13} />
            <span>Synced: {lastSynced.toLocaleTimeString()}</span>
          </button>
        </div>

        {/* Quick Log Bar */}
        <QuickLogBar
          activeUser={activeUser}
          onSubmitLog={handleSubmitLog}
          onUndoLast={handleUndoLast}
          isSubmitting={isSubmitting}
        />

        {loading && team.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <RefreshCw size={28} style={{ color: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
              <span>Connecting to live DSA A2Z arena database...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Split View: Leaderboard vs Heatmap */}
            <div className="split-layout">
              <div>
                <LeaderboardCard team={team} activeUserId={activeUserId} />
              </div>

              <div>
                {activeUser ? (
                  <HeatmapView activity={activeUser.activity} userName={activeUser.userName} />
                ) : (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Select a teammate profile above to view their 13-week contribution heatmap and streak!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Section */}
            {activeUser && (
              <BadgesGrid badges={activeUser.badges} userName={activeUser.userName} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <span>Striver A2Z Sheet — 4-Person Team Competition Tracker</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>● Real SQLite Database Persistence</span>
            <span>Built with React + Vite + Node.js + Vanilla CSS</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        team={team}
        activeUserId={activeUserId}
        onSelectUser={handleSelectUser}
      />

      <RecentLogsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeUser={activeUser}
        team={team}
        onRefreshTeam={() => fetchTeamData(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        team={team}
        onRefreshTeam={() => fetchTeamData(true)}
      />
    </div>
  );
}

export default App;
