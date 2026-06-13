/**
 * RightSidebar — portado de RightSidebar.jsx
 */

function getMiniCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return { days, today, monthName, year };
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
}

const ACTIVITY_COLORS = {
    note: 'activity-icon--note',
    link: 'activity-icon--link',
    file: 'activity-icon--file',
    code: 'activity-icon--code',
};

const QUICK_ACCESS = [
    { label: 'Notas rápidas', icon: 'file-text', href: './pages/notes.html' },
    { label: 'Meus Favoritos', icon: 'star', href: './pages/favorites.html' },
    { label: 'Importar Conteúdo', icon: 'download', href: './pages/import.html' },
    { label: 'Templates', icon: 'layout-template', href: './pages/templates.html' },
];

function renderRightSidebar(recentItems = []) {
    const el = document.getElementById('right-sidebar');
    if (!el) return;

    const { days, today, monthName, year } = getMiniCalendar();
    function pageHref(path) {
        const clean = path.replace('./pages/', '');
        return document.body.dataset.pagePath === 'pages' ? `./${clean}` : `./pages/${clean}`;
    }

    const activities = recentItems.length
        ? recentItems.slice(0, 5).map((item) => {
            const colorCls = ACTIVITY_COLORS[item.type] || ACTIVITY_COLORS.note;
            const actionText = item.type === 'file' ? 'Você enviou um arquivo'
                : item.type === 'link' ? 'Você adicionou um link'
                    : item.is_favorite ? 'Você favoritou um item'
                        : 'Você adicionou um novo item';
            const iconName = item.type === 'link' ? 'link-2' : 'file-text';
            return `
                <div class="activity-row">
                    <div class="activity-icon ${colorCls}">${NuckleoIcons.icon(iconName, 'icon-sm')}</div>
                    <div class="activity-text">
                        <p>${actionText}</p>
                        <p class="activity-title">${item.title}</p>
                        <p class="activity-time">${timeAgo(item.created_date)}</p>
                    </div>
                </div>`;
        }).join('')
        : '<p class="text-dim-sm">Sem atividades ainda</p>';

    const quickAccess = QUICK_ACCESS.map((qa) => `
        <a href="${pageHref(qa.href)}" class="quick-access-btn">
            ${NuckleoIcons.icon(qa.icon, 'icon-xs')}
            <span>${qa.label}</span>
        </a>
    `).join('');

    const dayHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) =>
        `<div class="cal-day-head">${d}</div>`
    ).join('');

    const dayCells = days.map((d) => {
        if (!d) return '<div></div>';
        const cls = d === today ? 'cal-day cal-day--today' : 'cal-day';
        return `<div class="${cls}">${d}</div>`;
    }).join('');

    el.innerHTML = `
        <div class="right-sidebar-inner">
            <section>
                <h3 class="rs-title-lg">Atividades recentes</h3>
                <div class="activity-list">${activities}</div>
            </section>

            <section>
                <div class="rs-header-row">
                    <h3 class="rs-title">Acessos rápidos</h3>
                    <a href="${pageHref('./pages/spaces.html')}" class="link-primary-sm">Editar Dashboard</a>
                </div>
                <div class="quick-access-grid">${quickAccess}</div>
            </section>

            <section>
                <h3 class="rs-title">Calendário</h3>
                <div class="mini-cal">
                    <div class="mini-cal-header">
                        <span class="mini-cal-month">${monthName} ${year}</span>
                        <div class="mini-cal-nav">
                            <button type="button">${NuckleoIcons.icon('chevron-left', 'icon-xs')}</button>
                            <button type="button">${NuckleoIcons.icon('chevron-right', 'icon-xs')}</button>
                        </div>
                    </div>
                    <div class="cal-grid cal-grid--head">${dayHeaders}</div>
                    <div class="cal-grid">${dayCells}</div>
                    <div class="cal-event">
                        <span class="cal-dot"></span>
                        <p>Revisar conteúdos do curso</p>
                    </div>
                    <p class="cal-event-time">15 mai, 15:00</p>
                    <div class="cal-event cal-event--border">
                        <span class="cal-dot"></span>
                        <p>Implementar o novo recurso no site</p>
                    </div>
                    <p class="cal-event-time">4 mar, 18:30</p>
                    <div class="cal-event cal-event--border">
                        <span class="cal-dot"></span>
                        <p>Criar novo design para a Home do site</p>
                    </div>
                    <p class="cal-event-time">8 jun, 22:00</p>
                </div>
            </section>
        </div>
    `;

    NuckleoIcons.refreshIcons();
}

window.NuckleoRightSidebar = { renderRightSidebar };
