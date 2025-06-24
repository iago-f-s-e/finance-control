'use client'

import { BarChart3, Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  BalanceChart,
  CategoryChart,
  IncomeExpenseChart,
  MonthlyComparisonChart,
  StatsCard,
  TransactionTrendChart,
} from '@/components/analytics/charts'
import { AdvancedFilters } from '@/components/transactions/advanced-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TransactionFilters } from '@/domains/transactions/repositories/transaction-repository'
import { useTransactions, useWallets } from '@/shared/hooks'
import { formatCurrency } from '@/shared/utils/format'

export default function AnalyticsPage() {
  const { transactions, loadTransactions } = useTransactions()
  const { totalBalance, loadWallets } = useWallets()
  const [filters, setFilters] = useState<TransactionFilters>({})

  useEffect(() => {
    loadTransactions()
    loadWallets()
  }, [loadTransactions, loadWallets])

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.walletId && transaction.walletId !== filters.walletId) return false
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false
    if (filters.type && transaction.type !== filters.type) return false
    if (filters.isExecuted !== undefined && transaction.isExecuted !== filters.isExecuted)
      return false
    if (filters.isRecurring !== undefined && transaction.isRecurring !== filters.isRecurring)
      return false
    if (filters.dateFrom && new Date(transaction.dueDate) < filters.dateFrom) return false
    if (filters.dateTo && new Date(transaction.dueDate) > filters.dateTo) return false

    return true
  })

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthTransactions = filteredTransactions.filter((t) => {
    const transactionDate = new Date(t.dueDate)
    return (
      transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    )
  })

  const thisMonthIncome = thisMonthTransactions
    .filter((t) => t.type === 'INCOME' && t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthExpenses = thisMonthTransactions
    .filter((t) => t.type === 'EXPENSE' && t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthBalance = thisMonthIncome - thisMonthExpenses

  const pendingIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME' && !t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE' && !t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  // Prepare chart data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      name: date.toLocaleDateString('pt-BR', { month: 'short' }),
      month: date.getMonth(),
      year: date.getFullYear(),
    }
  }).reverse()

  const monthlyData = last6Months.map((month) => {
    const monthTransactions = filteredTransactions.filter((t) => {
      const tDate = new Date(t.dueDate)
      return tDate.getMonth() === month.month && tDate.getFullYear() === month.year && t.isExecuted
    })

    const income = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      name: month.name,
      income,
      expense,
      balance: income - expense,
      value: monthTransactions.length,
    }
  })

  // Category data for pie chart
  const categoryStats = filteredTransactions
    .filter((t) => t.isExecuted && t.type === 'EXPENSE')
    .reduce(
      (acc, t) => {
        const categoryId = t.categoryId
        if (!acc[categoryId]) {
          acc[categoryId] = { name: `Categoria ${categoryId.slice(0, 8)}`, value: 0 }
        }
        acc[categoryId].value += t.amount
        return acc
      },
      {} as Record<string, { name: string; value: number }>,
    )

  const categoryChartData = Object.values(categoryStats)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 categories

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
  }

  const handleFiltersClear = () => {
    setFilters({})
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleFiltersClear}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Saldo Total"
          value={totalBalance}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Receitas Este Mês"
          value={thisMonthIncome}
          icon={<TrendingUp className="h-4 w-4" />}
          positive={thisMonthIncome > 0}
        />
        <StatsCard
          title="Despesas Este Mês"
          value={thisMonthExpenses}
          icon={<TrendingDown className="h-4 w-4" />}
          positive={false}
        />
        <StatsCard
          title="Resultado Mensal"
          value={thisMonthBalance}
          icon={<BarChart3 className="h-4 w-4" />}
          positive={thisMonthBalance >= 0}
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IncomeExpenseChart
              title="Receitas vs Despesas (6 meses)"
              data={monthlyData}
              height={300}
            />
            <BalanceChart title="Evolução do Saldo" data={monthlyData} height={300} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TransactionTrendChart title="Volume de Transações" data={monthlyData} height={250} />
            <Card>
              <CardHeader>
                <CardTitle>Transações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Receitas Pendentes</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(pendingIncome)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Despesas Pendentes</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(pendingExpenses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-medium">Impacto no Saldo</span>
                    <span
                      className={`font-bold ${
                        (pendingIncome - pendingExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(pendingIncome - pendingExpenses)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categoryChartData.length > 0 ? (
              <CategoryChart title="Gastos por Categoria" data={categoryChartData} height={300} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Nenhum dado de categoria disponível</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Top Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryChartData.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-primary" />
                        <span className="text-sm font-medium">
                          #{index + 1} {category.name}
                        </span>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <MonthlyComparisonChart
            title="Comparação Mensal Receitas vs Despesas"
            data={monthlyData}
            height={400}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado para análise</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0
                ? 'Nenhuma transação encontrada com os filtros aplicados'
                : 'Crie algumas transações para ver suas análises aqui'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
