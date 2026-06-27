# Documento de Especificação do Sistema — Refatoração Visual Marvel (Parte 2)

> **Propósito:** Este documento define a estratégia de identidade visual Marvel, novos componentes de UI (HealthStatus + SourcePanel) e o plano de integração sem modificar a lógica de mensagens existente da Parte 1.

---

## 1. Estratégia de Background com Imagem

### 1.1. Imagem de fundo

| Recurso | Caminho real (Vite) | Observação |
|---------|---------------------|------------|
| Background | `/Marvel_Background.jpg` | Já existe em `public/`. Nome sugerido pelo Figma era `quadrinhos.jpg` — manter o arquivo existente. |

### 1.2. Classe Tailwind para o background

Aplicada diretamente no `<body>` (via `global.css` após instalação do Tailwind) ou no `<div>` raiz do `Layout.tsx`:

```css
/* Adicionar em assets/styles/global.css via @layer utilities */
.marvel-bg {
  @apply min-h-screen bg-cover bg-center bg-fixed;
  background-image: url('/Marvel_Background.jpg');
}
```

**Estratégia de overlay para legibilidade** — duas camadas: imagem + gradiente escuro translúcido:

```css
.marvel-bg {
  @apply relative min-h-screen overflow-x-hidden;
}
.marvel-bg::before {
  content: '';
  @apply fixed inset-0;
  background-image: url('/Marvel_Background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 0.12; /* reduz drasticamente para não competir com o texto */
  z-index: 0;
}
.marvel-bg > * {
  @apply relative z-10;
}
```

> ⚠️ **Decisão de arquitetura:** O projeto atual usa **CSS Modules**. Para não refatorar componentes existentes, adota-se uma **abordagem híbrida**: instala-se Tailwind como dependência (`tailwindcss`, `postcss`, `autoprefixer`), configurando `vite.config.ts` com o plugin `@tailwindcss/vite`. Componentes NOVOS usam Tailwind; componentes EXISTENTES permanecem com CSS Modules. A classe `.marvel-bg` é injetada via `@layer base` no `global.css`.

### 1.3. Plano de instalação do Tailwind (passo único)

1. `npm install -D tailwindcss @tailwindcss/vite`
2. Em `vite.config.ts`, adicionar `tailwindcss()` ao array de plugins.
3. No topo de `src/assets/styles/global.css`, adicionar `@import "tailwindcss";`
4. Criar a classe `.marvel-bg` (acima) no `global.css`.

---

## 2. Paleta de Cores — Dark Mode Marvel

### 2.1. Variáveis CSS (substituir em `variables.css`)

O tema atual usa `prefers-color-scheme: dark`. A nova identidade Marvel elimina o light mode e fixa o dark mode absoluto:

```css
:root {
  /* Backgrounds */
  --color-bg: #020817;              /* Azul escuro Marvel */
  --color-surface: #0a1a3a;         /* Superfície elevada */
  --color-surface-raised: #0f2248;  /* Cartões / mensagens */

  /* Texto */
  --color-text: #e8e8e8;
  --color-text-primary: #f0f4ff;
  --color-text-secondary: #8899bb;

  /* Acento Marvel */
  --color-primary: #ED1D24;         /* Vermelho Marvel */
  --color-primary-hover: #ff2e35;
  --color-primary-dim: rgba(237, 29, 36, 0.15);

  /* Bordas */
  --border-color: #1a2d55;

  /* Mensagens */
  --color-message-user: #ED1D24;
  --color-message-assistant: var(--color-surface-raised);

  /* Feedback */
  --color-error-bg: rgba(237, 29, 36, 0.12);
  --color-error-border: #ED1D24;
  --color-error-text: #ff6b6b;

  /* Health status */
  --color-health-up: #22c55e;
  --color-health-down: #ef4444;
  --color-health-checking: #f59e0b;  /* Laranja (vs amarelo anterior) */

  --color-dragging-overlay: rgba(237, 29, 36, 0.08);
}

/* Remover o bloco @media (prefers-color-scheme: dark) — dark mode é o padrão */
```

### 2.2. Mapeamento de classes Tailwind utilitárias

| Token | Classe Tailwind |
|-------|----------------|
| `--color-bg` | `bg-[#020817]` |
| `--color-surface` | `bg-[#0a1a3a]` |
| `--color-primary` | `bg-[#ED1D24]` / `text-[#ED1D24]` / `border-[#ED1D24]` |
| `--color-text-primary` | `text-[#f0f4ff]` |
| `--color-text-secondary` | `text-[#8899bb]` |

