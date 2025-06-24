'use client'

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
import { useWallets } from '@/shared/hooks'
import type { Wallet } from '@/domains/wallets/entities/wallet'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  currency: z.string().length(3, 'Moeda deve ter 3 caracteres').default('BRL'),
})

type FormData = z.infer<typeof formSchema>

interface WalletFormProps {
  wallet?: Wallet
  onSuccess?: () => void
}

export function WalletForm({ wallet, onSuccess }: WalletFormProps) {
  const { createWallet, isLoading } = useWallets()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallet?.name || '',
      currency: wallet?.currency || 'BRL',
    },
  })

  const onSubmit = async (data: FormData) => {
    const result = await createWallet(data)
    
    if (result.success) {
      form.reset()
      onSuccess?.()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Carteira</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Conta Corrente, Poupança..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moeda</FormLabel>
              <FormControl>
                <Input 
                  placeholder="BRL"
                  maxLength={3}
                  style={{ textTransform: 'uppercase' }}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Salvando...' : wallet ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 