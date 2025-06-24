import type { WalletRepository } from '../repositories/wallet-repository'
import type { CreateWalletDTO, Wallet } from '../entities/wallet'
import type { Result } from '@/shared/types/common'

export class CreateWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(data: CreateWalletDTO): Promise<Result<Wallet>> {
    try {
      // Validate wallet name is not empty
      if (!data.name.trim()) {
        return {
          success: false,
          error: new Error('Wallet name cannot be empty'),
        }
      }

      const wallet = await this.walletRepository.create({
        ...data,
        currency: data.currency || 'BRL',
      })

      return {
        success: true,
        data: wallet,
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      }
    }
  }
} 