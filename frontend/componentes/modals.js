/**
 * Modais — portados de CreateSpaceModal, CreateItemModal, ItemDetailModal
 */

const SPACE_EMOJIS = ['📁', '💡', '🚀', '📚', '🎯', '🔬', '🎨', '💻', '🎵', '📝', '🌍', '⚡'];

function ensureModalRoot() {
    let overlay = document.getElementById('nuckleo-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nuckleo-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '<div class="modal-box" id="nuckleo-modal-box"></div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    }
    return overlay;
}

function openModal(contentHtml, maxWidth = '') {
    const overlay = ensureModalRoot();
    const box = document.getElementById('nuckleo-modal-box');
    box.className = 'modal-box' + (maxWidth ? ` ${maxWidth}` : '');
    box.innerHTML = contentHtml;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    NuckleoIcons.refreshIcons();
}

function closeModal() {
    document.getElementById('nuckleo-modal')?.classList.remove('open');
    document.body.style.overflow = '';
}

function openCreateSpaceModal() {
    const emojiPicker = SPACE_EMOJIS.map((e) =>
        `<button type="button" class="emoji-btn" data-emoji="${e}">${e}</button>`
    ).join('');

    openModal(`
        <div class="modal-header">
            <h2>Novo Espaço</h2>
            <button type="button" class="modal-close" onclick="NuckleoModals.closeModal()">${NuckleoIcons.icon('x', 'icon-sm')}</button>
        </div>
        <form class="modal-form" id="form-create-space">
            <div class="form-group">
                <label>Ícone</label>
                <div class="emoji-grid" id="emoji-grid">${emojiPicker}</div>
                <input type="hidden" name="emoji" id="space-emoji" value="📁" />
            </div>
            <div class="form-group">
                <label>Nome do espaço</label>
                <input class="input" name="title" placeholder="Ex: Projetos pessoais" required />
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea class="input textarea" name="description" placeholder="Breve descrição..." rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Tags (separadas por vírgula)</label>
                <input class="input" name="tags" placeholder="dev, design, ideias" />
            </div>
            <div class="form-group">
                <label>Visibilidade</label>
                <div class="visibility-btns">
                    <button type="button" class="vis-btn vis-btn--active" data-vis="private">${NuckleoIcons.icon('lock', 'icon-xs')} Privado</button>
                    <button type="button" class="vis-btn" data-vis="public">${NuckleoIcons.icon('globe', 'icon-xs')} Público</button>
                </div>
                <input type="hidden" name="visibility" id="space-visibility" value="private" />
            </div>
            <button type="submit" class="btn-primary btn-full">Criar Espaço</button>
        </form>
    `);

    let selectedEmoji = '📁';
    let visibility = 'private';

    document.querySelectorAll('.emoji-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach((b) => b.classList.remove('emoji-btn--active'));
            btn.classList.add('emoji-btn--active');
            selectedEmoji = btn.dataset.emoji;
            document.getElementById('space-emoji').value = selectedEmoji;
        });
    });
    document.querySelector('.emoji-btn')?.classList.add('emoji-btn--active');

    document.querySelectorAll('.vis-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vis-btn').forEach((b) => b.classList.remove('vis-btn--active'));
            btn.classList.add('vis-btn--active');
            visibility = btn.dataset.vis;
            document.getElementById('space-visibility').value = visibility;
        });
    });

    document.getElementById('form-create-space').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const space = {
            id: 's' + Date.now(),
            title: fd.get('title'),
            description: fd.get('description') || '',
            emoji: selectedEmoji,
            visibility,
            tags: (fd.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
            item_count: 0,
            created_date: new Date().toISOString(),
        };

        try {
            await window.Nuckleo.apiFetch('/spaces', { method: 'POST', body: JSON.stringify(space) });
        } catch { /* local */ }

        const spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || '[]');
        spaces.unshift(space);
        localStorage.setItem('nuckleo_spaces', JSON.stringify(spaces));

        if (window.NuckleoDashboard) {
            NuckleoDashboard.state.spaces = spaces;
            NuckleoDashboard.initDashboard();
        }

        closeModal();
    });

    NuckleoIcons.refreshIcons();
}

