import type { SupabaseClient } from '@/infrastructure/database/supabase'
import type { 
  TransactionRepository, 
  TransactionFilters 
} from '@/domains/transactions/repositories/transaction-repository'
import type { 
  Transaction, 
  CreateTransactionDTO, 
  UpdateTransactionDTO 
} from '@/domains/transactions/entities/transaction'

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const { data: transaction, error } = await this.supabase
      .from('transactions')
      .insert({
        wallet_id: data.walletId,
        category_id: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        due_date: data.dueDate.toISOString(),
        is_executed: data.isExecuted || false,
        is_recurring: data.isRecurring || false,
        recurrence_pattern: data.recurrencePattern,
        recurrence_interval: data.recurrenceInterval || 1,
        recurrence_end_date: data.recurrenceEndDate?.toISOString(),
        group_id: data.groupId,
        is_group_parent: data.isGroupParent || false,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(transaction)
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
    const updateData: any = {}
    
    if (data.walletId) updateData.wallet_id = data.walletId
    if (data.categoryId) updateData.category_id = data.categoryId
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.dueDate) updateData.due_date = data.dueDate.toISOString()
    if (data.isRecurring !== undefined) updateData.is_recurring = data.isRecurring
    if (data.recurrencePattern) updateData.recurrence_pattern = data.recurrencePattern
    if (data.recurrenceInterval !== undefined) updateData.recurrence_interval = data.recurrenceInterval
    if (data.recurrenceEndDate) updateData.recurrence_end_date = data.recurrenceEndDate.toISOString()
    
    updateData.updated_at = new Date().toISOString()

    const { data: transaction, error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(transaction)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data: transaction, error } = await this.supabase
      .from('transactions')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapToEntity(transaction)
  }

  async findMany(filters?: TransactionFilters): Promise<Transaction[]> {
    let query = this.supabase.from('transactions').select()

    if (filters?.walletId) query = query.eq('wallet_id', filters.walletId)
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.isExecuted !== undefined) query = query.eq('is_executed', filters.isExecuted)
    if (filters?.isRecurring !== undefined) query = query.eq('is_recurring', filters.isRecurring)
    if (filters?.groupId) query = query.eq('group_id', filters.groupId)
    if (filters?.dateFrom) query = query.gte('due_date', filters.dateFrom.toISOString())
    if (filters?.dateTo) query = query.lte('due_date', filters.dateTo.toISOString())

    const { data: transactions, error } = await query.order('due_date', { ascending: false })

    if (error) throw error
    return transactions.map(t => this.mapToEntity(t))
  }

  async findByIds(ids: string[]): Promise<Transaction[]> {
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .select()
      .in('id', ids)

    if (error) throw error
    return transactions.map(t => this.mapToEntity(t))
  }

  async executeMany(ids: string[]): Promise<Transaction[]> {
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .update({
        is_executed: true,
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select()

    if (error) throw error
    return transactions.map(t => this.mapToEntity(t))
  }

  async findPendingRecurring(): Promise<Transaction[]> {
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .select()
      .eq('is_recurring', true)
      .eq('is_executed', false)
      .lte('due_date', new Date().toISOString())

    if (error) throw error
    return transactions.map(t => this.mapToEntity(t))
  }

  async findByGroupId(groupId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .select()
      .eq('group_id', groupId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return transactions.map(t => this.mapToEntity(t))
  }

  private mapToEntity(data: any): Transaction {
    return {
      id: data.id,
      walletId: data.wallet_id,
      categoryId: data.category_id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      dueDate: new Date(data.due_date),
      isExecuted: data.is_executed,
      executedAt: data.executed_at ? new Date(data.executed_at) : undefined,
      isRecurring: data.is_recurring,
      recurrencePattern: data.recurrence_pattern,
      recurrenceInterval: data.recurrence_interval,
      recurrenceEndDate: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
      parentTransactionId: data.parent_transaction_id,
      groupId: data.group_id,
      isGroupParent: data.is_group_parent,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
} 