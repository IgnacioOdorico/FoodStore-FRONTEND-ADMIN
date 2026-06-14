import { create } from 'zustand';

export interface WsState {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useWsStore = create<WsState>((set) => ({
  isConnected: false,
  connect: () => set({ isConnected: true }),
  disconnect: () => set({ isConnected: false })
}));
