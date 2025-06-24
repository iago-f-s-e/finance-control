'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { TransferForm } from '@/components/wallets/transfer-form'

export default function TransferPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/wallets')
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
          <h1 className="text-2xl font-bold">Transferir entre Carteiras</h1>
          <p className="text-muted-foreground">Mova dinheiro entre suas carteiras</p>
        </div>
      </div>

      {/* Form */}
      <TransferForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
