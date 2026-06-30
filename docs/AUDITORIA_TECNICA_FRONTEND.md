# Auditoria Técnica — Front-end React

**Projeto:** Chat Inteligente com Suporte a Documentos (GenIA - Grupo 5)  
**Data:** 29 de junho de 2026  
**Stack real:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, CSS Modules, Vitest 4  
**Propósito:** Auditoria completa do frontend para comparação futura com o backend

---

## 1. Arquitetura

### 1.1 Estrutura de Pastas

```
chat-frontend/
├── public/                             # Arquivos estáticos (imagens, favicon)
│   ├── Marvel_Logo.jpg
│   ├── Marvel_Background.jpg
│   └── vite.svg
├── src/
│   ├── assets/styles/                  # Estilos globais
│   │   ├── variables.css               # CSS custom properties (tema)
│   │   └── global.css                  # Reset, Tailwind import, scrollbar, animações
│   ├── components/
│   │   ├── Chat/                       # Núcleo do chat
│   │   │   ├── ChatWindow.tsx          # Componente principal do chat
│   │   │   ├── ChatInput.tsx           # Input de mensagem + anexo
│   │   │   ├── MessageList.tsx         # Lista de mensagens com scroll
│   │   │   ├── MessageItem.tsx         # Bolha de mensagem individual
│   │   │   ├── WelcomeScreen.tsx       # Tela inicial com sugestões
│   │   │   └── AttachmentBadge.tsx     # Badge de arquivo anexado
│   │   ├── Common/                     # Componentes reutilizáveis
│   │   │   ├── ErrorBoundary.tsx       # Class component de captura de erro
│   │   │   ├── ErrorMessage.tsx        # Mensagem de erro com retry
│   │   │   ├── HealthStatus.tsx        # Indicador de saúde da API + IA
│   │   │   ├── HealthIndicator.tsx     # Indicador simples (NÃO utilizado)
│   │   │   ├── Loading.tsx             # Spinner de carregamento
│   │   │   ├── Toast.tsx               # Container de toasts
│   │   │   ├── SkeletonLoader.tsx      # Placeholder de carregamento (NÃO utilizado)
│   │   │   ├── NewChatButton.tsx       # Botão de novo chat (NÃO utilizado)
│   │   │   └── Logo.tsx                # Logo Marvel (NÃO utilizado)
│   │   ├── Documents/
│   │   │   └── DocumentPanel.tsx       # Painel de ingestão de documentos
│   │   ├── History/
│   │   │   └── ConversationItem.tsx    # Item do histórico de conversas
│   │   └── Layout/
│   │       ├── Layout.tsx              # Layout principal com sidebar e outlet
│   │       ├── Sidebar.tsx             # Sidebar com histórico + documentos
│   │       └── Footer.tsx              # Rodapé institucional
│   ├── contexts/
│   │   ├── SessionContext.tsx          # Contexto de sessão
│   │   ├── ConversationContext.tsx     # Contexto de conversa ativa
│   │   └── ToastContext.tsx            # Contexto de notificações toast
│   ├── hooks/
│   │   ├── useChat.ts                  # Hook de envio de mensagens
│   │   ├── useConversation.ts          # Hook de histórico e seleção
│   │   ├── useDocuments.ts            # Hook de documentos (ingestão, busca)
│   │   ├── useHealth.ts               # Hook de health check
│   │   └── useUpload.ts               # Hook de upload de arquivos
│   ├── pages/
│   │   ├── ChatPage.tsx               # Página principal do chat
│   │   └── NotFoundPage.tsx           # Página 404
│   ├── services/
│   │   ├── api.ts                      # Cliente HTTP base (fetch wrapper)
│   │   ├── chatService.ts             # Endpoints de chat
│   │   ├── sessionService.ts          # Endpoints de sessão
│   │   ├── uploadService.ts           # Upload via XMLHttpRequest
│   │   ├── healthService.ts           # Health check
│   │   ├── documentService.ts         # Endpoints de documentos
│   │   └── conversationStorage.ts     # Persistência local (localStorage)
│   ├── types/
│   │   ├── message.ts                 # Message, ChatRequest, ChatResponse, etc.
│   │   ├── conversation.ts            # Conversation, ConversationSummary, etc.
│   │   ├── session.ts                 # SessionResponse
│   │   ├── upload.ts                  # UploadResponse, AttachmentResponse
│   │   ├── health.ts                  # HealthResponse, HealthStatus
│   │   └── document.ts               # Document, DocumentIngestResponse, etc.
│   ├── utils/
│   │   ├── constants.ts              # Timeouts, limites, chaves de storage
│   │   ├── validators.ts             # Validações de mensagem, arquivo, sessão
│   │   ├── formatters.ts             # Formatação de data, hora, tamanho
│   │   └── withRetry.ts              # Função de retry genérica (NÃO utilizada)
│   ├── main.tsx                       # Entry point
│   ├── App.tsx                        # Componente raiz com providers
│   ├── router.tsx                     # Configuração de rotas
│   ├── vite-env.d.ts                  # Tipos Vite
│   └── test-setup.ts                  # Setup de testes (jest-dom)
├── doc/
│   └── SYSTEM_DOCS_FRONTEND.md        # Documentação oficial (desatualizada)
├── index.html
├── package.json
├── vite.config.ts                     # Proxy /api → localhost:8080
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .oxlintrc.json
└── .gitignore
```

### 1.2 Responsabilidades de Cada Módulo

| Módulo | Responsabilidade |
|--------|------------------|
| `components/Chat/` | Renderização da interface de chat (janela, mensagens, input) |
| `components/Common/` | Componentes compartilhados (erro, loading, toast, saúde) |
| `components/Documents/` | Painel de ingestão de documentos (arquivo e URL) |
| `components/History/` | Item de histórico de conversas |
| `components/Layout/` | Estrutura de layout (sidebar, footer, layout principal) |
| `contexts/` | Estado global (sessão, conversa ativa, toasts) |
| `hooks/` | Lógica de negócio e efeitos colaterais |
| `pages/` | Páginas/rotas da aplicação |
| `services/` | Chamadas HTTP e persistência localStorage |
| `types/` | Interfaces TypeScript de DTOs |
| `utils/` | Constantes, validadores, formatadores, retry |
| `assets/styles/` | Estilos globais e variáveis CSS |

### 1.3 Fluxo Geral da Aplicação

```
main.tsx
  └── App.tsx
        ├── ErrorBoundary
        ├── SessionProvider (inicializa sessão ao montar)
        ├── ConversationProvider (estado da conversa ativa)
        ├── ToastProvider (notificações)
        └── RouterProvider (react-router-dom)
              └── Layout
                    ├── Sidebar
                    │     ├── Botão Nova Conversa → useConversation().createNewConversation()
                    │     ├── ConversationItem[] (histórico → useConversation().conversations)
                    │     ├── DocumentPanel → useDocuments()
                    │     └── HealthStatus → useHealth()
                    ├── <Outlet>
                    │     └── ChatPage → ChatWindow
                    │           ├── ErrorMessage (se houver erro)
                    │           ├── MessageList
                    │           │     ├── WelcomeScreen (se sem mensagens)
                    │           │     └── MessageItem[] (mensagens)
                    │           └── ChatInput (envio de texto ou arquivo)
                    └── Footer
                    └── Toast (notificações flutuantes)
```

---

## 2. Componentes

