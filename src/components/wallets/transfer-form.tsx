'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Wallet } from '@/domains/wallets/entities/wallet'
import { container } from '@/infrastructure/container'
import { useWalletStore } from '@/shared/stores'
import { formatCurrency } from '@/shared/utils/format'

const transferSchema = z
  .object({
    fromWalletId: z.string().min(1, 'Carteira de origem é obrigatória'),
    toWalletId: z.string().min(1, 'Carteira de destino é obrigatória'),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    description: z.string().min(1, 'Descrição é obrigatória'),
  })
  .refine((data) => data.fromWalletId !== data.toWalletId, {
    message: 'Carteiras de origem e destino devem ser diferentes',
    path: ['toWalletId'],
  })

type TransferData = z.infer<typeof transferSchema>

interface TransferFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const { wallets, setWallets } = useWalletStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load wallets
    const loadWallets = async () => {
      try {
        const walletsData = await container.walletRepository.findAll()
        setWallets(walletsData)
      } catch (error) {
        console.error('Failed to load wallets:', error)
      }
    }

    loadWallets()
  }, [setWallets])

  const form = useForm<TransferData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWalletId: '',
      toWalletId: '',
      amount: 0,
      description: '',
    },
  })

  const watchFromWalletId = form.watch('fromWalletId')
  const watchToWalletId = form.watch('toWalletId')
  const watchAmount = form.watch('amount')

  const fromWallet = wallets.find((w) => w.id === watchFromWalletId)
  const toWallet = wallets.find((w) => w.id === watchToWalletId)

  const onSubmit = async (data: TransferData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await container.transferBetweenWalletsUseCase.execute(data)

      if (result.success) {
        // Reload wallets to update balances
        const updatedWallets = await container.walletRepository.findAll()
        setWallets(updatedWallets)

        form.reset()
        onSuccess?.()
      } else {
        setError(result.error.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const WalletCard = ({
    wallet,
    isSelected,
    onClick,
    disabled,
  }: {
    wallet: Wallet
    isSelected: boolean
    onClick: () => void
    disabled?: boolean
  }) => (
    <Card
      className={`cursor-pointer transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : isSelected
            ? 'ring-2 ring-primary bg-primary/5'
            : 'hover:bg-muted/50'
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{wallet.name}</h4>
            <Badge variant="outline" className="text-xs mt-1">
              {wallet.currency}
            </Badge>
          </div>
          <div className="text-right">
            <div className="font-bold">{formatCurrency(wallet.balance, wallet.currency)}</div>
            {wallet.id === watchFromWalletId && watchAmount > 0 && (
              <div className="text-xs text-muted-foreground">
                Após: {formatCurrency(wallet.balance - watchAmount, wallet.currency)}
              </div>
            )}
            {wallet.id === watchToWalletId && watchAmount > 0 && (
              <div className="text-xs text-muted-foreground">
                Após: {formatCurrency(wallet.balance + watchAmount, wallet.currency)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transferência entre Carteiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor a Transferir</FormLabel>
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
                      <Input placeholder="Ex: Transferência para poupança" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* From Wallet */}
              <FormField
                control={form.control}
                name="fromWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>De (Carteira de Origem)</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {wallets.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            Nenhuma carteira encontrada.
                          </p>
                        ) : (
                          wallets.map((wallet) => (
                            <WalletCard
                              key={wallet.id}
                              wallet={wallet}
                              isSelected={field.value === wallet.id}
                              onClick={() => field.onChange(wallet.id)}
                              disabled={wallet.id === watchToWalletId}
                            />
                          ))
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Arrow */}
              {fromWallet && toWallet && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">{fromWallet.name}</div>
                    <ArrowRightLeft className="h-4 w-4" />
                    <div className="text-sm font-medium">{toWallet.name}</div>
                  </div>
                </div>
              )}

              {/* To Wallet */}
              <FormField
                control={form.control}
                name="toWalletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para (Carteira de Destino)</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {wallets.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            Nenhuma carteira encontrada.
                          </p>
                        ) : (
                          wallets.map((wallet) => (
                            <WalletCard
                              key={wallet.id}
                              wallet={wallet}
                              isSelected={field.value === wallet.id}
                              onClick={() => field.onChange(wallet.id)}
                              disabled={wallet.id === watchFromWalletId}
                            />
                          ))
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Balance Validation */}
              {fromWallet && watchAmount > 0 && fromWallet.balance < watchAmount && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive text-sm">
                    ⚠️ Saldo insuficiente. Disponível:{' '}
                    {formatCurrency(fromWallet.balance, fromWallet.currency)}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || (fromWallet && watchAmount > fromWallet.balance)}
                  className="flex-1"
                >
                  {isSubmitting ? 'Transferindo...' : 'Confirmar Transferência'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
