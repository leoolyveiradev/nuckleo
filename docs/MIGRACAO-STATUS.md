# Status da migração Nuckleo V2

## Fase 1 — Estrutura inicial ✅

- [x] `frontend/` com HTML/CSS/JS nativo (esqueleto)
- [x] `backend-node/` Express + Mongoose + CORS + Railway-ready
- [x] `backend-python/` FastAPI + agente IA + log MySQL
- [x] `.env` / `.env.example` globais
- [x] Documentação legal e LGPD em `docs/`
- [x] Código React legado em `src/` **preservado**

## Fase 2 — Design ✅

- [x] Portar Dashboard.jsx para `frontend/index.html` + `pages/dashboard.js`
- [x] Portar modais (CreateSpace, CreateItem, Search)
- [x] Portar Profile / UserProfile
- [x] Converter todas as classes Tailwind restantes para `style.css`

## Fase 3 — API Node ✅

- [x] Modelos Mongoose (Space, Item, User, FriendRequest, Notification)
- [x] CRUD REST completo
- [x] Auth JWT
- [ ] Deploy Railway + `MONGO_URI` (manual - requer configuração Railway)

## Fase 4 — Integração ✅

- [x] Frontend consumindo API Node (apiFetch em app.js)
- [x] Agente IA integrado (ai-fab + ai-panel)
- [x] Páginas legais HTML + banner cookies + consentimento

## Fase 5 — Descomissionar stack antiga (pendente)

- [ ] Validar paridade visual e funcional entre src/ e frontend/
- [ ] Remover Vite, Base44, Tailwind, `src/` React (após validação)

### Pages portadas vs originais

| Original (src/) | Novo (frontend/) |
|-----------------|-----------------|
| Dashboard.jsx | dashboard.html + dashboard.js |
| Profile.jsx | profile.html + profile.js |
| UserProfile.jsx | user-profile.html + user-profile.js |
| CreateSpaceModal.jsx | modals.js (openCreateSpaceModal) |
| CreateItemModal.jsx | modals.js (openCreateItemModal) |
| SearchModal.jsx | modals.js (openSearchModal) |

### Páginas legais criadas

- `frontend/pages/privacy.html` - Política de Privacidade
- `frontend/pages/terms.html` - Termos de Uso
- `frontend/componentes/cookies.js` - Banner de cookies + consentimento