### 2.1 `Layout.tsx`
- **Responsabilidade:** Layout principal com sidebar, outlet do router, footer e toasts
- **Props:** Nenhuma (usa Outlet do react-router-dom)
- **Estados:** `sidebarOpen: boolean` (visibilidade da sidebar em mobile)
- **Efeitos:** Listener global de `Ctrl+K` / `Cmd+K` para focar textarea
- **Componentes filhos:** `Sidebar`, `Footer`, `Toast`, `<Outlet />`
- **Componente pai:** Nenhum (renderizado pelo router)

### 2.2 `Sidebar.tsx`
- **Responsabilidade:** Sidebar com histórico de conversas, painel de documentos e health status
- **Props:** `open: boolean`, `onClose: () => void`
- **Estados:** Nenhum (delega para hooks)
- **Subcomponente:** `SidebarContent` (renderiza: botão nova conversa, `ConversationItem[]`, `DocumentPanel`, `HealthStatus`, botão Configurações)
- **Componentes filhos:** `ConversationItem[]`, `DocumentPanel`, `HealthStatus`
- **Componente pai:** `Layout`

### 2.3 `Footer.tsx`
- **Responsabilidade:** Exibe créditos "GenIA - Grupo 5"
- **Props:** Nenhuma
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `Layout`

### 2.4 `ChatPage.tsx`
- **Responsabilidade:** Página do chat, renderiza `ChatWindow`
- **Props:** Nenhuma
- **Estados:** Nenhum
- **Componentes filhos:** `ChatWindow`
- **Componente pai:** Rota `/` (via `Layout` + `<Outlet />`)

### 2.5 `NotFoundPage.tsx`
- **Responsabilidade:** Página 404 com link de volta
- **Props:** Nenhuma
- **Estados:** Nenhum
- **Componentes filhos:** `Link` (react-router-dom)
- **Componente pai:** Rota `*` (via `Layout` + `<Outlet />`)

### 2.6 `ChatWindow.tsx`
- **Responsabilidade:** Janela principal do chat — orquestra mensagens, erro, loading, input
- **Props:** Nenhuma
- **Estados:** Nenhum (usa `useChat()`)
- **Componentes filhos:** `MessageList`, `ChatInput`, `ErrorMessage`, `Loading`
- **Componente pai:** `ChatPage`

### 2.7 `ChatInput.tsx`
- **Responsabilidade:** Input de texto com auto-resize + upload de arquivo
- **Props:** `onSend: (content, attachmentId?) => void`, `onSendFile?: (content, file) => void`, `disabled?: boolean`
- **Estados:** `message: string`, `selectedFile: File | null`, `fileInputRef: Ref`
- **Componentes filhos:** Nenhum
- **Componente pai:** `ChatWindow`

### 2.8 `MessageList.tsx`
- **Responsabilidade:** Lista de mensagens com scroll automático para o fim
- **Props:** `messages: Message[]`, `isTyping?: boolean`, `onSendSuggestion?: (text) => void`
- **Estados:** Nenhum (refs de scroll)
- **Efeitos:** Scroll automático condicional (se usuário estiver perto do fim)
- **Componentes filhos:** `MessageItem[]`, `WelcomeScreen` (se vazio)
- **Componente pai:** `ChatWindow`

### 2.9 `MessageItem.tsx`
- **Responsabilidade:** Bolha de mensagem individual (USER ou ASSISTANT)
- **Props:** `message: Message`
- **Estados:** Nenhum
- **Componentes filhos:** `AttachmentBadge` (se `message.attachment` existe)
- **Componente pai:** `MessageList`

### 2.10 `WelcomeScreen.tsx`
- **Responsabilidade:** Tela inicial com sugestões de perguntas
- **Props:** `onSendSuggestion: (text) => void`
- **Estados:** `imgError: boolean` (fallback se imagem não carregar)
- **Componentes filhos:** Nenhum
- **Componente pai:** `MessageList`

### 2.11 `AttachmentBadge.tsx`
- **Responsabilidade:** Badge com ícone de clipe + nome do arquivo anexado
- **Props:** `fileName?: string`
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `MessageItem`

### 2.12 `DocumentPanel.tsx`
- **Responsabilidade:** Painel expansível para ingestão de documentos (arquivo ou URL)
- **Props:** Nenhuma (usa `useDocuments()`)
- **Estados:** `open: boolean`, `showIngest: 'file' | 'url' | null`, `urlInput: string`, `fileInputRef: Ref`
- **Componentes filhos:** Nenhum
- **Componente pai:** `Sidebar` (dentro de `SidebarContent`)

### 2.13 `ConversationItem.tsx`
- **Responsabilidade:** Item clicável do histórico de conversas
- **Props:** `conversation: ConversationSummary`, `isActive: boolean`, `onSelect: () => void`
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `Sidebar`

### 2.14 `ErrorMessage.tsx`
- **Responsabilidade:** Exibe mensagem de erro com botão de retry opcional
- **Props:** `message: string`, `onRetry?: () => void`
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `ChatWindow`

### 2.15 `ErrorBoundary.tsx`
- **Responsabilidade:** Class component que captura erros não tratados na árvore
- **Props:** `children: ReactNode`
- **Estados:** `hasError: boolean`
- **Componentes filhos:** `children` (ou fallback de erro)
- **Componente pai:** `App`

### 2.16 `HealthStatus.tsx`
- **Responsabilidade:** Indicador de saúde da API + status do Ollama
- **Props:** Nenhuma (usa `useHealth()`)
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `Sidebar`

### 2.17 `HealthIndicator.tsx`
- **Responsabilidade:** Indicador simples de saúde (NÃO utilizado por nenhum componente)
- **Props:** Nenhuma (usa `useHealth()`)
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** Nenhum (componente órfão)

### 2.18 `Loading.tsx`
- **Responsabilidade:** Spinner "Processando..."
- **Props:** Nenhuma
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `ChatWindow`

### 2.19 `Toast.tsx`
- **Responsabilidade:** Container de notificações toast (auto-remove após 3s)
- **Props:** Nenhuma (usa `useToast()`)
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** `Layout`

### 2.20 `SkeletonLoader.tsx`
- **Responsabilidade:** Placeholder de carregamento com linhas simuladas (NÃO utilizado)
- **Props:** `lines?: number` (default 3)
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** Nenhum (componente órfão)

### 2.21 `NewChatButton.tsx`
- **Responsabilidade:** Botão de novo chat (NÃO utilizado — a Sidebar tem implementação própria)
- **Props:** Nenhuma (usa `useConversation()`)
- **Estados:** Nenhum
- **Componentes filhos:** Nenhum
- **Componente pai:** Nenhum (componente órfão)

### 2.22 `Logo.tsx`
- **Responsabilidade:** Exibe logo Marvel com fallback textual (NÃO utilizado)
- **Props:** Nenhuma
- **Estados:** `imgError: boolean`
- **Componentes filhos:** Nenhum
- **Componente pai:** Nenhum (componente órfão)

---

## 3. Hooks

### 3.1 `useChat()` — `src/hooks/useChat.ts`
- **Onde é usado:** `ChatWindow.tsx`
- **Retorna:** `{ messages, isLoading, error, sendMessage, sendFileMessage, retry, clearMessages }`
- **Contextos consumidos:** `useSession()`, `useConversationContext()`
- **Serviços chamados:** `postMessageAsync`, `uploadAndAsk`

