/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format dates for display
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}

/**
 * Format dates with time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('pt-BR')
}

/**
 * Parse amount from string input
 */
export function parseAmount(value: string): number {
  const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return Number.parseFloat(cleanValue) || 0
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
} 