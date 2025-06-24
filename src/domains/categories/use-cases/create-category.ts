import type { CategoryRepository } from '../repositories/category-repository'
import type { CreateCategoryDTO, Category } from '../entities/category'
import type { Result } from '@/shared/types/common'

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(data: CreateCategoryDTO): Promise<Result<Category>> {
    try {
      // Validate category name is not empty
      if (!data.name.trim()) {
        return {
          success: false,
          error: new Error('Category name cannot be empty'),
        }
      }

      const category = await this.categoryRepository.create(data)

      return {
        success: true,
        data: category,
      }
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      }
    }
  }
} 