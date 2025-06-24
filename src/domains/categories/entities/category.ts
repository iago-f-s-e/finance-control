import type { TransactionType } from '@/domains/transactions/entities/transaction'

export interface Category {
  id: string
  name: string
  type: TransactionType
  color?: string
  icon?: string
  createdAt: Date
}

export interface CreateCategoryDTO {
  name: string
  type: TransactionType
  color?: string
  icon?: string
}

export interface UpdateCategoryDTO {
  name?: string
  color?: string
  icon?: string
}

export class CategoryEntity {
  constructor(private readonly category: Category) {}

  get id(): string {
    return this.category.id
  }

  get name(): string {
    return this.category.name
  }

  get type(): TransactionType {
    return this.category.type
  }

  get color(): string | undefined {
    return this.category.color
  }

  get icon(): string | undefined {
    return this.category.icon
  }

  isIncomeCategory(): boolean {
    return this.category.type === 'INCOME'
  }

  isExpenseCategory(): boolean {
    return this.category.type === 'EXPENSE'
  }

  toJSON(): Category {
    return { ...this.category }
  }
}
