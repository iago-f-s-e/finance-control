import type { CreateCategoryDTO } from '@/domains/categories/entities/category'
import { container } from '@/infrastructure/container'
import { useCategoryStore } from '@/shared/stores'
import { useCallback } from 'react'

export function useCategories() {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    isLoading,
    error,
    setCategories,
    addCategory,
    removeCategory,
    setLoading,
    setError,
    clearError,
  } = useCategoryStore()

  const createCategory = useCallback(
    async (data: CreateCategoryDTO) => {
      setLoading(true)
      clearError()

      try {
        const result = await container.createCategoryUseCase.execute(data)

        if (result.success) {
          addCategory(result.data)
          return { success: true, data: result.data }
        }

        setError(result.error.message)
        return { success: false, error: result.error.message }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [addCategory, setLoading, setError, clearError],
  )

  const loadCategories = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const categories = await container.categoryRepository.findAll()
      setCategories(categories)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setCategories, setLoading, setError, clearError])

  const deleteCategory = useCallback(
    async (id: string) => {
      setLoading(true)
      clearError()

      try {
        await container.categoryRepository.delete(id)
        removeCategory(id)
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [removeCategory, setLoading, setError, clearError],
  )

  return {
    // State
    categories,
    incomeCategories,
    expenseCategories,
    isLoading,
    error,

    // Actions
    createCategory,
    loadCategories,
    deleteCategory,
    clearError,
  }
}
