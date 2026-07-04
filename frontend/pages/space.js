/**
 * Space detail page — portado de src/pages/SpaceDetail.jsx
 */

const NuckleoSpace = {
    state: {
        space: null,
        items: [],
        loading: true,
        loadingItems: true,
        showCreateItem: false,
        selectedItem: null,
    },

    async init() {
        const params = new URLSearchParams(window.location.search);
        const spaceId = params.get('id');

        if (!spaceId) {
            this.renderNotFound();
            return;
        }

        await this.loadSpace(spaceId);
        this.render();
    },

    async loadSpace(id) {
        this.state.loading = true;

        try {
            const spacesRes = await window.Nuckleo.apiFetch('/spaces?id=' + id);
            this.state.space = Array.isArray(spacesRes) ? spacesRes[0] : null;
        } catch (e) {
            const spaces = JSON.parse(localStorage.getItem('nuckleo_spaces') || '[]');
            this.state.space = spaces.find(s => s.id === id) || null;
        }

        if (this.state.space) {
            await this.loadItems(id);
        }

        this.state.loading = false;
    },

    async loadItems(spaceId) {
        this.state.loadingItems = true;

        try {
            const itemsRes = await window.Nuckleo.apiFetch('/items?space_id=' + spaceId);
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
        } catch (e) {
            const items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
            this.state.items = items.filter(i => i.space_id === spaceId);
        }

        this.state.loadingItems = false;
    },

    isOwner() {
        const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        return this.state.space?.created_by === user?.email;
    },

    goBack() {
        window.history.back();
    },

    renderNotFound() {
        const content = document.getElementById('space-content');
        content.innerHTML = `
            <div class="empty-state">
                <p>Espaço não encontrado.</p>
                <a href="/pages/spaces.html" class="link">Voltar aos espaços</a>
            </div>
        `;
    },

    render() {
        const content = document.getElementById('space-content');
        if (!content) return;

        if (this.state.loading) {
            content.innerHTML = '<div class="loading">Carregando...</div>';
            return;
        }

        if (!this.state.space) {
            this.renderNotFound();
            return;
        }

        const s = this.state.space;
        const pinnedItems = this.state.items.filter(i => i.is_pinned);
        const otherItems = this.state.items.filter(i => !i.is_pinned);
        const isOwner = this.isOwner();

        content.innerHTML = `
            <div class="page-header">
                <button class="btn-back" onclick="NuckleoSpace.goBack()">
                    ${NuckleoIcons.icon('arrow-left', 'icon-xs')}
                </button>
                <div class="space-header-info">
                    <div class="space-title-row">
                        <span class="space-icon">${NuckleoIcons.icon(s.icon || 'folder', 'icon-lg')}</span>
                        <h1>${s.title}</h1>
                    </div>
                    ${s.description ? `<p class="text-muted">${s.description}</p>` : ''}
                    <div class="space-meta">
                        ${s.visibility === 'public'
                            ? `<span>${NuckleoIcons.icon('globe', 'icon-xs')} Público</span>`
                            : `<span>${NuckleoIcons.icon('lock', 'icon-xs')} Privado</span>`
                        }
                        <span>${this.state.items.length} itens</span>
                        ${s.tags?.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                </div>
                ${isOwner ? `
                    <div class="space-actions">
                        <button class="icon-btn" onclick="NuckleoSpace.togglePin()">
                            ${NuckleoIcons.icon(s.is_pinned ? 'pin' : 'pin', 'icon-sm')}
                        </button>
                        <button class="icon-btn danger" onclick="NuckleoSpace.deleteSpace()">
                            ${NuckleoIcons.icon('trash-2', 'icon-sm')}
                        </button>
                        <button class="btn-primary" onclick="NuckleoSpace.openCreateItem()">
                            ${NuckleoIcons.icon('plus', 'icon-xs')} Novo Item
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        // Pinned items
        if (pinnedItems.length > 0) {
            content.innerHTML += `
                <section class="section">
                    <h2>${NuckleoIcons.icon('pin', 'icon-xs')} Fixados</h2>
                    <div class="grid">
                        ${pinnedItems.map(item => window.NuckleoCards.renderItemCard(item)).join('')}
                    </div>
                </section>
            `;
        }

        // Other items
        if (this.state.loadingItems) {
            content.innerHTML += `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${[1,2,3,4,5,6].map(() => '<div class="card skeleton"></div>').join('')}
                </div>
            `;
        } else if (otherItems.length > 0) {
            content.innerHTML += `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${otherItems.map(item => window.NuckleoCards.renderItemCard(item)).join('')}
                </div>
            `;
        } else if (this.state.items.length === 0) {
            content.innerHTML += isOwner
                ? `<div class="empty-state"><p>Este espaço ainda está vazio.</p><button class="btn-primary" onclick="NuckleoSpace.openCreateItem()">+ Adicionar item</button></div>`
                : `<div class="empty-state"><p>Este espaço ainda está vazio.</p></div>`;
        }
    },

    async togglePin() {
        if (!this.state.space || !this.isOwner()) return;
        const updated = { ...this.state.space, is_pinned: !this.state.space.is_pinned };
        try {
            await window.Nuckleo.apiFetch('/spaces/' + this.state.space.id, {
                method: 'PATCH',
                body: JSON.stringify({ is_pinned: updated.is_pinned }),
            });
        } catch { /* local */ }
        this.state.space = updated;
        this.render();
    },

    async deleteSpace() {
        if (!confirm('Tem certeza que deseja excluir este espaço e todos os itens?')) return;
        const id = this.state.space.id;

        for (const item of this.state.items) {
            try {
                await window.Nuckleo.apiFetch('/items/' + item.id, { method: 'DELETE' });
            } catch { /* local */ }
        }

        try {
            await window.Nuckleo.apiFetch('/spaces/' + id, { method: 'DELETE' });
        } catch { /* local */ }

        window.location.href = '/pages/spaces.html';
    },

    openCreateItem() {
        this.state.showCreateItem = true;
        window.NuckleoModals.openCreateItemModal(this.state.space.id);
    },
};

window.NuckleoSpace = NuckleoSpace;

document.addEventListener('DOMContentLoaded', () => NuckleoSpace.init());