function openCreateItemModal(spaceId, defaultType = 'note') {
    openModal(`
        <div class="modal-header"><h2>Novo Item</h2><button type="button" class="modal-close" onclick="NuckleoModals.closeModal()">✕</button></div>
        <form class="modal-form" id="form-create-item">
            <div class="form-group">
                <label>Título</label>
                <input class="input" name="title" required placeholder="Nome do item" />
            </div>
            <div class="form-group">
                <label>Tipo</label>
                <input type="hidden" name="type" value="${defaultType}" />
                <p class="text-dim-sm">${defaultType}</p>
            </div>
            <div class="form-group">
                <label>Conteúdo / URL</label>
                <textarea class="input textarea" name="content" rows="4" placeholder="Conteúdo..."></textarea>
            </div>
            <button type="submit" class="btn-primary btn-full">Criar Item</button>
        </form>
    `, 'modal-box--lg');

    document.getElementById('form-create-item').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const item = {
            id: 'i' + Date.now(),
            title: fd.get('title'),
            type: fd.get('type'),
            content: fd.get('content') || '',
            space_id: spaceId,
            is_favorite: false,
            created_date: new Date().toISOString(),
        };
        const items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
        items.unshift(item);
        localStorage.setItem('nuckleo_items', JSON.stringify(items));
        if (window.NuckleoDashboard) {
            NuckleoDashboard.state.items = items;
            NuckleoDashboard.initDashboard();
        }
        closeModal();
    });
}

function openItemDetailModal(item) {
    const labels = { note: 'Nota', link: 'Link', code: 'Código', file: 'Arquivo' };
    openModal(`
        <div class="modal-header">
            <span class="badge">${labels[item.type] || 'Item'}</span>
            <button type="button" class="modal-close" onclick="NuckleoModals.closeModal()">✕</button>
        </div>
        <div class="modal-body">
            <h2 class="detail-title">${item.title}</h2>
            <p class="text-dim-sm">${item.content || 'Sem conteúdo'}</p>
        </div>
    `);
}

function openNoSpaceModal() {
    openModal(`
        <div class="modal-body modal-body--center">
            <p class="text-muted">Crie um Space primeiro para adicionar itens.</p>
            <button type="button" class="btn-primary" onclick="NuckleoModals.closeModal(); NuckleoModals.openCreateSpaceModal();">Criar Space</button>
        </div>
    `);
}

