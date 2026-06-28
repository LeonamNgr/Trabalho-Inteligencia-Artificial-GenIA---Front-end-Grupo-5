# ESPECIFICAÇÃO TÉCNICA COMPLETA DO FRONT-END

## Documento de alinhamento para o Back-end (Spring Boot)
> Gerado em: 28/06/2026
> Projeto: Marvel AI Chat - Grupo 5

---

## SUMÁRIO

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Regras de Proxy e Conexão](#2-regras-de-proxy-e-conexão)
3. [Endpoints da API - Contratos Completos](#3-endpoints-da-api---contratos-completos)
4. [Tipos TypeScript x DTOs Java Esperados](#4-tipos-typescript-x-dtos-java-esperados)
5. [Fluxos de Dados Detalhados](#5-fluxos-de-dados-detalhados)
6. [Regras de Validação do Front-end](#6-regras-de-validação-do-front-end)
7. [Tratamento de Erros e HTTP Status Codes](#7-tratamento-de-erros-e-http-status-codes)
8. [Timeouts e Configurações](#8-timeouts-e-configurações)
9. [Cache Local (localStorage)](#9-cache-local-localstorage)
10. [Comportamento Esperado do Back-end](#10-comportamento-esperado-do-back-end)
11. [Health Check - Comportamento Detalhado](#11-health-check---comportamento-detalhado)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Stack do Front-end
- **React 19.x** com StrictMode
- **TypeScript 6.x** (strict mode)
- **Vite 8.x** (servidor de desenvolvimento na porta 5173)
- **Tailwind CSS 4.x** + CSS Modules (híbrido)
- **React Router DOM 7.x** (BrowserRouter)
- **Motion 12.x** (animações Framer Motion)
- **Lucide React** (ícones)
- **Vitest 4.x** (testes)
- **Oxlint** (linter)

### 1.2 Árvore de Componentes (Renderização)

```
<StrictMode>
  <ErrorBoundary>
    <SessionProvider>           ← Gerencia sessionId (localStorage + API)
      <ConversationProvider>    ← Gerencia activeConversation + messages (estado global)
        <ToastProvider>         ← Notificações toast
          <RouterProvider>
            <Layout>
              ├── <Sidebar>     ← Sidebar responsiva (mobile: drawer)
              │   ├── Nova Conversa button
              │   ├── Lista de conversas (useConversation)
              │   ├── <DocumentPanel>   ← Gerenciamento de documentos
              │   └── <HealthStatus>    ← Status da API
              ├── <Outlet>      ← <ChatPage>
              │   └── <ChatWindow>
              │       ├── <ErrorMessage> (se error)
              │       ├── <Loading> (se isLoading && sem mensagens)
              │       ├── <MessageList>
              │       │   ├── <WelcomeScreen> (se messages vazio)
              │       │   ├── <MessageItem>[] (para cada mensagem)
              │       │   │   └── <AttachmentBadge> (se houver anexo)
              │       │   └── typing indicator (se isTyping)
              │       └── <ChatInput>
              │           ├── Paperclip button (upload .txt/.pdf)
              │           ├── textarea (auto-resize)
              │           └── Send button
              └── <Footer>
              <Toast />         ← Notificações toast flutuantes
```

### 1.3 Hierarquia de Contextos

```
SessionContext
├── sessionId: string | null
├── isLoading: boolean
├── error: string | null
├── initialize: () => Promise<void>
└── destroy: () => Promise<void>

ConversationContext
├── activeConversation: Conversation | null
├── messages: Message[]
├── setActiveConversation: (conversation | null) => void
├── addMessage: (message: Message) => void
├── setMessages: (messages: Message[]) => void
└── clearMessages: () => void

ToastContext
├── toasts: Toast[]
├── addToast: (message: string, type: 'success' | 'error' | 'info') => void
└── removeToast: (id: number) => void
```

---

## 2. REGRAS DE PROXY E CONEXÃO

### 2.1 Configuração do Vite (`vite.config.ts`)

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

- Em desenvolvimento, toda requisição para `/api/*` é redirecionada para `http://localhost:8080` (Spring Boot)
- O front-end nunca faz CORS direto — o proxy do Vite lida com isso

### 2.2 Variáveis de Ambiente (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_UPLOAD_TIMEOUT=120000
VITE_HEALTH_INTERVAL=30000
```

- `VITE_API_BASE_URL`: Base URL para API (vazio em produção = mesma origem; preenchido em dev para upload direto via XHR)
- `VITE_UPLOAD_TIMEOUT`: Timeout do upload em ms
- `VITE_HEALTH_INTERVAL`: Intervalo do polling de health check em ms (NÃO USADO - o código usa constante fixa de 30s)

### 2.3 Regra de URL da API

```ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
```

- **Requisições `fetch` (api.ts)**: usam `API_BASE_URL` + path → ex: `http://localhost:8080/api/chat/message`
- **Requisições `XMLHttpRequest` (uploadService.ts)**: usam `API_BASE_URL` + path → mesma lógica
- **Requisições sem proxy**: Se `API_BASE_URL` for vazio (produção), as requisições vão para a mesma origem

---

## 3. ENDPOINTS DA API - CONTRATOS COMPLETOS

### 3.1 SESSÃO

#### `GET /api/session` → Cria nova sessão
**Timeout:** 10.000ms (TIMEOUTS.SESSION)

**Request:** Nenhum body. Query params: nenhum.

**Response (201 Created):**
```json
{
  "sessionId": "uuid-string",
  "createdAt": "2026-06-28T19:00:00.000Z",
  "lastActivity": "2026-06-28T19:00:00.000Z",
  "expired": false
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| sessionId | string (UUID) | SIM | Identificador único da sessão (formato UUID v4) |
| createdAt | string (ISO 8601) | SIM | Data de criação |
| lastActivity | string (ISO 8601) | SIM | Última atividade |
| expired | boolean | SIM | Se a sessão expirou |

**Uso no front-end:** Chamado automaticamente pelo `SessionProvider` via `useEffect` na montagem. Possui retry automático: 3 tentativas com delay exponencial (1s, 2s, 3s). O `sessionId` é salvo no `localStorage` com a chave `sessionId` para reuso entre reloads.

---

#### `DELETE /api/session/{sessionId}` → Remove sessão
**Timeout:** 10.000ms

**Response (204 No Content):** Sem body.

**Uso no front-end:** Chamado quando o usuário "destroi" a sessão. Em caso de erro de rede, remove o sessionId do localStorage mesmo assim.

---

### 3.2 CHAT / MENSAGENS

#### `POST /api/chat/message` → Envia mensagem e recebe resposta da IA
**Timeout:** 60.000ms (TIMEOUTS.MESSAGE)

**Request Body:**
```json
{
  "sessionId": "uuid-string",
  "conversationId": null,
  "content": "Quem é o Homem de Ferro?",
  "attachmentId": null
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| sessionId | string | SIM | UUID da sessão ativa |
| conversationId | number ou null | SIM | `null` para nova conversa, ou o ID da conversa existente |
| content | string | SIM | Texto da mensagem (máx 5000 caracteres, validado no front) |
| attachmentId | number ou null | SIM | `null` se sem anexo, ou ID do attachment enviado via upload |

**Response (200 OK):**
```json
{
  "userMessage": {
    "id": 1,
    "conversationId": 1,
    "role": "USER",
    "content": "Quem é o Homem de Ferro?",
    "timestamp": "2026-06-28T19:00:00.000Z",
    "attachment": null
  },
  "assistantMessage": {
    "id": 2,
    "conversationId": 1,
    "role": "ASSISTANT",
    "content": "O Homem de Ferro é Tony Stark...",
    "timestamp": "2026-06-28T19:00:05.000Z",
    "attachment": null
  },
  "conversationId": 1
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| userMessage | Message | SIM | Objeto Message completo com role="USER" |
| assistantMessage | Message | SIM | Objeto Message completo com role="ASSISTANT" |
| conversationId | number | SIM | ID da conversa (novo ou existente) |

**Message:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | number | SIM | ID único da mensagem |
| conversationId | number | SIM | ID da conversa |
| role | "USER" \| "ASSISTANT" | SIM | Quem enviou |
| content | string | SIM | Conteúdo textual |
| timestamp | string (ISO 8601) | SIM | Data/hora da mensagem |
| attachment | AttachmentResponse \| null | NÃO | Anexo (se houver) |

**AttachmentResponse:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | number | SIM | ID do anexo |
| fileName | string | SIM | Nome do arquivo |
| fileType | string | SIM | Tipo MIME |
| fileSize | number | SIM | Tamanho em bytes |
| uploadedAt | string (ISO 8601) | SIM | Data do upload |

**Regras de negócio esperadas do backend:**
- Se `conversationId` for `null`, o backend deve **criar uma nova conversa** e retornar o novo ID
- Se `conversationId` for um número, o backend deve **adicionar à conversa existente**
- O backend deve processar a mensagem com a IA (Ollama) e retornar a resposta
- O campo `attachmentId` vincula um arquivo enviado previamente via upload

---

#### `GET /api/chat/history/{sessionId}` → Lista conversas da sessão
**Timeout:** 15.000ms (TIMEOUTS.HISTORY)

**Response (200 OK):**
```json
{
  "sessionId": "uuid-string",
  "conversations": [
    {
      "id": 1,
      "title": "Quem é o Homem de Ferro?",
      "messageCount": 2,
      "lastMessage": "O Homem de Ferro é Tony Stark...",
      "lastActivity": "2026-06-28T19:00:05.000Z"
    }
  ]
}
```

**Campos obrigatórios:**

**ConversationSummary:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | number | SIM | ID da conversa |
| title | string | SIM | Título (primeiros ~60 chars) |
| messageCount | number | SIM | Total de mensagens na conversa |
| lastMessage | string | SIM | Conteúdo da última mensagem |
| lastActivity | string (ISO 8601) | SIM | Data da última atividade |

**Uso no front-end:** Carregado automaticamente na montagem da Sidebar. O front-end usa estratégia "local-first": primeiro exibe dados do cache localStorage, depois substitui com os dados da API.

---

#### `GET /api/chat/history/{sessionId}/{conversationId}` → Carrega mensagens de uma conversa
**Timeout:** 15.000ms

**Response (200 OK):**
```json
{
  "id": 1,
  "messages": [
    {
      "id": 1,
      "conversationId": 1,
      "role": "USER",
      "content": "Quem é o Homem de Ferro?",
      "timestamp": "2026-06-28T19:00:00.000Z",
      "attachment": null
    },
    {
      "id": 2,
      "conversationId": 1,
      "role": "ASSISTANT",
      "content": "O Homem de Ferro é Tony Stark...",
      "timestamp": "2026-06-28T19:00:05.000Z",
      "attachment": null
    }
  ]
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | number | SIM | ID da conversa (mesmo do path) |
| messages | Message[] | SIM | Array de mensagens ordenadas cronologicamente |

**Uso no front-end:** Chamado quando o usuário clica em uma conversa na Sidebar. Também usa estratégia "local-first": exibe mensagens do cache enquanto carrega do servidor.

---

### 3.3 UPLOAD DE ARQUIVO (anexo de mensagem)

#### `POST /api/upload` → Upload de arquivo para anexar a mensagem
**Timeout:** 120.000ms (TIMEOUTS.UPLOAD)

**Request:** `multipart/form-data`
| Campo | Tipo | Descrição |
|---|---|---|
| file | File | Arquivo .txt ou .pdf (máx 10MB) |
| sessionId | string | UUID da sessão |

**Response (200 OK):**
```json
{
  "attachmentId": 1,
  "fileName": "documento.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "uploadedAt": "2026-06-28T19:00:00.000Z",
  "message": "Upload realizado com sucesso"
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| attachmentId | number | SIM | ID do anexo (usado no `ChatRequest.attachmentId`) |
| fileName | string | SIM | Nome original do arquivo |
| fileType | string | SIM | Tipo MIME |
| fileSize | number | SIM | Tamanho em bytes |
| uploadedAt | string (ISO 8601) | SIM | Data do upload |
| message | string | SIM | Mensagem de confirmação |

**Observações importantes:**
- O upload usa `XMLHttpRequest` (não `fetch`) para ter progresso
- Apenas `.txt` e `.pdf` são aceitos (validado no front-end)
- Limite de 10MB validado no front-end
- O `attachmentId` retornado é enviado no próximo `POST /api/chat/message`

---

### 3.4 DOCUMENTOS (RAG - Retrieval Augmented Generation)

#### `POST /api/documents/ingest` → Ingerir arquivo para RAG
**Timeout:** 15.000ms (usando fetch direto, sem api.post)

**Request:** `multipart/form-data`
| Campo | Tipo | Descrição |
|---|---|---|
| file | File | Arquivo .txt, .pdf, .md ou .html (máx 50MB) |
| sourceType | string (opcional) | Tipo da fonte (ex: "pdf", "html") |

**Response (200 OK):**
```json
{
  "documentId": 1,
  "fileName": "wikipedia_ironman.html",
  "status": "PROCESSING",
  "chunks": 0,
  "processingTime": 0,
  "message": "Documento recebido para processamento"
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| documentId | number | SIM | ID do documento para polling |
| fileName | string | SIM | Nome do arquivo |
| status | "PENDING" \| "PROCESSING" \| "COMPLETED" \| "FAILED" | SIM | Status inicial (tipicamente PROCESSING ou PENDING) |
| chunks | number | SIM | Número de chunks processados (0 enquanto processa) |
| processingTime | number | SIM | Tempo de processamento em ms |
| message | string | SIM | Mensagem de status |

---

#### `POST /api/documents/ingest/url` → Ingerir URL para RAG
**Timeout:** 15.000ms

**Request Body:**
```json
{
  "url": "https://pt.wikipedia.org/wiki/Homem_de_Ferro"
}
```

**Response:** Mesmo formato de `DocumentIngestResponse`

---

#### `GET /api/documents` → Lista todos os documentos
**Timeout:** 15.000ms

**Response (200 OK):**
```json
{
  "documents": [
    {
      "id": 1,
      "fileName": "wikipedia_ironman.html",
      "sourceType": "html",
      "fileSize": 45200,
      "status": "COMPLETED",
      "totalChunks": 8,
      "createdAt": "2026-06-28T19:00:00.000Z"
    }
  ]
}
```

**Document:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| id | number | SIM | ID do documento |
| fileName | string | SIM | Nome do arquivo |
| sourceType | string | SIM | Tipo da fonte (pdf, html, txt, md) |
| fileSize | number \| null | SIM | Tamanho em bytes (null para URL) |
| status | DocumentStatus | SIM | Status do processamento |
| totalChunks | number | SIM | Total de chunks gerados |
| createdAt | string (ISO 8601) | SIM | Data de criação |

---

#### `GET /api/documents/{id}` → Obtém detalhes de um documento
**Timeout:** 15.000ms

**Response:** Objeto `Document` (mesmo formato do list).

**Uso no front-end:** Usado internamente para **polling de status** quando um documento está sendo processado.

---

#### `DELETE /api/documents/{id}` → Remove um documento
**Timeout:** 15.000ms

**Response (204 No Content):**

---

#### `GET /api/documents/{id}/chunks` → Lista chunks de um documento
**Timeout:** 15.000ms

**Response (200 OK):**
```json
[
  {
    "chunkId": 1,
    "documentId": 1,
    "fileName": "wikipedia_ironman.html",
    "chunkIndex": 0,
    "content": "Tony Stark é um personagem...",
    "similarityScore": null
  }
]
```

---

#### `POST /api/documents/search` → Busca semântica em documentos
**Timeout:** 60.000ms

**Request Body:**
```json
{
  "query": "Homem de Ferro armadura",
  "topK": 5
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| query | string | SIM | Texto da busca |
| topK | number | NÃO (default 5) | Número de resultados |

**Response (200 OK):**
```json
{
  "results": [
    {
      "chunkId": 1,
      "documentId": 1,
      "fileName": "wikipedia_ironman.html",
      "chunkIndex": 0,
      "content": "Tony Stark é um personagem...",
      "similarityScore": 0.95
    }
  ]
}
```

**DocumentChunk:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| chunkId | number | SIM | ID do chunk |
| documentId | number | SIM | ID do documento de origem |
| fileName | string | SIM | Nome do arquivo |
| chunkIndex | number | SIM | Índice do chunk no documento |
| content | string | SIM | Conteúdo textual do chunk |
| similarityScore | number \| null | SIM | Score de similaridade (null se não disponível) |

---

### 3.5 HEALTH CHECK

#### `GET /api/health` → Status da API e serviços
**Timeout:** 5.000ms

**Response (200 OK):**
```json
{
  "status": "UP",
  "database": "UP",
  "ollama": "UP",
  "diskSpace": "OK",
  "timestamp": "2026-06-28T19:00:00.000Z",
  "version": "1.0.0"
}
```

**Campos obrigatórios:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| status | "UP" \| "DOWN" \| "DEGRADED" | SIM | Status geral da aplicação |
| database | string | SIM | Status do banco de dados ("UP" ou "DOWN") |
| ollama | string | SIM | Status do Ollama/IA ("UP", "DOWN", "SIMULATION") |
| diskSpace | string | SIM | Status do disco |
| timestamp | string (ISO 8601) | SIM | Timestamp da verificação |
| version | string | SIM | Versão da aplicação |

**Uso no front-end:**
- `useHealth` hook faz polling a cada 30s
- `HealthStatus` component exibe dois badges: status geral e status do Ollama
- **Mapeamento de status (useHealth):** response.status → `HealthStatus`
  - "UP" → badge verde "ONLINE"
  - "DOWN" → badge vermelho "OFFLINE"
  - "DEGRADED" → badge amarelo "DEGRADADO"
  - erro de rede → badge vermelho "OFFLINE"
- **Mapeamento de ollama (HealthStatus.tsx):**
  - "UP" → badge verde "IA"
  - "DOWN" → badge vermelho "IA"
  - "SIMULATION" → badge amarelo "SIMULAÇÃO"
  - null/ausente → não exibe badge

---

## 4. TIPOS TYPESCRIPT x DTOS JAVA ESPERADOS

### 4.1 Message → MessageDTO (Java)

```typescript
// TypeScript (front-end)
export interface Message {
  id: number;                    // Long no Java
  conversationId: number;        // Long
  role: 'USER' | 'ASSISTANT';   // Enum: USER, ASSISTANT
  content: string;               // String (até 5000 caracteres)
  timestamp: string;             // LocalDateTime → ISO 8601
  attachment?: AttachmentResponse | null;  // Opcional
}
```

### 4.2 ChatRequest → ChatRequestDTO (Java)

```typescript
export interface ChatRequest {
  sessionId: string;             // String (UUID)
  conversationId: number | null; // Long (nullable)
  content: string;               // String
  attachmentId: number | null;   // Long (nullable)
}
```

### 4.3 ChatResponse → ChatResponseDTO (Java)

```typescript
export interface ChatResponse {
  userMessage: Message;          // MessageDTO (role=USER)
  assistantMessage: Message;     // MessageDTO (role=ASSISTANT)
  conversationId: number;        // Long
}
```

### 4.4 ConversationSummary → ConversationSummaryDTO (Java)

```typescript
export interface ConversationSummary {
  id: number;                    // Long
  title: string;                 // String (primeiros 60 chars)
  messageCount: number;          // int/Integer
  lastMessage: string;           // String
  lastActivity: string;          // LocalDateTime → ISO 8601
}
```

### 4.5 ConversationResponse → ConversationResponseDTO (Java)

```typescript
export interface ConversationResponse {
  id: number;                    // Long
  messages: Message[];           // List<MessageDTO>
}
```

### 4.6 SessionResponse → SessionResponseDTO (Java)

```typescript
export interface SessionResponse {
  sessionId: string;             // String (UUID v4)
  createdAt: string;             // LocalDateTime → ISO 8601
  lastActivity: string;          // LocalDateTime → ISO 8601
  expired: boolean;              // boolean
}
```

### 4.7 UploadResponse → UploadResponseDTO (Java)

```typescript
export interface UploadResponse {
  attachmentId: number;          // Long
  fileName: string;              // String
  fileType: string;              // String (MIME type)
  fileSize: number;              // long
  uploadedAt: string;            // LocalDateTime → ISO 8601
  message: string;               // String
}
```

### 4.8 Document → DocumentDTO (Java)

```typescript
export interface Document {
  id: number;                    // Long
  fileName: string;              // String
  sourceType: string;            // String ("pdf", "html", "txt", "md")
  fileSize: number | null;       // Long (nullable, null para URLs)
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalChunks: number;           // int
  createdAt: string;             // LocalDateTime → ISO 8601
}
```

### 4.9 DocumentIngestResponse → DocumentIngestResponseDTO (Java)

```typescript
export interface DocumentIngestResponse {
  documentId: number;            // Long
  fileName: string;              // String
  status: DocumentStatus;        // PENDING | PROCESSING | COMPLETED | FAILED
  chunks: number;                // int (0 enquanto processa)
  processingTime: number;        // long (ms)
  message: string;               // String
}
```

### 4.10 DocumentChunk → DocumentChunkDTO (Java)

```typescript
export interface DocumentChunk {
  chunkId: number;               // Long
  documentId: number;            // Long
  fileName: string;              // String
  chunkIndex: number;            // int
  content: string;               // String
  similarityScore: number | null; // Double (nullable)
}
```

### 4.11 HealthResponse → HealthResponseDTO (Java)

```typescript
export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';  // String
  database: string;              // String ("UP" | "DOWN")
  ollama: string;                // String ("UP" | "DOWN" | "SIMULATION")
  diskSpace: string;             // String
  timestamp: string;             // LocalDateTime → ISO 8601
  version: string;               // String
}
```

---

## 5. FLUXOS DE DADOS DETALHADOS

### 5.1 Inicialização da Aplicação

```
1. App monta → ErrorBoundary → SessionProvider
2. SessionProvider.useEffect() → initialize()
3.    ├── Verifica localStorage: chave "sessionId"
4.    │   ├── Se existe: setSessionId(valor) → sessionId pronto
5.    │   └── Se não existe:
6.    │       ├── GET /api/session (com retry: 3x, delay 1s/2s/3s)
7.    │       ├── Se sucesso: localStorage["sessionId"] = response.sessionId
8.    │       └── Se falha: sessionError = mensagem de erro
9.    └── setIsLoading(false)
10. ConversationProvider → ConversationContext
11. ToastProvider → ToastContext
12. Router → Layout
13.    ├── Sidebar → useConversation()
14.    │   ├── useEffect(sessionId) → fetchHistory()
15.    │   │   ├── GET /api/chat/history/{sessionId}
16.    │   │   └── Atualiza lista de conversas
17.    │   └── Renderiza lista de conversas
18.    └── ChatPage → ChatWindow → useChat()
19.        └── Renderiza WelcomeScreen (messages vazio)
```

### 5.2 Envio de Mensagem

```
1. Usuário digita texto e clica Send (ou Enter)
2. ChatInput.handleSend()
3.    ├── Valida: mensagem não vazia (trim)
4.    └── Chama onSend(content, attachmentId)
5. useChat.sendMessage()
6.    ├── Valida sessionId (se null → setError "Sessão não disponível")
7.    ├── Valida mensagem (isValidMessage → vazia ou >5000 chars)
8.    ├── setError(null), setIsLoading(true)
9.    ├── POST /api/chat/message { sessionId, conversationId, content, attachmentId }
10.   │   ├── TIMEOUT: 60s (AbortSignal.timeout)
11.   │   ├── SUCESSO → ChatResponse
12.   │   │   ├── Se !activeConversation (nova conversa):
13.   │   │   │   ├── setActiveConversation({ id: response.conversationId })
14.   │   │   │   └── ensureConversationInList(id, content)
15.   │   │   │       ├── Carrega lista do localStorage
16.   │   │   │       ├── Verifica se já existe (por id)
17.   │   │   │       └── Se não existe: adiciona no início e salva
18.   │   │   ├── addMessage(response.userMessage)
19.   │   │   ├── addMessage(response.assistantMessage)
20.   │   │   ├── persistMessages(convId, allMsgs) → localStorage
21.   │   │   └── updateConversationLastMessage(convId, assistantMessage.content)
22.   │   └── ERRO → setError(mensagem)
23.   └── setIsLoading(false)
24. ChatWindow re-renderiza com messages populado
25.    └── MessageList mostra <MessageItem>[] + remove <WelcomeScreen>
```

### 5.3 Seleção de Conversa (Sidebar)

```
1. Usuário clica em uma conversa na Sidebar
2. SidebarContent → selectConversation(chat.id)
3. useConversation.selectConversation()
4.    ├── Valida sessionId
5.    ├── setIsLoading(true)
6.    ├── Carrega do localStorage (local-first):
7.    │   ├── Se tem cache: setActiveConversation + setMessages
8.    │   └── Imediatamente visível ao usuário
9.    ├── GET /api/chat/history/{sessionId}/{conversationId}
10.   │   ├── TIMEOUT: 15s
11.   │   ├── SUCESSO → sobrescreve com dados do servidor
12.   │   │   ├── setActiveConversation({ id })
13.   │   │   ├── setMessages(response.messages)
14.   │   │   └── saveMessages(sessionId, id, messages)
15.   │   └── ERRO → mantém dados locais se existirem
16.   └── setIsLoading(false)
```

### 5.4 Upload de Arquivo (anexo de mensagem)

```
1. Usuário clica no Paperclip → seleciona .txt ou .pdf
2. ChatInput.handleFileSelect()
3. useUpload.uploadFile()
4.    ├── Valida sessionId
5.    ├── Valida tipo/extensão (.txt ou .pdf)
6.    ├── Valida tamanho (<= 10MB)
7.    ├── setProgress(0), setIsUploading(true)
8.    ├── XMLHttpRequest POST /api/upload (multipart/form-data)
9.    │   ├── file + sessionId
10.   │   ├── TIMEOUT: 120s
11.   │   ├── onprogress → atualiza barra de progresso
12.   │   ├── SUCESSO → setUploadedFile(response)
13.   │   │   └── ChatInput mostra badge com nome do arquivo
14.   │   └── ERRO → setError
15.   └── setIsUploading(false)
16. Usuário digita mensagem e envia → attachmentId vai no ChatRequest
```

### 5.5 Criação de Nova Conversa

```
1. Usuário clica "Nova Conversa" (Sidebar)
2. useConversation.createNewConversation()
3.    ├── Se tem sessão + conversa ativa + mensagens:
4.    │   └── Salva mensagens atuais no localStorage
5.    ├── setActiveConversation(null)
6.    └── setMessages([])
7. ChatWindow re-renderiza → mostra <WelcomeScreen>
```

### 5.6 Ingestão de Documento (RAG)

```
1. Usuário abre DocumentPanel → clica "Ingerir Arquivo" ou "Ingerir URL"
2. useDocuments.ingestFile() ou ingestUrl()
3.    ├── Valida extensão (.txt, .pdf, .md, .html)
4.    ├── Valida tamanho (<= 50MB)
5.    ├── POST /api/documents/ingest (ou /ingest/url)
6.    │   ├── SUCESSO → DocumentIngestResponse
7.    │   │   ├── Adiciona documento otimista à lista (com status inicial)
8.    │   │   └── Inicia POLLING:
9.    │   │       ├── pollStatus(id) a cada 2s, máx 30 tentativas (60s)
10.   │   │       ├── GET /api/documents/{id} → verifica .status
11.   │   │       ├── COMPLETED ou FAILED → para de pollar
12.   │   │       └── Atualiza documento na lista
13.   │   └── ERRO → setError
14.   └── isIngesting = false
```

### 5.7 Health Check (Polling)

```
1. useHealth monta → useEffect
2.    ├── checkHealth() imediatamente
3.    ├── setInterval(checkHealth, 30_000)
4. checkHealth()
5.    ├── setStatus('CHECKING')
6.    ├── GET /api/health (timeout: 5s)
7.    │   ├── SUCESSO:
8.    │   │   ├── status = response.status (UP|DOWN|DEGRADED)
9.    │   │   ├── ollama = response.ollama
10.   │   │   └── version = response.version
11.   │   └── ERRO (fetch throw):
12.   │       ├── status = 'DOWN'
13.   │       └── ollama = null
14.   └── lastCheck = new Date()
```

---

## 6. REGRAS DE VALIDAÇÃO DO FRONT-END

### 6.1 Mensagens (`isValidMessage` em `validators.ts`)
- **Conteúdo vazio**: `content.trim()` deve ser !== ''
- **Limite de caracteres**: `content.length <= 5000`
- Mensagem de erro: "A mensagem excede o limite de 5000 caracteres."

### 6.2 Upload de Arquivo (Chat - anexo)
- **Tipos MIME permitidos**: `text/plain`, `application/pdf`
- **Extensões permitidas**: `.txt`, `.pdf`
- **Tamanho máximo**: 10 MB (`UPLOAD_MAX_SIZE`)
- Mensagem de erro: "Apenas arquivos .txt e .pdf são aceitos."
- Mensagem de erro: "O arquivo excede o limite de 10 MB."

### 6.3 Upload de Documento (RAG)
- **Extensões permitidas**: `.txt`, `.pdf`, `.md`, `.html`
- **Tamanho máximo**: 50 MB (`DOCUMENT_UPLOAD_MAX_SIZE`)
- Mensagem de erro: "Apenas arquivos .txt, .pdf, .md e .html são aceitos."
- Mensagem de erro: "O arquivo excede o limite de 50 MB."

### 6.4 Sessão (`isValidSessionId` em `validators.ts`)
- Formato UUID v4: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

---

## 7. TRATAMENTO DE ERROS E HTTP STATUS CODES

### 7.1 Classes de Erro (`api.ts`)

```
AppError (Error base)
├── code: string
│
├── HttpError (AppError)
│   ├── status: number (HTTP status code)
│   ├── body: ErrorResponse
│   └── code: "HTTP_{status}"
│
├── NetworkError (AppError)
│   └── code: "NETWORK_ERROR"
│
└── ValidationError (AppError)
    └── code: "VALIDATION_ERROR"
```

### 7.2 ErrorResponse (formato esperado do backend)

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Mensagem descritiva do erro",
  "timestamp": "2026-06-28T19:00:00.000Z",
  "path": "/api/chat/message",
  "errors": [
    { "field": "content", "message": "O campo content é obrigatório" }
  ]
}
```

### 7.3 Mapeamento de HTTP Status → Mensagens

| Status | Mensagem para o Usuário | Quando ocorre |
|---|---|---|
| 400 | "Verifique os dados enviados." | Validação de campos |
| 404 | "Recurso não encontrado." | Sessão/conversa não existe |
| 409 | "Sessão expirada. Crie uma nova sessão." | Sessão expirada/inválida |
| 413 | "O arquivo excede o limite de tamanho permitido." | Upload > limite |
| 415 | "Formato de arquivo não suportado." | Tipo MIME inválido |
| 422 | "Os dados enviados são inválidos." | Erro de validação |
| 500 | "Erro no servidor. Tente novamente mais tarde." | Erro interno |
| 502 | "Serviço de IA indisponível. Tente novamente mais tarde." | Ollama fora do ar |
| outros | "Ocorreu um erro inesperado." | Fallback genérico |

### 7.4 Regras de exibição de erro

1. Se `ErrorResponse.errors[]` existir e não estiver vazio → exibe `errors[0].message`
2. Se `ErrorResponse.message` existir → exibe `message`
3. Caso contrário → exibe mensagem do lookup table acima
4. Se não encontrar no lookup → "Ocorreu um erro inesperado."

### 7.5 Onde os erros são exibidos

| Erro | Local | Componente |
|---|---|---|
| Erro de envio de mensagem | Topo do ChatWindow | `ErrorMessage` (com botão "Tentar novamente") |
| Erro de upload de anexo | Abaixo do input | texto vermelho inline |
| Erro de sessão | No sendMessage / fetchHistory | `ErrorMessage` no ChatWindow |
| Erro de histórico | Na Sidebar (substitui lista) | `ErrorMessage` |
| Erro de documento | No DocumentPanel | texto vermelho inline |
| Erro de health check | Não exibido (fica OFFLINE) | badge no HealthStatus |

---

## 8. TIMEOUTS E CONFIGURAÇÕES

### 8.1 Timeouts (`constants.ts`)

```ts
export const TIMEOUTS = {
  MESSAGE: 60_000,    // 60s - POST /api/chat/message
  UPLOAD: 120_000,    // 120s - POST /api/upload
  HISTORY: 15_000,    // 15s - GET /api/chat/history/*
  HEALTH: 5_000,      // 5s - GET /api/health
  SESSION: 10_000,    // 10s - GET /api/session
} as const;
```

### 8.2 Retry (criação de sessão)

```ts
export const RETRY = {
  MAX_ATTEMPTS: 3,     // Máximo de tentativas
  BASE_DELAY: 1000,    // Delay inicial: 1s, depois 2s, depois 3s
} as const;
```

### 8.3 Health Check

```ts
export const HEALTH_CHECK_INTERVAL = 30_000;  // 30s entre cada poll
```

### 8.4 Constants de Limite

```ts
export const UPLOAD_MAX_SIZE = 10 * 1024 * 1024;           // 10 MB (anexo de chat)
export const DOCUMENT_UPLOAD_MAX_SIZE = 50 * 1024 * 1024;  // 50 MB (documento RAG)
export const MAX_MESSAGE_LENGTH = 5000;                     // 5000 caracteres
```

---

## 9. CACHE LOCAL (localStorage)

### 9.1 Chaves

```ts
const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',              // UUID da sessão atual
} as const;

// Chaves dinâmicas (conversationStorage.ts):
const CONVERSATIONS_KEY = (sid: string) => `chat:conversations:${sid}`;
const MESSAGES_KEY = (sid: string, cid: number) => `chat:messages:${sid}:${cid}`;
```

### 9.2 O que é cached

| Chave | Conteúdo | Quando salva | Quando lida |
|---|---|---|---|
| `sessionId` | UUID v4 | Na criação de sessão | Na inicialização |
| `chat:conversations:{sid}` | `ConversationSummary[]` | No fetchHistory, sendMessage (nova conversa) | No fetchHistory, refreshFromStorage |
| `chat:messages:{sid}:{cid}` | `Message[]` | No sendMessage, selectConversation, createNewConversation | No selectConversation |

### 9.3 Estratégia de Cache

- **Local-first (otimista)**: Sempre exibe dados do cache primeiro, depois substitui com dados do servidor
- **Fallback silencioso**: Se a API falhar, mantém dados locais (se existirem)
- **Efeito幽冥 (side effect)**: Erros de API só são exibidos se não houver dados em cache
- **createNewConversation**: Salva mensagens atuais antes de limpar (para não perder edições locais)

---

## 10. COMPORTAMENTO ESPERADO DO BACK-END

### 10.1 Sessões

1. **Criação (`GET /api/session`)**: Deve retornar um UUID v4 único. A sessão deve ser armazenada no banco PostgreSQL com timestamp de criação e última atividade.
2. **Expiração**: Se o backend retornar `expired: true`, o front-end NÃO trata automaticamente — o erro 409 é esperado. O backend deve retornar 409 para sessões expiradas nas chamadas de mensagem.
3. **Exclusão (`DELETE /api/session/{id}`)**: Deve remover a sessão do banco.

### 10.2 Mensagens e Conversas

1. **Nova conversa**: Quando `conversationId` é `null`, o backend deve:
   - Criar uma nova conversa (entrada no banco)
   - Salvar a mensagem do usuário
   - Processar com IA (Ollama)
   - Salvar a resposta
   - Retornar ambas as mensagens com o `conversationId` da nova conversa

2. **Continuação**: Quando `conversationId` é um número, o backend deve:
   - Verificar se a conversa existe e pertence à sessão
   - Adicionar a mensagem do usuário
   - Processar com IA (contexto incluindo histórico da conversa)
   - Salvar a resposta
   - Retornar ambas as mensagens

3. **Histórico (`GET /api/chat/history/{sessionId}`)**:
   - Listar TODAS as conversas da sessão
   - Ordenar por `lastActivity` decrescente (mais recente primeiro)
   - Retornar apenas o resumo (sem as mensagens completas)

4. **Mensagens da conversa (`GET /api/chat/history/{sessionId}/{conversationId}`)**:
   - Verificar se a conversa pertence à sessão
   - Retornar TODAS as mensagens em ordem cronológica
   - Incluir campo `attachment` quando houver anexo

### 10.3 Upload

1. **Salvar arquivo**: O arquivo enviado deve ser armazenado (sistema de arquivos ou S3)
2. **Response**: Retornar o `attachmentId` imediatamente (processamento síncrono)
3. **Validações do backend**:
   - Tipo MIME: `text/plain`, `application/pdf`
   - Tamanho: até 10MB (deve validar igual ao front-end)
   - Se acima: retornar 413

### 10.4 Documentos (RAG)

1. **Ingestão (`POST /api/documents/ingest`)**:
   - Aceitar `multipart/form-data` com o campo `file`
   - Processar de forma ASSÍNCRONA (retornar status PROCESSING ou PENDING imediatamente)
   - Extrair texto do arquivo, chunkar e gerar embeddings
   - Atualizar status para COMPLETED (ou FAILED)

2. **Polling**: O front-end faz polling a cada 2s por até 60s. O endpoint `GET /api/documents/{id}` deve retornar o status atualizado.

3. **Busca semântica (`POST /api/documents/search`)**:
   - Receber query + topK
   - Gerar embedding da query
   - Buscar similaridade coseno nos chunks
   - Retornar topK resultados ordenados por similaridade (maior primeiro)
   - Campo `similarityScore` deve ser Double (0.0 a 1.0)

### 10.5 Tratamento de Erros Consistente

O backend deve retornar erro no formato:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Mensagem clara para o usuário",
  "timestamp": "2026-06-28T19:00:00.000Z",
  "path": "/api/chat/message",
  "errors": [
    { "field": "content", "message": "O campo content excede o limite de 5000 caracteres" }
  ]
}
```

**IMPORTANTE**: O front-end exibe `message` ou `errors[0].message`. Todos os erros devem ter `message` preenchido.

---

## 11. HEALTH CHECK - COMPORTAMENTO DETALHADO

O front-end interpreta o campo `ollama` da seguinte forma:
- `"UP"` → badge verde "IA"
- `"DOWN"` → badge vermelho "IA"
- `"SIMULATION"` → badge amarelo "SIMULAÇÃO"
- Qualquer outro valor → não exibe o badge (ollamaStatus = null)

O badge do Ollama só aparece se `ollama` for um valor mapeado. Se o campo `ollama` vier vazio ou null, o badge não é renderizado.

O front-end espera que o backend faça:
1. Verificar conexão com o banco PostgreSQL
2. Verificar conexão com o Ollama
3. Verificar espaço em disco
4. Retornar status consolidado:
   - `"UP"` se todos os serviços ok
   - `"DEGRADED"` se algum serviço secundário falhou
   - `"DOWN"` se o serviço principal falhou

---

## ANEXO: MAPA DE FUNÇÕES DO FRONT-END

### services/ (Camada HTTP)

| Função | Arquivo | Método HTTP | Endpoint |
|---|---|---|---|
| `createSession()` | `sessionService.ts` | GET | `/api/session` |
| `deleteSession(id)` | `sessionService.ts` | DELETE | `/api/session/{id}` |
| `postMessage(request)` | `chatService.ts` | POST | `/api/chat/message` |
| `getHistory(sessionId)` | `chatService.ts` | GET | `/api/chat/history/{sessionId}` |
| `getConversation(sessionId, convId)` | `chatService.ts` | GET | `/api/chat/history/{sessionId}/{convId}` |
| `uploadFile(file, sessionId, onProgress)` | `uploadService.ts` | POST | `/api/upload` |
| `ingestDocument(file, sourceType)` | `documentService.ts` | POST | `/api/documents/ingest` |
| `ingestUrl(url)` | `documentService.ts` | POST | `/api/documents/ingest/url` |
| `listDocuments()` | `documentService.ts` | GET | `/api/documents` |
| `getDocument(id)` | `documentService.ts` | GET | `/api/documents/{id}` |
| `deleteDocument(id)` | `documentService.ts` | DELETE | `/api/documents/{id}` |
| `getDocumentChunks(id)` | `documentService.ts` | GET | `/api/documents/{id}/chunks` |
| `searchDocuments(query, topK)` | `documentService.ts` | POST | `/api/documents/search` |
| `getHealth()` | `healthService.ts` | GET | `/api/health` |

### hooks/ (Camada de Lógica de Negócio)

| Hook | Função Principal | Dependências |
|---|---|---|
| `useChat` | Enviar mensagens, gerenciar estado de loading/erro | SessionContext, ConversationContext |
| `useConversation` | Gerenciar histórico, selecionar conversas | SessionContext, ConversationContext |
| `useDocuments` | CRUD de documentos, polling de status, busca semântica | documentService |
| `useHealth` | Polling de health check | healthService |
| `useUpload` | Upload de arquivo com progresso | SessionContext, uploadService |

### contexts/ (Estado Global)

| Contexto | Estado | Funções |
|---|---|---|
| `SessionContext` | sessionId, isLoading, error | initialize, destroy |
| `ConversationContext` | activeConversation, messages | setActiveConversation, addMessage, setMessages, clearMessages |
| `ToastContext` | toasts | addToast, removeToast |

---

> Este documento serve como contrato formal entre front-end e back-end.
> Qualquer alteração nos contratos de API deve ser refletida em ambos os lados.
