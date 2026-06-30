# Auditoria de Integração — Módulo de Sessão

**Objetivo:** Verificar exclusivamente a compatibilidade do fluxo de sessão entre frontend e backend.  
**Escopo:** `SessionContext`, `SessionProvider`, `useSession`, `sessionService`, `SessionResponse`, `localStorage`.  
**Premissa:** Nenhum arquivo será alterado. Nenhum código será escrito.

---

## Fluxo Atual da Sessão

```
main.tsx
  └── <StrictMode>
        └── App.tsx
              └── <ErrorBoundary>
                    └── <SessionProvider>          ← inicializa sessão aqui
                          └── <ConversationProvider>
                                └── <ToastProvider>
                                      └── <RouterProvider>


SessionProvider (dentro do useEffect no mount):
─────────────────────────────────────────────────

    ┌─ initialize()
    │
    ├── setIsLoading(true)
    ├── setError(null)
    │
    ├── sessionId = localStorage.getItem("sessionId")
    │
    ├── SE sessionId existe E é UUID válido:
    │     ├── GET /api/session/{sessionId}        ← valida
    │     ├── SE response.ok E !response.expired:
    │     │     ├── setSessionId(sessionId)        ← reutiliza
    │     │     ├── setIsLoading(false)
    │     │     └── FIM
    │     └── SENÃO (erro de rede, 404, ou expired):
    │           ├── localStorage.removeItem("sessionId")
    │           └── (continua para criar nova)
    │
    ├── SE sessionId existe MAS não é UUID:
    │     └── localStorage.removeItem("sessionId")
    │
    └── createWithRetry()                          ← criar nova
          ├── tentativa 1: GET /api/session
          │     ├── SUCESSO: localStorage.setItem → setSessionId → retorna
          │     └── ERRO: retryCount++
          ├── tentativa 2: (após 2s) GET /api/session
          │     ├── SUCESSO: ...
          │     └── ERRO: retryCount++
          ├── tentativa 3: (após 3s) GET /api/session
          │     ├── SUCESSO: ...
          │     └── ERRO: setError() + throw
          │
          └── setIsLoading(false)


useSession() consumido por:
  ├── useChat()         → sessionId, error, initialize (como reinitializeSession)
  ├── useConversation() → sessionId, error, initialize (como reinitializeSession)
  └── useUpload()       → sessionId apenas (hook órfão)

destroy() exposto mas NUNCA chamado na UI atual.
```

---

## Fluxo HTTP

### GET /api/session — Criar sessão

| Campo | Valor |
|-------|-------|
| **Método** | GET |
| **Endpoint** | `/api/session` |
| **Headers** | `Content-Type: application/json` |
| **Body** | Nenhum |
| **Resposta esperada (frontend)** | `{ sessionId: string, createdAt: string, lastActivity: string, expired: boolean }` |
| **Timeout** | 10s (`TIMEOUTS.SESSION`) |
| **Quem chama** | `sessionService.createSession()` → `SessionContext.createWithRetry()` |
| **Quando chama** | Inicialização (se não há sessão local válida) ou após falha de validação |
| **Tratamento de erro** | Retry 3x com backoff (1s, 2s, 3s). Após 3 falhas, `setError()` |
| **Compatível com backend?** | ⚠ Depende — criação com GET é atípica |

### GET /api/session/{sessionId} — Validar sessão

| Campo | Valor |
|-------|-------|
| **Método** | GET |
| **Endpoint** | `/api/session/{sessionId}` |
| **Headers** | `Content-Type: application/json` |
| **Body** | Nenhum |
| **Resposta esperada (frontend)** | `{ sessionId: string, createdAt: string, lastActivity: string, expired: boolean }` |
| **Timeout** | 10s (`TIMEOUTS.SESSION`) |
| **Quem chama** | `sessionService.validateSession()` → `SessionContext.initialize()` |
| **Quando chama** | Inicialização (se há sessionId no localStorage) |
| **Tratamento de erro** | 404 → retorna `null`. Outros erros propagam. |
| **Compatível com backend?** | ✅ (GET para consulta é padrão) |

### DELETE /api/session/{sessionId} — Destruir sessão

| Campo | Valor |
|-------|-------|
| **Método** | DELETE |
| **Endpoint** | `/api/session/{sessionId}` |
| **Headers** | `Content-Type: application/json` |
| **Body** | Nenhum |
| **Resposta esperada (frontend)** | `204 No Content` (body vazio) |
| **Timeout** | 10s (`TIMEOUTS.SESSION`) |
| **Quem chama** | `sessionService.deleteSession()` → `SessionContext.destroy()` |
| **Quando chama** | Nunca (destroy não é invocado por nenhum componente) |
| **Tratamento de erro** | Ignorado (sempre remove localStorage no finally) |
| **Compatível com backend?** | ✅ |

