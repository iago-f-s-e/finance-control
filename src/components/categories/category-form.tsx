'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Category } from '@/domains/categories/entities/category'
import { container } from '@/infrastructure/container'
import { useCategoryStore } from '@/shared/stores'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Tipo é obrigatório',
  }),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const { addCategory, setLoading, setError } = useCategoryStore()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'EXPENSE',
      color: category?.color || '#6b7280',
      icon: category?.icon || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const result = await container.createCategoryUseCase.execute(data)

      if (result.success) {
        addCategory(result.data)
        form.reset()
        onSuccess?.()
      } else {
        setError(result.error.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const commonIcons = [
    '💰',
    '💻',
    '📈',
    '💵', // Income
    '🍽️',
    '🚗',
    '🏠',
    '🏥',
    '📚',
    '🎮',
    '👕',
    '💸', // Expense
  ]

  const commonColors = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
    '#374151',
    '#1f2937',
    '#111827',
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação, Salário..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'INCOME' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => field.onChange('INCOME')}
                  >
                    💰 Receita
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'EXPENSE' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => field.onChange('EXPENSE')}
                  >
                    💸 Despesa
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícone (opcional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input placeholder="Escolha um emoji..." {...field} />
                  <div className="grid grid-cols-8 gap-2">
                    {commonIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => field.onChange(icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor (opcional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-10 p-1 border rounded" {...field} />
                    <Input placeholder="#6b7280" {...field} />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {commonColors.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-2"
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {category ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
