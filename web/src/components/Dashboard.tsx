import { useDevicesRealtime } from '../hooks/useDevices';
import { useAuthStore } from '../store/authStore';
import { DeviceCard } from './DeviceCard';
import { RecentActivity } from './RecentActivity';
import './Dashboard.css';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const devices = useDevicesRealtime();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">🔐 Lost Device Finder</h1>
            <p className="dashboard-subtitle">Protect and locate your devices remotely</p>
          </div>
          <div className="header-right">
            <span className="user-email">👤 {user?.email}</span>
            <button className="sign-out-button" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h2 className="empty-title">No Devices Registered Yet</h2>
            <p className="empty-text">
              Start protecting your devices by installing the mobile app and
              logging in with your account credentials.
            </p>
            <div className="empty-instructions">
              <h3 className="empty-instructions-title">📖 Getting Started</h3>
              <ul className="empty-instructions-list">
                <li>Download and install the Lost Device Finder mobile app</li>
                <li>Open the app and sign in with the same email: <strong>{user?.email}</strong></li>
                <li>Your device will automatically appear here</li>
                <li>Use the Ring button to locate your device remotely</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="devices-grid">
              {devices.map((device) => (
                <DeviceCard key={device.deviceId} device={device} />
              ))}
            </div>
            <div className="dashboard-activity-section">
              <RecentActivity />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