---

## Fluxo de Estados

```
                  ┌──────────────────────────────────────┐
                  │        INICIALIZAÇÃO                 │
                  │  isLoading=true, sessionId=null      │
                  └────────────┬─────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
           ┌─────────────────┐   ┌─────────────────┐
           │ localStorage    │   │ localStorage    │
           │ TEM sessionId   │   │ NÃO TEM         │
           └────────┬────────┘   └────────┬────────┘
                    │                     │
                    ▼                     ▼
           ┌─────────────────┐   ┌─────────────────┐
           │ isValidSessionId│   │ createWithRetry │
           │ = true          │   │ GET /api/session│
           └────────┬────────┘   └────────┬────────┘
                    │                     │
                    ▼                     ├── SUCESSO ──► SESSÃO CRIADA
           ┌─────────────────┐           │              sessionId setado
           │ GET /api/session│           │              localStorage.setItem
           │ /{sessionId}    │           │
           └────────┬────────┘           └── FALHA (3x) ──► ERRO
                    │                                       isLoading=false
         ┌──────────┼──────────┐                            sessionId=null
         ▼          ▼          ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Válida  │ │Expirada │ │ Erro    │
   │ expired │ │(true ou │ │(rede,   │
   │ = false │ │ 404)    │ │timeout) │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │REUTILI- │ │ LIMPAR  │ │ LIMPAR  │
   │  ZAR    │ │ E CRIAR │ │ E CRIAR │
   │sessionId│ │  NOVA   │ │  NOVA   │
   └─────────┘ └─────────┘ └─────────┘


                  ┌──────────────────────────────────────┐
                  │        SESSÃO CRIADA                 │
                  │  isLoading=false, sessionId=UUID     │
                  │  localStorage tem sessionId          │
                  └──────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      Chat normal      Histórico          Upload
      (usa sessionId)  (usa sessionId)    (usa sessionId)

              ┌──────────────────────────────────────┐
              │        SESSÃO EXPIRADA (404/409)     │
              │  useChat captura → reinitialize()   │
              │  → volta para INICIALIZAÇÃO          │
              └──────────────────────────────────────┘

              ┌──────────────────────────────────────┐
              │        SESSÃO DESTRUÍDA              │
              │  destroy() → DELETE + localStorage   │
              │  remove → sessionId=null             │
              │  (NUNCA chamado na UI atual)          │
              └──────────────────────────────────────┘
```

---

## Compatibilidade com Backend

### Endpoint: GET /api/session (criação)

| Item | Frontend espera | Backend (hipotético) | Compatível? |
|------|-----------------|---------------------|-------------|
| Método | GET | ? | ⚠ Depende |
| Payload | Nenhum | — | ✅ |
| sessionId | string (UUID) | ? | ⚠ Depende |
| createdAt | string (ISO) | ? | ⚠ Depende |
| lastActivity | string (ISO) | ? | ⚠ Depende |
| expired | boolean | ? | ⚠ Depende |

### Endpoint: GET /api/session/{sessionId} (validação)

| Item | Frontend espera | Backend (hipotético) | Compatível? |
|------|-----------------|---------------------|-------------|
| Método | GET | — | ✅ Padrão |
| sessionId | string (UUID) | ? | ⚠ Depende |
| expired | boolean | ? | ⚠ **Crítico** — se backend retornar `isExpired` em vez de `expired`, o campo será `undefined` (falsy) e a sessão será considerada válida mesmo se expirada |

### Endpoint: DELETE /api/session/{sessionId} (destruição)

| Item | Frontend espera | Backend (hipotético) | Compatível? |
|------|-----------------|---------------------|-------------|
| Método | DELETE | — | ✅ Padrão |
| Status esperado | 204 | ? | ⚠ Depende |
| Body | vazio | — | ✅ |

---

## Problemas Encontrados

### 🔴 Crítico

