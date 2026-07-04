# Estrutura do Nuckleo2.1

## Raiz do projeto

- .eslintrc.js
- eslint.config.js
- manifest.json
- README.md
- estrutura-do-nuckleo.md

## backend-node

- package.json
- Procfile
- server.js

### backend-node/src

- middleware/
  - auth.js
- models/
  - FriendRequest.js
  - Item.js
  - Notification.js
  - Space.js
  - User.js
- routes/
  - friends.js
  - items.js
  - notifications.js
  - spaces.js
  - users.js

## backend-python

- requirements.txt

### backend-python/app

- __init__.py
- auth.py
- database.py
- main.py
- routers/
  - __init__.py
  - auth.py
  - friends.py
  - items.py
  - notifications.py
  - spaces.py
  - users.py
- schemas/
  - __init__.py
  - auth.py
  - friends.py
  - items.py
  - notifications.py
  - spaces.py
  - users.py

## docs

- app.js
- index.html
- MIGRACAO-STATUS.md
- README.md
- style.css
- diretrizes/
  - codigo-de-conduta.md
  - conteudo-e-comunidade.md
- legal/
  - aviso-legal.md
  - politica-de-cookies.md
  - politica-de-privacidade.md
  - termos-de-uso.md
- lgpd/
  - checklist-conformidade.md
  - politica-de-seguranca.md
  - procedimento-incidentes.md
  - registro-de-tratamento.md

## frontend

- app.js
- index.html
- style.css
- componentes/
  - cards.js
  - cookies.js
  - icons.js
  - layout.js
  - modals.js
  - profile.js
  - right-sidebar.js
  - user-profile.js
- pages/
  - _page-shell.js
  - channels.html
  - classes.html
  - courses.html
  - dashboard.html
  - dashboard.js
  - favorites.html
  - favorites.js
  - feature-page.js
  - friends.html
  - import.html
  - items.html
  - items.js
  - library.html
  - messages.html
  - notes.html
  - privacy.html
  - privacy.js
  - profile.html
  - recents.html
  - recents.js
  - space.js
  - spaces.html
  - spaces.js
  - tags.html
  - templates.html
  - terms.html
  - terms.js
  - user-profile.html

## src

- App.jsx
- index.css
- main.jsx
- api/
- componentes/
  - ProtectedRoute.jsx
  - UserNotRegisteredError.jsx
  - cards/
  - layout/
  - modals/
  - search/
  - ui/
- hooks/
  - use-mobile.jsx
- imgs/
- lib/
  - app-params.js
  - AuthContext.jsx
  - PageNotFound.jsx
  - query-client.js
  - utils.js
- pages/
  - Channels.jsx
  - Classes.jsx
  - Courses.jsx
  - Dashboard.jsx
  - Favorites.jsx
  - FeaturePage.jsx
  - Friends.jsx
  - Import.jsx
  - Items.jsx
  - Library.jsx
  - Messages.jsx
  - Notes.jsx
  - Notifications.jsx
  - Profile.jsx
  - Recents.jsx
  - SpaceDetail.jsx
  - Spaces.jsx
  - Tags.jsx
  - Templates.jsx
  - UserProfile.jsx
- utils/
  - index.ts