const NuckleoSearch = {
    state: {
        query: '',
        results: { spaces: [], items: [], users: [] },
        loading: false,
    },

    async search(query) {
        this.state.query = query;
        if (!query.trim()) {
            this.state.results = { spaces: [], items: [], users: [] };
            this.renderResults();
            return;
        }

        this.state.loading = true;
        this.renderResults();

        try {
            const q = query.toLowerCase();
            const [spacesRes, itemsRes, usersRes] = await Promise.all([
                window.Nuckleo.apiFetch('/spaces'),
                window.Nuckleo.apiFetch('/items'),
                window.Nuckleo.apiFetch('/users'),
            ]);

            const spaces = Array.isArray(spacesRes) ? spacesRes : [];
            const items = Array.isArray(itemsRes) ? itemsRes : [];
            const users = Array.isArray(usersRes) ? usersRes : [];

            this.state.results = {
                spaces: spaces.filter(s => s.title?.toLowerCase().includes(q)).slice(0, 5),
                items: items.filter(i => i.title?.toLowerCase().includes(q)).slice(0, 5),
                users: users.filter(u =>
                    u.full_name?.toLowerCase().includes(q) ||
                    u.username?.toLowerCase().includes(q) ||
                    u.email?.toLowerCase().includes(q)
                ).slice(0, 5),
            };
        } catch (e) {
            // Fallback to localStorage
            const spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || '[]');
            const items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
            const q = query.toLowerCase();

            this.state.results = {
                spaces: spaces.filter(s => s.title?.toLowerCase().includes(q)).slice(0, 5),
                items: items.filter(i => i.title?.toLowerCase().includes(q)).slice(0, 5),
                users: [],
            };
        }

        this.state.loading = false;
        this.renderResults();
    },

    getResultsHtml() {
        const { spaces, items, users } = this.state.results;
        const hasResults = spaces.length > 0 || items.length > 0 || users.length > 0;

        if (this.state.loading) {
            return `<div class="search-loading"><div class="spinner"></div></div>`;
        }

        if (!this.state.query) {
            return `<div class="search-empty"><p>Comece a digitar para buscar</p><p class="text-dim-sm">⌘K para abrir a qualquer momento</p></div>`;
        }

        if (!hasResults) {
            return `<div class="search-empty"><p>Nenhum resultado encontrado</p></div>`;
        }

        let html = '';

        if (spaces.length > 0) {
            html += `<div class="search-section">
                <div class="search-section-title">📁 Espaços</div>
                ${spaces.map(s => `
                    <button class="search-result" onclick="window.location.href='/pages/space.html?id=${s.id}'">
                        <span>${s.emoji || '📁'}</span>
                        <div class="search-result-content">
                            <span class="search-result-label">${s.title}</span>
                            <span class="search-result-sub">${s.item_count || 0} itens</span>
                        </div>
                    </button>
                `).join('')}
            </div>`;
        }

        if (items.length > 0) {
            html += `<div class="search-section">
                <div class="search-section-title">📝 Itens</div>
                ${items.map(i => `
                    <button class="search-result" onclick="NuckleoModals.openItemDetailModal(${JSON.stringify(i).replace(/"/g, '&quot;')})">
                        <span class="item-type-badge">${i.type === 'note' ? '📝' : i.type === 'link' ? '🔗' : i.type === 'code' ? '💻' : '📎'}</span>
                        <div class="search-result-content">
                            <span class="search-result-label">${i.title}</span>
                            <span class="search-result-sub">${i.type}</span>
                        </div>
                    </button>
                `).join('')}
            </div>`;
        }

        if (users.length > 0) {
            html += `<div class="search-section">
                <div class="search-section-title">👤 Usuários</div>
                ${users.map(u => {
                    const handle = u.username || u.email?.split('@')[0];
                    return `
                        <button class="search-result" onclick="window.location.href='/pages/user-profile.html?u=${handle}'">
                            <span class="user-avatar">${u.full_name?.charAt(0) || '?'}</span>
                            <div class="search-result-content">
                                <span class="search-result-label">${u.full_name || u.email}</span>
                                <span class="search-result-sub">@${handle}</span>
                            </div>
                        </button>
                    `;
                }).join('')}
            </div>`;
        }

        return html;
    },

    renderResults() {
        const resultsEl = document.getElementById('search-results');
        if (resultsEl) {
            resultsEl.innerHTML = this.getResultsHtml();
        }
    },
};

function openSearchModal() {
    NuckleoSearch.state = { query: '', results: { spaces: [], items: [], users: [] }, loading: false };

    openModal(`
        <div class="search-modal">
            <div class="search-input-wrapper">
                ${NuckleoIcons.icon('search', 'icon')}
                <input type="text" id="search-input" placeholder="Buscar espaços, itens, usuários..." autofocus />
                <kbd class="search-kbd">ESC</kbd>
            </div>
            <div class="search-results" id="search-results">
                <div class="search-empty"><p>Comece a digitar para buscar</p><p class="text-dim-sm">⌘K para abrir a qualquer momento</p></div>
            </div>
        </div>
    `, 'modal-box--lg');

    const input = document.getElementById('search-input');
    let timeout = null;

    input?.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            NuckleoSearch.search(e.target.value);
        }, 300);
    });

    input?.focus();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            NuckleoModals.closeModal();
        }
    });
}

window.NuckleoModals = {
    openModal, closeModal, openCreateSpaceModal, openCreateItemModal,
    openItemDetailModal, openNoSpaceModal, openSearchModal,
};