### 3.2 `useConversation()` — `src/hooks/useConversation.ts`
- **Onde é usado:** `Sidebar.tsx` (via `SidebarContent`)
- **Retorna:** `{ conversations, isLoading, error, fetchHistory, selectConversation, createNewConversation }`
- **Contextos consumidos:** `useSession()`, `useConversationContext()`
- **Serviços chamados:** `getHistory`, `getConversation`
- **Efeitos:** `fetchHistory()` executado quando `sessionId` muda; `refreshFromStorage()` executado quando `activeConversation.id` ou `messages.length` muda

### 3.3 `useDocuments()` — `src/hooks/useDocuments.ts`
- **Onde é usado:** `DocumentPanel.tsx`
- **Retorna:** `{ documents, isLoading, error, ingestFile, ingestUrl, fetchDocuments, removeDocument, searchResults, searchDocuments, isSearching, isIngesting }`
- **Contextos consumidos:** Nenhum (usa o proprio estado local)
- **Serviços chamados:** `documentService.*` (listDocuments, ingestDocument, ingestUrl, getDocument, deleteDocument, searchDocuments)

### 3.4 `useHealth()` — `src/hooks/useHealth.ts`
- **Onde é usado:** `HealthStatus.tsx`, `HealthIndicator.tsx` (órfão)
- **Retorna:** `{ status, ollama, version, lastCheck, checkHealth }`
- **Contextos consumidos:** Nenhum
- **Serviços chamados:** `getHealth`
- **Efeitos:** `checkHealth()` no mount + `setInterval` a cada `HEALTH_CHECK_INTERVAL` (30s)

### 3.5 `useUpload()` — `src/hooks/useUpload.ts`
- **Onde é usado:** Em nenhum lugar (hook órfão — não é importado por nenhum componente)
- **Retorna:** `{ progress, isUploading, uploadedFile, error, uploadFile, retry, reset }`
- **Contextos consumidos:** `useSession()`
- **Serviços chamados:** `uploadFile` (uploadService.ts)

---

## 4. Services

### 4.1 `api.ts` — Cliente HTTP base
- **Responsabilidade:** Wrapper genérico sobre `fetch` com timeout, tratamento de erro, serialização JSON
- **Métodos expostos:** `api.get<T>(url, timeout?)`, `api.post<T>(url, body?, timeout?)`, `api.delete<T>(url, timeout?)`
- **Timeout:** Usa `AbortSignal.timeout(timeout)` — padrão `TIMEOUTS.MESSAGE` (180s)
- **Tratamento de erro:** Se `!response.ok`, lê `response.json()` e lança `HttpError(status, body)`. Se 204, retorna `undefined`.
- **Classes de erro:**
  - `AppError` — `message` + `code`
  - `HttpError` — `status` + `body` (herda `AppError`)
  - `ErrorResponse` — `{ status, error, message, timestamp, path, errors? }`

### 4.2 `chatService.ts` — Endpoints de Chat

| Função | Método | Endpoint | Request | Response | Timeout |
|--------|--------|----------|---------|----------|---------|
| `postMessage` | POST | `/api/chat/message` | `ChatRequest` | `ChatResponse` | 180s (TIMEOUTS.MESSAGE) |
| `postMessageAsync` | POST | `/api/chat/message/async` | `ChatRequest` | Pooling até `ChatResponse` | 15s start + 600s total pooling |
| `uploadAndAsk` | POST | `/api/chat/upload-and-ask` | `FormData` (file, sessionId, conversationId, content) | `UploadAndAskResponse` | 120s (TIMEOUTS.UPLOAD) |
| `getHistory` | GET | `/api/chat/history/{sessionId}` | — | `HistoryResponse` | 15s (TIMEOUTS.HISTORY) |
| `getConversation` | GET | `/api/chat/history/{sessionId}/{conversationId}` | — | `ConversationResponse` | 15s (TIMEOUTS.HISTORY) |

**Observação:** `postMessage()` existe no service mas **NÃO é chamado por nenhum hook**. O `useChat` chama `postMessageAsync()`.

**Fluxo de `postMessageAsync`:**
1. POST `/api/chat/message/async` com `AbortSignal.timeout(15s)`
2. Recebe `TaskStatusResponse` com `taskId`
3. Pooling a cada 2s em `/api/chat/message/async/{taskId}`
4. Se `status === 'COMPLETED'`, retorna `result`
5. Se `status === 'FAILED'`, lança erro com `errorMessage`
6. Se `elapsed >= maxTotalMs` (600s), lança timeout
7. Timeout individual de polling: 15s (`AbortSignal.timeout`)

### 4.3 `sessionService.ts` — Endpoints de Sessão

| Função | Método | Endpoint | Request | Response | Timeout |
|--------|--------|----------|---------|----------|---------|
| `createSession` | GET | `/api/session` | — | `SessionResponse` | 10s |
| `validateSession` | GET | `/api/session/{sessionId}` | — | `SessionResponse` \| `null` (404) | 10s |
| `deleteSession` | DELETE | `/api/session/{sessionId}` | — | `void` (204) | 10s |

**Tratamento de erro:** `validateSession` captura `HttpError(404)` e retorna `null`. Demais erros propagam.

### 4.4 `uploadService.ts` — Upload de Arquivo
- **Endpoint:** `POST /api/upload`
- **Método:** XMLHttpRequest (não fetch)
- **Request:** `FormData` com `file` + `sessionId`
- **Response:** `UploadResponse` (`{ attachmentId, fileName, fileType, fileSize, uploadedAt, message }`)
- **Timeout:** `TIMEOUTS.UPLOAD` (120s), configurado via `xhr.timeout`
- **Progresso:** Callback `onProgress` via `xhr.upload.onprogress`
- **Tratamento de erro:** Se status HTTP não for 2xx, tenta parsear JSON do responseText e lança `HttpError`. Se não conseguir parsear, cria erro genérico.

### 4.5 `healthService.ts` — Health Check
- **Endpoint:** `GET /api/health`
- **Método:** GET via `api.get`
- **Response:** `HealthResponse` (`{ status, database, ollama, diskSpace, timestamp, version }`)
- **Timeout:** `TIMEOUTS.HEALTH` (5s)

### 4.6 `documentService.ts` — Documentos

| Função | Método | Endpoint | Timeout |
|--------|--------|----------|---------|
| `ingestDocument` | POST (multipart) | `/api/documents/ingest` | 120s (UPLOAD) |
| `ingestUrl` | POST (JSON) | `/api/documents/ingest/url` | 15s (HISTORY) |
| `listDocuments` | GET | `/api/documents` | 15s (HISTORY) |
| `getDocument` | GET | `/api/documents/{id}` | 15s (HISTORY) |
| `deleteDocument` | DELETE | `/api/documents/{id}` | 15s (HISTORY) |
| `getDocumentChunks` | GET | `/api/documents/{id}/chunks` | 15s (HISTORY) |
| `searchDocuments` | POST (JSON) | `/api/documents/search` | 180s (MESSAGE) |

### 4.7 `conversationStorage.ts` — Persistência Local
- **Responsabilidade:** Ler/escrever conversas e mensagens no localStorage
- Não é um service HTTP. Funções:
  - `loadConversations(sessionId)` → `ConversationSummary[]`
  - `saveConversations(sessionId, conversations)`
  - `loadMessages(sessionId, conversationId)` → `Message[]`
  - `saveMessages(sessionId, conversationId, messages)`

