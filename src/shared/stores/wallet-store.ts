import type { Wallet } from '@/domains/wallets/entities/wallet'
import { create } from 'zustand'

interface WalletState {
  // State
  wallets: Wallet[]
  selectedWalletId: string | null
  isLoading: boolean
  error: string | null

  // Computed
  totalBalance: number
  selectedWallet: Wallet | null

  // Actions
  setWallets: (wallets: Wallet[]) => void
  addWallet: (wallet: Wallet) => void
  updateWallet: (id: string, wallet: Wallet) => void
  removeWallet: (id: string) => void
  selectWallet: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  wallets: [],
  selectedWalletId: null,
  isLoading: false,
  error: null,

  // Computed values
  get totalBalance() {
    return get().wallets.reduce((total, wallet) => total + wallet.balance, 0)
  },

  get selectedWallet() {
    const { wallets, selectedWalletId } = get()
    return wallets.find((w) => w.id === selectedWalletId) || null
  },

  // Actions
  setWallets: (wallets) => set({ wallets }),

  addWallet: (wallet) =>
    set((state) => ({
      wallets: [...state.wallets, wallet],
    })),

  updateWallet: (id, wallet) =>
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === id ? wallet : w)),
    })),

  removeWallet: (id) =>
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
      selectedWalletId: state.selectedWalletId === id ? null : state.selectedWalletId,
    })),

  selectWallet: (id) => set({ selectedWalletId: id }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}))
