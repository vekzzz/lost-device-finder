import { describe, it, expect } from 'vitest'
import { getFirebaseErrorMessage, handleFirebaseError } from './firebaseErrors'

describe('firebaseErrors', () => {
  describe('getFirebaseErrorMessage', () => {
    it('should return friendly message for invalid email error', () => {
      const error = { code: 'auth/invalid-email' }
      expect(getFirebaseErrorMessage(error)).toBe('Please enter a valid email address.')
    })

    it('should return friendly message for wrong password error', () => {
      const error = { code: 'auth/wrong-password' }
      expect(getFirebaseErrorMessage(error)).toBe('Incorrect password. Please try again.')
    })

    it('should return friendly message for user not found error', () => {
      const error = { code: 'auth/user-not-found' }
      expect(getFirebaseErrorMessage(error)).toBe('No account found with this email. Please check your email or sign up.')
    })

    it('should return friendly message for weak password error', () => {
      const error = { code: 'auth/weak-password' }
      expect(getFirebaseErrorMessage(error)).toBe('Password is too weak. Please use at least 6 characters.')
    })

    it('should return friendly message for email already in use error', () => {
      const error = { code: 'auth/email-already-in-use' }
      expect(getFirebaseErrorMessage(error)).toBe('This email is already registered. Please sign in instead.')
    })

    it('should return friendly message for network error', () => {
      const error = { code: 'auth/network-request-failed' }
      expect(getFirebaseErrorMessage(error)).toBe('Network error. Please check your internet connection.')
    })

    it('should return generic auth error for unknown auth error codes', () => {
      const error = { code: 'auth/unknown-error' }
      expect(getFirebaseErrorMessage(error)).toBe('Authentication failed. Please try again.')
    })

    it('should return specific firestore error message', () => {
      const error = { code: 'firestore/permission-denied' }
      expect(getFirebaseErrorMessage(error)).toBe('You don\'t have permission to perform this action.')
    })

    it('should return generic error for errors without code', () => {
      const error = { message: 'Some error' }
      expect(getFirebaseErrorMessage(error)).toBe('Something went wrong. Please try again.')
    })
  })

  describe('handleFirebaseError', () => {
    it('should include operation context in error message', () => {
      const error = { code: 'auth/network-request-failed' }
      const message = handleFirebaseError(error, 'login')
      expect(message).toContain('Network error')
    })

    it('should work without operation context', () => {
      const error = { code: 'auth/invalid-email' }
      const message = handleFirebaseError(error)
      expect(message).toBe('Please enter a valid email address.')
    })

    it('should handle non-Firebase errors', () => {
      const error = new Error('Generic error')
      const message = handleFirebaseError(error, 'test')
      expect(message).toBe('Something went wrong. Please try again.')
    })
  })
})
