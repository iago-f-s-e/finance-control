'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCategoryStore } from '@/shared/stores'
import { container } from '@/infrastructure/container'
import { CategoryForm } from '@/components/categories/category-form'
import type { Category } from '@/domains/categories/entities/category'

export default function CategoriesPage() {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    isLoading,
    error,
    setCategories,
    removeCategory,
    setLoading,
    setError,
    clearError,
  } = useCategoryStore()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    clearError()

    try {
      const categories = await container.categoryRepository.findAll()
      setCategories(categories)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      setLoading(true)
      try {
        await container.categoryRepository.delete(categoryId)
        removeCategory(categoryId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    loadCategories()
  }

  const handleEditSuccess = () => {
    setEditingCategory(null)
    loadCategories()
  }

  const editingCategoryData = editingCategory 
    ? categories.find(c => c.id === editingCategory)
    : undefined

  if (isLoading && categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  const CategoryList = ({ categories, title }: { categories: Category[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma categoria encontrada
          </p>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <span className="text-xl">{category.icon}</span>
                  )}
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={category.type === 'INCOME' ? 'success' : 'destructive'}
                      >
                        {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog 
                    open={editingCategory === category.id} 
                    onOpenChange={(open) => setEditingCategory(open ? category.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                      </DialogHeader>
                      <CategoryForm 
                        category={editingCategoryData} 
                        onSuccess={handleEditSuccess} 
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações por categorias
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Lists */}
      <div className="space-y-6">
        <CategoryList 
          categories={incomeCategories} 
          title={`Receitas (${incomeCategories.length})`} 
        />
        
        <CategoryList 
          categories={expenseCategories} 
          title={`Despesas (${expenseCategories.length})`} 
        />
      </div>

      {/* Empty State */}
      {categories.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie categorias para organizar melhor suas transações
            </p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                </DialogHeader>
                <CategoryForm onSuccess={handleCreateSuccess} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 