# 🤖 Chat Inteligente com Suporte a Documentos

**Sistema web de chat interativo** com capacidade de envio de mensagens e upload de documentos (`.txt` e `.pdf`), desenvolvido como projeto do módulo de **Inteligência Artificial** do programa **Serratec — Residência em TIC**.

A arquitetura segue o padrão de **Clean Architecture**, com front-end独立 em React SPA e back-end em Spring Boot, preparada para futura integração com Large Language Models (LLM).

---

## 👥 Equipe — Grupo 5

| Membro | Função |
|--------|--------|
| **Emily Neves da Silva** | Equipe de Desenvolvimento |
| **Gabriel Mendonça dos Santos Menezes** | Equipe de Desenvolvimento |
| **Leonam Nogueira Machado** | Equipe de Desenvolvimento |
| **Rayla Martins Ferreira** | Equipe de Desenvolvimento |

---

## 🏗️ Visão Geral da Arquitetura

O sistema é dividido em duas camadas principais que se comunicam via REST API:

```
┌─────────────────────────────────────────────────┐
│              FRONT-END (React SPA)               │
│   Componentes → Hooks → Services → Contextos    │
├─────────────────────────────────────────────────┤
│               API REST (HTTP/JSON)               │
├─────────────────────────────────────────────────┤
│              BACK-END (Spring Boot)              │
│  Controllers → Services → Repositories → BD     │
├─────────────────────────────────────────────────┤
│         PERSISTÊNCIA (H2 / PostgreSQL)           │
└─────────────────────────────────────────────────┘
```

### Front-end (React + TypeScript + Vite)

Camadas do front-end seguindo fluxo unidirecional:

| Camada | Responsabilidade |
|--------|------------------|
| **Components** | Renderização pura de JSX. Recebem dados via props. **Sem lógica de negócio.** |
| **Custom Hooks** | Gerenciam estado, efeitos colaterais e chamadas HTTP. Expõem `loading`, `error`, `data`. |
| **Services** | Funções HTTP tipadas que consomem a API REST. |
| **Contexts** | Estado global compartilhado (`SessionContext`, `ConversationContext`). |
| **Types / Utils** | Interfaces TypeScript, validadores, formatadores e constantes. |

### Back-end (Java + Spring Boot)

Arquitetura em camadas concêntricas (Clean Architecture):

| Camada | Responsabilidade |
|--------|------------------|
| **Controller** | Apenas orquestração HTTP — delega para Services. |
| **Service** | Regras de negócio, orquestração de entidades e repositórios. |
| **Repository** | Acesso a dados via Spring Data JPA. |
| **Entity** | Modelo de domínio anêmico com anotações JPA. |
| **DTO** | Objetos de transferência que isolam a API do modelo interno. |

> 💡 **Preparação para IA:** A interface `ChatService` permite substituir o simulador atual por um serviço real de IA sem alterar controllers, repositórios ou front-end.

---

## 🛠️ Stack Tecnológica

### Front-end

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 19.x | Biblioteca de interface |
| TypeScript | 6.x | Tipagem estática |
| Vite | 8.x | Bundler e dev server |
| CSS Modules | — | Estilização com escopo |
| Vitest | 4.x | Testes unitários |
| Oxlint | 1.x | Linter |

### Back-end

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Java | 17+ | Linguagem |
| Spring Boot | 3.x | Framework web |
| JPA / Hibernate | 6.x | ORM |
| H2 | — | Banco de desenvolvimento |
| PostgreSQL | 15+ | Banco de produção |
| JUnit 5 + Mockito | — | Testes |
| Maven | 3.9+ | Build |

---

## ✨ Funcionalidades

- **Envio de mensagens** com feedback visual de loading e erro
- **Upload de arquivos** via drag-and-drop ou seletor (`.txt` e `.pdf`, até 10 MB)
- **Barra de progresso** durante upload com transição suave
- **Histórico de conversas** navegável por sessão
- **Indicador de saúde da API** em tempo real
- **Estados de loading, erro e vazio** em todos os componentes
- **Responsividade** mobile/tablet/desktop
- **Acessibilidade** ARIA, navegação por teclado, WCAG 2.1 AA
- **Retry automático** com backoff exponencial (3 tentativas)
- **Sessão por UUID** armazenada no `localStorage`

---

## 📁 Estrutura do Projeto

