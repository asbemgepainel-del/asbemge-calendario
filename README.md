# Asbemge · Calendário de Eventos

Aplicação Next.js + TypeScript + Tailwind + Supabase para gestão do calendário de
eventos esportivos e sociais do Clube Asbemge.

- `/` — dashboard público, somente leitura, sem necessidade de login.
- `/admin` — painel administrativo (CRUD de eventos, detecção de conflito de agenda,
  configurações), protegido por Supabase Auth.

## Desenvolvimento local

```bash
npm install
cp .env.local.example .env.local # preencha com as credenciais do seu projeto Supabase
npm run dev
```

## Variáveis de ambiente

| Nome | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase |

## Banco de dados

O schema inicial está em `supabase/migrations/0001_init.sql`. Ele cria as tabelas de
eventos, locais, regras de espaçamento, diretores, notificações, o bucket de storage
`event-art` para as artes dos eventos e as políticas de RLS.

Diretores (contas do `/admin`) são criados manualmente: primeiro em
Authentication → Users no painel do Supabase, depois inserindo uma linha
correspondente na tabela `directors` com o mesmo `id`.

## Deploy

Deploy contínuo via Vercel, conectado ao repositório Git. Configure as variáveis de
ambiente acima no projeto Vercel (Settings → Environment Variables) antes do primeiro
deploy de produção.
