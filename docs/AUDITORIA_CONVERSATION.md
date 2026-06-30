# Auditoria de Integração — Módulo Conversation

**Objetivo:** Verificar exclusivamente a compatibilidade do fluxo de conversas entre frontend e backend.  
**Escopo:** `ConversationContext`, `ConversationProvider`, `useConversation`, `conversationStorage`, `chatService` (apenas `getHistory`, `getConversation`), DTOs `Conversation`, `ConversationSummary`, `HistoryResponse`, `ConversationResponse`.  
**Premissa:** Nenhum arquivo será alterado. Nenhum código será escrito.

---

## Fluxo Atual das Conversas

```
PARTICIPANTES:
  ConversationContext  → estado global { activeConversation, messages }
  useConversation      → lógica de histórico, seleção, criação
  useChat              → lógica de envio (CRIA/MODIFICA conversas)
  conversationStorage  → persistência localStorage
  chatService          → HTTP

FLUXO DE CRIAÇÃO (useChat.sendMessage):
────────────────────────────────────────
  ChatInput
    → useChat.sendMessage(content)
      → addMessage(tempUserMessage)        ← com conversationId=0 se não há ativa
      → POST /api/chat/message/async
      → Response: { conversationId, userMessage, assistantMessage }

      Se NÃO havia activeConversation:
        → setActiveConversation({ id: backendConvId })
        → ensureConversationInList(convId, content)
            → localStorage chat:conversations:{sid}: cria entry com
              { id, title: truncate(content, 50), messageCount: 1,
                lastMessage: content, lastActivity: now }

      → updateMessage(tempUserId, dados reais)
      → addMessage(assistantMessage)
      → persistMessages(convId, [userMessage, assistantMessage])
          → localStorage chat:messages:{sid}:{convId} = apenas 2 mensagens
      → updateConversationLastMessage(convId, assistantContent)
          → atualiza entry no localStorage (messageCount+1, lastMessage, lastActivity)


FLUXO DE SELEÇÃO (useConversation.selectConversation):
────────────────────────────────────────────────────────
  Sidebar → ConversationItem.onSelect(convId)
    → useConversation.selectConversation(id)
      → loadMessages(sid, id) do localStorage
        Se tem dados locais:
          → setActiveConversation({ id })
          → setMessages(localMessages)
      → GET /api/chat/history/{sid}/{id}
        Se OK:
          → setActiveConversation({ id: response.id })
          → setMessages(response.messages)
          → saveMessages(sid, id, response.messages) ← sobrescreve localStorage
        Se 404/409:
          → reinitializeSession()
          → retorna
        Se outro erro e não havia dados locais:
          → setError(message)
      → setIsLoading(false)


FLUXO DE NOVA CONVERSA (useConversation.createNewConversation):
────────────────────────────────────────────────────────────────
  Sidebar → Botão "Nova Conversa"
    → useConversation.createNewConversation()
      Se sessionId && activeConversation && messages.length > 0:
        → saveMessages(sid, activeConversation.id, messages)
      → setActiveConversation(null)
      → setMessages([])


FLUXO DE HISTÓRICO (useConversation.fetchHistory):
───────────────────────────────────────────────────
  useEffect [sessionId]
    → fetchHistory()
      → loadConversations(sid) do localStorage
        Se tem dados locais:
          → setConversations(local)          ← mostra imediatamente
      → GET /api/chat/history/{sid}
        Se OK:
          → setConversations(response.conversations)
          → saveConversations(sid, response.conversations)
        Se 404/409:
          → reinitializeSession()
          → retorna
        Se outro erro e não havia dados locais:
          → setError(message)

  useEffect [activeConversation?.id, messages.length]
    → refreshFromStorage()
      → loadConversations(sid)
      → setConversations(local)              ← NUNCA visto em ação

```

---

## Fluxo HTTP

### GET /api/chat/history/{sessionId} — Listar conversas

