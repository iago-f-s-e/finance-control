import type { CreateWalletDTO, UpdateWalletDTO, Wallet } from '../entities/wallet'

export interface WalletRepository {
  create(data: CreateWalletDTO): Promise<Wallet>
  update(id: string, data: UpdateWalletDTO): Promise<Wallet>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Wallet | null>
  findAll(): Promise<Wallet[]>
  updateBalance(id: string, amount: number): Promise<Wallet>
}
