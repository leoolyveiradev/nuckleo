/**
 * Renderização nativa de cards — baseado em ItemCard, SpaceCard e UserCard (.jsx)
 * Será expandido na migração com dados da API Node.
 */

const TYPE_CONFIG = {
    note: { label: 'Texto', color: '#60a5fa' },
    link: { label: 'Link', color: 'var(--primary)' },
    code: { label: 'Código', color: '#fb923c' },
    file: { label: 'Arquivo', color: '#c084fc' },
};

function renderItemCard(item) {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.note;
    return `
        <article class="card" data-item-id="${item.id}" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;">
                <span class="badge" style="color:${cfg.color}">${cfg.label}</span>
                ${item.is_favorite ? NuckleoIcons.icon('star', 'icon-sm') : ''}
            </div>
            <h3 style="font-size:0.875rem;font-weight:600;">${item.title}</h3>
        </article>
    `;
}

function renderSpaceCard(space) {
    return `
        <article class="card" data-space-id="${space.id}" style="cursor:pointer;">
            <div style="margin-bottom:0.5rem;">${NuckleoIcons.icon(space.icon || 'folder', 'icon-lg')}</div>
            <h3 style="font-size:0.8125rem;font-weight:600;">${space.title}</h3>
            <p class="text-muted" style="font-size:0.6875rem;margin-top:0.25rem;">${space.item_count || 0} itens</p>
        </article>
    `;
}

function renderUserCard(user) {
    const handle = user.username || user.email?.split('@')[0] || 'user';
    return `
        <article class="card" style="display:flex;align-items:center;gap:0.75rem;">
            <div style="width:2.5rem;height:2.5rem;border-radius:0.75rem;background:#222;display:flex;align-items:center;justify-content:center;">
                ${user.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
                <p style="font-size:0.875rem;font-weight:600;">${user.full_name || 'Usuário'}</p>
                <p class="text-muted" style="font-size:0.75rem;">@${handle}</p>
            </div>
        </article>
    `;
}

function mountCardGrid(containerId, htmlCards) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.75rem;">${htmlCards.join('')}</div>`;
}

window.NuckleoCards = { renderItemCard, renderSpaceCard, renderUserCard, mountCardGrid };
