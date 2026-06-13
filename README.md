# 🧠 NUCKLEO V2 — DOCUMENTO DE ARQUITETURA E DIRETRIZES DE MIGRAÇÃO TOTAL
### [DOCUMENTO PARA EXECUÇÃO DO AGENTE DO CURSOR - ECOSSISTEMA HOSPEDADO NO RAILWAY]

**ATENÇÃO, CURSOR:** Este arquivo é um guia de execução imperativo. Não deves apagar o design visual premium do Nuckleo, nem alterar a disposição das páginas e componentes. O teu objetivo é realizar uma "cirurgia de bastidores": traduzir a interface de React para HTML/CSS/JS nativos e implementar um ecossistema próprio integrado ao **Railway** (onde o backend Node.js e o MongoDB estão hospedados) e ao servidor Python local.

---

## 1. DIAGNÓSTICO DO PROJETO ATUAL (O QUE DEVE SER REMOVIDO)
Deves desativar e eliminar completamente os seguintes arquivos de configuração e dependências que prendem o projeto ao ecossistema antigo, sem que isso afete o visual do site:
* `vite.config.js` e `vite-env.d.ts` (Remover o empacotador Vite).
* `tailwind.config.js` e `postcss.config.js` (Remover o compilador Tailwind).
* `components.json` (Remover o vínculo do Shadcn UI CLI).
* `package.json` antigo da raiz (Será substituído por estruturas independentes).
* `src/api/base44Client.js` e a pasta `entidades/` (Remover completamente a plataforma Base44).

---

## 2. NOVA ESTRUTURA DE PASTAS (MAPEAMENTO CIRÚRGICO)
Deves reorganizar o espaço de trabalho na seguinte estrutura de pastas. O Frontend será movido para uma pasta isolada e os Backends ficarão em diretórios próprios:

