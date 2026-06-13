/**
 * Dashboard — portado de Dashboard.jsx
 */

const QUICK_ACTIONS = [
    { label: 'Adicionar Link', sub: 'Salve links úteis', icon: 'link-2', color: 'qa--primary', type: 'link' },
    { label: 'Novo Texto', sub: 'Escreva algo', icon: 'file-text', color: 'qa--blue', type: 'note' },
    { label: 'Enviar Arquivo', sub: 'PDFs, docs e mais', icon: 'file-up', color: 'qa--purple', type: 'file' },
    { label: 'Nova Pasta', sub: 'Organize seus itens', icon: 'folder-plus', color: 'qa--orange', type: 'space' },
    { label: 'Novo Código', sub: 'Salve trechos de código', icon: 'code-2', color: 'qa--cyan', type: 'code' },
];

const TYPE_LABELS = { note: 'Texto', link: 'Link', code: 'Código', file: 'Arquivo' };
const TYPE_COLORS = {
    note: 'type--note', link: 'type--link', code: 'type--code', file: 'type--file',
};
const ITEM_TABS = ['Todos', 'Links', 'Textos', 'Arquivos', 'Códigos', 'Imagens', 'Pastas'];
const SPACE_EMOJI_BG = ['space-emoji--1', 'space-emoji--2', 'space-emoji--3', 'space-emoji--4'];
const AVATAR_COLORS = ['av--1', 'av--2', 'av--3'];

const DEMO_SPACES = [
    { id: 's1', title: 'Projetos pessoais', emoji: '🚀', item_count: 12, created_date: new Date().toISOString() },
    { id: 's2', title: 'Estudos', emoji: '📚', item_count: 8, created_date: new Date().toISOString() },
    { id: 's3', title: 'Referências', emoji: '💡', item_count: 5, created_date: new Date().toISOString() },
];

const DEMO_ITEMS = [
    { id: 'i1', title: 'Documentação React', type: 'link', space_id: 's1', is_favorite: true, created_date: new Date().toISOString() },
    { id: 'i2', title: 'Ideias para o Nuckleo', type: 'note', space_id: 's1', is_favorite: false, created_date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'i3', title: 'utils.js', type: 'code', space_id: 's2', is_favorite: false, created_date: new Date(Date.now() - 172800000).toISOString() },
    { id: 'i4', title: 'Briefing.pdf', type: 'file', space_id: 's3', is_favorite: true, created_date: new Date(Date.now() - 3600000).toISOString() },
];

let state = {
    spaces: [],
    items: [],
    activeTab: 'Todos',
    createItemType: 'note',
};

function getGreeting(name) {
    const hour = new Date().getHours();
    const firstName = (name || 'Usuário').split(' ')[0];
    if (hour < 12) return `Bom dia, ${firstName}! 👋`;
    if (hour < 18) return `Boa tarde, ${firstName}! 👋`;
    return `Boa noite, ${firstName}! 👋`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    const hm = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (diffDays === 0) return `Hoje ${hm}`;
    if (diffDays === 1) return `Ontem ${hm}`;
    return `${diffDays}d atrás`;
}

function loadLocalData() {
    const spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || 'null');
    const items = JSON.parse(localStorage.getItem('nuckleo_items') || 'null');
    state.spaces = spaces?.length ? spaces : DEMO_SPACES;
    state.items = items?.length ? items : DEMO_ITEMS;
    if (!spaces) localStorage.setItem('nuckleo_spaces', JSON.stringify(state.spaces));
    if (!items) localStorage.setItem('nuckleo_items', JSON.stringify(state.items));
}

async function fetchApiData() {
    try {
        const [spacesRes, itemsRes] = await Promise.all([
            window.Nuckleo.apiFetch('/spaces').catch(() => null),
            window.Nuckleo.apiFetch('/items').catch(() => null),
        ]);
        if (Array.isArray(spacesRes)) state.spaces = spacesRes;
        if (Array.isArray(itemsRes)) state.items = itemsRes;
    } catch { /* usa local */ }
}

function filterItems() {
    const tab = state.activeTab;
    return state.items.filter((item) => {
        if (tab === 'Todos') return true;
        if (tab === 'Links') return item.type === 'link';
        if (tab === 'Textos') return item.type === 'note';
        if (tab === 'Arquivos') return item.type === 'file';
        if (tab === 'Códigos') return item.type === 'code';
        return true;
    });
}

function itemIcon(type) {
    const map = { link: 'link-2', code: 'code-2', file: 'file-up', note: 'file-text' };
    return NuckleoIcons.icon(map[type] || 'file-text', 'icon-xs');
}

function renderQuickActions() {
    const el = document.getElementById('quick-actions');
    if (!el) return;
    el.innerHTML = QUICK_ACTIONS.map((a) => `
        <button type="button" class="quick-action" data-action-type="${a.type}">
            <div class="quick-action-icon ${a.color}">${NuckleoIcons.icon(a.icon, 'icon-md')}</div>
            <div class="quick-action-text">
                <p class="quick-action-label">${a.label}</p>
                <p class="quick-action-sub">${a.sub}</p>
            </div>
        </button>
    `).join('');

    el.querySelectorAll('.quick-action').forEach((btn) => {
        btn.addEventListener('click', () => handleQuickAction(btn.dataset.actionType));
    });
    NuckleoIcons.refreshIcons();
}