| Campo | Valor |
|-------|-------|
| **Método** | GET |
| **Endpoint** | `/api/chat/history/{sessionId}` |
| **Headers** | `Content-Type: application/json` |
| **Body** | Nenhum |
| **Resposta esperada** | `{ sessionId: string, conversations: ConversationSummary[] }` |
| **Timeout** | 15s (`TIMEOUTS.HISTORY`) |
| **Quem chama** | `useConversation.fetchHistory()` |
| **Quando chama** | No mount, sempre que `sessionId` muda |
| **Tratamento de erro** | 404/409 → `reinitializeSession()`. Outros → `setError()` (só se localStorage vazio) |

### GET /api/chat/history/{sessionId}/{conversationId} — Carregar conversa

| Campo | Valor |
|-------|-------|
| **Método** | GET |
| **Endpoint** | `/api/chat/history/{sessionId}/{conversationId}` |
| **Headers** | `Content-Type: application/json` |
| **Body** | Nenhum |
| **Resposta esperada** | `{ id: number, messages: Message[] }` |
| **Timeout** | 15s (`TIMEOUTS.HISTORY`) |
| **Quem chama** | `useConversation.selectConversation()` |
| **Quando chama** | Usuário clica em uma conversa no histórico |
| **Tratamento de erro** | 404/409 → `reinitializeSession()`. Outros → `setError()` (só se localStorage vazio) |

---

## Fluxo de Estados

```
                    ┌──────────────────────────────────┐
                    │        INICIALIZAÇÃO              │
                    │  sessionId chega (via Session)    │
                    │  → useEffect dispara              │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────────┐
                    │         FETCH HISTORY             │
                    │  GET /api/chat/history/{sid}     │
                    │  + localStorage como fallback    │
                    ├──────────────────────────────────┤
                    │  activeConversation = null        │
                    │  messages = []                    │
                    │  conversations = [...]            │
                    └────────────┬─────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ NOVA         │     │ SELECIONAR   │     │ ENVIAR       │
   │ CONVERSA     │     │ CONVERSA     │     │ MENSAGEM     │
   ├──────────────┤     ├──────────────┤     ├──────────────┤
   │ Salva msg    │     │ LocalStorage │     │ Backend cria │
   │ atual (se   │     │ → exibe      │     │ convId se    │
   │ houver)      │     │ API →        │     │ null         │
   │              │     │ atualiza     │     │              │
   │ activeConv=  │     │              │     │ setActiveConv│
   │ null         │     │ activeConv=  │     │ = backendId  │
   │ messages=[]  │     │ {id}         │     │              │
   └──────────────┘     └──────────────┘     └──────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────────┐
                    │        CONVERSA ATIVA             │
                    │  activeConversation = { id }      │
                    │  messages = [Message]             │
                    │  localStorage sincronizado        │
                    └──────────────────────────────────┘
```

---

## Compatibilidade com o Backend

### GET /api/chat/history/{sessionId}

| Campo | Frontend espera | Compatível? | Observação |
|-------|-----------------|-------------|------------|
| Método | GET | ✅ | Padrão REST |
| `sessionId` | string | ✅ | UUID |
| `conversations` | `ConversationSummary[]` | ⚠ | Verificar tipo de cada campo abaixo |
| └ `id` | number | ⚠ | Verificar se backend retorna Long ou Int |
| └ `title` | string | ⚠ | Verificar se backend gera título |
| └ `messageCount` | number | ✅ | |
| └ `lastMessage` | string | ✅ | |
| └ `lastActivity` | string (ISO) | ✅ | |

### GET /api/chat/history/{sessionId}/{conversationId}

