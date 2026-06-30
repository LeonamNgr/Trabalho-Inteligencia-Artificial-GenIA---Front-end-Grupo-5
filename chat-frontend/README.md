# Chat Inteligente — Frontend

Frontend React do sistema de chat inteligente com suporte a documentos, integrado ao backend Spring Boot.

## Stack

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 19 | Biblioteca de interface |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS | 4 | Estilização utilitária |
| CSS Modules | — | Estilização com escopo |
| React Router DOM | 7 | Roteamento SPA |
| motion | 12 | Animações |
| lucide-react | 1 | Ícones |
| Vitest | 4 | Testes unitários |
| Oxlint | 1 | Linter |

## Estrutura

```
src/
├── components/
│   ├── Chat/          # ChatWindow, MessageList, MessageItem, ChatInput, AttachmentBadge, WelcomeScreen
│   ├── Common/        # ErrorBoundary, ErrorMessage, Loading, SkeletonLoader, Toast, HealthIndicator, HealthStatus, Logo, NewChatButton
│   ├── Documents/     # DocumentPanel
│   ├── History/       # ConversationItem
│   └── Layout/        # Layout, Sidebar, Footer
├── contexts/          # SessionContext, ConversationContext, ToastContext
├── hooks/             # useChat, useConversation, useUpload, useHealth, useDocuments
├── pages/             # ChatPage, NotFoundPage
├── services/          # api, chatService, uploadService, sessionService, healthService, documentService, conversationStorage
├── types/             # message, conversation, session, upload, health, document
├── utils/             # constants, validators, formatters, withRetry
└── assets/styles/     # global.css, variables.css
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (porta 5173) |
| `npm run build` | Compila TypeScript + build de produção |
| `npm run lint` | Executa oxlint |
| `npm run preview` | Preview do build de produção |
| `npm test` | Executa testes (Vitest) |
| `npm run typecheck` | TypeScript check sem emitir arquivos |

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_BASE_URL` | `/api` | Base URL para chamadas à API |
| `VITE_UPLOAD_TIMEOUT` | `120000` | Timeout para upload (ms) |
| `VITE_HEALTH_INTERVAL` | `30000` | Intervalo de health check (ms) |

## Docker

```bash
# Construir imagem
docker build -t chat-frontend .

# Executar com backend
docker run -p 80:80 chat-frontend
```

O nginx faz proxy reverso de `/api` para o backend em `http://backend:8080`.

## Integração com Backend

- **Proxy em dev**: Vite proxy `/api` → `http://localhost:8080`
- **Proxy em prod**: nginx proxy `/api` → `http://backend:8080`
- **Upload**: XMLHttpRequest com progresso
- **Chat**: fetch com polling assíncrono (task status)
- **Sessão**: UUID armazenado em localStorage

## Build de Produção

```bash
npm install
npm run build
```

Gera os artefatos em `dist/`.
