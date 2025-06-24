import type { SupabaseClient } from '@/infrastructure/database/supabase'
import type { CategoryRepository } from '@/domains/categories/repositories/category-repository'
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/domains/categories/entities/category'
import type { TransactionType } from '@/domains/transactions/entities/transaction'

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateCategoryDTO): Promise<Category> {
    const { data: category, error } = await this.supabase
      .from('categories')
      .insert({
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(category)
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.color !== undefined) updateData.color = data.color
    if (data.icon !== undefined) updateData.icon = data.icon

    const { data: category, error } = await this.supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(category)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findById(id: string): Promise<Category | null> {
    const { data: category, error } = await this.supabase
      .from('categories')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapToEntity(category)
  }

  async findAll(): Promise<Category[]> {
    const { data: categories, error } = await this.supabase
      .from('categories')
      .select()
      .order('name', { ascending: true })

    if (error) throw error
    return categories.map(c => this.mapToEntity(c))
  }

  async findByType(type: TransactionType): Promise<Category[]> {
    const { data: categories, error } = await this.supabase
      .from('categories')
      .select()
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) throw error
    return categories.map(c => this.mapToEntity(c))
  }

  private mapToEntity(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      createdAt: new Date(data.created_at),
    }
  }
} 