#### PC01 — StrictMode causa dupla inicialização concorrente

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/main.tsx:8` + `src/contexts/SessionContext.tsx:91-93` |
| **Explicação** | React StrictMode monta → desmonta → monta o componente em desenvolvimento. O `useEffect` que chama `initialize()` executa duas vezes. Como `initialize` é assíncrona e não há proteção (mutex, ref flag, etc.), ambas as execuções rodam simultaneamente: ambas leem o mesmo localStorage, ambas validam a mesma sessão, e — se a sessão precisar ser criada — ambas chamam `GET /api/session` simultaneamente. O backend pode criar duas sessões. A última sobrescreve a primeira no localStorage, mas a primeira pode estar sendo usada por hooks que já a capturaram. |
| **Impacto na apresentação** | **ALTO** — pode gerar sessões órfãs no backend e race condition na inicialização. Em produção (sem StrictMode) não ocorre, mas durante desenvolvimento/testes o comportamento é imprevisível. |

#### PC02 — Race condition no retryCount compartilhado

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:21,37-38` |
| **Explicação** | `retryCount` é um `useRef` compartilhado entre todas as chamadas de `createWithRetry`. Se duas execuções de `initialize` estiverem rodando (StrictMode), ambas incrementam o mesmo `retryCount.current`. Isso pode fazer uma execução desistir prematuramente (achar que já esgotou 3 tentativas quando na verdade só fez 1 ou 2). |
| **Impacto na apresentação** | **MÉDIO** — se o backend estiver estável, o problema não se manifesta. Se houver instabilidade, o retry pode falhar antes do esperado. |

#### PC03 — Nome do campo `expired` pode ser diferente no backend

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/types/session.ts:5`, `src/contexts/SessionContext.tsx:55` |
| **Explicação** | O frontend verifica `!valid.expired`. Se o backend retornar `isExpired` (ou outro nome), o campo será `undefined` (falsy) e a sessão será considerada válida mesmo se estiver expirada. Isso permite que o chat prossiga com uma sessão que o backend considera inválida, causando 404/409 na primeira mensagem. O erro será tratado (recriação de sessão), mas a experiência do usuário é degradada. |
| **Impacto na apresentação** | **ALTO** — dependendo da implementação do backend, a primeira mensagem de cada sessão restaurada pode falhar. |

#### PC04 — Sessão válida é perdida se backend retorna erro de rede na validação

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:60-64` |
| **Explicação** | Se o backend está temporariamente fora do ar durante a validação (`GET /api/session/{sessionId}`), o `catch` genérico na linha 60 captura o erro e **limpa o sessionId do localStorage** (linha 63). Isso significa que mesmo que o backend volte imediatamente, o usuário perdeu a sessão anterior e todo o histórico associado a ela (no backend). O frontend ainda tem os dados no localStorage (conversas/mensagens), mas não consegue mais associá-los à sessão antiga. |
| **Impacto na apresentação** | **ALTO** — uma queda momentânea do backend durante a inicialização destrói a sessão do usuário. |

---

### 🟠 Alto

#### PA01 — createSession usa GET em vez de POST

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/services/sessionService.ts:6` |
| **Explicação** | A criação de sessão é feita com `GET /api/session`. O padrão REST para criação é POST. GET deve ser idempotente e sem efeitos colaterais. Se o backend implementou como POST, a chamada falha (405 Method Not Allowed). Se implementou como GET deliberadamente, pode haver problemas de cache HTTP ou proxies intermediários reutilizarem respostas. |
| **Impacto na apresentação** | **CRÍTICO** se backend esperar POST. **BAIXO** se backend implementou GET. |

#### PA02 — Retry tenta novamente mesmo para erros 4xx

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:38` |
| **Explicação** | `createWithRetry` retenta para **qualquer** erro, incluindo 400, 422, etc. Se o backend retornar um erro de validação (4xx), retentar não vai resolver — é um erro do lado do cliente. O frontend perde ~6s (1+2+3s de backoff) tentando algo que nunca vai funcionar. |
| **Impacto na apresentação** | **BAIXO** — improvável que o backend retorne 4xx para criação de sessão GET sem body. |

#### PA03 — Nenhuma proteção contra initialize após unmount

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:91-93` |
| **Explicação** | O `useEffect` não retorna cleanup. Se o componente desmontar durante a inicialização (ex: StrictMode), a promise continua rodando e pode chamar `setSessionId`, `setIsLoading`, `setError` em um componente desmontado. Isso gera warning do React ("Can't perform a React state update on an unmounted component"). |
| **Impacto na apresentação** | **BAIXO** — apenas warning em console, não quebra funcionalmente. |

#### PA04 — destroy exposto mas nunca chamado

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:79-89` |
| **Explicação** | O método `destroy` está disponível no contexto mas nenhum componente ou hook o invoca. Se o usuário nunca "desloga", a sessão fica no backend até expirar por tempo. Isso não é um bug, mas significa que o fluxo de DELETE nunca é testado. |
| **Impacto na apresentação** | **BAIXO** — sessões expiram por tempo no backend. |

