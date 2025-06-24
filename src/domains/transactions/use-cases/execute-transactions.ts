import type { WalletRepository } from '@/domains/wallets/repositories/wallet-repository'
import type { Result } from '@/shared/types/common'
import type { Transaction } from '../entities/transaction'
import type { TransactionRepository } from '../repositories/transaction-repository'

export class ExecuteTransactionsUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(transactionIds: string[]): Promise<Result<Transaction[]>> {
    try {
      // Get transactions to execute
      const transactions = await this.transactionRepository.findByIds(transactionIds)

      if (transactions.length === 0) {
        return {
          success: false,
          error: new Error('No transactions found'),
        }
      }

      // Validate all transactions are not executed yet
      const alreadyExecuted = transactions.filter((t) => t.isExecuted)
      if (alreadyExecuted.length > 0) {
        return {
          success: false,
          error: new Error(`${alreadyExecuted.length} transactions are already executed`),
        }
      }

      // Execute transactions
      const executedTransactions = await this.transactionRepository.executeMany(transactionIds)

      // Update wallet balances
      const walletUpdates = new Map<string, number>()

      for (const transaction of executedTransactions) {
        const amount = transaction.type === 'INCOME' ? transaction.amount : -transaction.amount
        const currentAmount = walletUpdates.get(transaction.walletId) || 0
        walletUpdates.set(transaction.walletId, currentAmount + amount)
      }

      // Apply balance updates
      for (const [walletId, amount] of Array.from(walletUpdates.entries())) {
        await this.walletRepository.updateBalance(walletId, amount)
      }

      return {
        success: true,
        data: executedTransactions,
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      }
    }
  }
}
