import type { TransactionRepository } from '../repositories/transaction-repository'
import type { WalletRepository } from '@/domains/wallets/repositories/wallet-repository'
import type { CreateTransactionDTO, Transaction } from '../entities/transaction'
import type { Result } from '@/shared/types/common'

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository
  ) {}

  async execute(data: CreateTransactionDTO): Promise<Result<Transaction>> {
    try {
      // Validate wallet exists
      const wallet = await this.walletRepository.findById(data.walletId)
      if (!wallet) {
        return {
          success: false,
          error: new Error('Wallet not found'),
        }
      }

      // Create transaction
      const transaction = await this.transactionRepository.create(data)

      // If executed immediately, update wallet balance
      if (data.isExecuted) {
        const amount = data.type === 'INCOME' ? data.amount : -data.amount
        await this.walletRepository.updateBalance(data.walletId, amount)
      }

      return {
        success: true,
        data: transaction,
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      }
    }
  }
} 