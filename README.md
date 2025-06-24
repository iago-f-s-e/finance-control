# Finance Control

Sistema de gestão financeira pessoal desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand  
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Code Quality**: Biome

## 🏗️ Arquitetura

O projeto segue princípios de Domain-Driven Design (DDD):

```
src/
├── domains/           # Lógica de negócio
│   ├── transactions/  # Receitas e despesas
│   ├── wallets/      # Carteiras
│   ├── categories/   # Categorias
│   └── analytics/    # Análises e gráficos
├── infrastructure/   # Integrações externas
├── adapters/        # Adaptadores de interface
└── shared/          # Utilitários compartilhados
```

## 🔧 Setup

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar código
npm run check
```

## 📋 Funcionalidades Principais

- ✅ **Receitas**: Cadastro, edição e exclusão de receitas
- ✅ **Despesas**: Gestão completa de despesas e agrupamentos
- ✅ **Carteiras**: Múltiplas carteiras e transferências
- ✅ **Recorrência**: Transações recorrentes flexíveis
- ✅ **Analytics**: Gráficos e relatórios financeiros
- ✅ **Mobile-First**: Interface otimizada para dispositivos móveis

## 📚 Documentação

Consulte a pasta `/docs` para:
- ADR-001: Decisões arquiteturais
- Database schema
- API documentation 