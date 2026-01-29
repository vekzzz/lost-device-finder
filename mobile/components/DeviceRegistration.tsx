import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useDeviceStore } from '../store/deviceStore';
import { handleFirebaseError } from '../lib/firebaseErrors';
import { getDeviceName, getDevicePlatform } from '../lib/device';

interface DeviceRegistrationProps {
  deviceId: string;
  onRegistered: () => void;
}

export function DeviceRegistration({ deviceId, onRegistered }: DeviceRegistrationProps) {
  const { startCommandListener } = useDeviceStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let userId: string;

      if (isLogin) {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;

        // Create user document
        await setDoc(doc(db, 'users', userId), {
          email,
          createdAt: new Date(),
        });
      }

      // Register device under this user with actual device model name
      const deviceName = await getDeviceName();
      const platformName = getDevicePlatform();
      await setDoc(doc(db, 'devices', deviceId), {
        userId,
        name: deviceName,
        platform: platformName,
        lastSeen: new Date(),
        status: 'online',
        createdAt: new Date(),
      });

      // Start listening for commands
      startCommandListener();

      onRegistered();
    } catch (err: unknown) {
      const friendlyMessage = handleFirebaseError(err, 'user registration');
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      Alert.alert(
        '✅ Email Sent!',
        'Password reset instructions have been sent to your email. Please check your inbox and spam folder.',
        [{ text: 'OK' }]
      );
    } catch (err: unknown) {
      const friendlyMessage = handleFirebaseError(err, 'password reset');
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register Your Device</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to link this device to your account' : 'Create an account to protect this device'}
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete={isLogin ? 'password' : 'password-new'}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
            setResetEmailSent(false);
          }}
        >
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceIdLabel}>Device ID:</Text>
          <Text style={styles.deviceId}>{deviceId}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  error: {
    backgroundColor: 'rgba(254, 202, 202, 0.3)',
    borderWidth: 1,
    borderColor: '#fc8181',
    color: '#c53030',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  toggleButton: {
    padding: 12,
    alignItems: 'center',
  },
  toggleText: {
    color: '#667eea',
    fontSize: 14,
  },
  deviceInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  deviceIdLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#2d3748',
  },
});
