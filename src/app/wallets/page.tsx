'use client'

import { ArrowRightLeft, Edit, Plus, Trash2, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { WalletForm } from '@/components/wallets/wallet-form'
import { useWallets } from '@/shared/hooks'
import { formatCurrency } from '@/shared/utils/format'

export default function WalletsPage() {
  const { wallets, totalBalance, isLoading, error, loadWallets, deleteWallet, clearError } =
    useWallets()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<string | null>(null)

  useEffect(() => {
    loadWallets()
  }, [loadWallets])

  const handleDelete = async (walletId: string) => {
    if (confirm('Tem certeza que deseja excluir esta carteira?')) {
      await deleteWallet(walletId)
    }
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingWallet(null)
  }

  if (isLoading && wallets.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carteiras</h1>
          <p className="text-muted-foreground">Gerencie suas carteiras e contas</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/wallets/transfer">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transferir
            </Link>
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Carteira
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Carteira</DialogTitle>
              </DialogHeader>
              <WalletForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>
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

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Saldo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground">Soma de todas as carteiras</p>
        </CardContent>
      </Card>

      {/* Wallets List */}
      <div className="grid gap-4">
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma carteira encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira carteira para começar a gerenciar suas finanças
              </p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Carteira
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Carteira</DialogTitle>
                  </DialogHeader>
                  <WalletForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      <Badge variant="outline">{wallet.currency}</Badge>
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Criada em {new Date(wallet.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Dialog
                      open={editingWallet === wallet.id}
                      onOpenChange={(open) => setEditingWallet(open ? wallet.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Carteira</DialogTitle>
                        </DialogHeader>
                        <WalletForm wallet={wallet} onSuccess={handleEditSuccess} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(wallet.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