---

## 3. Animação do Título "MARVEL"

### 3.1. Definição CSS (Keyframes + classe utilitária)

```css
@keyframes marvel-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.marvel-title {
  @apply inline-block;
  animation: marvel-pulse 3s ease-in-out infinite;
}
```

### 3.2. Onde aplicar

No componente `Logo.tsx`, que atualmente renderiza `<h1>GenIA</h1>`:

```tsx
// Logo.tsx — refatorado
export function Logo() {
  return (
    <h1 className="marvel-title text-[#ED1D24] text-xl font-bold tracking-widest uppercase select-none">
      <img src="/Marvel_Logo.jpg" alt="Marvel" className="h-8 w-auto" />
    </h1>
  );
}
```

> **Decisão:** O logo será exibido como imagem (`/Marvel_Logo.jpg`). A animação `marvel-pulse` pode ser aplicada ao container da imagem para o efeito sutil. Caso o Figma exija o texto "MARVEL" em vez da imagem, usar o mesmo `<h1>` com `className="marvel-title text-[#ED1D24]"`.

---

## 4. Componente de Status da API — `<HealthStatus />`

### 4.1. Aproveitamento do existente

Já existe `HealthIndicator.tsx` conectado ao hook `useHealth()`. A refatoração é **puramente visual**: renomear para `HealthStatus` (opcional) e atualizar o mapeamento de estados com os ícones/cores do tema Marvel.

### 4.2. Props esperadas (interface)

```typescript
interface HealthStatusProps {
  status?: 'CHECKING' | 'ONLINE' | 'DOWN';  // Se omitido, usa o hook internamente
  showLabel?: boolean;                       // default: true
  size?: 'sm' | 'md';                       // default: 'sm'
}
```

> **Nota:** O hook `useHealth()` retorna `'UP' | 'DOWN' | 'CHECKING'`. O mapeamento visual exige que `'UP'` seja exibido como `'ONLINE'`. Isso é tratado internamente no componente.

### 4.3. Mapeamento visual

| Estado | Label | Cor | Indicador Visual |
|--------|-------|-----|------------------|
| `CHECKING` | "VERIFICANDO" | Laranja (`#f59e0b`) | Bolinha pulsando (opacity pulse) |
| `ONLINE` | "ONLINE" | Verde (`#22c55e`) | Bolinha fixa |
| `DOWN` | "OFFLINE" | Vermelho (`#ef4444`) | Bolinha fixa com tom mais escuro |

### 4.4. Implementação com Tailwind

```tsx
export function HealthStatus({ status: propStatus, showLabel = true, size = 'sm' }: HealthStatusProps) {
  const { status: hookStatus } = useHealth();
  const currentStatus = propStatus ?? hookStatus;

  const config = {
    CHECKING: { label: 'VERIFICANDO', dotClass: 'bg-[#f59e0b] animate-pulse' },
    ONLINE:   { label: 'ONLINE',      dotClass: 'bg-[#22c55e]' },
    DOWN:     { label: 'OFFLINE',     dotClass: 'bg-[#ef4444]' },
  } as const;

  const { label, dotClass } = config[currentStatus === 'UP' ? 'ONLINE' : currentStatus === 'DOWN' ? 'DOWN' : 'CHECKING'];

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0a1a3a] border border-[#1a2d55]" role="status">
      <span className={`block rounded-full ${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} ${dotClass}`} />
      {showLabel && <span className="text-xs text-[#8899bb] uppercase tracking-wide">{label}</span>}
    </div>
  );
}
```

### 4.5. Integração (sem quebrar Header)

No `Header.tsx`, substituir a importação de `HealthIndicator` por `HealthStatus`:

```
HealthIndicator → HealthStatus
```

A posição no header permanece a mesma: entre o `Logo` e o `NewChatButton`.

---

## 5. Componente de Fontes RAG — `<SourcePanel />`

### 5.1. Propósito

Exibir os trechos de documentos (`.txt`/`.pdf`) utilizados pela IA para gerar a resposta. Renderizado como um **accordion colapsável** fixado logo abaixo de cada mensagem do assistente.

### 5.2. Tipo de dado esperado (extensão do `Message`)

