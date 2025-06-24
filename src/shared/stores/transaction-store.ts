import type { Transaction } from '@/domains/transactions/entities/transaction'
import type { TransactionFilters } from '@/domains/transactions/repositories/transaction-repository'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface TransactionState {
  // State
  transactions: Transaction[]
  selectedTransactions: string[]
  filters: TransactionFilters
  isLoading: boolean
  error: string | null

  // Computed
  selectedTransactionsSum: number
  incomeTransactions: Transaction[]
  expenseTransactions: Transaction[]
  executedTransactions: Transaction[]
  pendingTransactions: Transaction[]

  // Actions
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, transaction: Transaction) => void
  removeTransaction: (id: string) => void
  setSelectedTransactions: (transactionIds: string[]) => void
  toggleTransactionSelection: (id: string) => void
  selectAllTransactions: () => void
  clearTransactionSelection: () => void
  setFilters: (filters: Partial<TransactionFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useTransactionStore = create<TransactionState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    transactions: [],
    selectedTransactions: [],
    filters: {},
    isLoading: false,
    error: null,

    // Computed values
    get selectedTransactionsSum() {
      const { transactions, selectedTransactions } = get()
      return transactions
        .filter((t) => selectedTransactions.includes(t.id))
        .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0)
    },

    get incomeTransactions() {
      return get().transactions.filter((t) => t.type === 'INCOME')
    },

    get expenseTransactions() {
      return get().transactions.filter((t) => t.type === 'EXPENSE')
    },

    get executedTransactions() {
      return get().transactions.filter((t) => t.isExecuted)
    },

    get pendingTransactions() {
      return get().transactions.filter((t) => !t.isExecuted)
    },

    // Actions
    setTransactions: (transactions) => set({ transactions }),

    addTransaction: (transaction) =>
      set((state) => ({
        transactions: [transaction, ...state.transactions],
      })),

    updateTransaction: (id, transaction) =>
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? transaction : t)),
      })),

    removeTransaction: (id) =>
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        selectedTransactions: state.selectedTransactions.filter((tid) => tid !== id),
      })),

    setSelectedTransactions: (transactionIds) => set({ selectedTransactions: transactionIds }),

    toggleTransactionSelection: (id) =>
      set((state) => ({
        selectedTransactions: state.selectedTransactions.includes(id)
          ? state.selectedTransactions.filter((tid) => tid !== id)
          : [...state.selectedTransactions, id],
      })),

    selectAllTransactions: () =>
      set((state) => ({
        selectedTransactions: state.transactions.map((t) => t.id),
      })),

    clearTransactionSelection: () => set({ selectedTransactions: [] }),

    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    clearError: () => set({ error: null }),
  })),
)
