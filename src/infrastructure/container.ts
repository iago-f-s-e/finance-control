import { supabase } from './database/supabase'

import { SupabaseCategoryRepository } from '@/adapters/repositories/supabase-category-repository'
// Repository implementations
import { SupabaseTransactionRepository } from '@/adapters/repositories/supabase-transaction-repository'
import { SupabaseWalletRepository } from '@/adapters/repositories/supabase-wallet-repository'
import { SupabaseWalletTransferRepository } from '@/adapters/repositories/supabase-wallet-transfer-repository'

import { CreateCategoryUseCase } from '@/domains/categories/use-cases/create-category'
// Use cases
import { CreateTransactionUseCase } from '@/domains/transactions/use-cases/create-transaction'
import { ExecuteTransactionsUseCase } from '@/domains/transactions/use-cases/execute-transactions'
import { CreateWalletUseCase } from '@/domains/wallets/use-cases/create-wallet'
import { TransferBetweenWalletsUseCase } from '@/domains/wallets/use-cases/transfer-between-wallets'

// Repository instances
export const transactionRepository = new SupabaseTransactionRepository(supabase)
export const walletRepository = new SupabaseWalletRepository(supabase)
export const categoryRepository = new SupabaseCategoryRepository(supabase)
export const walletTransferRepository = new SupabaseWalletTransferRepository(supabase)

// Use case instances
export const createTransactionUseCase = new CreateTransactionUseCase(
  transactionRepository,
  walletRepository,
)

export const executeTransactionsUseCase = new ExecuteTransactionsUseCase(
  transactionRepository,
  walletRepository,
)

export const createWalletUseCase = new CreateWalletUseCase(walletRepository)

export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository)

export const transferBetweenWalletsUseCase = new TransferBetweenWalletsUseCase(
  walletTransferRepository,
  walletRepository,
)

// Container object for easy access
export const container = {
  // Repositories
  transactionRepository,
  walletRepository,
  categoryRepository,
  walletTransferRepository,

  // Use cases
  createTransactionUseCase,
  executeTransactionsUseCase,
  createWalletUseCase,
  createCategoryUseCase,
  transferBetweenWalletsUseCase,
} as const