| Campo | Frontend espera | Compatível? | Observação |
|-------|-----------------|-------------|------------|
| Método | GET | ✅ | Padrão REST |
| `id` | number | ⚠ | Verificar se é o conversationId |
| `messages` | `Message[]` | ⚠ | Verificar DTO abaixo |
| └ `id` | number | ✅ | message id |
| └ `conversationId` | number | ⚠ | Deve bater com `id` da URL |
| └ `role` | `'USER' \| 'ASSISTANT'` | ⚠ | Verificar se backend retorna maiúsculo |
| └ `content` | string | ✅ | |
| └ `timestamp` | string (ISO) | ✅ | |
| └ `attachment` | `AttachmentResponse \| null` | ⚠ | Verificar se backend inclui |

### POST /api/chat/message/async (resposta — criação de conversa)

| Campo | Frontend espera | Compatível? | Observação |
|-------|-----------------|-------------|------------|
| `conversationId` | number | ⚠ | **Crítico** — frontend espera que backend retorne o `conversationId` na resposta |
| `userMessage` | `Message` | ✅ | |
| `assistantMessage` | `Message` | ✅ | |

---

## Persistência Local

### Chaves do localStorage

| Chave | Conteúdo | Criada em | Atualizada em | Removida em |
|-------|----------|-----------|---------------|-------------|
| `chat:conversations:{sessionId}` | `ConversationSummary[]` | `ensureConversationInList()` (primeira msg) | `updateConversationLastMessage()`, `fetchHistory()` (resposta API), `selectConversation()` | **Nunca** |
| `chat:messages:{sessionId}:{conversationId}` | `Message[]` | `persistMessages()` (após 1ª resposta) | `selectConversation()` (resposta API), `createNewConversation()` (antes de limpar) | **Nunca** |

### Cache vs Sincronização

1. **Leitura otimista (cache-first):** `fetchHistory` e `selectConversation` primeiro exibem dados do localStorage, depois buscam do backend e sobrescrevem.

2. **Escrita apenas no backend:** As mensagens enviadas via `sendMessage` são salvas primeiro no backend (que retorna os dados normalizados). O frontend só persiste no localStorage após a resposta do backend.

3. **Inconsistência potencial:** Se o usuário enviar mensagens offline, elas NUNCA serão persistidas (o código espera a resposta do backend para salvar). Mensagens enviadas sem conexão são perdidas.

4. **Sobrescrição total:** `selectConversation` e `fetchHistory` sobrescrevem TODO o localStorage com os dados do backend, não fazem merge.

5. **Sem limpeza:** Dados de conversas de sessões antigas permanecem no localStorage para sempre.

---

## Problemas Encontrados

### 🔴 Crítico

#### PC01 — sendMessage sobrescreve localStorage com APENAS 2 mensagens

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useChat.ts:144-145` |
| **Linha** | `const allMsgs = [response.userMessage, assistantMsg]; persistMessages(backendConvId, allMsgs);` |
| **Explicação** | Após enviar uma mensagem, `persistMessages` salva no localStorage SOMENTE as duas últimas mensagens (user + assistant), NÃO o histórico completo da conversa. Se o usuário enviar 5 mensagens, o localStorage terá apenas as 2 últimas. Ao recarregar a página ou trocar de conversa e voltar, as mensagens anteriores (1-4) são perdidas. O backend as tem, mas a primeira exibição (cache-first) mostrará dados incompletos. Após `fetchHistory` completar, os dados corretos são carregados — mas durante o breve período de cache-first, o usuário vê um histórico truncado. |
| **Impacto na apresentação** | **ALTO** — se o apresentador recarregar a página ou demonstrar o fallback offline, mensagens antigas sumirão. Dependendo da ordem dos eventos, o usuário pode ver dados parciais. |

#### PC02 — sendMessage vs sendFileMessage: inconsistência de persistência

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useChat.ts:144-145` vs `src/hooks/useChat.ts:214` |
| **Linhas** | 144 vs 214 |
| **Explicação** | `sendMessage` (texto puro) salva apenas `[response.userMessage, assistantMsg]` — 2 mensagens. `sendFileMessage` (com arquivo) salva `[...messages, response.userMessage, assistantMsg]` — todas as mensagens. O mesmo hook, duas funções diferentes, comportamentos diferentes de persistência. `sendFileMessage` está correta; `sendMessage` está truncando o histórico. |
| **Impacto na apresentação** | **ALTO** — se a apresentação focar em chat de texto (o mais comum), a persistência local será perdida a cada nova mensagem. |

