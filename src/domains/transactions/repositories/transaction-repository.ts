import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../entities/transaction'

export interface TransactionFilters {
  walletId?: string
  categoryId?: string
  type?: 'INCOME' | 'EXPENSE'
  isExecuted?: boolean
  dateFrom?: Date
  dateTo?: Date
  isRecurring?: boolean
  groupId?: string
}

export interface TransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>
  update(id: string, data: UpdateTransactionDTO): Promise<Transaction>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Transaction | null>
  findMany(filters?: TransactionFilters): Promise<Transaction[]>
  findByIds(ids: string[]): Promise<Transaction[]>
  executeMany(ids: string[]): Promise<Transaction[]>
  findPendingRecurring(): Promise<Transaction[]>
  findByGroupId(groupId: string): Promise<Transaction[]>
} 