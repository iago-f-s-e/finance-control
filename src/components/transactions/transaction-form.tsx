'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions } from '@/shared/hooks'
import { useWalletStore, useCategoryStore } from '@/shared/stores'
import { container } from '@/infrastructure/container'
import { parseAmount } from '@/shared/utils/format'

const formSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Tipo é obrigatório',
  }),
  walletId: z.string().min(1, 'Carteira é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  dueDate: z.date(),
  isExecuted: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

interface TransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { createTransaction, isLoading } = useTransactions()
  const { wallets, setWallets } = useWalletStore()
  const { categories, setCategories } = useCategoryStore()

  useEffect(() => {
    // Load wallets and categories
    const loadData = async () => {
      try {
        const [walletsData, categoriesData] = await Promise.all([
          container.walletRepository.findAll(),
          container.categoryRepository.findAll(),
        ])
        setWallets(walletsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    loadData()
  }, [setWallets, setCategories])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'EXPENSE',
      walletId: '',
      categoryId: '',
      amount: 0,
      description: '',
      dueDate: new Date(),
      isExecuted: false,
      isRecurring: false,
    },
  })

  const watchedType = form.watch('type')
  const availableCategories = categories.filter(c => c.type === watchedType)

  const onSubmit = async (data: FormData) => {
    const result = await createTransaction(data)
    
    if (result.success) {
      form.reset()
      onSuccess?.()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo da Transação</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'INCOME' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => {
                      field.onChange('INCOME')
                      form.setValue('categoryId', '') // Reset category when type changes
                    }}
                  >
                    💰 Receita
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'EXPENSE' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => {
                      field.onChange('EXPENSE')
                      form.setValue('categoryId', '') // Reset category when type changes
                    }}
                  >
                    💸 Despesa
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Salário, Conta de luz..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Wallet Selection */}
        <FormField
          control={form.control}
          name="walletId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carteira</FormLabel>
              <FormControl>
                <div className="grid gap-2">
                  {wallets.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhuma carteira encontrada. Crie uma carteira primeiro.
                    </p>
                  ) : (
                    wallets.map((wallet) => (
                      <Card
                        key={wallet.id}
                        className={`cursor-pointer transition-colors ${
                          field.value === wallet.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => field.onChange(wallet.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{wallet.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {wallet.currency}
                              </Badge>
                            </div>
                            <div className="text-sm font-medium">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: wallet.currency,
                              }).format(wallet.balance)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <div className="grid gap-2">
                  {availableCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Nenhuma categoria encontrada para {watchedType === 'INCOME' ? 'receitas' : 'despesas'}.
                      Crie uma categoria primeiro.
                    </p>
                  ) : (
                    availableCategories.map((category) => (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-colors ${
                          field.value === category.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => field.onChange(category.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {category.icon && (
                              <span className="text-xl">{category.icon}</span>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium">{category.name}</h4>
                            </div>
                            {category.color && (
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Execute Immediately */}
        <FormField
          control={form.control}
          name="isExecuted"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isExecuted"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isExecuted" className="text-sm font-medium">
                    Efetivar imediatamente
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Salvando...' : 'Criar Transação'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 