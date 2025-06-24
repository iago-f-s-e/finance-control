'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { TransactionForm } from '@/components/transactions/transaction-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewTransactionPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nova Transação</h1>
          <p className="text-muted-foreground">Adicione uma nova receita ou despesa</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
