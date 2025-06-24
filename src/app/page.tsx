'use client'

import { useEffect, useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTransactions, useWallets } from '@/shared/hooks'
import { formatCurrency, formatDate } from '@/shared/utils/format'

export default function HomePage() {
  const {
    transactions,
    selectedTransactions,
    selectedTransactionsSum,
    isLoading,
    error,
    loadTransactions,
    executeTransactions,
    toggleTransactionSelection,
    clearTransactionSelection,
    clearError,
  } = useTransactions()

  const { totalBalance, loadWallets } = useWallets()

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadTransactions()
    loadWallets()
  }, [loadTransactions, loadWallets])

  const handleExecuteSelected = async () => {
    if (selectedTransactions.length === 0) return
    
    const result = await executeTransactions(selectedTransactions)
    if (result.success) {
      clearTransactionSelection()
    }
  }

  const pendingTransactions = transactions.filter(t => !t.isExecuted)
  
  const pendingIncome = pendingTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const pendingExpenses = pendingTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  if (isLoading && transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças
        </p>
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

      {/* Summary Cards */}
      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
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
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
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

      {/* Batch Actions */}
      {selectedTransactions.length > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedTransactions.length} transação(ões) selecionada(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(selectedTransactionsSum)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearTransactionSelection}>
                  Cancelar
                </Button>
                <Button onClick={handleExecuteSelected}>
                  Efetivar Selecionadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira transação usando o botão + no canto inferior direito
              </p>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card 
              key={transaction.id}
              className={`cursor-pointer transition-colors ${
                selectedTransactions.includes(transaction.id)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleTransactionSelection(transaction.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{transaction.description}</h3>
                      <Badge
                        variant={transaction.isExecuted ? 'success' : 'outline'}
                      >
                        {transaction.isExecuted ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Executado
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.dueDate)}</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'INCOME' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    {transaction.isExecuted && transaction.executedAt && (
                      <div className="text-xs text-muted-foreground">
                        Executado em {formatDate(transaction.executedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 