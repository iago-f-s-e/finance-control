import type { CreateTransactionDTO } from '@/domains/transactions/entities/transaction'
import type { TransactionFilters } from '@/domains/transactions/repositories/transaction-repository'
import { container } from '@/infrastructure/container'
import { useTransactionStore } from '@/shared/stores'
import { useCallback } from 'react'

export function useTransactions() {
  const {
    transactions,
    selectedTransactions,
    selectedTransactionsSum,
    isLoading,
    error,
    setTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setSelectedTransactions,
    setLoading,
    setError,
    clearError,
  } = useTransactionStore()

  const createTransaction = useCallback(
    async (data: CreateTransactionDTO) => {
      setLoading(true)
      clearError()

      try {
        const result = await container.createTransactionUseCase.execute(data)

        if (result.success) {
          addTransaction(result.data)
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
    [addTransaction, setLoading, setError, clearError],
  )

  const loadTransactions = useCallback(
    async (filters?: TransactionFilters) => {
      setLoading(true)
      clearError()

      try {
        const transactions = await container.transactionRepository.findMany(filters)
        setTransactions(transactions)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load transactions'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    [setTransactions, setLoading, setError, clearError],
  )

  const executeTransactions = useCallback(
    async (transactionIds: string[]) => {
      setLoading(true)
      clearError()

      try {
        const result = await container.executeTransactionsUseCase.execute(transactionIds)

        if (result.success) {
          // Update executed transactions in store
          result.data.forEach((executedTransaction) => {
            updateTransaction(executedTransaction.id, executedTransaction)
          })
          return { success: true, data: result.data }
        }

        setError(result.error.message)
        return { success: false, error: result.error.message }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to execute transactions'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [updateTransaction, setLoading, setError, clearError],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      setLoading(true)
      clearError()

      try {
        await container.transactionRepository.delete(id)
        removeTransaction(id)
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [removeTransaction, setLoading, setError, clearError],
  )

  const toggleTransactionSelection = useCallback(
    (transactionId: string) => {
      const currentSelected = selectedTransactions
      if (currentSelected.includes(transactionId)) {
        setSelectedTransactions(currentSelected.filter((id) => id !== transactionId))
      } else {
        setSelectedTransactions([...currentSelected, transactionId])
      }
    },
    [selectedTransactions, setSelectedTransactions],
  )

  const clearTransactionSelection = useCallback(() => {
    setSelectedTransactions([])
  }, [setSelectedTransactions])

  return {
    // State
    transactions,
    selectedTransactions,
    selectedTransactionsSum,
    isLoading,
    error,

    // Actions
    createTransaction,
    loadTransactions,
    executeTransactions,
    deleteTransaction,
    toggleTransactionSelection,
    clearTransactionSelection,
    clearError,
  }
}