#### PC03 — selectConversation NÃO salva mensagens atuais antes de trocar

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useConversation.ts:64-98` |
| **Explicação** | Quando o usuário clica em outra conversa no histórico, `selectConversation` carrega a nova conversa mas NÃO salva a conversa atual no localStorage. Se o usuário estava conversando na Conversa A e clicou na Conversa B, as mensagens mais recentes de A (não persistidas ainda) são perdidas do localStorage. Apenas `createNewConversation` salva a conversa atual (antes de criar uma nova). |
| **Impacto na apresentação** | **ALTO** — se o apresentador trocar de conversa e voltar, as mensagens mais recentes podem não estar no localStorage. O backend as tem, mas o cache-first pode mostrar dados desatualizados durante o carregamento. |

---

### 🟠 Alto

#### PA01 — refreshFromStorage pode sobrescrever dados da API com localStorage

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useConversation.ts:117-119` |
| **Linhas** | 117-119 |
| **Explicação** | O efeito `refreshFromStorage` roda sempre que `activeConversation?.id` ou `messages.length` muda. Ele lê o localStorage e sobrescreve `conversations` no estado React. Se `fetchHistory` acabou de atualizar `conversations` com dados da API, e em seguida `selectConversation` muda `activeConversation?.id` (disparando `refreshFromStorage`), o `setConversations(local)` pode substituir os dados frescos da API por dados potencialmente desatualizados do localStorage. |
| **Impacto na apresentação** | **MÉDIO** — janela de race condition pequena, mas possível. |

#### PA02 — Dados de sessões anteriores NUNCA são limpos do localStorage

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/services/conversationStorage.ts` |
| **Explicação** | As chaves `chat:conversations:{sid}` e `chat:messages:{sid}:{cid}` nunca são removidas. Se o usuário criar múltiplas sessões (recarregando a página, expirando sessão), os dados de sessões antigas se acumulam no localStorage. Nunca há limpeza. |
| **Impacto na apresentação** | **BAIXO** — não afeta a sessão atual, apenas polui o storage. |

#### PA03 — ensureConversationInList duplica se primeira chamada falha

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useChat.ts:46-62` |
| **Explicação** | Se `sendMessage` é chamado, o request ao backend falha (ex: timeout), e o usuário tenta novamente, uma nova conversa é criada no backend (com novo convId). A `ensureConversationInList` vai criar uma ENTRADA DUPLICADA no localStorage para a primeira tentativa (que falhou, mas já havia sido adicionada). A verificação `!list.some((c) => c.id === convId)` não impede porque o `convId` da primeira tentativa (0 ou null) é diferente do `convId` real retornado. |
| **Impacto na apresentação** | **BAIXO** — entradas órfãs no localStorage, sem impacto visual imediato. |

---

### 🟡 Médio

#### PM01 — Temp message com conversationId=0 nunca é limpa em caso de erro

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useChat.ts:107` |
| **Linha** | `conversationId: activeConversation?.id ?? 0` |
| **Explicação** | Quando não há conversa ativa, a mensagem temporária recebe `conversationId = 0`. Se o request falhar e o erro não for 404/409, a mensagem com `conversationId = 0` permanece no estado (não é removida). Fica uma "mensagem fantasma" com ID inválido. |
| **Impacto na apresentação** | **BAIXO** — mensagem visível mas sem conversa vinculada. O botão "Nova Conversa" limpa. |

#### PM02 — Nenhuma proteção contra dupla chamada de selectConversation

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useConversation.ts:64-98` |
| **Explicação** | Se o usuário clicar rapidamente em duas conversas diferentes, ambas as chamadas `selectConversation` rodam concorrentemente. A primeira define `activeConversation` e `messages`, a segunda sobrescreve. Durante a execução concorrente, o estado pode ficar inconsistente (ex: mensagens da conversa A com id da conversa B). |
| **Impacto na apresentação** | **MÉDIO** — possível em UI rápida, mas improvável durante apresentação normal. |

