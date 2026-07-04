/**
 * Sidebar, TopBar e BottomNav — portados de Sidebar.jsx, TopBar.jsx, BottomNav.jsx
 */

const NAV_ICONS = {
    'Início': 'home', 'Spaces': 'layers', 'Itens': 'file-text', 'Favoritos': 'star',
    'Recentes': 'clock', 'Livraria': 'book-open', 'Cursos': 'graduation-cap',
    'Aulas': 'book-marked', 'Anotações': 'pen-line', 'Grupos': 'users',
    'Canais': 'radio', 'Mensagens': 'messages-square', 'Tags': 'tag',
    'Template': 'layout-template', 'Importar': 'download',
};

const NAV_SECTIONS = [
    {
        items: [
            { href: './index.html', label: 'Início' },
            { href: './pages/spaces.html', label: 'Spaces' },
            { href: './pages/items.html', label: 'Itens' },
            { href: './pages/favorites.html', label: 'Favoritos' },
            { href: './pages/recents.html', label: 'Recentes' },
            { href: './pages/library.html', label: 'Livraria' },
        ],
    },
    {
        label: 'APRENDIZADO',
        items: [
            { href: './pages/courses.html', label: 'Cursos' },
            { href: './pages/classes.html', label: 'Aulas' },
            { href: './pages/notes.html', label: 'Anotações' },
        ],
    },
    {
        label: 'COMUNIDADE',
        items: [
            { href: './pages/friends.html', label: 'Grupos' },
            { href: './pages/channels.html', label: 'Canais' },
            { href: './pages/messages.html', label: 'Mensagens' },
        ],
    },
    {
        label: 'FERRAMENTAS',
        items: [
            { href: './pages/tags.html', label: 'Tags' },
            { href: './pages/templates.html', label: 'Template' },
            { href: './pages/import.html', label: 'Importar' },
        ],
    },
];

const MOBILE_NAV = [
    { file: null, label: 'Início', icon: 'home' },
    { file: 'spaces.html', label: 'Spaces', icon: 'layers' },
    { file: 'favorites.html', label: 'Favoritos', icon: 'star' },
    { file: 'friends.html', label: 'Firma', icon: 'users' },
    { file: 'profile.html', label: 'Perfil', icon: 'user' },
];

const STORAGE_PCT = 62;

function resolveHref(href) {
    const inPages = document.body.dataset.pagePath === 'pages';
    if (!inPages) return href;
    if (href === './index.html') return '../index.html';
    return href.replace('./pages/', './');
}

function renderSidebar() {
    const el = document.getElementById('sidebar');
    if (!el) return;

    const circumference = 2 * Math.PI * 26;
    const offset = circumference * (1 - STORAGE_PCT / 100);

    let html = '<nav class="sidebar-nav">';

    NAV_SECTIONS.forEach((section) => {
        if (section.label) html += `<p class="nav-section-label">${section.label}</p>`;
        section.items.forEach((item) => {
            const ic = NAV_ICONS[item.label] || 'circle';
            html += `<a class="nav-link" href="${resolveHref(item.href)}">${NuckleoIcons.icon(ic, 'icon-nav')}<span>${item.label}</span></a>`;
        });
    });

    html += `</nav>
        <div class="sidebar-storage">
            <div class="storage-ring">
                <svg viewBox="0 0 64 64" class="storage-svg">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#1e1e1e" stroke-width="6"/>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--primary)" stroke-width="6"
                        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
                </svg>
                <span class="storage-pct">${STORAGE_PCT}%</span>
            </div>
            <p class="text-dim-sm">Armazenamento</p>
            <p class="storage-gb"><strong>12.4</strong> / 20 GB</p>
            <button type="button" class="btn-storage">Gerenciar plano</button>
        </div>`;

    el.innerHTML = html;
    NuckleoIcons.refreshIcons();
}

function renderTopbar(user = {}) {
    const el = document.getElementById('topbar');
    if (!el) return;

    const handle = user.username || user.email?.split('@')[0] || 'usuario';
    const initial = user.full_name?.charAt(0)?.toUpperCase() || '?';
    const profileHref = document.body.dataset.pagePath === 'pages' ? './profile.html' : './pages/profile.html';

    el.innerHTML = `
        <button class="search-btn" type="button" id="open-search">
            ${NuckleoIcons.icon('search', 'icon-sm')}
            <span class="search-placeholder">Buscar no Nuckleo...</span>
        </button>
        <div class="topbar-spacer"></div>
        <div class="topbar-actions">
            <a href="${resolveHref('./pages/notifications.html')}" class="topbar-icon-btn" aria-label="Notificações">
                ${NuckleoIcons.icon('bell', 'icon-sm')}
                <span class="notif-dot"></span>
            </a>
            <button type="button" class="topbar-icon-btn" aria-label="Menu">${NuckleoIcons.icon('align-justify', 'icon-sm')}</button>
            <a href="${profileHref}" class="topbar-profile">
                <div class="topbar-avatar">${user.avatar_url ? `<img src="${user.avatar_url}" alt="">` : initial}</div>
                <div class="topbar-profile-text">
                    <span class="topbar-name">${user.full_name || 'Usuário'}</span>
                    <span class="topbar-handle">@${handle}</span>
                </div>
                ${NuckleoIcons.icon('chevron-down', 'icon-xs')}
            </a>
        </div>
    `;

    document.getElementById('open-search')?.addEventListener('click', () => {
        if (window.NuckleoModals?.openSearchModal) NuckleoModals.openSearchModal();
    });

    NuckleoIcons.refreshIcons();
}

function renderBottomNav() {
    const el = document.getElementById('bottom-nav');
    if (!el) return;

    const inPages = document.body.dataset.pagePath === 'pages';
    el.innerHTML = MOBILE_NAV.map((item) => {
        const href = item.file === null
            ? (inPages ? '../index.html' : './index.html')
            : (inPages ? `./${item.file}` : `./pages/${item.file}`);
        return `<a href="${href}">${NuckleoIcons.icon(item.icon, 'icon-nav')}<span>${item.label}</span></a>`;
    }).join('');

    NuckleoIcons.refreshIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{"full_name":"Usuário"}');
    renderSidebar();
    renderTopbar(user);
    if (document.getElementById('bottom-nav')) renderBottomNav();
});

window.NuckleoLayout = { renderSidebar, renderTopbar, renderBottomNav, resolveHref };
