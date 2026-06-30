# Changelog

## [2.0.0] - 2026-06-30

### Adicionado
- Documentação: README.md, CHANGELOG.md, LICENSE (MIT)
- Suporte a async polling para mensagens longas (Ollama)
- Upload de documentos com ingestão (PDF, TXT, HTML, DOCX, imagens)
- Ingestão por URL
- Painel de documentos na sidebar
- Indicador de saúde da API com status do Ollama
- Auto-scroll no chat com detecção de scroll manual
- Retry automático com backoff exponencial para criação de sessão
- Armazenamento local de conversas e mensagens (localStorage)
- Tema escuro Marvel
- Responsividade mobile/tablet/desktop
- Atalho de teclado Ctrl+K para focar no input

### Alterado
- Migração de chamadas síncronas para async polling com task status
- Separação de tipos e interfaces em arquivos dedicados em `src/types/`
- Melhoria no tratamento de erros com `HttpError` e `AppError`
- Componentização do chat (ChatWindow, MessageList, MessageItem, ChatInput)
- Separação de hooks por domínio (useChat, useConversation, useUpload, useHealth, useDocuments)

### Corrigido
- Sessão expirada agora recria automaticamente nova sessão
- Upload de arquivo com progresso via XMLHttpRequest
- Validação de mensagem vazia e tamanho máximo
- Scroll automático na primeira carga e novas mensagens

### Infrastructure
- Dockerfile multi-stage (node:20-alpine + nginx:alpine)
- nginx.conf com proxy reverso para backend
- Proxy do Vite configurado para /api → localhost:8080
- Oxlint para linting
- Vitest para testes unitários
