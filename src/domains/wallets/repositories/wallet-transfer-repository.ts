import type { CreateWalletTransferDTO, WalletTransfer } from '../entities/wallet-transfer'

export interface WalletTransferRepository {
  create(data: CreateWalletTransferDTO): Promise<WalletTransfer>
  findById(id: string): Promise<WalletTransfer | null>
  findAll(): Promise<WalletTransfer[]>
  findByWalletId(walletId: string): Promise<WalletTransfer[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<WalletTransfer[]>
}
