import { useActivities } from '../hooks/useActivities';
import { getTimeSinceLastSeen } from '../lib/deviceStatus';
import './RecentActivity.css';

export function RecentActivity() {
  const activities = useActivities(10);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ring':
        return '🔔';
      case 'stop':
        return '⏹️';
      case 'found':
        return '✓';
      default:
        return '•';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'ring':
        return 'Started ringing';
      case 'stop':
        return 'Stopped alert';
      case 'found':
        return 'Marked as found';
      default:
        return 'Unknown action';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'ring':
        return 'orange';
      case 'stop':
        return 'blue';
      case 'found':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="recent-activity">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-empty">
          <div className="activity-empty-icon">📊</div>
          <p className="activity-empty-text">No recent activity</p>
          <p className="activity-empty-subtext">
            Device actions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <h2 className="activity-title">Recent Activity</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.activityId} className={`activity-item ${getActionColor(activity.action)}`}>
            <div className="activity-icon">{getActionIcon(activity.action)}</div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-device">{activity.deviceName}</span>
                <span className="activity-time">{getTimeSinceLastSeen(activity.timestamp)}</span>
              </div>
              <div className="activity-action">{getActionText(activity.action)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
