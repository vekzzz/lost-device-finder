import { create } from 'zustand';

interface DeviceStore {
  selectedDeviceId: string | null;
  setSelectedDeviceId: (deviceId: string | null) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  selectedDeviceId: null,
  setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),
}));