---

## 5. Fluxo Completo do Chat

```
1. INICIALIZAÇÃO
   └── SessionProvider monta → useEffect → initialize()
       ├── localStorage.getItem("sessionId")
       ├── Se existe e é UUID válido:
       │     └── apiValidateSession(stored)
       │           ├── Se válida (expired=false) → setSessionId(stored), fim
       │           └── Se erro de rede → tenta criar nova
       ├── Se inválida → clearStoredSession()
       └── Se não existe ou expirou:
             └── createWithRetry()
                   ├── apiCreateSession() → GET /api/session
                   ├── localStorage.setItem("sessionId", response.sessionId)
                   └── Retry: até 3 tentativas com backoff (1s, 2s, 3s)

2. CRIAÇÃO DA SESSÃO
   └── createWithRetry() → api.get("/api/session")
       └── Response: { sessionId, createdAt, lastActivity, expired }
       └── Armazena sessionId no localStorage e no estado SessionContext

3. NOVA CONVERSA
   └── Clique em "Nova Conversa" → useConversation().createNewConversation()
       ├── Se há conversa ativa com mensagens → saveMessages() no localStorage
       ├── setActiveConversation(null)
       └── setMessages([])

4. ENVIO DA MENSAGEM (useChat.sendMessage)
   └── ChatInput → onSend(content)
       ├── Validação: mensagem não vazia, ≤ 5000 caracteres
       ├── setError(null), setIsLoading(true)
       ├── Cria mensagem USER temporária (id negativo = -Date.now())
       ├── addMessage(tempUser) → ConversationContext
       ├── Chama postMessageAsync({ sessionId, conversationId, content, attachmentId })
       │     └── POST /api/chat/message/async
       │     └── Pooling /api/chat/message/async/{taskId} a cada 2s (máx 10min)
       ├── Response: { userMessage, assistantMessage, conversationId }
       ├── Se nova conversa (sem activeConversation):
       │     ├── setActiveConversation({ id: backendConvId })
       │     └── ensureConversationInList(backendConvId, content)
       ├── updateMessage(tempUserId, dados reais do backend)
       └── addMessage(assistantMessage)

5. ENVIO COM ARQUIVO (useChat.sendFileMessage)
   └── Similar ao sendMessage, mas:
       ├── Valida tipo de arquivo (MIME + extensão)
       ├── Valida tamanho (≤ 50 MB)
       └── Chama uploadAndAsk() → POST /api/chat/upload-and-ask (multipart)
       └── Response: { userMessage, assistantMessage, conversationId }

6. RECEBIMENTO DA RESPOSTA
   └── postMessageAsync retorna ChatResponse
       ├── response.userMessage → atualiza mensagem temporária
       └── response.assistantMessage → addMessage() com role: 'ASSISTANT'

7. PERSISTÊNCIA LOCAL
   └── persistMessages(convId, allMsgs)
       └── saveMessages(sessionId, convId, [userMsg, assistantMsg])
   └── updateConversationLastMessage(convId, assistantContent)
       └── Atualiza array de ConversationSummary no localStorage

8. HISTÓRICO
   └── useConversation.fetchHistory()
       ├── Carrega localStorage primeiro (fallback offline)
       ├── GET /api/chat/history/{sessionId} → { sessionId, conversations[] }
       ├── Atualiza estado + localStorage
       └── Se erro 404/409 → reinitializeSession()

9. RENDERIZAÇÃO
   └── ChatWindow → MessageList → MessageItem[]
       └── MessageList faz scroll automático para o fim
       └── Indicador de digitação (3 dots animados) enquanto isLoading
```

---

## 6. Fluxo do Upload

```
1. SELEÇÃO DO ARQUIVO
   └── Clique no botão Paperclip → fileInputRef.current.click()
   └── Input file: accept=".txt,.pdf,.md,.html,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif"
   └── onChange → setSelectedFile(file)
   └── Exibe nome do arquivo + botão X para remover

2. ENVIO COM ARQUIVO
   └── Clique em Send (Enter) com selectedFile presente
   └── ChatInput verifica: se selectedFile && onSendFile
       └── Chama onSendFile(message, file)
       └── Que chama useChat.sendFileMessage(content, file)

3. VALIDAÇÕES NO FRONTEND (useChat.sendFileMessage)
   ├── sessionId existe?
   ├── isAllowedFileType(file.type) → ALLOWED_MIME_TYPES
   ├── isAllowedExtension(file.name) → ALLOWED_EXTENSIONS (fallback)
   └── isWithinFileSizeLimit(file.size) → UPLOAD_MAX_SIZE (50 MB)

4. CHAMADA HTTP
   └── uploadAndAsk(file, sessionId, conversationId, content)
       └── FormData com: file, sessionId, conversationId?, content?
       └── POST /api/chat/upload-and-ask
       └── AbortSignal.timeout(120s)
       └── Se erro → HttpError(status, body)

5. RESPOSTA DO BACKEND
   └── UploadAndAskResponse: { userMessage, assistantMessage, conversationId }
   └── Cria/atualiza conversa
   └── Adiciona mensagens ao estado
   └── Persiste no localStorage

6. FLUXO ALTERNATIVO (upload puro, sem pergunta)
   └── Hook useUpload.ts existe mas NÃO é conectado a nenhum componente
   └── usaria POST /api/upload via XMLHttpRequest com progresso
   └── Valida: tipo, tamanho (mas mensagem de erro diz "10 MB" — contradiz constante de 50 MB)
```

---

## 7. LocalStorage

### 7.1 Chaves Utilizadas

| Chave | Formato | Onde é criada | Onde é atualizada | Onde é removida |
|-------|---------|---------------|-------------------|-----------------|
| `sessionId` | UUID string | `SessionContext.initialize()` — após `createSession()` bem-sucedido | `SessionContext.initialize()` — se sessão válida | `clearStoredSession()` (quando sessão inválida/expirada), `destroy()` |
| `chat:conversations:{sessionId}` | JSON array de `ConversationSummary[]` | `ensureConversationInList()` (primeira mensagem de nova conversa) | `updateConversationLastMessage()` (após cada mensagem), `fetchHistory()` (resposta da API), `selectConversation()` | Nunca é removida |
| `chat:messages:{sessionId}:{conversationId}` | JSON array de `Message[]` | `persistMessages()` (após primeira resposta) | `selectConversation()` (se API retornou dados), `createNewConversation()` (salva mensagens atuais antes de limpar) | Nunca é removida |

### 7.2 Observações
- `sessionId` é a única chave fixa (`STORAGE_KEYS.SESSION_ID = 'sessionId'`)
- As chaves de conversas e mensagens usam padrão dinâmico com `sessionId` e `conversationId`
- Não há limpeza de localStorage ao destruir sessão (apenas `sessionId` é removido, conversas antigas permanecem)
- Todas as operações de leitura/escrita são silenciosas (try/catch sem log)

---

## 8. Estado da Aplicação

