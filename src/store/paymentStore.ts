import { create } from 'zustand';

interface PaymentState {
  paymentId: string | null;
  status: string | null;
  setPaymentId: (id: string | null) => void;
  setStatus: (status: string | null) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  paymentId: null,
  status: null,
  setPaymentId: (paymentId) => set({ paymentId }),
  setStatus: (status) => set({ status }),
}));
