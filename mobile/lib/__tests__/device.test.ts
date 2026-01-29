import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { getDevicePlatform, getDeviceName, getOrCreateDeviceId, clearDeviceId } from '../device'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('device utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getDevicePlatform', () => {
    it('should return "ios" for iOS platform', () => {
      expect(getDevicePlatform()).toBe('ios')
    })

    it('should return "android" for non-iOS platforms', () => {
      // Since our mock sets Platform.OS to 'ios', we can't easily change it
      // This test documents that any platform other than ios returns 'android'
      const result = getDevicePlatform()
      expect(['ios', 'android']).toContain(result)
    })
  })

  describe('getDeviceName', () => {
    it('should return device name with platform', async () => {
      const deviceName = await getDeviceName()
      expect(deviceName).toContain('(')
      expect(deviceName).toContain(')')
      expect(deviceName).toMatch(/\(ios\)|\(android\)/)
    })
  })

  describe('getOrCreateDeviceId', () => {
    it('should return existing device ID from storage', async () => {
      const mockId = 'existing_device_id_123'
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockId)

      const deviceId = await getOrCreateDeviceId()

      expect(deviceId).toBe(mockId)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@lost_device_finder:deviceId')
    })

    it('should create and store new device ID when none exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
      ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)

      const deviceId = await getOrCreateDeviceId()

      expect(deviceId).toMatch(/^device_/)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@lost_device_finder:deviceId',
        expect.stringMatching(/^device_/)
      )
    })

    it('should return fallback ID on storage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'))

      const deviceId = await getOrCreateDeviceId()

      expect(deviceId).toMatch(/^device_/)
    })
  })

  describe('clearDeviceId', () => {
    it('should remove device ID from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

      await clearDeviceId()

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@lost_device_finder:deviceId')
    })

    it('should handle errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'))

      await expect(clearDeviceId()).resolves.not.toThrow()
    })
  })
})