| Estado | Onde fica armazenado | Tipo |
|--------|----------------------|------|
| `sessionId` | `SessionContext` (estado React) + `localStorage` | `string \| null` |
| `activeConversation` | `ConversationContext` | `Conversation \| null` (`{ id: number }`) |
| `messages` | `ConversationContext` | `Message[]` |
| `conversations` (histórico) | `useConversation` (estado local) + `localStorage` | `ConversationSummary[]` |
| `isLoading` (chat) | `useChat` (estado local) | `boolean` |
| `error` (chat) | `useChat` (estado local) | `string \| null` |
| `isLoading` (sessão) | `SessionContext` | `boolean` |
| `error` (sessão) | `SessionContext` | `string \| null` |
| `isLoading` (histórico) | `useConversation` | `boolean` |
| `error` (histórico) | `useConversation` | `string \| null` |
| `progress` (upload) | `useUpload` (hook órfão) | `number` |
| `isUploading` (upload) | `useUpload` (hook órfão) | `boolean` |
| `uploadedFile` | `useUpload` (hook órfão) | `UploadResponse \| null` |
| `error` (upload) | `useUpload` (hook órfão) | `string \| null` |
| `documents` | `useDocuments` | `Document[]` |
| `isIngesting` | `useDocuments` | `boolean` |
| `isSearching` | `useDocuments` | `boolean` |
| `searchResults` | `useDocuments` | `DocumentChunk[]` |
| `error` (documentos) | `useDocuments` | `string \| null` |
| `toasts` | `ToastContext` | `Toast[]` |
| `status` (health) | `useHealth` | `HealthStatus \| 'CHECKING'` |
| `ollama` (health) | `useHealth` | `string \| null` |
| `version` (health) | `useHealth` | `string \| null` |

---

## 9. Fluxo HTTP (Endpoints por método)

### GET /api/session
- **Quem chama:** `sessionService.createSession()` → `SessionContext.createWithRetry()`
- **Quando chama:** Inicialização da aplicação (se não há sessão local ou se expirou)
- **Payload:** Nenhum
- **Resposta esperada:** `{ sessionId: string, createdAt: string, lastActivity: string, expired: boolean }`
- **Tratamento de erro:** Retry com 3 tentativas, backoff 1s/2s/3s. Erro persiste → `setError(message)`

### GET /api/session/{sessionId}
- **Quem chama:** `sessionService.validateSession()` → `SessionContext.initialize()`
- **Quando chama:** Se há sessionId no localStorage
- **Payload:** Nenhum
- **Resposta esperada:** `SessionResponse` ou `null` (se 404)
- **Tratamento de erro:** 404 → retorna null. Outros → propaga.

### DELETE /api/session/{sessionId}
- **Quem chama:** `sessionService.deleteSession()` → `SessionContext.destroy()`
- **Quando chama:** Quando `destroy()` é chamado (não há UI que chame isso atualmente)
- **Payload:** Nenhum
- **Resposta esperada:** 204 No Content
- **Tratamento de erro:** Ignorado (sempre remove localStorage)

### POST /api/chat/message/async
- **Quem chama:** `chatService.postMessageAsync()` → `useChat.sendMessage()`
- **Quando chama:** Usuário envia mensagem de texto
- **Payload:** `{ sessionId, conversationId, content, attachmentId }`
- **Resposta esperada:** `{ taskId, status, result?, errorMessage?, createdAt?, completedAt? }`
- **Tratamento de erro:** Se response.ok=false → HttpError. Se status=FAILED → erro com errorMessage. Se timeout total (10min) → "Tempo limite excedido".

### GET /api/chat/message/async/{taskId}
- **Quem chama:** Pooling interno de `postMessageAsync()`
- **Quando chama:** A cada 2s após criar tarefa assíncrona
- **Payload:** Nenhum
- **Resposta esperada:** `TaskStatusResponse` com status PENDING/PROCESSING/COMPLETED/FAILED
- **Tratamento de erro:** Se response.ok=false, continua (break não interrompe polling). Timeout individual de 15s.

### POST /api/chat/upload-and-ask
- **Quem chama:** `chatService.uploadAndAsk()` → `useChat.sendFileMessage()`
- **Quando chama:** Usuário envia arquivo + opcionalmente texto
- **Payload:** `FormData` com file, sessionId, conversationId?, content?
- **Resposta esperada:** `{ userMessage, assistantMessage, conversationId }`
- **Tratamento de erro:** HttpError(status, body)

### GET /api/chat/history/{sessionId}
- **Quem chama:** `chatService.getHistory()` → `useConversation.fetchHistory()`
- **Quando chama:** Na inicialização (quando sessionId fica disponível)
- **Payload:** Nenhum
- **Resposta esperada:** `{ sessionId, conversations: ConversationSummary[] }`
- **Tratamento de erro:** 404 ou 409 → reinitializeSession(). Outros → setError() (só se localStorage vazio)

### GET /api/chat/history/{sessionId}/{conversationId}
- **Quem chama:** `chatService.getConversation()` → `useConversation.selectConversation()`
- **Quando chama:** Usuário clica em uma conversa no histórico
- **Payload:** Nenhum
- **Resposta esperada:** `{ id, messages: Message[] }`
- **Tratamento de erro:** 404 ou 409 → reinitializeSession(). Outros → setError() (só se não havia dados locais)

### POST /api/upload
- **Quem chama:** `uploadService.uploadFile()` → `useUpload.uploadFile()`
- **Observação:** O hook `useUpload` não é utilizado por nenhum componente atualmente
- **Payload:** `FormData` com file + sessionId
- **Resposta esperada:** `{ attachmentId, fileName, fileType, fileSize, uploadedAt, message }`
- **Tratamento de erro:** HttpError(status, body). Timeout → "Tempo limite excedido". Erro de rede → "Erro de rede".

### GET /api/health
- **Quem chama:** `healthService.getHealth()` → `useHealth.checkHealth()`
- **Quando chama:** No mount + a cada 30s
- **Payload:** Nenhum
- **Resposta esperada:** `{ status, database, ollama, diskSpace, timestamp, version }`
- **Tratamento de erro:** Qualquer erro → status='DOWN', ollama=null

### POST /api/documents/ingest
- **Quem chama:** `documentService.ingestDocument()` → `useDocuments.ingestFile()`
- **Quando chama:** Usuário seleciona arquivo no DocumentPanel
- **Payload:** `FormData` com file + sourceType?
- **Resposta esperada:** `{ documentId, fileName, status, chunks, processingTime, message }`
- **Tratamento de erro:** Mensagem genérica

### POST /api/documents/ingest/url
- **Quem chama:** `documentService.ingestUrl()` → `useDocuments.ingestUrl()`
- **Payload:** `{ url }`
- **Resposta esperada:** Mesmo formato de `IngestResponse`

### GET /api/documents
- **Quem chama:** `documentService.listDocuments()` → `useDocuments.fetchDocuments()`
- **Payload:** Nenhum
- **Resposta esperada:** `{ documents: Document[] }`

### DELETE /api/documents/{id}
- **Quem chama:** `documentService.deleteDocument()` → `useDocuments.removeDocument()`
- **Payload:** Nenhum
- **Resposta esperada:** 204 No Content

### POST /api/documents/search
- **Payload:** `{ query, topK }`
- **Resposta esperada:** `{ results: DocumentChunk[] }`

---

## 10. Timeouts

### 10.1 Definições em `src/utils/constants.ts`

