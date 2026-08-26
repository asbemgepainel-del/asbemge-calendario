# Prompt para o Claude Code — Sistema de Calendário Asbemge

Copie e cole o texto abaixo no Claude Code, dentro da pasta do projeto, junto com os
3 arquivos anexados (`asbemge-calendario.jsx`, `asbemge-dashboard-publico.jsx`, `asbemge-schema.sql`).

---

## Prompt

Quero transformar estes protótipos React (feitos como artifacts, com estado em memória)
em uma aplicação Next.js + TypeScript + Tailwind + Supabase real, para gestão do
calendário de eventos esportivos e sociais do Clube Asbemge.

**Contexto do projeto:**
- Sou vice-presidente de esportes e eventos do clube e vou usar o painel administrativo.
- Outras pessoas (sócios, diretoria) vão acessar apenas o dashboard público, sem poder
  cadastrar ou editar nada.
- O clube usa as cores azul institucional e dourado (herança do antigo Bemge) e tem logo
  em `https://asbemge.com.br/wp-content/uploads/2025/04/logo.png` (versão escura) e
  `logo_white.png` (versão clara, para fundos escuros).

**Arquivos de referência anexados:**
1. `asbemge-calendario.jsx` — protótipo do painel administrativo (cadastro de eventos,
   detecção de conflito de agenda configurável por categoria, calendário anual/mensal/dia).
2. `asbemge-dashboard-publico.jsx` — protótipo do dashboard público, somente leitura, com
   menu lateral recolhível (sanduíche), estilo painel analítico (BI), e visualização da
   arte/pôster do evento ao selecioná-lo.
3. `asbemge-schema.sql` — schema completo para Supabase (Postgres): tabelas de eventos,
   locais, regras de espaçamento, diretores, notificações e conflitos, com RLS.

**O que preciso que você faça:**

1. Crie um projeto Next.js 14+ (App Router) com TypeScript e Tailwind, estruturado assim:
   - `/app/admin` — painel administrativo (login obrigatório via Supabase Auth), baseado
     no design e nas funcionalidades de `asbemge-calendario.jsx`.
   - `/app` (rota pública, ex. `/` ou `/calendario`) — dashboard público somente leitura,
     baseado no design de `asbemge-dashboard-publico.jsx`, sem exigir login.
   - Mantenha fielmente o design (cores, tipografia Sora/Inter/IBM Plex Mono, tokens CSS)
     dos dois protótipos — só adapte a estrutura de dados para vir do Supabase em vez de
     `useState` local.

2. Rode as migrações do `asbemge-schema.sql` no Supabase (ou gere os arquivos de migração
   equivalentes em `/supabase/migrations`).

3. Implemente:
   - CRUD de eventos no admin, usando a tabela `events`.
   - A lógica de detecção de conflito de agenda (portada do protótipo: `dateGapDays`,
     `computeConflicts`, `conflictsForEvent`), agora buscando as regras da tabela
     `spacing_rules` em vez de estado local.
   - Tela de configurações no admin para editar `spacing_rules` e o toggle
     "considerar porte do evento" (tabela `settings`).
   - Upload de imagem/arte do evento (campo `attachment_url` em `events`) via Supabase
     Storage — no dashboard público, se o evento tiver imagem enviada, mostrar essa
     imagem no painel de destaque; caso contrário, manter o pôster gerado em SVG como
     placeholder (já implementado em `EventArt` no protótipo).
   - Autenticação Supabase Auth apenas para o `/app/admin` (redirecionar para login se
     não autenticado); o dashboard público não exige login.

4. Configure o deploy no Vercel (crie `vercel.json` se necessário) e me devolva os
   comandos de deploy.

5. Não use `localStorage`/`sessionStorage` em nenhum componente — use estado React e
   Supabase como fonte de verdade.

Me pergunte se precisar decidir algo específico (nome das rotas, se o dashboard público
fica em domínio separado, etc.) antes de gerar tudo de uma vez.