```
/
├── chat-frontend/                   # Aplicação front-end
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/               # ChatWindow, MessageList, MessageItem, ChatInput, AttachmentBadge
│   │   │   ├── Common/             # Loading, EmptyState, ErrorMessage, HealthIndicator, Toast
│   │   │   ├── History/            # ConversationHistory, ConversationItem
│   │   │   ├── Layout/             # Layout, Header, Sidebar, Footer
│   │   │   └── Upload/             # UploadArea, DragDropZone, FileSelector, UploadProgress
│   │   ├── contexts/               # SessionContext, ConversationContext
│   │   ├── hooks/                  # useChat, useUpload, useConversation, useHealth
│   │   ├── pages/                  # ChatPage, NotFoundPage
│   │   ├── services/               # api, chatService, uploadService, sessionService, healthService
│   │   ├── types/                  # message, conversation, session, upload, health
│   │   ├── utils/                  # constants, validators, formatters
│   │   └── assets/styles/          # global.css, variables.css
│   ├── public/                     # favicon.svg
│   ├── index.html
│   ├── vite.config.ts              # Proxy /api → localhost:8080
│   ├── tsconfig.json
│   └── package.json
│
├── chat-backend/                   # Back-end (em desenvolvimento)
│   └── ...
│
├── SYSTEM_DOCS.md                  # Documentação geral do sistema
├── SYSTEM_DOCS_FRONTEND.md         # Documentação do front-end
└── SYSTEM_DOCS_BACKEND.md          # Documentação do back-end
```

---

## 🌐 API REST — Endpoints

| Método | URL | Descrição | Status |
|--------|-----|-----------|--------|
| `GET` | `/api/health` | Health check da aplicação | 200, 500 |
| `GET` | `/api/session` | Criar ou recuperar sessão | 200 |
| `DELETE` | `/api/session/{sessionId}` | Encerrar sessão | 204, 404 |
| `POST` | `/api/chat/message` | Enviar mensagem | 200, 400, 404, 422 |
| `GET` | `/api/chat/history/{sessionId}` | Histórico da sessão | 200, 404 |
| `GET` | `/api/chat/history/{sessionId}/{conversationId}` | Conversa específica | 200, 404 |
| `POST` | `/api/upload` | Upload de arquivo | 200, 400, 413, 415 |

### Contratos JSON

**Envio de mensagem:**
```json
// POST /api/chat/message
// Request
{
  "sessionId": "uuid-da-sessao",
  "conversationId": 1,
  "content": "Olá, qual é a capital do Brasil?"
}

// Response 200
{
  "userMessage": { "role": "USER", "content": "Olá, qual é a capital do Brasil?" },
  "assistantMessage": { "role": "ASSISTANT", "content": "A capital do Brasil é Brasília." }
}
```

**Upload de arquivo:**
```json
// POST /api/upload (multipart/form-data)
// Response 200
{
  "attachmentId": 5,
  "fileName": "relatorio.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048000,
  "uploadedAt": "2026-06-25T15:00:00Z",
  "message": "Arquivo enviado com sucesso."
}
```

---

## 🚀 Como Executar

### Front-end

```bash
# Acessar o diretório do front-end
cd chat-frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`. O Vite faz proxy de `/api` para `http://localhost:8080`.

### Back-end (em desenvolvimento)

```bash
# Acessar o diretório do back-end
cd chat-backend

# Compilar e executar
./mvnw spring-boot:run
```

---

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila TypeScript + build de produção |
| `npm run lint` | Executa oxlint |
| `npm run preview` | Preview do build de produção |
| `npm test` | Executa testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com cobertura |

---

## ✅ Validações

| Regra | Código HTTP | Mensagem |
|-------|-------------|----------|
| Mensagem vazia | 422 | "O conteúdo da mensagem não pode estar vazio." |
| Mensagem > 5000 caracteres | 422 | "A mensagem excede o limite de 5000 caracteres." |
| Arquivo > 10 MB | 413 | "O arquivo excede o limite máximo de 10 MB." |
| Formato não suportado | 415 | "Formato de arquivo não suportado. Utilize .txt ou .pdf." |
| Sessão não encontrada | 404 | "Sessão não encontrada: {sessionId}" |

---

## 📄 Documentação

Documentos detalhados na raiz do projeto:


- [`SYSTEM_DOCS_FRONTEND.md`](chat-frontend/doc/SYSTEM_DOCS_FRONTEND.md) — Documentação completa do front-end


---

<p align="center">Desenvolvido como parte do programa <strong>Serratec — Residência em TIC</strong> • Inteligência Artificial • 2026</p>