| Constante | Valor (ms) | minutos | Onde é usado |
|-----------|-----------|---------|--------------|
| `TIMEOUTS.MESSAGE` | 180.000 | 3 min | `api.get/post` (padrão), `postMessage`, `searchDocuments` |
| `TIMEOUTS.UPLOAD` | 120.000 | 2 min | `uploadAndAsk()`, `ingestDocument()`, `uploadService.uploadFile()` (xhr.timeout) |
| `TIMEOUTS.HISTORY` | 15.000 | 15 s | `getHistory`, `getConversation`, `ingestUrl`, `listDocuments`, `getDocument`, `deleteDocument`, `getDocumentChunks` |
| `TIMEOUTS.HEALTH` | 5.000 | 5 s | `getHealth()` |
| `TIMEOUTS.SESSION` | 10.000 | 10 s | `createSession`, `validateSession`, `deleteSession` |
| `TIMEOUTS.ASYNC_START` | 15.000 | 15 s | POST `/api/chat/message/async` (primeira chamada) |
| `TIMEOUTS.ASYNC_POLL` | 15.000 | 15 s | GET polling `/api/chat/message/async/{taskId}` |

### 10.2 Outros timeouts

| Constante | Valor | Onde é usado |
|-----------|-------|--------------|
| `POLLING.INTERVAL_MS` | 2.000 ms | Intervalo entre polls do `postMessageAsync` |
| `POLLING.MAX_TOTAL_MS` | 600.000 ms (10 min) | Tempo máximo total de polling |
| `HEALTH_CHECK_INTERVAL` | 30.000 ms (env) \| 30s padrão | Intervalo entre health checks |
| `RETRY.BASE_DELAY` | 1.000 ms | Delay base do retry de sessão |
| `RETRY.MAX_ATTEMPTS` | 3 | Máximo de tentativas de criação de sessão |
| `setTimeout` no Toast | 3.000 ms | Auto-remoção de toasts |

### 10.3 Timeout do proxy Vite
- `proxyTimeout: 300000` (5 min) no `vite.config.ts` — para requisições longas que passam pelo proxy de desenvolvimento

---

## 11. Tratamento de Erros

### 11.1 Mapeamento em `api.ts` (`getErrorMessage`)

| Código | Mensagem | Onde é usado |
|--------|----------|--------------|
| 400 | "Verifique os dados enviados." | `api.ts` (função `getErrorMessage`) |
| 404 | "Recurso não encontrado." | `api.ts` |
| 409 | "Sessão expirada. Crie uma nova sessão." | `api.ts` |
| 413 | "O arquivo excede o limite de tamanho permitido." | `api.ts` |
| 415 | "Formato de arquivo não suportado." | `api.ts` |
| 422 | "Os dados enviados são inválidos." | `api.ts` |
| 500 | "Erro no servidor. Tente novamente mais tarde." | `api.ts` |
| 502 | "Serviço de IA indisponível. Tente novamente mais tarde." | `api.ts` |
| fallback | "Ocorreu um erro inesperado." | `api.ts` |

### 11.2 Tratamento Real nos Hooks

**useChat.sendMessage:**
- Captura `HttpError` com status **404** ou **409** → `setError('Sessão expirou...')` + `reinitializeSession()`
- Outros erros → `setError(err.message)`
- **Erros sem tratamento específico:** 400, 413, 415, 422, 500, 502 — todos caem no fallback genérico

**useChat.sendFileMessage:**
- Captura `HttpError` com status **409** → reinitializeSession()
- Outros erros → genérico
- **Observação:** Não trata 404 (ao contrário de sendMessage)

**useConversation.fetchHistory:**
- Captura `HttpError` com status **404** ou **409** → reinitializeSession()
- Outros erros → genérico (só se localStorage vazio)

**useConversation.selectConversation:**
- Captura `HttpError` com status **404** ou **409** → reinitializeSession()
- Outros erros → genérico (só se localStorage vazio)

**SessionContext.createWithRetry:**
- Qualquer erro → retry até 3x, depois `setError(message)`
- Erro de sessão inválida → `clearStoredSession()`

**useUpload (órfão):**
- Qualquer erro → `err.message` ou "Erro no upload"
- `xhr.onerror` → "Erro de rede"
- `xhr.ontimeout` → "Tempo limite excedido"

**useDocuments:**
- Todos os erros → mensagem genérica (`err.message` ou fallback)

**useHealth:**
- Qualquer erro → `setStatus('DOWN')`, `setOllama(null)`

**ErrorBoundary:**
- Captura qualquer erro não tratado na árvore de componentes
- Renderiza fallback com "Algo deu errado." + botão "Tentar novamente"

### 11.3 Análise por Código HTTP

| Código | Tratamento específico? | Onde | Apenas genérico? |
|--------|----------------------|------|------------------|
| `AbortSignal.timeout` / Timeout | Parcial | `postMessageAsync` (tempo total), `uploadService` (ontimeout) | Sim, na maioria dos casos |
| 400 | ❌ | — | Sim, `getErrorMessage` + fallback |
| 404 | ✅ | `sendMessage`, `fetchHistory`, `selectConversation` (→ reinitializeSession) | `validateSession` trata 404 como null |
| 409 | ✅ | `sendMessage`, `sendFileMessage`, `fetchHistory`, `selectConversation` (→ reinitializeSession) | — |
| 413 | ❌ | — | Sim, `getErrorMessage` |
| 415 | ❌ | — | Sim, `getErrorMessage` |
| 422 | ❌ | — | Sim, `getErrorMessage` |
| 500 | ❌ | — | Sim, `getErrorMessage` |
| 502 | ❌ | — | Sim, `getErrorMessage` |
| Rede offline | ❌ | — | Sim, fetch rejeita com TypeError |

---

## 12. Compatibilidade com o Backend

### 12.1 Possíveis Inconsistências

1. **Endpoint de sessão:** Frontend usa `GET /api/session` para criar sessão (sem body). Verificar se backend espera POST com body ou GET realmente cria.

2. **Endpoint de mensagem:** Frontend chama `POST /api/chat/message/async` (assíncrono com polling), não `POST /api/chat/message` (síncrono). Verificar se backend implementa o endpoint async.

3. **Upload-and-ask:** Frontend chama `POST /api/chat/upload-and-ask`. Verificar se backend implementa este endpoint combinado.

4. **Conversation na resposta:** `ChatResponse` no frontend espera `conversationId` (número). `ConversationSummary` espera `id`, `title`, `messageCount`, `lastMessage`, `lastActivity`. Verificar se backend retorna exatamente estes campos.

5. **TaskStatusResponse:** Frontend espera `taskId`, `status` (PENDING/PROCESSING/COMPLETED/FAILED), `result`, `errorMessage`, `createdAt`, `completedAt`. Verificar compatibilidade.

6. **Document endpoints:** Frontend usa `/api/documents/*` — verificar se backend expõe essa API.

7. **SessionResponse:** Frontend espera `expired: boolean`. Verificar se backend inclui este campo.

8. **HistoryResponse:** Frontend espera `{ sessionId: string, conversations: ConversationSummary[] }`. Verificar formato.

9. **ConversationResponse:** Frontend espera `{ id: number, messages: Message[] }`. Verificar se backend retorna `messages` diretamente.

10. **UploadResponse:** Frontend espera `attachmentId` (não `id`). Verificar nomenclatura no backend.

11. **HealthResponse:** Frontend espera `version: string`. Verificar se backend retorna.

12. **DocumentIngestResponse:** Frontend espera `documentId`, `fileName`, `status`, `chunks`, `processingTime`, `message`. Verificar todos os campos.

