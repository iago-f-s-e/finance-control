export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function parseAmount(value: string): number {
  // Remove non-numeric characters except comma and dot
  const cleaned = value.replace(/[^\d,.-]/g, '')
  
  // Replace comma with dot for parsing
  const normalized = cleaned.replace(',', '.')
  
  return Number.parseFloat(normalized) || 0
} 