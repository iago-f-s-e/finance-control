import { useCallback } from 'react'
import { useTransactionStore } from '@/shared/stores'
import { container } from '@/infrastructure/container'
import type { CreateTransactionDTO } from '@/domains/transactions/entities/transaction'
import type { TransactionFilters } from '@/domains/transactions/repositories/transaction-repository'

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
    toggleTransactionSelection,
    selectAllTransactions,
    clearTransactionSelection,
    setLoading,
    setError,
    clearError,
  } = useTransactionStore()

  const createTransaction = useCallback(async (data: CreateTransactionDTO) => {
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
  }, [addTransaction, setLoading, setError, clearError])

  const executeTransactions = useCallback(async (transactionIds: string[]) => {
    setLoading(true)
    clearError()

    try {
      const result = await container.executeTransactionsUseCase.execute(transactionIds)
      
      if (result.success) {
        // Update transactions in store
        for (const transaction of result.data) {
          updateTransaction(transaction.id, transaction)
        }
        clearTransactionSelection()
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
  }, [updateTransaction, clearTransactionSelection, setLoading, setError, clearError])

  const loadTransactions = useCallback(async (filters?: TransactionFilters) => {
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
  }, [setTransactions, setLoading, setError, clearError])

  const deleteTransaction = useCallback(async (id: string) => {
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
  }, [removeTransaction, setLoading, setError, clearError])

  return {
    // State
    transactions,
    selectedTransactions,
    selectedTransactionsSum,
    isLoading,
    error,

    // Actions
    createTransaction,
    executeTransactions,
    loadTransactions,
    deleteTransaction,
    toggleTransactionSelection,
    selectAllTransactions,
    clearTransactionSelection,
    clearError,
  }
} 