13. **Document:** Frontend espera `totalChunks: number`. Verificar campo no backend.

---

## 13. Problemas Encontrados

### 🔴 Crítico

| # | Problema | Arquivo | Explicação |
|---|----------|---------|------------|
| 1 | **postMessageAsync usa polling mas não há fallback síncrono** | `src/services/chatService.ts:10-57` | Se o backend não implementar `/api/chat/message/async`, todo envio de mensagem quebra. A função `postMessage` (síncrona) existe mas não é usada. |
| 2 | **Mensagem de erro de upload contradiz limite real** | `src/hooks/useUpload.ts:35` | `isWithinFileSizeLimit` usa `UPLOAD_MAX_SIZE = 50MB` mas a mensagem diz "O arquivo excede o limite de 10 MB." O usuário verá um erro confuso se o arquivo tiver entre 10-50 MB. |
| 3 | **Hook useUpload não é utilizado por nenhum componente** | `src/hooks/useUpload.ts` | Todo o código de upload com progresso via XHR está órfão. A funcionalidade de upload puro (sem pergunta) não está acessível ao usuário. |
| 4 | **useUpload.ts valida com "10 MB" mas ALLOWED_EXTENSIONS inclui .jpg/.png/.gif/.doc/.docx** | `src/hooks/useUpload.ts:30` | Mensagem diz "Apenas arquivos .txt e .pdf" mas as constantes permitem muito mais formatos, criando inconsistência entre validação e mensagem. |

### 🟠 Alto

| # | Problema | Arquivo | Explicação |
|---|----------|---------|------------|
| 5 | **Componentes órfãos não utilizados** | `HealthIndicator.tsx`, `SkeletonLoader.tsx`, `NewChatButton.tsx`, `Logo.tsx` | 4 componentes criados mas não importados por ninguém. Aumentam o bundle sem necessidade. |
| 6 | **withRetry.ts não utilizado por nenhum hook** | `src/utils/withRetry.ts` | Função de retry genérica existe mas o único retry implementado está dentro do SessionContext (lógica própria). |
| 7 | **sendFileMessage não trata 404 (sendMessage trata)** | `src/hooks/useChat.ts:217-222` | Inconsistência: `sendMessage` trata 404 e 409, `sendFileMessage` trata apenas 409. Se a sessão expirar durante upload, o 404 não dispara recriação. |
| 8 | **postMessage (síncrono) existe mas não é chamado** | `src/services/chatService.ts:6-8` | Função está implementada e exportada mas nenhum hook a invoca. Código morto. |
| 9 | **documentService.ts importa API_BASE_URL mas usa api.get/post** | `src/services/documentService.ts:8` | Inconsistência: alguns métodos usam `api.*`, outros (ingestDocument) usam fetch direto com `API_BASE_URL`. |
| 10 | **storage de mensagens com chave dinâmica não é limpo** | `src/services/conversationStorage.ts` | Conversas e mensagens no localStorage nunca são removidas. Podem acumular-se indefinidamente. |

### 🟡 Médio

| # | Problema | Arquivo | Explicação |
|---|----------|---------|------------|
| 11 | **ChatInput aceita extensões que não são validadas no backend** | `src/components/Chat/ChatInput.tsx:76` | `accept=".txt,.pdf,.md,.html,.doc,.docx,.jpg,..."` mas o validador `isAllowedExtension` só cobre `.txt,.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx`. Extensões como `.md`, `.html`, `.bmp`, `.tiff` são aceitas pelo input mas rejeitadas pela validação. |
| 12 | **Mensagens de erro 409 e 502 em api.ts não são usadas** | `src/services/api.ts:37,42` | As mensagens para 409 ("Sessão expirada") e 502 ("Serviço de IA indisponível") estão definidas em `errorMessages` mas nunca são exibidas porque o tratamento nos hooks substitui a mensagem. |
| 13 | **Polling ignora erros HTTP (segue tentando)** | `src/services/chatService.ts:45` | Se o endpoint de polling retornar erro, o loop continua sem contagem de tentativas ou backoff, podendo gerar polling infinito. |
| 14 | **Não há validação de `lastFileRef` antes de retry** | `src/hooks/useChat.ts:232-240` | Se `retry()` for chamado sem mensagem anterior, não faz nada — silenciosamente. |
| 15 | **fetchHistory não salva conversas no localStorage se API falhar** | `src/hooks/useConversation.ts:48-49` | Só salva no localStorage se a chamada GET for bem-sucedida. Se a API falhar, os dados locais carregados no início (linha 41-44) são perdidos. |

### 🟢 Baixo

| # | Problema | Arquivo | Explicação |
|---|----------|---------|------------|
| 16 | **useUpload.ts retry não expõe loading state** | `src/hooks/useUpload.ts:58-62` | `retry()` chama `uploadFile` mas o estado `isUploading` já foi setado como `false` no finally anterior. |
| 17 | **formatRelativeTime retorna "Agora" para mensagens futuras** | `src/utils/formatters.ts:19-29` | Se `isoString` for futura, `diffMs` é negativo e `diffMins < 1` → retorna "Agora" incorretamente. |
| 18 | **ensureConversationInList duplica título se mesma conversa for chamada novamente** | `src/hooks/useChat.ts:46-62` | Se chama `sendMessage` duas vezes na mesma conversa nova, a primeira chamada cria, a segunda não (verifica por id). Mas se houve erro na primeira, o id não foi salvo e uma segunda tentativa pode criar entrada duplicada. |
| 19 | **Nenhum toast de sucesso é disparado** | `src/contexts/ToastContext.tsx` | `addToast` nunca é chamado por nenhum hook — apenas o `Toast` é renderizado, mas nunca aparecem mensagens de sucesso. |
| 20 | **ErrorBoundary usa console.error sem verificação de ambiente** | `src/components/Common/ErrorBoundary.tsx:19` | `console.error` dispara alerta de linter (comentário `eslint-disable`). Não há verificação de produção vs desenvolvimento. |

---

## 14. Pontos Fortes

1. **Separação de responsabilidades clara:** Componentes puramente visuais, hooks com lógica, services com chamadas HTTP, contexts com estado global.

2. **Tipagem estrita TypeScript:** Todos os DTOs, props e retornos de hooks são tipados. Sem uso de `any`.

3. **Gerenciamento de estado session-first:** Sessão é validada e criada automaticamente na inicialização com retry.

4. **Fallback offline no histórico:** Antes de chamar a API, o frontend carrega dados do localStorage como fallback imediato.

5. **Tratamento de expiração de sessão:** Se o backend retorna 404/409 ao buscar histórico ou conversa, o frontend recria a sessão automaticamente.

6. **Scroll automático inteligente:** Só rola para o fim se o usuário já estiver perto do fim da lista.

7. **Acessibilidade:** Uso de `role="log"`, `aria-live="polite"`, `role="alert"`, `role="button"`, `role="progressbar"` e navegação por teclado (Enter, Shift+Enter, Ctrl+K).

8. **Tela de boas-vindas com sugestões:** UX rica com sugestões clicáveis.

9. **Auto-resize do textarea:** Ajusta altura dinamicamente.

10. **Health check periódico:** Monitoramento contínuo do backend com indicador visual.

11. **Validação dupla (frontend + backend):** Validações de formato, tamanho e conteúdo antes do envio HTTP.

