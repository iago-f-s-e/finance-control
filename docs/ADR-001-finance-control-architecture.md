# ADR-001: Finance Control - Decisões Arquiteturais e de Design

**Data**: 2024-12-19  
**Status**: Aceito  
**Contexto**: Projeto de gestão financeira pessoal do zero  

## 📋 Resumo Executivo

Decidimos implementar um sistema de gestão financeira pessoal usando arquitetura monolítica com Next.js, focado em simplicidade inicial mas preparado para escalabilidade futura através de princípios de DDD.

## 🎯 Objetivos do Sistema

### Core Business Requirements

**Income Management (Receitas)**:
- CRUD completo de receitas
- Receitas unitárias ou recorrentes  
- Sistema de efetivação que impacta carteira
- Recorrência dinâmica (semanal, quinzenal, mensal, anual)

**Expenses Management (Despesas)**:
- CRUD completo de despesas
- Despesas unitárias ou recorrentes
- Sistema de efetivação que impacta carteira
- Agrupamento de despesas (ex: cartão de crédito)
- Recorrência dinâmica (semanal, quinzenal, mensal, anual)

**Wallet System (Carteiras)**:
- Múltiplas carteiras por usuário
- Saldo baseado em transações efetivadas
- Transferências entre carteiras

**Analytics & Visualization**:
- Gráficos de receitas, despesas e saldo
- Filtros por efetivação, tipo, range de data
- Dashboard de gestão para efetivações em lote

## 🏗️ Decisões Arquiteturais

### 1. Arquitetura Geral
**Decisão**: Arquitetura Monolítica com Next.js  
**Alternativas Consideradas**:
- Micro-frontends + APIs separadas
- Backend separado + Frontend

**Justificativa**:
- ✅ Simplicidade para MVP
- ✅ Deploy único e fácil
- ✅ Development velocity alta
- ✅ Estrutura preparada para possível migração futura

### 2. Stack Tecnológico
**Decisão**: 
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Language**: TypeScript
- **Code Quality**: Biome
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes

**Justificativa**:
- ✅ Stack moderna e robusta
- ✅ TypeScript para type safety
- ✅ Supabase elimina necessidade de setup de backend
- ✅ Shadcn/ui acelera development de UI

### 3. Padrões Arquiteturais
**Decisão**: Domain-Driven Design (DDD) simplificado  
**Estrutura**:
```
src/
├── domains/
│   ├── transactions/     # Core business logic
│   ├── wallets/         # Wallet management  
│   ├── categories/      # Categorization
│   └── analytics/       # Charts & reports
├── infrastructure/      # External concerns
├── adapters/           # Interface adapters
└── shared/            # Common utilities
```

**Justificativa**:
- ✅ Separação clara de responsabilidades
- ✅ Facilita testes unitários
- ✅ Preparado para crescimento
- ✅ Business logic isolada

### 4. Modelo de Dados

**Decisão**: Modelo relacional com 4 entidades principais:

```sql
-- Wallets: Múltiplas carteiras
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories: Categorização de transações
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type transaction_type NOT NULL, -- 'INCOME' | 'EXPENSE'
  color VARCHAR(7),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions: Core entity
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  category_id UUID REFERENCES categories(id),
  type transaction_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMP,
  
  -- Recurrence Support
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern recurrence_type, -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date DATE,
  parent_transaction_id UUID REFERENCES transactions(id),
  
  -- Grouping (Credit Card)
  group_id UUID,
  is_group_parent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transfers: Between wallets
CREATE TABLE wallet_transfers (
  id UUID PRIMARY KEY,
  from_wallet_id UUID REFERENCES wallets(id),
  to_wallet_id UUID REFERENCES wallets(id),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Justificativa**:
- ✅ Suporte completo a recorrência dinâmica
- ✅ Agrupamento de transações (cartão de crédito)
- ✅ Múltiplas carteiras + transferências
- ✅ Categorização flexível
- ✅ Auditoria básica com timestamps

## 🎨 Design Decisions

### 1. User Experience
**Decisão**: Mobile-First Design  
**Justificativa**:
- ✅ Maioria dos usuários acessará via mobile
- ✅ Progressive enhancement para desktop
- ✅ Touch-friendly interfaces

### 2. Nomenclatura
**Decisão**: Terminologia em inglês no código  
- `Income` em vez de "Receitas" ou "Entradas"
- `Expenses` em vez de "Despesas" ou "Saídas"  
- `Wallets` em vez de "Carteiras"

**Justificativa**:
- ✅ Consistência com padrões internacionais
- ✅ Evita ambiguidade de "entradas" duplas
- ✅ Facilita manutenção por outros devs

### 3. Recorrência
**Decisão**: Sistema dinâmico e flexível  
**Padrões Suportados**:
- Weekly (Semanal)
- Biweekly (Quinzenal)  
- Monthly (Mensal)
- Yearly (Anual)
- Com intervalo customizável (ex: a cada 2 meses)
- Data de término opcional

## 🛣️ Roadmap de Implementação

### Fase 1: Foundation (Sprint 1-2)
- [x] Setup Next.js + TypeScript + Tailwind
- [x] Configuração Supabase + Migrations
- [x] Estrutura de pastas DDD
- [x] Configuração Biome + Git hooks

### Fase 2: Core Domain (Sprint 3-4)  
- [x] Entities: Transaction, Wallet, Category
- [x] Repository pattern com Supabase
- [x] Use cases básicos
- [x] Zustand stores

### Fase 3: Wallet & Categories (Sprint 5-6)
- [x] CRUD Wallets
- [x] CRUD Categories  
- [x] UI Components base (Shadcn)
- [x] Navegação principal

### Fase 4: Transactions CRUD (Sprint 7-8)
- [x] Formulário de transações
- [x] Lista de transações
- [x] Filtros básicos
- [x] Validações

### Fase 5: Advanced Features (Sprint 9-10)
- [ ] Sistema de recorrência
- [ ] Agrupamento (cartão)
- [ ] Efetivação em lote
- [ ] Transferências entre carteiras

### Fase 6: Analytics (Sprint 11-12)
- [ ] Dashboard principal
- [ ] Gráficos (Chart.js/Recharts)
- [ ] Filtros avançados
- [ ] Relatórios

## ❌ Decisões Adiadas

Por simplicidade do MVP, decidimos **NÃO** implementar inicialmente:

- **Error Handling complexo**: Estratégias sofisticadas de retry/fallback
- **Data Consistency**: Locks otimistas, conflict resolution
- **Scalability concerns**: Sharding, caching, performance optimization  
- **Edge Cases**: Feriados, múltiplas moedas, saldo negativo
- **Monitoring**: APM, analytics, error tracking
- **Authentication**: Sistema próprio (usar Supabase Auth simples)

## ✅ Critérios de Sucesso

- [ ] Usuário consegue gerenciar receitas e despesas
- [ ] Sistema de recorrência funciona corretamente
- [ ] Efetivação em lote é intuitiva
- [ ] Gráficos fornecem insights úteis
- [ ] Interface mobile é fluida
- [ ] Performance adequada até 1000 transações

## 🔄 Revisão

Esta ADR deve ser revisada quando:
- Requisitos de performance se tornarem críticos
- Necessidade de múltiplos usuários/teams
- Complexidade do domínio aumentar significativamente
- Feedback de usuários indicar problemas arquiteturais

---

**Aprovado por**: Staff Engineer  
**Próximo passo**: Implementação da Fase 1 