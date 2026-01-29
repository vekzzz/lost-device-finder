import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isDeviceOnline, getDeviceStatus, getTimeSinceLastSeen } from './deviceStatus'

describe('deviceStatus', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-01 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isDeviceOnline', () => {
    it('should return true when lastSeen is within 2 minutes', () => {
      const lastSeen = new Date('2024-01-01T11:59:00Z') // 1 minute ago
      expect(isDeviceOnline(lastSeen)).toBe(true)
    })

    it('should return false when lastSeen is more than 2 minutes ago', () => {
      const lastSeen = new Date('2024-01-01T11:57:00Z') // 3 minutes ago
      expect(isDeviceOnline(lastSeen)).toBe(false)
    })

    it('should return false when lastSeen is exactly at the threshold', () => {
      const lastSeen = new Date('2024-01-01T11:58:00Z') // exactly 2 minutes ago
      expect(isDeviceOnline(lastSeen)).toBe(false)
    })
  })

  describe('getDeviceStatus', () => {
    it('should return "online" when device is online', () => {
      const lastSeen = new Date('2024-01-01T11:59:30Z')
      expect(getDeviceStatus(lastSeen)).toBe('online')
    })

    it('should return "offline" when device is offline', () => {
      const lastSeen = new Date('2024-01-01T11:55:00Z')
      expect(getDeviceStatus(lastSeen)).toBe('offline')
    })
  })

  describe('getTimeSinceLastSeen', () => {
    it('should return "Just now" for very recent times', () => {
      const lastSeen = new Date('2024-01-01T11:59:50Z') // 10 seconds ago
      expect(getTimeSinceLastSeen(lastSeen)).toBe('Just now')
    })

    it('should return minutes for times less than an hour', () => {
      const lastSeen = new Date('2024-01-01T11:55:00Z') // 5 minutes ago
      expect(getTimeSinceLastSeen(lastSeen)).toBe('5 minutes ago')
    })

    it('should return singular "minute" for 1 minute', () => {
      const lastSeen = new Date('2024-01-01T11:59:00Z') // 1 minute ago
      expect(getTimeSinceLastSeen(lastSeen)).toBe('1 minute ago')
    })

    it('should return hours for times less than a day', () => {
      const lastSeen = new Date('2024-01-01T10:00:00Z') // 2 hours ago
      expect(getTimeSinceLastSeen(lastSeen)).toBe('2 hours ago')
    })

    it('should return days for times more than 24 hours', () => {
      const lastSeen = new Date('2023-12-30T12:00:00Z') // 2 days ago
      expect(getTimeSinceLastSeen(lastSeen)).toBe('2 days ago')
    })
  })
})
