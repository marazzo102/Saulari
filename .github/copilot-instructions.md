# Copilot Instructions for Saulari

## Visão Geral do Projeto
- **Framework:** Next.js 15 (Pages Router)
- **Banco de Dados:** Supabase (configurado via variáveis de ambiente, com fallbacks para desenvolvimento)
- **Gerenciador de Pacotes:** pnpm
- **Estilização:** Tailwind CSS + estilos inline com **tema escuro profissional**
- **Domínio:** Gestão de seguros, clientes e apólices (mercado brasileiro)
- **Idioma:** UI e mensagens em português
- **Tema:** Interface escura com tons profissionais para melhor experiência visual

## Estrutura e Fluxos Principais
- **Página principal:** Toda a lógica e UI central estão em `pages/index.js`.
- **APIs customizadas:** Em `pages/api/` (ex: `cotar-seguros.js`, `logs.js`, `send-email.js`, `send-whatsapp.js`, `upload-pdf.js`).
- **Integração Supabase:** Configurada em `lib/supabaseClient.js`. Use sempre este client para acesso ao banco.
- **Logs/Auditoria:** Use `/api/logs` para registrar ações relevantes. Veja exemplo de uso em `index.js` (função `logAction`).
- **Upload de PDF:** Endpoint `/api/upload-pdf.js` com limite de 10MB.
- **Envio de e-mail/WhatsApp:** Simulados por padrão, mas prontos para integração real (ver comentários nos arquivos API).

## Convenções e Padrões
- **Tema escuro:** Paleta de cores profissional com fundo `#0a0e13`, cards `#1a202c`, sidebar `#0f172a`
- **Cores principais:** Azul claro `#4fc3f7` para destaques, textos `#e2e8f0`, acentos `#cbd5e1`
- **Validação de CPF:** Função utilitária local em `index.js`
- **Tabela responsiva:** Colunas otimizadas para evitar scroll horizontal, larguras percentuais
- **Filtros e KPIs:** Cards de resumo e filtros profissionais com tema escuro consistente
- **Estilo:** Estilos inline com foco em legibilidade e contraste adequado
- **Logs:** Estrutura de tabela sugerida no comentário de `logs.js`
- **Mensagens e labels:** Sempre em português

## Workflows de Desenvolvimento
- **Rodar localmente:**
  ```bash
  pnpm install
  pnpm dev
  # Acesse http://localhost:3000 ou http://localhost:5000 (Replit)
  ```
- **Variáveis de ambiente necessárias:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (Valores de fallback já inclusos para dev)
- **Deploy:** Recomenda-se Vercel. Veja instruções no README.

## Integrações e Pontos de Atenção
- **Supabase:** Sempre use o client de `lib/supabaseClient.js`.
- **APIs externas:** Estrutura pronta para integração com seguradoras (ver comentários em `cotar-seguros.js`).
- **Logs:** Use `/api/logs` para rastreabilidade de ações.
- **Uploads:** PDFs até 10MB via `/api/upload-pdf.js`.

## Exemplos de Uso
- **Registrar log:**
  ```js
  await fetch('/api/logs', { method: 'POST', body: JSON.stringify({ action, entity, user }) })
  ```
- **Cotação de seguros:**
  ```js
  const res = await fetch('/api/cotar-seguros', { method: 'POST', body: JSON.stringify({ ... }) })
  ```

## Arquivos-chave
- `pages/index.js` — UI principal, lógica de negócios
- `pages/api/` — Endpoints customizados
- `lib/supabaseClient.js` — Configuração do Supabase
- `replit.md` — Notas de arquitetura e setup

> Mantenha sempre a consistência com os padrões acima ao criar novas features ou integrar agentes de IA.