```typescript
// types/message.ts — ADICIONAR (sem remover campos existentes)
export interface Source {
  id: number | string;
  title: string;           // Nome do documento (ex: "contrato.pdf")
  excerpt: string;         // Trecho relevante (100-300 chars)
  relevance?: number;      // Score 0-1 (opcional)
}

// Estender Message — campo opcional
export interface Message {
  id: number;
  conversationId: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
  attachment?: UploadResponse | null;
  sources?: Source[];       // ← NOVO: opcional, apenas ASSISTANT
}
```

### 5.3. Props do `<SourcePanel />`

```typescript
interface SourcePanelProps {
  sources: Source[];
  /** Máximo de itens visíveis antes do "Ver mais" (default: 3) */
  maxVisible?: number;
}
```

### 5.4. Estrutura visual (Tailwind)

```
┌─────────────────────────────────────────────┐
│ 📄 Fontes utilizadas                    ▶   │  ← header clicável (accordion toggle)
├─────────────────────────────────────────────┤
│ 🔹 contrato.pdf                             │
│    "O valor acordado entre as partes..."    │  ← excerpt
│    Relevância: 92%                          │  ← barra ou badge (opcional)
├─────────────────────────────────────────────┤
│ 🔹 relatorio.txt                            │
│    "Conforme análise dos dados..."          │
│    Relevância: 78%                          │
└─────────────────────────────────────────────┘
```

### 5.5. Código de referência