```text
nuckleo/
├── .env                         # Variáveis de ambiente locais (para desenvolvimento)
├── README.md                    # Este guia de instruções
├── frontend/                    # TODO O FRONTEND PREMIUM TRADUZIDO
│   ├── index.html               # Arquivo principal (SPA ou ponto de entrada)
│   ├── style.css                # CSS Puro (Variáveis, Temas e Design Shadcn portados)
│   ├── app.js                   # Motor JS global (Chama as URLs de Produção/Railway)
│   ├── pages/                   # Telas originais portadas do React para HTML/JS
│   │   ├── dashboard.html       # (Baseado em Dashboard.jsx)
│   │   ├── spaces.html          # (Baseado em Spaces.jsx e SpaceDetail.jsx)
│   │   ├── notes.html           # (Baseado em Notes.jsx)
│   │   ├── favorites.html       # (Baseado em Favorites.jsx)
│   │   ├── profile.html         # (Baseado em Profile.jsx e UserProfile.jsx)
│   │   ├── channels.html        # (Baseado em Channels.jsx)
│   │   ├── recents.html         # (Baseado em Recents.jsx)
│   │   ├── tags.html            # (Baseado em Tags.jsx)
│   │   └── templates.html       # (Baseado em Templates.jsx)
│   └── componentes/
│       ├── cards.js             # Lógica nativa para ItemCard, SpaceCard e UserCard
│       └── modals.js            # Lógica dos Modais de Criação, Detalhes e Busca
├── backend-node/                # SERVIDOR PRINCIPAL EXPRESS (PRONTO PARA O RAILWAY)
│   ├── package.json             # Dependências: express, mongoose, cors, dotenv, nodemon
│   └── src/server.js            # Conexão NoSQL MongoDB Atlas e Endpoints REST com CORS
└── backend-python/              # SERVIDOR DE IA LOCAL (FASTAPI + PYMYSQL)
    ├── requirements.txt         # Dependências: fastapi, uvicorn, pymysql
    └── app/main.py              # Endpoints do Agente de IA e Auditoria em MySQL


    3. ESPECIFICAÇÕES DE IMPLEMENTAÇÃO (PASSO A PASSO)
A. CONFIGURAÇÃO DE PRODUÇÃO & REDE (RAILWAY + MONGO)
Backend Node no Railway: No arquivo backend-node/src/server.js, a conexão do Mongoose deve usar obrigatoriamente process.env.MONGO_URI (variável fornecida automaticamente pelo plugin do MongoDB no Railway ou injetada pelo painel). A porta deve escutar dinamicamente process.env.PORT para que o Railway consiga atribuir a porta correta de produção.

Segurança CORS Ativa: Como o frontend rodará de forma estática e o backend estará na nuvem do Railway, deves configurar o middleware cors() no Express para aceitar requisições externas sem bloquear o navegador do usuário.

Endpoint Dinâmico no Frontend (frontend/app.js): Configura uma constante global para gerenciar as URLs das APIs. Em desenvolvimento, aponta para as portas locais, mas deixa preparado o espaço para a URL de produção fornecida pelo Railway (ex: https://nuckleo-production.up.railway.app/api).

B. FRONTEND (Preservação Estética e Funcional)
Tradução de Componentes UI (Antigo Shadcn): Analisa o design dos arquivos em componentes/ui/ (como carousel.jsx, dialog.jsx, tabs.jsx). Substitui-os por elementos HTML estruturados e estilizados nativamente no style.css.

Lógica de Navegação: Transforma a navegação do AppLayout.jsx e BottomNav.jsx num sistema nativo. Podes usar links diretos entre as páginas HTML da pasta pages/ ou criar uma SPA usando manipulação de contêineres (display: block / display: none) disparados pelos cliques no menu lateral e superior, mantendo o visual fluído.

Substituição do Tailwind por CSS3 Puro: Deves ler todas as classes utilitárias aplicadas nos arquivos .jsx e convertê-las em regras de CSS clássico no style.css. Utiliza as seguintes variáveis globais para manter a paleta Dark e Verde-Limão idêntica:

CSS
:root {
    --bg-dark: #0d1117;
    --bg-card: #161b22;
    --bg-input: #090c10;
    --primary: #87ef0e;
    --text-main: #f0f6fc;
    --text-muted: #8b949e;
    --border-color: #30363d;
    --ai-blue: #58a6ff;
}

C. BACKEND PYTHON & AGENTE DE IA (Suporte e Personalização)
Deves configurar uma API FastAPI que servirá de motor local para o Agente de Contexto do Nuckleo. Esse agente ajudará o usuário com dúvidas e dicas de textos, mensagens e códigos.

Endpoint do Agente (/api/ai/agent): Deve receber a mensagem do usuário e o nome da página atual onde ele se encontra. O agente processará o texto e retornará um JSON contendo uma resposta em texto (response) e uma chave de ação (action).

Lógica de Ações da IA:

Se o usuário falar sobre "mudar cor", "tema" ou "personalizar", o agente deve retornar a ação "suggest_theme_change".

Se o usuário perguntar como "criar pasta" ou "novo espaço", o agente deve retornar a ação "highlight_create_space".

Quero uma sugestão de sistema para o agente ajudar o usuário nas escritas de códigos e também de textos e mensagens.

Auditoria Relacional (MySQL): Implementa uma função em Python utilizando a biblioteca pymysql para conectar ao banco MySQL local (MYSQL_DB). Toda vez que o Agente de IA responder, um registro contendo a data, o tamanho da mensagem e a ação tomada deve ser inserido na tabela ai_logs. Se o MySQL estiver temporariamente offline, captura a exceção (try/except) para que a aplicação não trave.

D. INTEGRAÇÃO VISUAL DO AGENTE NO FRONTEND
Cria um painel na lateral direita pra esse chat (adaptando o design do antigo RightSidebar.jsx) que irá interagir com o usuário apenas quando ele clicar nele.

Quando o usuário digitar uma dúvida, o JavaScript do frontend (app.js) faz um POST para o backend Python.

Personalização via IA: Se o JSON de retorno do backend Python contiver a ação "suggest_theme_change", o JavaScript do frontend deve alterar as variáveis de cor do documento em tempo real utilizando:
document.documentElement.style.setProperty('--primary', '#novo-codigo-cor') ou aplicar uma classe de tema (ex: Tema Cyberpunk, Tema Matrix) para demonstrar visualmente a capacidade de personalização do Agente.

4. DIRETRIZES DE EXECUÇÃO PARA O CURSOR
Analise meticulosamente toda a estrutura de arquivos e o design das telas originais. O teu trabalho é puramente de refatoração tecnológica e tradução de código. Gera e escreve os novos arquivos garantindo o funcionamento integrado do ecossistema, a persistência dos dados no MongoDB via Railway e a inteligência do agente de chat local em Python. Faça isso passo a passo, garantindo que o visual do Nuckleo permaneça impecável.


O meu banco MongoDB e o servidor Express do Node estarão rodando no Railway, portanto o código precisa de suporte total a CORS e variáveis dinâmicas de produção para conexões. Por favor, faça a refatoração completa com base nisso e crie o Agente de IA sem alterar a beleza do layout atual.