function renderSpaces() {
    const el = document.getElementById('spaces-grid');
    if (!el) return;

    const chips = state.spaces.slice(0, 3).map((space, i) => `
        <a href="./pages/spaces.html?id=${space.id}" class="space-chip">
            <div class="space-chip-top">
                <div class="space-emoji ${SPACE_EMOJI_BG[i % SPACE_EMOJI_BG.length]}">${space.emoji || '📁'}</div>
                <span class="text-dim-xs">${space.item_count || 0} itens</span>
            </div>
            <p class="space-chip-title">${space.title}</p>
            <div class="space-chip-avatars">
                <div class="avatar-stack">
                    ${AVATAR_COLORS.map((c) => `<span class="avatar-dot ${c}"></span>`).join('')}
                </div>
                <span class="text-dim-xs">+2</span>
            </div>
        </a>
    `).join('');

    el.innerHTML = chips + `
        <button type="button" class="space-chip space-chip--new" id="btn-new-space-grid" data-action="create-space">
            ${NuckleoIcons.icon('plus', 'icon-md')}
            <span>Novo Space</span>
        </button>
    `;

    document.getElementById('btn-new-space-grid')?.addEventListener('click', () => NuckleoModals.openCreateSpaceModal());
    NuckleoIcons.refreshIcons();
}

function renderTabs() {
    const el = document.getElementById('item-tabs');
    if (!el) return;
    el.innerHTML = ITEM_TABS.map((tab) => `
        <button type="button" class="item-tab ${state.activeTab === tab ? 'item-tab--active' : ''}" data-tab="${tab}">${tab}</button>
    `).join('');

    el.querySelectorAll('.item-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.tab;
            renderTabs();
            renderRecentItems();
        });
    });
}

function renderRecentItems() {
    const el = document.getElementById('recent-list');
    if (!el) return;

    const filtered = filterItems().slice(0, 10);

    if (!filtered.length) {
        el.innerHTML = `
            <div class="empty-state">
                <p>Nenhum item ainda.</p>
                <button type="button" class="link-primary" id="btn-first-item">+ Criar primeiro item</button>
            </div>`;
        document.getElementById('btn-first-item')?.addEventListener('click', () => {
            state.createItemType = 'note';
            handleQuickAction('note');
        });
        return;
    }

    el.innerHTML = filtered.map((item, i) => {
        const typeCls = TYPE_COLORS[item.type] || TYPE_COLORS.note;
        const spaceTitle = state.spaces.find((s) => s.id === item.space_id)?.title || '';
        const starCls = item.is_favorite ? 'star--active' : '';
        return `
            <div class="recent-row" data-item-id="${item.id}" style="animation-delay:${i * 30}ms">
                <div class="recent-icon ${typeCls}">${itemIcon(item.type)}</div>
                <div class="recent-info">
                    <p class="recent-title">${item.title}</p>
                    ${spaceTitle ? `<p class="recent-space">${spaceTitle}</p>` : ''}
                </div>
                <span class="recent-badge ${typeCls}">${TYPE_LABELS[item.type] || 'Item'}</span>
                <span class="recent-date">${formatDate(item.created_date)}</span>
                <div class="recent-actions">
                    <button type="button" class="btn-icon btn-fav ${starCls}" data-fav="${item.id}" aria-label="Favorito">
                        ${NuckleoIcons.icon('star', 'icon-xs')}
                    </button>
                    <button type="button" class="btn-icon" aria-label="Mais">${NuckleoIcons.icon('more-horizontal', 'icon-xs')}</button>
                </div>
            </div>`;
    }).join('');

    el.querySelectorAll('.btn-fav').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.fav);
        });
    });

    el.querySelectorAll('.recent-row').forEach((row) => {
        row.addEventListener('click', () => {
            const item = state.items.find((i) => i.id === row.dataset.itemId);
            if (item) NuckleoModals.openItemDetailModal(item);
        });
    });

    NuckleoIcons.refreshIcons();
}

function toggleFavorite(id) {
    state.items = state.items.map((i) => i.id === id ? { ...i, is_favorite: !i.is_favorite } : i);
    localStorage.setItem('nuckleo_items', JSON.stringify(state.items));
    renderRecentItems();
    NuckleoRightSidebar.renderRightSidebar(state.items);
}

function handleQuickAction(type) {
    if (type === 'space') {
        NuckleoModals.openCreateSpaceModal();
        return;
    }
    state.createItemType = type;
    if (!state.spaces.length) {
        NuckleoModals.openNoSpaceModal();
        return;
    }
    NuckleoModals.openCreateItemModal(state.spaces[0].id, type);
}

function bindHeader() {
    document.getElementById('btn-new-item')?.addEventListener('click', () => NuckleoModals.openCreateSpaceModal());
}

function renderGreeting() {
    const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{"full_name":"Usuário"}');
    const el = document.getElementById('greeting');
    if (el) el.textContent = getGreeting(user.full_name);
}

async function initDashboard() {
    loadLocalData();
    await fetchApiData();

    renderGreeting();
    renderQuickActions();
    renderSpaces();
    renderTabs();
    renderRecentItems();
    bindHeader();

    NuckleoRightSidebar.renderRightSidebar(state.items);
}

document.addEventListener('DOMContentLoaded', initDashboard);

window.NuckleoDashboard = { state, initDashboard, toggleFavorite };
