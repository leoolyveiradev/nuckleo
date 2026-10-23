/**
 * profile.js — Página de perfil do usuário logado
 */

const NuckleoProfile = (() => {

    /* ── Estado ── */
    let user = {};
    let editing = false;
    let activeTab = 'spaces';

    /* ── Mock de dados ── */
    const MOCK_USER = {
        full_name: 'Leonardo Oliveira',
        username: 'leo.oliveira',
        email: 'leo@nuckleo.app',
        bio: 'Construindo meu segundo cérebro. Designer, dev e eterno curioso.',
        avatar_url: '',
        location: 'Fortaleza, Brasil',
        website: 'https://leooli.dev',
        joined: '2024-11',
        followers: 142,
        following: 38,
        spaces_count: 11,
        items_count: 274,
    };

    const MOCK_SPACES = [
        { id: 's1', title: 'Design System 2025', icon: 'palette', item_count: 34, visibility: 'public' },
        { id: 's2', title: 'Projetos pessoais', icon: 'rocket', item_count: 18, visibility: 'private' },
        { id: 's3', title: 'Referências dev', icon: 'code', item_count: 61, visibility: 'public' },
        { id: 's4', title: 'Leitura & estudos', icon: 'book', item_count: 22, visibility: 'private' },
    ];

    const MOCK_ITEMS = [
        { id: 'i1', title: 'Componentes Headless UI', type: 'link', space: 'Design System 2025' },
        { id: 'i2', title: 'Rascunho — manifesto do produto', type: 'note', space: 'Projetos pessoais' },
        { id: 'i3', title: 'useDebounce hook', type: 'code', space: 'Referências dev' },
        { id: 'i4', title: 'Clean Architecture — resumo', type: 'note', space: 'Leitura & estudos' },
        { id: 'i5', title: 'Paleta de cores Nuckleo', type: 'file', space: 'Design System 2025' },
        { id: 'i6', title: 'API routes pattern', type: 'code', space: 'Referências dev' },
    ];

    /* ── Helpers ── */
    function initials(name) {
        return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    }

    function formatJoined(ym) {
        if (!ym) return '';
        const [y, m] = ym.split('-');
        const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return `${months[parseInt(m, 10) - 1]} ${y}`;
    }

    function itemIcon(type) {
        return { note: 'file-text', link: 'link', code: 'code', file: 'paperclip' }[type] || 'file';
    }

    /* ── Render principal ── */
    function render() {
        const el = document.getElementById('profile-content');
        if (!el) return;

        el.innerHTML = `
            <div class="prof-page">

                <!-- Cover + avatar -->
                <div class="prof-cover">
                    <div class="prof-cover-bg"></div>
                    <div class="prof-avatar-wrap">
                        <div class="prof-avatar">
                            ${user.avatar_url
                                ? `<img src="${user.avatar_url}" alt="${user.full_name}">`
                                : `<span>${initials(user.full_name)}</span>`}
                        </div>
                        ${editing ? `
                            <button type="button" class="prof-avatar-edit" id="btn-change-avatar" title="Alterar foto">
                                ${NuckleoIcons.icon('camera', 'icon-xs')}
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Info + ações -->
                <div class="prof-header">
                    <div class="prof-identity">
                        ${editing ? `
                            <input class="prof-edit-name input" id="edit-name" value="${user.full_name || ''}" placeholder="Seu nome" />
                            <input class="prof-edit-handle input" id="edit-handle" value="${user.username || ''}" placeholder="@username" />
                        ` : `
                            <h1 class="prof-name">${user.full_name || 'Usuário'}</h1>
                            <span class="prof-handle">@${user.username || 'usuario'}</span>
                        `}
                    </div>

                    <div class="prof-actions">
                        ${editing ? `
                            <button type="button" class="btn-ghost-sm" id="btn-cancel-edit">Cancelar</button>
                            <button type="button" class="btn-primary-sm" id="btn-save-edit">Salvar</button>
                        ` : `
                            <button type="button" class="btn-ghost-sm" id="btn-edit-profile">
                                ${NuckleoIcons.icon('pencil', 'icon-xs')} Editar perfil
                            </button>
                        `}
                    </div>
                </div>

                <!-- Bio + meta -->
                <div class="prof-meta-row">
                    <div class="prof-meta-left">
                        ${editing ? `
                            <textarea class="prof-edit-bio input textarea" id="edit-bio" rows="2" placeholder="Sua bio...">${user.bio || ''}</textarea>
                            <div class="prof-edit-fields">
                                <input class="input" id="edit-location" value="${user.location || ''}" placeholder="Localização" />
                                <input class="input" id="edit-website" value="${user.website || ''}" placeholder="Website" />
                            </div>
                        ` : `
                            ${user.bio ? `<p class="prof-bio">${user.bio}</p>` : ''}
                            <div class="prof-meta-items">
                                ${user.location ? `<span>${NuckleoIcons.icon('map-pin', 'icon-xs')} ${user.location}</span>` : ''}
                                ${user.website ? `<a href="${user.website}" target="_blank" rel="noopener">${NuckleoIcons.icon('link', 'icon-xs')} ${user.website.replace(/^https?:\/\//, '')}</a>` : ''}
                                ${user.joined ? `<span>${NuckleoIcons.icon('calendar', 'icon-xs')} Desde ${formatJoined(user.joined)}</span>` : ''}
                            </div>
                        `}
                    </div>

                    <!-- Stats -->
                    <div class="prof-stats">
                        <div class="prof-stat">
                            <span class="prof-stat-val">${user.spaces_count ?? 0}</span>
                            <span class="prof-stat-lbl">Espaços</span>
                        </div>
                        <div class="prof-stat">
                            <span class="prof-stat-val">${user.items_count ?? 0}</span>
                            <span class="prof-stat-lbl">Itens</span>
                        </div>
                        <div class="prof-stat">
                            <span class="prof-stat-val">${user.followers ?? 0}</span>
                            <span class="prof-stat-lbl">Seguidores</span>
                        </div>
                        <div class="prof-stat">
                            <span class="prof-stat-val">${user.following ?? 0}</span>
                            <span class="prof-stat-lbl">Seguindo</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="prof-tabs" id="prof-tabs">
                    <button class="prof-tab ${activeTab === 'spaces' ? 'prof-tab--active' : ''}" data-tab="spaces">
                        ${NuckleoIcons.icon('layers', 'icon-xs')} Espaços
                    </button>
                    <button class="prof-tab ${activeTab === 'items' ? 'prof-tab--active' : ''}" data-tab="items">
                        ${NuckleoIcons.icon('file-text', 'icon-xs')} Itens recentes
                    </button>
                    <button class="prof-tab ${activeTab === 'activity' ? 'prof-tab--active' : ''}" data-tab="activity">
                        ${NuckleoIcons.icon('activity', 'icon-xs')} Atividade
                    </button>
                </div>

                <!-- Conteúdo da tab -->
                <div class="prof-tab-content" id="prof-tab-content">
                    ${renderTabContent()}
                </div>

            </div>
        `;

        NuckleoIcons.refreshIcons();
        bindEvents();
    }

    /* ── Conteúdo das tabs ── */
    function renderTabContent() {
        if (activeTab === 'spaces') return renderSpacesTab();
        if (activeTab === 'items') return renderItemsTab();
        if (activeTab === 'activity') return renderActivityTab();
        return '';
    }

    function renderSpacesTab() {
        const spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || 'null') || MOCK_SPACES;
        if (!spaces.length) {
            return `<div class="prof-empty">${NuckleoIcons.icon('layers', 'icon-md')}<p>Nenhum espaço criado ainda</p>
                <button type="button" class="btn-primary-sm" onclick="NuckleoModals.openCreateSpaceModal()">Criar espaço</button></div>`;
        }
        return `<div class="prof-spaces-grid">
            ${spaces.map(s => `
                <div class="prof-space-card">
                    <div class="prof-space-icon">${NuckleoIcons.icon(s.icon || 'folder', 'icon-sm')}</div>
                    <div class="prof-space-info">
                        <p class="prof-space-title">${s.title}</p>
                        <p class="prof-space-meta">${s.item_count ?? 0} itens · ${s.visibility === 'public' ? 'Público' : 'Privado'}</p>
                    </div>
                    <span class="prof-space-vis ${s.visibility === 'public' ? 'vis--pub' : 'vis--priv'}">
                        ${NuckleoIcons.icon(s.visibility === 'public' ? 'globe' : 'lock', 'icon-xs')}
                    </span>
                </div>
            `).join('')}
        </div>`;
    }

    function renderItemsTab() {
        const items = JSON.parse(localStorage.getItem('nuckleo_items') || 'null') || MOCK_ITEMS;
        if (!items.length) {
            return `<div class="prof-empty">${NuckleoIcons.icon('file-text', 'icon-md')}<p>Nenhum item salvo ainda</p></div>`;
        }
        return `<div class="prof-items-list">
            ${items.slice(0, 10).map(i => `
                <div class="prof-item-row">
                    <div class="prof-item-icon">${NuckleoIcons.icon(itemIcon(i.type), 'icon-sm')}</div>
                    <div class="prof-item-info">
                        <p class="prof-item-title">${i.title}</p>
                        ${i.space ? `<p class="prof-item-space">${i.space}</p>` : ''}
                    </div>
                    <span class="prof-item-type">${i.type}</span>
                </div>
            `).join('')}
        </div>`;
    }

    function renderActivityTab() {
        const events = [
            { icon: 'plus-circle', text: 'Criou o espaço <strong>Design System 2025</strong>', time: 'há 2 dias' },
            { icon: 'file-plus', text: 'Adicionou <strong>useDebounce hook</strong> em Referências dev', time: 'há 3 dias' },
            { icon: 'user-plus', text: 'Começou a seguir <strong>Ana Lima</strong>', time: 'há 5 dias' },
            { icon: 'star', text: 'Favoritou o espaço <strong>Arquitetura limpa</strong>', time: 'há 1 semana' },
            { icon: 'share-2', text: 'Compartilhou <strong>Projetos pessoais</strong> com João Silva', time: 'há 2 semanas' },
        ];
        return `<div class="prof-activity">
            ${events.map(e => `
                <div class="prof-activity-row">
                    <div class="prof-activity-icon">${NuckleoIcons.icon(e.icon, 'icon-sm')}</div>
                    <div class="prof-activity-info">
                        <p class="prof-activity-text">${e.text}</p>
                        <p class="prof-activity-time">${e.time}</p>
                    </div>
                </div>
            `).join('')}
        </div>`;
    }

    /* ── Eventos ── */
    function bindEvents() {
        /* Tabs */
        document.getElementById('prof-tabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.prof-tab');
            if (!btn) return;
            activeTab = btn.dataset.tab;
            render();
        });

        /* Editar */
        document.getElementById('btn-edit-profile')?.addEventListener('click', () => {
            editing = true; render();
        });

        document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
            editing = false; render();
        });

        document.getElementById('btn-save-edit')?.addEventListener('click', () => {
            user.full_name = document.getElementById('edit-name')?.value || user.full_name;
            user.username  = document.getElementById('edit-handle')?.value.replace('@', '') || user.username;
            user.bio       = document.getElementById('edit-bio')?.value || '';
            user.location  = document.getElementById('edit-location')?.value || '';
            user.website   = document.getElementById('edit-website')?.value || '';

            localStorage.setItem('nuckleo_user', JSON.stringify(user));

            editing = false;
            render();

            /* Atualiza topbar com novo nome */
            if (window.NuckleoLayout) NuckleoLayout.renderTopbar(user);
        });
    }

    /* ── Init ── */
    function init() {
        const stored = localStorage.getItem('nuckleo_user');
        user = stored ? { ...MOCK_USER, ...JSON.parse(stored) } : { ...MOCK_USER };
        render();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { init, render };

})();
