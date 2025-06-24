import type { CreateWalletDTO, UpdateWalletDTO, Wallet } from '@/domains/wallets/entities/wallet'
import type { WalletRepository } from '@/domains/wallets/repositories/wallet-repository'
import type { SupabaseClient } from '@/infrastructure/database/supabase'

export class SupabaseWalletRepository implements WalletRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateWalletDTO): Promise<Wallet> {
    const { data: wallet, error } = await this.supabase
      .from('wallets')
      .insert({
        name: data.name,
        currency: data.currency || 'BRL',
        balance: 0,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(wallet)
  }

  async update(id: string, data: UpdateWalletDTO): Promise<Wallet> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.currency !== undefined) updateData.currency = data.currency

    const { data: wallet, error } = await this.supabase
      .from('wallets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(wallet)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('wallets').delete().eq('id', id)

    if (error) throw error
  }

  async findById(id: string): Promise<Wallet | null> {
    const { data: wallet, error } = await this.supabase
      .from('wallets')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapToEntity(wallet)
  }

  async findAll(): Promise<Wallet[]> {
    const { data: wallets, error } = await this.supabase
      .from('wallets')
      .select()
      .order('created_at', { ascending: true })

    if (error) throw error
    return wallets.map((w) => this.mapToEntity(w))
  }

  async updateBalance(id: string, amount: number): Promise<Wallet> {
    // Get current balance first
    const currentWallet = await this.findById(id)
    if (!currentWallet) {
      throw new Error('Wallet not found')
    }

    const newBalance = currentWallet.balance + amount

    const { data: wallet, error } = await this.supabase
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(wallet)
  }

  private mapToEntity(data: any): Wallet {
    return {
      id: data.id,
      name: data.name,
      currency: data.currency,
      balance: data.balance,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