---

### 🟡 Médio

#### PM01 — Auth header não é enviado

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/services/api.ts:63-66` |
| **Explicação** | As requisições de sessão não incluem token de autenticação. Se o backend exigir autenticação, todas as chamadas de sessão falharão com 401/403. O frontend não trata esses códigos. |
| **Impacto na apresentação** | **MÉDIO** — depende se o backend exige auth. Provavelmente não, dado que é um projeto acadêmico. |

#### PM02 — Loading termina antes do retry acabar em caso de erro

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:74-76` |
| **Explicação** | `setIsLoading(false)` está no `finally` do bloco que chama `createWithRetry`. Se `createWithRetry` lançar erro (após 3 tentativas), `setIsLoading(false)` é chamado. Correto. Mas se `createWithRetry` estiver rodando (tentando), `isLoading` continua `true`. O problema é que se o `initialize` for chamado novamente enquanto a anterior ainda está rodando, o loading pode ficar inconsistente. |
| **Impacto na apresentação** | **BAIXO** — cenário de concorrência raro. |

---

### 🟢 Baixo

#### PB01 — Duas verificações consecutivas para stored

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/contexts/SessionContext.tsx:52,66` |
| **Explicação** | `if (stored && isValidSessionId(stored))` seguido de `if (stored && !isValidSessionId(stored))`. Funciona, mas o segundo poderia ser `else`. Leitura de localStorage duplicada. |
| **Impacto na apresentação** | Nenhum. |

#### PB02 — validateSession captura apenas 404, não 409

| Campo | Valor |
|-------|-------|
| **Arquivo** | `src/services/sessionService.ts:13` |
| **Explicação** | Se o backend retornar 409 (sessão expirada), `validateSession` propaga o erro. O `initialize` captura no catch genérico e trata corretamente (limpa e recria). Mas a mensagem de erro específica para 409 ("Sessão expirada. Crie uma nova sessão.") nunca é exibida para validação. |
| **Impacto na apresentação** | Nenhum — o fluxo funciona, apenas a mensagem é genérica. |

---

## Pontos Fortes

1. **Validação de UUID:** `isValidSessionId` com regex garante que apenas UUIDs sejam armazenados.
2. **Retry com backoff:** 3 tentativas com backoff progressivo (1s, 2s, 3s) para criação de sessão.
3. **Fallback de sessão:** Se a sessão existente expirou ou é inválida, uma nova é criada automaticamente.
4. **Recriação automática via hooks:** `useChat` e `useConversation` capturam 404/409 e chamam `reinitializeSession()`.
5. **Limpeza consistente:** `destroy()` sempre remove o localStorage mesmo se o DELETE falhar.
6. **Timeout dedicado:** `TIMEOUTS.SESSION = 10s` específico para operações de sessão.
7. **Contexto separado:** `SessionContext` isolado de `ConversationContext` e `ToastContext`.
8. **`useSession` com guarda:** Lança erro se usado fora do `SessionProvider`.
9. **`retryCount` em useRef:** Evita re-renderizações desnecessárias durante retry.
10. **Stable callbacks:** `createWithRetry` e `clearStoredSession` com `useCallback([])` estáveis.

---

## Conclusão

### ⚠ REVISÃO NECESSÁRIA

**Problemas que realmente impedem uma apresentação estável:**

1. **StrictMode + race condition (PC01 + PC02):** Durante desenvolvimento, o `initialize()` roda duas vezes em paralelo. Em produção não há StrictMode, mas se a apresentação usar `npm run dev`, o comportamento pode ser imprevisível — sessões duplicadas, retryCount corrompido. **Solução antes da apresentação:** testar com `npm run build && npm run preview` (modo produção) para evitar StrictMode.

2. **Nome do campo `expired` (PC03):** Se o backend retornar `isExpired` em vez de `expired`, a validação de sessão ignora expiração. **Verificação obrigatória antes da apresentação:** confirmar que o backend retorna `expired` (exatamente este nome) no JSON de `SessionResponse`.

3. **Método da criação de sessão (PA01):** GET para criar sessão é atípico. **Verificação obrigatória:** confirmar que o backend implementa `GET /api/session` (não `POST`).

**Se os 3 itens acima forem verificados e estiverem corretos, o módulo de sessão está estável para apresentação.**

⚠ Recomenda-se testar a aplicação com `npm run build && npm run preview` (produção) em vez de `npm run dev` (desenvolvimento com StrictMode) durante a apresentação.
