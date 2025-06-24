'use client'

import { useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions, useWallets } from '@/shared/hooks'
import { formatCurrency } from '@/shared/utils/format'

export default function AnalyticsPage() {
  const { transactions, loadTransactions } = useTransactions()
  const { totalBalance, loadWallets } = useWallets()

  useEffect(() => {
    loadTransactions()
    loadWallets()
  }, [loadTransactions, loadWallets])

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.dueDate)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear
  })

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'INCOME' && t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'EXPENSE' && t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const thisMonthBalance = thisMonthIncome - thisMonthExpenses

  const pendingIncome = transactions
    .filter(t => t.type === 'INCOME' && !t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && !t.isExecuted)
    .reduce((sum, t) => sum + t.amount, 0)

  // Top categories this month
  const categoryStats = thisMonthTransactions
    .filter(t => t.isExecuted)
    .reduce((acc, t) => {
      const key = `${t.categoryId}-${t.type}`
      if (!acc[key]) {
        acc[key] = {
          categoryId: t.categoryId,
          type: t.type,
          amount: 0,
          count: 0,
        }
      }
      acc[key].amount += t.amount
      acc[key].count += 1
      return acc
    }, {} as Record<string, { categoryId: string; type: string; amount: number; count: number }>)

  const topExpenseCategories = Object.values(categoryStats)
    .filter(stat => stat.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Análise detalhada das suas finanças
        </p>
      </div>

      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Saldo Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
        </CardContent>
      </Card>

      {/* This Month Summary */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Este Mês
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(thisMonthIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(thisMonthExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                thisMonthBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(thisMonthBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {thisMonthBalance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">Transações Pendentes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Receitas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(pendingIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Despesas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(pendingExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Categories */}
      {topExpenseCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Maiores Gastos por Categoria (Este Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenseCategories.map((stat, index) => (
                <div key={stat.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">Categoria {stat.categoryId.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.count} transaç{stat.count === 1 ? 'ão' : 'ões'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formatCurrency(stat.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado para análise</h3>
            <p className="text-muted-foreground">
              Crie algumas transações para ver suas análises aqui
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 