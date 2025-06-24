export type TransactionType = 'INCOME' | 'EXPENSE'
export type RecurrencePattern = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'

export interface Transaction {
  id: string
  walletId: string
  categoryId: string
  type: TransactionType
  amount: number
  description: string
  dueDate: Date
  isExecuted: boolean
  executedAt?: Date
  
  // Recurrence
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  recurrenceInterval: number
  recurrenceEndDate?: Date
  parentTransactionId?: string
  
  // Grouping (Credit Card)
  groupId?: string
  isGroupParent: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionDTO {
  walletId: string
  categoryId: string
  type: TransactionType
  amount: number
  description: string
  dueDate: Date
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  recurrenceInterval?: number
  recurrenceEndDate?: Date
  groupId?: string
  isGroupParent?: boolean
}

export interface UpdateTransactionDTO {
  walletId?: string
  categoryId?: string
  amount?: number
  description?: string
  dueDate?: Date
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  recurrenceInterval?: number
  recurrenceEndDate?: Date
}

export class TransactionEntity {
  constructor(private readonly transaction: Transaction) {}

  get id(): string {
    return this.transaction.id
  }

  get amount(): number {
    return this.transaction.amount
  }

  get isExecuted(): boolean {
    return this.transaction.isExecuted
  }

  get type(): TransactionType {
    return this.transaction.type
  }

  get dueDate(): Date {
    return this.transaction.dueDate
  }

  isOverdue(): boolean {
    return !this.isExecuted && this.dueDate < new Date()
  }

  isDueThisMonth(): boolean {
    const now = new Date()
    const dueDate = this.dueDate
    return (
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getMonth() === now.getMonth()
    )
  }

  execute(): Transaction {
    if (this.isExecuted) {
      throw new Error('Transaction is already executed')
    }

    return {
      ...this.transaction,
      isExecuted: true,
      executedAt: new Date(),
      updatedAt: new Date(),
    }
  }

  toJSON(): Transaction {
    return { ...this.transaction }
  }
} 