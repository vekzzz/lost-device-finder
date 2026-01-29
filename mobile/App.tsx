import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Platform, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { doc, onSnapshot } from 'firebase/firestore';
import { useDeviceStore } from './store/deviceStore';
import { DeviceRegistration } from './components/DeviceRegistration';
import { EditDeviceNameModal } from './components/EditDeviceNameModal';
import { auth, db } from './lib/firebase';
import { signOut } from 'firebase/auth';
import {
  requestNotificationPermissions,
  sendNotification,
} from './lib/backgroundTasks';

export default function App() {
  const {
    deviceId,
    deviceStatus,
    alertStatus,
    error,
    lastCommand,
    initializeDevice,
    startCommandListener,
    manualStopAlert,
  } = useDeviceStore();

  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [backgroundTaskStatus, setBackgroundTaskStatus] = useState<string>('');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Initialize device on app start
    initializeDevice();

    // Check if user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const registered = !!user && !user.isAnonymous;
      setIsRegistered(registered);
      setCheckingAuth(false);
      setUserEmail(user?.email || '');

      // Start command listener if user is authenticated
      if (registered) {
        startCommandListener();
      }
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to device name changes
  useEffect(() => {
    if (!deviceId || !isRegistered) return;

    const deviceRef = doc(db, 'devices', deviceId);
    const unsubscribe = onSnapshot(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDeviceName(data.name || '');
      }
    });

    return unsubscribe;
  }, [deviceId, isRegistered]);

  // Setup notifications
  useEffect(() => {
    if (!isRegistered) return;

    const setupNotifications = async () => {
      try {
        // Request notification permissions
        const notifPermission = await requestNotificationPermissions();
        if (notifPermission) {
          setBackgroundTaskStatus('Notifications enabled - App will alert even in background');
        } else {
          setBackgroundTaskStatus('Notifications disabled - Enable in settings for background alerts');
          Alert.alert(
            'Notifications Recommended',
            'Please enable notifications to receive alerts when your device rings, even when the app is in the background.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [isRegistered]);

  // Monitor alert status and send notifications when ringing
  useEffect(() => {
    if (alertStatus === 'ringing') {
      sendNotification(
        '🔊 Device Alert Active',
        'Your device is ringing! Open the app to stop it.'
      );
    }
  }, [alertStatus]);

  // Pulse animation for ringing alert
  useEffect(() => {
    if (alertStatus === 'ringing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertStatus]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? You will need to sign in again to receive commands.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              setIsRegistered(false);
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Show loading while checking auth
  if (checkingAuth || deviceStatus === 'registering') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Initializing Device...</Text>
          <Text style={styles.loadingSubtext}>Please wait</Text>
        </View>
      </View>
    );
  }

  // Show registration screen if not registered
  if (!isRegistered && deviceId) {
    return (
      <DeviceRegistration
        deviceId={deviceId}
        onRegistered={() => setIsRegistered(true)}
      />
    );
  }

  const getPlatformEmoji = () => {
    return Platform.OS === 'ios' ? '📱' : '🤖';
  };

  const getPlatformName = () => {
    return Platform.OS === 'ios' ? 'iOS' : 'Android';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header with gradient background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>🔐 Lost Device Finder</Text>
            <Text style={styles.subtitle}>Device Protection Active</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        {userEmail ? (
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>👤 {userEmail}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Alert Status - Priority Display */}
        {alertStatus !== 'idle' && (
          <Animated.View
            style={[
              styles.card,
              alertStatus === 'ringing' ? styles.alertCard : styles.stoppingCard,
              alertStatus === 'ringing' && { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.alertIconContainer}>
              {alertStatus === 'ringing' ? (
                <Animated.Text style={[styles.alertIcon, { transform: [{ scale: pulseAnim }] }]}>
                  🔊
                </Animated.Text>
              ) : (
                <View style={styles.stoppingIconContainer}>
                  <ActivityIndicator size="large" color="#667eea" />
                </View>
              )}
            </View>
            <Text style={[
              styles.alertTitle,
              alertStatus === 'stopping' && styles.stoppingTitle
            ]}>
              {alertStatus === 'ringing' ? 'ALERT ACTIVE' : 'Stopping Alert...'}
            </Text>
            <Text style={[
              styles.alertSubtitle,
              alertStatus === 'stopping' && styles.stoppingSubtitle
            ]}>
              {alertStatus === 'ringing'
                ? 'Device is ringing at maximum volume'
                : 'Please wait while we silence the alert'}
            </Text>
            {alertStatus === 'ringing' && (
              <TouchableOpacity
                style={styles.stopAlertButton}
                onPress={async () => {
                  try {
                    await manualStopAlert();
                    // Show success message after a delay to let the animation finish
                    setTimeout(() => {
                      Alert.alert(
                        '✅ Alert Stopped',
                        'The ringing has been stopped. Glad you found your device!',
                        [{ text: 'OK' }]
                      );
                    }, 500);
                  } catch (error) {
                    console.error('Error stopping alert:', error);
                    Alert.alert(
                      'Error',
                      'Failed to stop the alert. Please try again.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
              >
                <Text style={styles.stopAlertButtonText}>⏹️ Stop Alert Now</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Device Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Device Status</Text>
            {deviceStatus === 'registered' && (
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>Active</Text>
              </View>
            )}
            {deviceStatus === 'error' && (
              <View style={[styles.statusBadge, styles.statusBadgeError]}>
                <Text style={styles.statusBadgeText}>Error</Text>
              </View>
            )}
          </View>

          {/* Device Name with Edit Button */}
          {deviceName && (
            <View style={styles.deviceNameRow}>
              <View style={styles.deviceNameContent}>
                <Text style={styles.deviceInfoIcon}>{getPlatformEmoji()}</Text>
                <View style={styles.deviceInfoText}>
                  <Text style={styles.deviceInfoLabel}>Device Name</Text>
                  <Text style={styles.deviceInfoValue}>{deviceName}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowEditNameModal(true)}
              >
                <Text style={styles.editButtonIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoIcon}>📱</Text>
            <View style={styles.deviceInfoText}>
              <Text style={styles.deviceInfoLabel}>Platform</Text>
              <Text style={styles.deviceInfoValue}>{getPlatformName()}</Text>
            </View>
          </View>

          {deviceStatus === 'registered' && (
            <>
              <View style={styles.successMessage}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>
                  Your device is protected and listening for commands
                </Text>
              </View>

              {backgroundTaskStatus && (
                <View style={styles.backgroundStatusInfo}>
                  <Text style={styles.backgroundStatusIcon}>🔄</Text>
                  <Text style={styles.backgroundStatusText}>
                    {backgroundTaskStatus}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Edit Device Name Modal */}
        {deviceId && deviceName && (
          <EditDeviceNameModal
            visible={showEditNameModal}
            deviceId={deviceId}
            currentName={deviceName}
            onClose={() => setShowEditNameModal(false)}
            onSuccess={() => {
              // Device name will update automatically via Firestore listener
            }}
          />
        )}

        {/* Device ID Card */}
        {deviceId && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Device Identifier</Text>
            <View style={styles.deviceIdContainer}>
              <Text style={styles.deviceId} selectable>{deviceId}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                This unique ID is used to identify your device in the web dashboard
              </Text>
            </View>
          </View>
        )}

        {/* Last Command Card */}
        {lastCommand && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Last Action</Text>
            <View style={styles.simpleActivityContainer}>
              <View style={styles.simpleActivityIcon}>
                <Text style={styles.simpleActivityEmoji}>
                  {lastCommand.type === 'ring' && '🔔'}
                  {lastCommand.type === 'stop' && '⏹️'}
                  {lastCommand.type === 'found' && '✓'}
                </Text>
              </View>
              <View style={styles.simpleActivityContent}>
                <Text style={styles.simpleActivityAction}>
                  {lastCommand.type === 'ring' && 'Device Rang'}
                  {lastCommand.type === 'stop' && 'Alert Stopped'}
                  {lastCommand.type === 'found' && 'Marked as Found'}
                </Text>
                <Text style={styles.simpleActivityTime}>
                  {new Date(lastCommand.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <View style={[
                styles.simpleActivityStatus,
                lastCommand.status === 'executed' ? styles.simpleActivityStatusSuccess : styles.simpleActivityStatusPending
              ]}>
                <Text style={styles.simpleActivityStatusText}>
                  {lastCommand.status === 'executed' ? '✓' : '⏳'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={[styles.card, styles.errorCard]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Error Occurred</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Instructions Card */}
        <View style={[styles.card, styles.instructionsCard]}>
          <Text style={styles.cardTitle}>📖 How It Works</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Keep this app running in the background on your device
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Access the web dashboard using the same login credentials
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                If your device is lost, send a ring command remotely
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Your device will play a loud alert to help you find it
              </Text>
            </View>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(209, 213, 219, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6e6e73',
  },
  signOutButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
  },
  userEmail: {
    color: '#1c1c1e',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeError: {
    backgroundColor: '#f8d7da',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#155724',
    fontSize: 13,
    fontWeight: '600',
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
  },
  deviceNameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonIcon: {
    fontSize: 18,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfoIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  deviceInfoText: {
    flex: 1,
  },
  deviceInfoLabel: {
    fontSize: 13,
    color: '#6e6e73',
    marginBottom: 4,
  },
  deviceInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  successIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  backgroundStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  backgroundStatusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  backgroundStatusText: {
    flex: 1,
    fontSize: 12,
    color: '#007aff',
    lineHeight: 16,
  },
  deviceIdContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
    marginBottom: 12,
  },
  deviceId: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#3a3a3c',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007aff',
    lineHeight: 18,
  },
  // New Activity Container Styles
  simpleActivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
    gap: 12,
  },
  simpleActivityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleActivityEmoji: {
    fontSize: 22,
  },
  simpleActivityContent: {
    flex: 1,
    gap: 4,
  },
  simpleActivityAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  simpleActivityTime: {
    fontSize: 13,
    color: '#6e6e73',
  },
  simpleActivityStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleActivityStatusSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  simpleActivityStatusPending: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
  },
  simpleActivityStatusText: {
    fontSize: 16,
  },
  alertCard: {
    backgroundColor: '#FF3B30',
    borderWidth: 0,
  },
  stoppingCard: {
    backgroundColor: '#667eea',
    borderWidth: 0,
  },
  alertIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 48,
  },
  stoppingIconContainer: {
    padding: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stoppingTitle: {
    color: '#fff',
  },
  alertSubtitle: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  stoppingSubtitle: {
    color: '#fff',
    opacity: 0.95,
  },
  errorCard: {
    backgroundColor: 'rgba(254, 202, 202, 0.3)',
    borderWidth: 2,
    borderColor: '#fc8181',
  },
  errorIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c53030',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#c53030',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: '#3a3a3c',
    lineHeight: 22,
    paddingTop: 5,
  },
  footer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(209, 213, 219, 0.3)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6e6e73',
  },
  stopAlertButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopAlertButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF3B30',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
