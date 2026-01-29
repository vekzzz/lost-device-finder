/**
 * Converts Firebase error codes to user-friendly messages
 */

interface FirebaseError {
  code?: string;
  message?: string;
}

export function getFirebaseErrorMessage(error: unknown): string {
  const firebaseError = error as FirebaseError;
  // If it's not an error object, return generic message
  if (!firebaseError) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Extract error code from Firebase error
  const errorCode = firebaseError?.code || '';
  const errorMessage = firebaseError?.message || '';

  // Authentication errors
  const authErrors: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/requires-recent-login': 'Please sign in again to continue.',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/invalid-verification-id': 'Verification expired. Please request a new code.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/invalid-continue-uri': 'Invalid configuration. Please contact support.',
    'auth/unauthorized-continue-uri': 'Invalid configuration. Please contact support.',
  };

  // Firestore errors
  const firestoreErrors: Record<string, string> = {
    'permission-denied': 'You don\'t have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'failed-precondition': 'Operation cannot be performed. Please try again.',
    'aborted': 'Operation was aborted. Please try again.',
    'out-of-range': 'Invalid value provided.',
    'unimplemented': 'This feature is not available yet.',
    'internal': 'An internal error occurred. Please try again.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'data-loss': 'Data loss detected. Please contact support.',
    'unauthenticated': 'Please sign in to continue.',
    'deadline-exceeded': 'Operation timed out. Please try again.',
    'cancelled': 'Operation was cancelled.',
  };

  // Check for specific error codes
  if (errorCode.startsWith('auth/')) {
    return authErrors[errorCode] || 'Authentication failed. Please try again.';
  }

  // Check for Firestore errors
  for (const [code, message] of Object.entries(firestoreErrors)) {
    if (errorCode.includes(code) || errorMessage.includes(code)) {
      return message;
    }
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('Network')) {
    return 'Network error. Please check your internet connection.';
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    return 'Operation timed out. Please try again.';
  }

  // Default message
  return 'Something went wrong. Please try again.';
}

/**
 * Logs error details for debugging while showing user-friendly message
 */
export function handleFirebaseError(error: unknown, context?: string): string {
  const userMessage = getFirebaseErrorMessage(error);
  const firebaseError = error as FirebaseError;

  // Log detailed error for debugging
  console.error(`Firebase error${context ? ` in ${context}` : ''}:`, {
    code: firebaseError?.code,
    message: firebaseError?.message,
    fullError: error,
  });

  return userMessage;
}
