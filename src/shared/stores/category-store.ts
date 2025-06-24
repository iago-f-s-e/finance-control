import { create } from 'zustand'
import type { Category } from '@/domains/categories/entities/category'
import type { TransactionType } from '@/domains/transactions/entities/transaction'

interface CategoryState {
  // State
  categories: Category[]
  isLoading: boolean
  error: string | null

  // Computed
  incomeCategories: Category[]
  expenseCategories: Category[]

  // Actions
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Category) => void
  removeCategory: (id: string) => void
  getCategoriesByType: (type: TransactionType) => Category[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // Initial state
  categories: [],
  isLoading: false,
  error: null,

  // Computed values
  get incomeCategories() {
    return get().categories.filter(c => c.type === 'INCOME')
  },

  get expenseCategories() {
    return get().categories.filter(c => c.type === 'EXPENSE')
  },

  // Actions
  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  updateCategory: (id, category) =>
    set((state) => ({
      categories: state.categories.map(c => c.id === id ? category : c),
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id),
    })),

  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type)
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
})) 