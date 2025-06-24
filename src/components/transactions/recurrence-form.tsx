'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import type { RecurrencePattern } from '@/domains/transactions/entities/transaction'

const recurrenceSchema = z.object({
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  recurrenceInterval: z.number().min(1).max(12).default(1),
  recurrenceEndDate: z.date().optional(),
})

type RecurrenceData = z.infer<typeof recurrenceSchema>

interface RecurrenceFormProps {
  value?: RecurrenceData
  onChange: (data: RecurrenceData) => void
}

const patternLabels: Record<RecurrencePattern, string> = {
  WEEKLY: 'Semanalmente',
  BIWEEKLY: 'Quinzenalmente',
  MONTHLY: 'Mensalmente',
  YEARLY: 'Anualmente',
}

export function RecurrenceForm({ value, onChange }: RecurrenceFormProps) {
  const form = useForm<RecurrenceData>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: {
      isRecurring: value?.isRecurring || false,
      recurrencePattern: value?.recurrencePattern || 'MONTHLY',
      recurrenceInterval: value?.recurrenceInterval || 1,
      recurrenceEndDate: value?.recurrenceEndDate,
    },
  })

  const watchIsRecurring = form.watch('isRecurring')
  const watchPattern = form.watch('recurrencePattern')

  // Sync form changes with parent
  const handleFormChange = () => {
    const data = form.getValues()
    onChange(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurar Recorrência</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            {/* Enable Recurrence */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          handleFormChange()
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium">
                        Transação recorrente
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurrence Pattern */}
            {watchIsRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(patternLabels).map(([pattern, label]) => (
                            <Button
                              key={pattern}
                              type="button"
                              variant={field.value === pattern ? 'default' : 'outline'}
                              className="text-sm"
                              onClick={() => {
                                field.onChange(pattern as RecurrencePattern)
                                handleFormChange()
                              }}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interval */}
                <FormField
                  control={form.control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Repetir a cada{' '}
                        <Badge variant="outline" className="ml-2">
                          {field.value}{' '}
                          {watchPattern === 'WEEKLY'
                            ? 'semana(s)'
                            : watchPattern === 'BIWEEKLY'
                              ? 'quinzena(s)'
                              : watchPattern === 'MONTHLY'
                                ? 'mês(es)'
                                : 'ano(s)'}
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value))
                            handleFormChange()
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="recurrenceEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de término (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined
                            field.onChange(date)
                            handleFormChange()
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Próximas ocorrências:</h4>
                  <div className="text-sm text-muted-foreground">
                    <div>
                      • Em {form.getValues('recurrenceInterval')}{' '}
                      {watchPattern === 'WEEKLY'
                        ? 'semana(s)'
                        : watchPattern === 'BIWEEKLY'
                          ? 'quinzena(s)'
                          : watchPattern === 'MONTHLY'
                            ? 'mês(es)'
                            : 'ano(s)'}
                    </div>
                    {form.getValues('recurrenceEndDate') && (
                      <div>
                        • Até {form.getValues('recurrenceEndDate')?.toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
