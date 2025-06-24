import type { Result } from '@/shared/types/common'
import type { CreateWalletTransferDTO, WalletTransfer } from '../entities/wallet-transfer'
import type { WalletRepository } from '../repositories/wallet-repository'
import type { WalletTransferRepository } from '../repositories/wallet-transfer-repository'

export class TransferBetweenWalletsUseCase {
  constructor(
    private readonly walletTransferRepository: WalletTransferRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(data: CreateWalletTransferDTO): Promise<Result<WalletTransfer>> {
    try {
      // Validate wallets exist
      const [fromWallet, toWallet] = await Promise.all([
        this.walletRepository.findById(data.fromWalletId),
        this.walletRepository.findById(data.toWalletId),
      ])

      if (!fromWallet) {
        return {
          success: false,
          error: new Error('Carteira de origem não encontrada'),
        }
      }

      if (!toWallet) {
        return {
          success: false,
          error: new Error('Carteira de destino não encontrada'),
        }
      }

      // Validate same wallet
      if (data.fromWalletId === data.toWalletId) {
        return {
          success: false,
          error: new Error('Não é possível transferir para a mesma carteira'),
        }
      }

      // Validate sufficient balance
      if (fromWallet.balance < data.amount) {
        return {
          success: false,
          error: new Error('Saldo insuficiente na carteira de origem'),
        }
      }

      // Validate amount
      if (data.amount <= 0) {
        return {
          success: false,
          error: new Error('Valor deve ser maior que zero'),
        }
      }

      // Create transfer record
      const transfer = await this.walletTransferRepository.create(data)

      // Update wallet balances
      await Promise.all([
        this.walletRepository.updateBalance(data.fromWalletId, -data.amount),
        this.walletRepository.updateBalance(data.toWalletId, data.amount),
      ])

      return {
        success: true,
        data: transfer,
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      }
    }
  }
}
