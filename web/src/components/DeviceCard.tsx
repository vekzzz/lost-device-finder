import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Device } from '../lib/types';
import { useSendCommand } from '../hooks/useCommands';
import { getDeviceStatus, getTimeSinceLastSeen } from '../lib/deviceStatus';
import { getFirebaseErrorMessage } from '../lib/firebaseErrors';
import { db } from '../lib/firebase';
import './DeviceCard.css';

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const sendCommand = useSendCommand();
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(getDeviceStatus(device.lastSeen));
  const [lastSeenText, setLastSeenText] = useState(getTimeSinceLastSeen(device.lastSeen));
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [isSavingName, setIsSavingName] = useState(false);

  // Update status every second for real-time accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus(getDeviceStatus(device.lastSeen));
      setLastSeenText(getTimeSinceLastSeen(device.lastSeen));
    }, 1000);

    return () => clearInterval(interval);
  }, [device.lastSeen]);

  const handleRing = async () => {
    try {
      setErrorMessage('');
      await sendCommand.mutateAsync({
        deviceId: device.deviceId,
        type: 'ring',
        deviceName: device.name
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      setErrorMessage(friendlyMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleStop = async () => {
    try {
      setErrorMessage('');
      await sendCommand.mutateAsync({
        deviceId: device.deviceId,
        type: 'stop',
        deviceName: device.name
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      setErrorMessage(friendlyMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleFound = async () => {
    try {
      setErrorMessage('');
      await sendCommand.mutateAsync({
        deviceId: device.deviceId,
        type: 'found',
        deviceName: device.name
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      setErrorMessage(friendlyMessage);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setErrorMessage('Device name cannot be empty');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (newName === device.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSavingName(true);
      setErrorMessage('');
      const deviceRef = doc(db, 'devices', device.deviceId);
      await updateDoc(deviceRef, { name: newName.trim() });
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const friendlyMessage = getFirebaseErrorMessage(error);
      setErrorMessage(friendlyMessage);
      setTimeout(() => setErrorMessage(''), 5000);
      setNewName(device.name); // Reset to original name on error
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(device.name);
    setIsEditing(false);
  };

  const isOnline = currentStatus === 'online';
  const platformIcon = device.platform === 'ios' ? '📱' : '🤖';

  return (
    <div className={`device-card ${isOnline ? 'online' : 'offline'}`}>
      <div className="device-header">
        <div className="device-info">
          <div className="device-name-container">
            {isEditing ? (
              <div className="device-name-edit">
                <span className="device-icon">{platformIcon}</span>
                <input
                  type="text"
                  className="device-name-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  disabled={isSavingName}
                  autoFocus
                  maxLength={50}
                />
                <div className="device-name-actions">
                  <button
                    className="device-name-save-btn"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    className="device-name-cancel-btn"
                    onClick={handleCancelEdit}
                    disabled={isSavingName}
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <h3 className="device-name">
                <span className="device-icon">{platformIcon}</span>
                {device.name}
                <button
                  className="device-name-edit-btn"
                  onClick={() => setIsEditing(true)}
                  title="Edit device name"
                >
                  ✏️
                </button>
              </h3>
            )}
          </div>
          <div className="device-meta">
            <span className={`status-badge ${currentStatus}`}>
              {currentStatus === 'online' ? 'Online' : 'Offline'}
            </span>
            {device.ringingStatus !== 'idle' && (
              <span className={`ringing-badge ${device.ringingStatus}`}>
                {device.ringingStatus === 'ringing' && '🔔 Ringing'}
                {device.ringingStatus === 'stopped' && '⏹️ Stopped'}
                {device.ringingStatus === 'found' && '✓ Found'}
              </span>
            )}
            <span className="device-platform">{device.platform}</span>
          </div>
        </div>
      </div>

      <div className="device-details">
        <div className="detail-row">
          <span className="detail-label">⏰ Last Seen</span>
          <span className="detail-value">{lastSeenText}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">🔑 Device ID</span>
          <span className="detail-value device-id" title={device.deviceId}>
            {device.deviceId}
          </span>
        </div>
      </div>

      <div className="device-actions">
        <button
          className={`action-button ring ${sendCommand.isPending ? 'loading' : ''}`}
          onClick={handleRing}
          disabled={sendCommand.isPending || !isOnline}
        >
          <span className="action-button-icon">🔔</span>
          {sendCommand.isPending ? 'Sending' : 'Ring Device'}
        </button>
        <button
          className={`action-button stop ${sendCommand.isPending ? 'loading' : ''}`}
          onClick={handleStop}
          disabled={sendCommand.isPending || !isOnline}
        >
          <span className="action-button-icon">⏹️</span>
          {sendCommand.isPending ? 'Sending' : 'Stop Alert'}
        </button>
        <button
          className={`action-button found ${sendCommand.isPending ? 'loading' : ''}`}
          onClick={handleFound}
          disabled={sendCommand.isPending || !isOnline}
        >
          <span className="action-button-icon">✓</span>
          {sendCommand.isPending ? 'Sending' : 'Mark as Found'}
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          ✓ Command sent successfully!
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          ❌ {errorMessage}
        </div>
      )}

      {!isOnline && (
        <div className="offline-notice">
          ⚠️ Device is offline. Commands will be delivered when device reconnects.
        </div>
      )}
    </div>
  );
}
