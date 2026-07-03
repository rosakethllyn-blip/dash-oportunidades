# Oportunidades - Convênios Hospitalares

Sistema SaaS para monitoramento de ocorrências em convênios hospitalares.

## Funcionalidades

- Dashboard com gráficos e estatísticas
- Cadastro de ocorrências por setor e categoria
- Lista de ocorrências com filtros
- Edição e exclusão de ocorrências
- Relatórios com exportação Excel
- Autenticação com OAuth (Google/GitHub)
- Suporte a múltiplos setores (Adulto e Infantil)
- Dados de 2025 e 2026

## Setores Suportados

### Adulto
- BLOCO I, BLOCO II, BLOCO V
- ALA A (ONCO)
- UTI I, UTI II
- CENTRO CIRÚRGICO
- PSA

### Infantil
- MATERNIDADE
- UCINCO
- UTI NEO, UTI PED
- CCMI
- PSI
- BLOCO III
- ONCOLOGIA PEDIÁTRICA

## Setup

### 1. Configurar Banco de Dados

```bash
# Crie um banco PostgreSQL (ex: usando Docker)
docker run --name pg-oportunidades -e POSTGRES_PASSWORD=sua_senha -e POSTGRES_DB=dash_oportunidades -p 5432:5432 -d postgres
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/dash_oportunidades?schema=public"
AUTH_SECRET="sua-chave-secreta-aqui"
AUTH_URL="http://localhost:3000"

# OAuth (opcional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

### 3. Instalar e Configurar

```bash
npm install
npm run db:push
npm run db:seed
npm run db:migrate:data
```

### 4. Iniciar

```bash
npm run dev
```

Acesse: http://localhost:3000/login

## Credenciais Padrão

- **Email:** admin@oportunidades.com
- **Senha:** admin123

## Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run db:seed      # Criar dados iniciais
npm run db:migrate:data  # Migrar dados da planilha
```

## Stack

- Next.js 14 + React 19 + TypeScript
- TailwindCSS + shadcn/ui
- PostgreSQL + Prisma ORM
- NextAuth.js (OAuth)
- Recharts (gráficos)
- Vercel (deploy)