---

### 🟢 Baixo

#### PB01 — Título da conversa truncado em 50 caracteres sem tratamento de caracteres especiais

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/hooks/useChat.ts:53` |
| **Explicação** | `title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')`. Funciona, mas não trata emojis ou caracteres multi-byte. Pode cortar no meio de um caractere. |
| **Impacto na apresentação** | Nenhum. |

#### PB02 — Conversation type tem title opcional mas nunca é populado

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/types/conversation.ts:3-6` |
| **Explicação** | `Conversation` tem `title?: string`. `setActiveConversation` sempre chama com `{ id }` sem título. O título nunca é usado na renderização da conversa ativa. Código morto. |
| **Impacto na apresentação** | Nenhum. |

---

## Pontos Fortes

1. **Cache-first no histórico:** `fetchHistory` e `selectConversation` exibem dados do localStorage IMEDIATAMENTE, depois atualizam com a API. Usuário vê conteúdo instantaneamente.

2. **Fallback silencioso:** Se a API de histórico falhar e houver dados locais, o erro é suprimido. O usuário continua vendo suas conversas.

3. **Recriação automática de sessão:** Se o backend retornar 404/409 ao buscar histórico ou conversa, a sessão é recriada automaticamente.

4. **Separação clara de responsabilidades:** `ConversationContext` gerencia apenas estado; `useConversation` gerencia lógica de negócio; `conversationStorage` gerencia persistência.

5. **Salvamento ao criar nova conversa:** `createNewConversation` salva as mensagens atuais antes de limpar, prevenindo perda ao iniciar uma nova conversa.

6. **Timeout dedicado:** `TIMEOUTS.HISTORY = 15s` específico para operações de histórico.

7. **Stable references:** `useCallback` com dependências mínimas em todas as funções do hook.

8. **Tipagem estrita:** Todos os DTOs de conversa (`ConversationSummary`, `HistoryResponse`, `ConversationResponse`) são fortemente tipados.

---

## Conclusão

### ⚠ REVISÃO NECESSÁRIA

**Problemas que realmente comprometem a apresentação:**

1. **🔴 PC01 + PC02 — Persistência truncada em sendMessage:** A cada mensagem de texto enviada, o localStorage é sobrescrito com apenas 2 mensagens (a última troca). Toda mensagem anterior é perdida do cache local. Se a apresentação envolver recarregar a página ou demonstrar fallback offline, o histórico local aparecerá incompleto. A função `sendFileMessage` está correta; `sendMessage` está errada.

2. **🔴 PC03 — Mensagens perdidas ao trocar de conversa:** `selectConversation` não salva a conversa atual antes de carregar a nova. Se o apresentador alternar entre conversas, as mensagens mais recentes da conversa anterior desaparecem do cache local. O backend as mantém, mas a experiência de cache-first fica comprometida.

**Se ambos os problemas acima forem considerados aceitáveis (porque o backend sempre tem os dados corretos e o cache-first é apenas temporário), o módulo Conversation é funcional para a apresentação, desde que:**

- A apresentação evite recarregar a página durante a demonstração
- Ou a apresentação use apenas `sendFileMessage` (com arquivo) em vez de `sendMessage` (texto puro) — o que não é prático
- O apresentador saiba que trocar de conversa e voltar pode mostrar dados desatualizados temporariamente

⚠ **Recomendação:** Testar o fluxo completo de "enviar 3+ mensagens → recarregar página → ver histórico" antes da apresentação para confirmar se o comportamento é aceitável.