12. **Documentação extensa:** `SYSTEM_DOCS_FRONTEND.md` detalhado (embora desatualizado).

13. **Testes unitários:** 8 arquivos de teste para hooks, componentes e utils.

14. **Polling com timeout total:** O `postMessageAsync` limita o tempo total de polling a 10 minutos, evitando loops infinitos.

15. **Indicador de "digitando":** 3 dots animados durante o carregamento da resposta.

---

## 15. Fluxo de Renderização (do clique ao pixel)

```
1. USUÁRIO DIGITA + CLICA "Enviar"
   └── ChatInput.tsx
       ├── handleSend() verifica disabled
       ├── Se selectedFile && onSendFile → onSendFile(message, file) → sendFileMessage()
       ├── Se message.trim() → onSend(message.trim()) → sendMessage()
       └── Limpa message e selectedFile

2. useChat.sendMessage()
   └── Valida mensagem (isValidMessage)
       ├── Se inválido → setError("A mensagem não pode estar vazia.") — retorna
       └── Se válido → continua
   └── setError(null)
   └── setIsLoading(true) → ChatWindow re-renderiza
   └── Cria tempUserId = -Date.now()
   └── addMessage(tempUserMessage) → ConversationContext
       └── ConversationContext.setMessages(prev => [...prev, tempUserMessage])
       └── MessageList re-renderiza com nova mensagem

3. CHAMADA HTTP (assíncrona)
   └── postMessageAsync(request)
       ├── POST /api/chat/message/async → recebe taskId
       └── Polling: GET /api/chat/message/async/{taskId} a cada 2s

4. RESPOSTA RECEBIDA
   └── Response: ChatResponse { userMessage, assistantMessage, conversationId }
   ├── Se !activeConversation:
   │     ├── setActiveConversation({ id: backendConvId })
   │     └── ensureConversationInList(backendConvId, content) → localStorage
   └── updateMessage(tempUserId, dados reais)
       └── ConversationContext: messages.map → atualiza mensagem temporária com dados reais
       └── MessageList re-renderiza (mensagem USER atualizada)
   └── addMessage(assistantMessage)
       └── ConversationContext: setMessages(prev => [...prev, assistantMessage])
       └── MessageList re-renderiza (nova mensagem ASSISTANT aparece)

5. PERSISTÊNCIA
   └── persistMessages(backendConvId, [userMessage, assistantMessage])
       └── saveMessages(sessionId, convId, msgs) → localStorage
   └── updateConversationLastMessage(convId, assistantMessage.content)
       └── Atualiza ConversationSummary no localStorage

6. FINAL
   └── setIsLoading(false) → ChatWindow re-renderiza
   └── MessageList faz scroll automático para bottomRef
```

---

## 16. Checklist para Apresentação

### Chat
- [ ] Enviar mensagem de texto com Enter funciona
- [ ] Enviar mensagem de texto clicando no botão funciona
- [ ] Shift+Enter insere nova linha (não envia)
- [ ] Auto-resize do textarea funciona
- [ ] Indicador de digitação ("...") aparece durante processamento
- [ ] Mensagens do usuário aparecem imediatamente (otimista)
- [ ] Mensagens são persistidas ao recarregar a página
- [ ] Botão "Tentar novamente" em caso de erro
- [ ] Ctrl+K / Cmd+K foca o input
- [ ] Campo desabilitado durante envio
- [ ] Validação de mensagem vazia bloqueia envio
- [ ] Validação de mensagem > 5000 caracteres bloqueia envio

### Histórico
- [ ] Sidebar exibe lista de conversas
- [ ] Clicar em conversa carrega as mensagens
- [ ] Conversa ativa fica destacada
- [ ] "Nova Conversa" limpa o chat atual
- [ ] Ao salvar, a conversa atual é persistida antes de criar nova
- [ ] Título da conversa é o começo da primeira mensagem
- [ ] Data/hora relativa aparece corretamente
- [ ] Histórico carrega offline do localStorage se API falhar
- [ ] Sidebar é responsiva (overlay em mobile)

### Upload
- [ ] Botão de anexar arquivo (Paperclip) funciona
- [ ] Nome do arquivo exibido antes do envio
- [ ] Remover arquivo selecionado (X) funciona
- [ ] Upload com arquivo + pergunta funciona
- [ ] Validação de tipo de arquivo rejeita formatos não permitidos
- [ ] Validação de tamanho (50 MB) rejeita arquivos grandes
- [ ] Mensagem de erro clara para formatos rejeitados
- [ ] Anexo é exibido na bolha de mensagem após envio

### Sessão
- [ ] Sessão criada automaticamente ao carregar a página
- [ ] Sessão é validada ao iniciar (se já existe no localStorage)
- [ ] Sessão expirada (409) recria automaticamente
- [ ] Sessão inválida (404) recria automaticamente
- [ ] Retry de criação de sessão (3 tentativas) funciona
- [ ] Sessão é persistida entre abas (localStorage)

### Conversas
- [ ] Nova conversa tem `conversationId` atribuído pelo backend
- [ ] Mensagens são associadas à conversa correta
- [ ] Carregar conversa do histórico restaura mensagens
- [ ] Mensagens do localStorage são carregadas antes da API (fallback)

### Tratamento de Erro
- [ ] 404/409 no chat → mensagem "Sessão expirada" + recria sessão
- [ ] 404/409 no histórico → mensagem + recria sessão
- [ ] 400/422 → exibe mensagem de validação do backend
- [ ] 413 → exibe "arquivo excede limite"
- [ ] 415 → exibe "formato não suportado"
- [ ] 500 → exibe "Erro no servidor"
- [ ] 502 → exibe "Serviço de IA indisponível"
- [ ] Timeout → exibe mensagem de timeout
- [ ] Erro de rede → exibe mensagem de erro
- [ ] ErrorBoundary captura erros de renderização

### Timeout
- [ ] Envio de mensagem tem timeout de 3 min (180s)
- [ ] Upload tem timeout de 2 min (120s)
- [ ] Histórico tem timeout de 15s
- [ ] Health check tem timeout de 5s
- [ ] Sessão tem timeout de 10s
- [ ] Async start tem timeout de 15s
- [ ] Async poll tem timeout de 15s
- [ ] Pooling total tem timeout de 10 min (600s)
- [ ] Toast auto-remove após 3s

### Integração com Backend
- [ ] GET /api/health retorna UP
- [ ] GET /api/session cria e retorna sessionId
- [ ] GET /api/session/{id} valida sessão
- [ ] POST /api/chat/message/async retorna taskId
- [ ] GET /api/chat/message/async/{taskId} retorna status COMPLETED
- [ ] POST /api/chat/upload-and-ask processa arquivo
- [ ] GET /api/chat/history/{sessionId} retorna lista
- [ ] GET /api/chat/history/{sessionId}/{convId} retorna mensagens
- [ ] POST /api/upload retorna attachmentId
- [ ] DELETE /api/session/{id} retorna 204
- [ ] POST /api/documents/ingest processa documento
- [ ] GET /api/documents retorna lista
- [ ] DELETE /api/documents/{id} retorna 204
- [ ] Proxy do Vite configurado para /api → localhost:8080
- [ ] CORS configurado no backend (ou proxy resolve)

---

**Documento gerado em:** 29 de junho de 2026  
**Propósito:** Auditoria técnica para comparação com o backend  
**Nenhum arquivo foi alterado.**
