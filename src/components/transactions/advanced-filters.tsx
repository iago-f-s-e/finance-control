'use client'

import { CalendarIcon, Filter, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { TransactionFilters } from '@/domains/transactions/repositories/transaction-repository'
import { container } from '@/infrastructure/container'
import { useCategoryStore, useWalletStore } from '@/shared/stores'

interface FilterFormData {
  walletId?: string
  categoryId?: string
  type?: 'INCOME' | 'EXPENSE'
  isExecuted?: boolean
  dateFrom?: Date
  dateTo?: Date
  isRecurring?: boolean
  minAmount?: number
  maxAmount?: number
}

interface AdvancedFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  onClear: () => void
}

export function AdvancedFilters({ filters, onFiltersChange, onClear }: AdvancedFiltersProps) {
  const { wallets, setWallets } = useWalletStore()
  const { categories, setCategories } = useCategoryStore()
  const [isOpen, setIsOpen] = useState(false)

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

  const form = useForm<FilterFormData>({
    defaultValues: {
      walletId: filters.walletId || '',
      categoryId: filters.categoryId || '',
      type: filters.type,
      isExecuted: filters.isExecuted,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      isRecurring: filters.isRecurring,
    },
  })

  const handleApplyFilters = (data: FilterFormData) => {
    const newFilters: TransactionFilters = {}

    if (data.walletId) newFilters.walletId = data.walletId
    if (data.categoryId) newFilters.categoryId = data.categoryId
    if (data.type) newFilters.type = data.type
    if (data.isExecuted !== undefined) newFilters.isExecuted = data.isExecuted
    if (data.dateFrom) newFilters.dateFrom = data.dateFrom
    if (data.dateTo) newFilters.dateTo = data.dateTo
    if (data.isRecurring !== undefined) newFilters.isRecurring = data.isRecurring

    onFiltersChange(newFilters)
  }

  const handleClear = () => {
    form.reset({
      walletId: '',
      categoryId: '',
      type: undefined,
      isExecuted: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      isRecurring: undefined,
    })
    onClear()
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.walletId && (
            <Badge variant="outline">
              Carteira: {wallets.find((w) => w.id === filters.walletId)?.name || 'Desconhecida'}
            </Badge>
          )}
          {filters.categoryId && (
            <Badge variant="outline">
              Categoria:{' '}
              {categories.find((c) => c.id === filters.categoryId)?.name || 'Desconhecida'}
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline">
              Tipo: {filters.type === 'INCOME' ? 'Receita' : 'Despesa'}
            </Badge>
          )}
          {filters.isExecuted !== undefined && (
            <Badge variant="outline">Status: {filters.isExecuted ? 'Executado' : 'Pendente'}</Badge>
          )}
          {filters.isRecurring !== undefined && (
            <Badge variant="outline">{filters.isRecurring ? 'Recorrente' : 'Única'}</Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="outline">
              A partir de: {filters.dateFrom.toLocaleDateString('pt-BR')}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="outline">Até: {filters.dateTo.toLocaleDateString('pt-BR')}</Badge>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleApplyFilters)} className="space-y-4">
                {/* Type Filter */}
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
                            size="sm"
                            onClick={() =>
                              field.onChange(field.value === 'INCOME' ? undefined : 'INCOME')
                            }
                          >
                            💰 Receitas
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'EXPENSE' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              field.onChange(field.value === 'EXPENSE' ? undefined : 'EXPENSE')
                            }
                          >
                            💸 Despesas
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Status Filter */}
                <FormField
                  control={form.control}
                  name="isExecuted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={field.value === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange(field.value === true ? undefined : true)}
                          >
                            ✅ Executadas
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              field.onChange(field.value === false ? undefined : false)
                            }
                          >
                            ⏳ Pendentes
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Wallet Filter */}
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carteira</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-2">
                          {wallets.map((wallet) => (
                            <Button
                              key={wallet.id}
                              type="button"
                              variant={field.value === wallet.id ? 'default' : 'outline'}
                              size="sm"
                              className="justify-start"
                              onClick={() =>
                                field.onChange(field.value === wallet.id ? '' : wallet.id)
                              }
                            >
                              {wallet.name}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Category Filter */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              type="button"
                              variant={field.value === category.id ? 'default' : 'outline'}
                              size="sm"
                              className="justify-start text-left"
                              onClick={() =>
                                field.onChange(field.value === category.id ? '' : category.id)
                              }
                            >
                              <span className="flex items-center gap-2">
                                {category.icon && <span>{category.icon}</span>}
                                <span className="truncate">{category.name}</span>
                              </span>
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Inicial</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Final</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Aplicar Filtros
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Limpar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
