'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/shared/utils/format'

interface ChartData {
  name: string
  value: number
  date?: string
  income?: number
  expense?: number
  balance?: number
}

interface BaseChartProps {
  title: string
  data: ChartData[]
  height?: number
}

// Income vs Expense Line Chart
export function IncomeExpenseChart({ title, data, height = 300 }: BaseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              name="Receitas"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              name="Despesas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Balance Area Chart
export function BalanceChart({ title, data, height = 300 }: BaseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Saldo"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Category Distribution Pie Chart
export function CategoryChart({ title, data, height = 300 }: BaseChartProps) {
  const COLORS = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
    '#374151',
    '#1f2937',
    '#111827',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Monthly Comparison Bar Chart
export function MonthlyComparisonChart({ title, data, height = 300 }: BaseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Receitas" />
            <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Quick Stats Cards
interface StatsCardProps {
  title: string
  value: number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  positive?: boolean
}

export function StatsCard({ title, value, change, changeLabel, icon, positive }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatCurrency(value)}</p>
            {change !== undefined && (
              <p className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
                {positive ? '+' : ''}
                {change.toFixed(1)}% {changeLabel}
              </p>
            )}
          </div>
          {icon && <div className="h-8 w-8 text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

// Transaction Trend Chart
export function TransactionTrendChart({ title, data, height = 250 }: BaseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [value, 'Transações']}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
              name="Número de Transações"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
