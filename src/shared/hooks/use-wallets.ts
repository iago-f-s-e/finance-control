import type { CreateWalletDTO } from '@/domains/wallets/entities/wallet'
import { container } from '@/infrastructure/container'
import { useWalletStore } from '@/shared/stores'
import { useCallback } from 'react'

export function useWallets() {
  const {
    wallets,
    selectedWalletId,
    selectedWallet,
    totalBalance,
    isLoading,
    error,
    setWallets,
    addWallet,
    removeWallet,
    selectWallet,
    setLoading,
    setError,
    clearError,
  } = useWalletStore()

  const createWallet = useCallback(
    async (data: CreateWalletDTO) => {
      setLoading(true)
      clearError()

      try {
        const result = await container.createWalletUseCase.execute(data)

        if (result.success) {
          addWallet(result.data)
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
    [addWallet, setLoading, setError, clearError],
  )

  const loadWallets = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const wallets = await container.walletRepository.findAll()
      setWallets(wallets)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load wallets'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [setWallets, setLoading, setError, clearError])

  const deleteWallet = useCallback(
    async (id: string) => {
      setLoading(true)
      clearError()

      try {
        await container.walletRepository.delete(id)
        removeWallet(id)
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete wallet'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [removeWallet, setLoading, setError, clearError],
  )

  return {
    // State
    wallets,
    selectedWalletId,
    selectedWallet,
    totalBalance,
    isLoading,
    error,

    // Actions
    createWallet,
    loadWallets,
    deleteWallet,
    selectWallet,
    clearError,
  }
}
