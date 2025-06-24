import type {
  CreateWalletTransferDTO,
  WalletTransfer,
} from '@/domains/wallets/entities/wallet-transfer'
import type { WalletTransferRepository } from '@/domains/wallets/repositories/wallet-transfer-repository'
import type { SupabaseClient } from '@/infrastructure/database/supabase'

export class SupabaseWalletTransferRepository implements WalletTransferRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateWalletTransferDTO): Promise<WalletTransfer> {
    const { data: transfer, error } = await this.supabase
      .from('wallet_transfers')
      .insert({
        from_wallet_id: data.fromWalletId,
        to_wallet_id: data.toWalletId,
        amount: data.amount,
        description: data.description,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(transfer)
  }

  async findById(id: string): Promise<WalletTransfer | null> {
    const { data: transfer, error } = await this.supabase
      .from('wallet_transfers')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapToEntity(transfer)
  }

  async findAll(): Promise<WalletTransfer[]> {
    const { data: transfers, error } = await this.supabase
      .from('wallet_transfers')
      .select()
      .order('executed_at', { ascending: false })

    if (error) throw error
    return transfers.map((t) => this.mapToEntity(t))
  }

  async findByWalletId(walletId: string): Promise<WalletTransfer[]> {
    const { data: transfers, error } = await this.supabase
      .from('wallet_transfers')
      .select()
      .or(`from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`)
      .order('executed_at', { ascending: false })

    if (error) throw error
    return transfers.map((t) => this.mapToEntity(t))
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WalletTransfer[]> {
    const { data: transfers, error } = await this.supabase
      .from('wallet_transfers')
      .select()
      .gte('executed_at', startDate.toISOString())
      .lte('executed_at', endDate.toISOString())
      .order('executed_at', { ascending: false })

    if (error) throw error
    return transfers.map((t) => this.mapToEntity(t))
  }

  private mapToEntity(data: any): WalletTransfer {
    return {
      id: data.id,
      fromWalletId: data.from_wallet_id,
      toWalletId: data.to_wallet_id,
      amount: data.amount,
      description: data.description,
      executedAt: new Date(data.executed_at),
      createdAt: new Date(data.created_at),
    }
  }
}
