import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/category'
import type { TransactionType } from '@/domains/transactions/entities/transaction'

export interface CategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>
  update(id: string, data: UpdateCategoryDTO): Promise<Category>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Category | null>
  findAll(): Promise<Category[]>
  findByType(type: TransactionType): Promise<Category[]>
} 