```tsx
import { useState } from 'react';
import type { Source } from '../../types/message';

interface SourcePanelProps {
  sources: Source[];
  maxVisible?: number;
}

export function SourcePanel({ sources, maxVisible = 3 }: SourcePanelProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!sources?.length) return null;

  const visible = expanded ? sources : sources.slice(0, maxVisible);
  const remaining = sources.length - maxVisible;

  return (
    <div className="mt-3 border border-[#1a2d55] rounded-lg overflow-hidden bg-[#0a1a3a]/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#8899bb] hover:text-[#f0f4ff] transition-colors uppercase tracking-wider"
        aria-expanded={open}
      >
        <span>📄 Fontes utilizadas ({sources.length})</span>
        <span className={`transform transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {visible.map((source) => (
            <div key={source.id} className="text-sm">
              <div className="flex items-center gap-1.5 text-[#ED1D24] font-medium text-xs">
                <span>🔹</span>
                <span>{source.title}</span>
              </div>
              <p className="mt-1 text-[#8899bb] text-xs leading-relaxed pl-5">
                {source.excerpt}
              </p>
              {source.relevance !== undefined && (
                <div className="mt-1 pl-5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#1a2d55] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ED1D24] rounded-full transition-all"
                      style={{ width: `${source.relevance * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8899bb]">
                    {Math.round(source.relevance * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
          {!expanded && remaining > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-[#ED1D24] hover:underline pl-5"
            >
              +{remaining} mais
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.6. Onde integrar o SourcePanel

No **`MessageItem.tsx`**, adicionar o `<SourcePanel />` condicionalmente apenas para mensagens do assistente que possuam `sources`:

```tsx
// MessageItem.tsx — modificação mínima
import { SourcePanel } from '../Common/SourcePanel';

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'USER';

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div>{message.content}</div>
      {message.attachment && (
        <AttachmentBadge fileName={message.attachment.fileName} />
      )}
      {!isUser && message.sources && message.sources.length > 0 && (
        <SourcePanel sources={message.sources} />
      )}
      <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
    </div>
  );
}
```

> ⚠️ **Proteção:** A exibição é condicional (`message.sources?.length > 0`). Se o backend não enviar `sources`, o componente simplesmente não renderiza. Zero impacto na lógica de envio/recebimento de mensagens.

---

## 6. Plano de Integração — Onde Cada Elemento se Encaixa

### 6.1. Árvore de componentes pós-refatoração

```
ErrorBoundary
└── SessionProvider
    └── ConversationProvider
        └── ToastProvider
            └── Layout (marvel-bg classe aplicada aqui)
                ├── Header
                │   ├── Hamburger button
                │   ├── Logo (MARVEL com pulse animation)
                │   ├── HealthStatus (substitui HealthIndicator)  ← NOVO
                │   └── NewChatButton
                ├── Sidebar (ConversationHistory — sem alterações)
                ├── <Outlet /> → ChatPage
                │   └── ChatWindow
                │       ├── ErrorMessage
                │       └── MessageList
                │           └── MessageItem
                │               └── SourcePanel (accordion)   ← NOVO
                └── Footer
```

### 6.2. Resumo de arquivos que serão modificados (tocados)

| Arquivo | Ação |
|---------|------|
| `vite.config.ts` | Adicionar plugin `tailwindcss` |
| `package.json` | Adicionar `tailwindcss`, `@tailwindcss/vite`, `postcss`, `autoprefixer` |
| `src/assets/styles/global.css` | Adicionar `@import "tailwindcss"` e classe `.marvel-bg` + `.marvel-title` |
| `src/assets/styles/variables.css` | Substituir paleta pelo dark mode Marvel (#020817, #ED1D24) |
| `src/components/Common/Logo.tsx` | Renderizar imagem `/Marvel_Logo.jpg` + animação pulse |
| `src/components/Common/HealthIndicator.tsx` | Refatorar para `HealthStatus` com nova UI e estados VISUAIS |
| `src/components/Common/HealthIndicator.module.css` | Remover (substituído por Tailwind no HealthStatus) |
| `src/components/Common/SourcePanel.tsx` | **CRIAR** — novo componente |
| `src/types/message.ts` | Adicionar interface `Source` e campo `sources?: Source[]` no `Message` |
| `src/components/Chat/MessageItem.tsx` | Adicionar `SourcePanel` condicional para mensagens ASSISTANT |
| `src/components/Layout/Layout.tsx` | Adicionar classe `marvel-bg` ao elemento raiz |

### 6.3. Arquivos que NÃO serão modificados (preservação total)

| Categoria | Arquivos |
|-----------|----------|
| **Hooks** | `useChat.ts`, `useConversation.ts`, `useHealth.ts`, `useUpload.ts` |
| **Services** | `api.ts`, `chatService.ts`, `healthService.ts`, `uploadService.ts`, `conversationStorage.ts` |
| **Contexts** | `SessionContext.tsx`, `ConversationContext.tsx`, `ToastContext.tsx` |
| **Chat logic** | `ChatWindow.tsx` (só roteia, não muda), `ChatInput.tsx`, `SendButton.tsx`, `TextArea.tsx`, `AttachmentBadge.tsx` |
| **History** | `ConversationHistory.tsx`, `ConversationItem.tsx`, `EmptyHistory.tsx` |
| **Upload** | `UploadArea.tsx`, `DragDropZone.tsx`, `FileSelector.tsx`, `UploadProgress.tsx` |
| **Pages** | `ChatPage.tsx`, `NotFoundPage.tsx` |
| **Router** | `router.tsx`, `App.tsx` |
| **Tests** | Todos os `.test.tsx` (novos testes para SourcePanel e HealthStatus podem ser adicionados) |
| **CSS Modules** | Todos os `.module.css` existentes permanecem intactos |

---

## 7. Checklist de Implementação

- [ ] Instalar Tailwind + configurar Vite + `global.css`
- [ ] Atualizar `variables.css` com paleta Marvel dark mode
- [ ] Adicionar `.marvel-bg` no `Layout.tsx` e no `global.css`
- [ ] Adicionar `.marvel-title` animation no `global.css`
- [ ] Refatorar `Logo.tsx` com imagem e animação pulse
- [ ] Refatorar `HealthIndicator` → `HealthStatus` (Tailwind + estados visuais)
- [ ] Adicionar interface `Source` e campo `sources` em `message.ts`
- [ ] Criar `SourcePanel.tsx` (accordion colapsável com Tailwind)
- [ ] Injetar `<SourcePanel />` em `MessageItem.tsx` (condicional, role ASSISTANT)
- [ ] Rodar `npm run build` e validar que nenhum teste quebrou

---

## 8. Cenários de Borda e Tratamento de Erro

| Cenário | Comportamento Esperado |
|---------|------------------------|
| Backend offline → `HealthStatus` mostra "OFFLINE" vermelho | Continuar exibindo mensagens simuladas (fallback existente) |
| `sources` é `undefined` ou `[]` | `SourcePanel` não renderiza |
| `sources` tem 1 item | Accordion mostra o item direto, sem "Ver mais" |
| `sources` tem > `maxVisible` (ex: 8) | Mostra 3 + link "+5 mais"; ao clicar, expande todos |
| Background imagem falha ao carregar | Fallback para `--color-bg: #020817` (a cor já está no body) |
| Logo imagem falha ao carregar | Exibir texto "MARVEL" com `alt` como fallback |
