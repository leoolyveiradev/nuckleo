/**
 * Favorites page — portado de src/pages/Favorites.jsx
 */

const NuckleoFavorites = {
    state: {
        items: [],
        loading: false,
        selectedItem: null,
    },

    async init() {
        const user = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        if (!user?.email) {
            this.renderLoginRequired();
            return;
        }

        await this.loadFavorites(user.email);
        this.render();
    },

    async loadFavorites(email) {
        this.state.loading = true;
        this.render();

        try {
            const itemsRes = await window.Nuckleo.apiFetch('/items?created_by=' + encodeURIComponent(email) + '&is_favorite=true');
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
        } catch (e) {
            // Fallback to localStorage
            const allItems = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
            this.state.items = allItems.filter(item => item.is_favorite && item.created_by === email);
        }

        this.state.loading = false;
    },

    async toggleFavorite(item) {
        const updatedItem = { ...item, is_favorite: !item.is_favorite };

        try {
            await window.Nuckleo.apiFetch('/items/' + item.id, {
                method: 'PATCH',
                body: JSON.stringify({ is_favorite: updatedItem.is_favorite }),
            });
        } catch { /* local */ }

        const items = JSON.parse(localStorage.getItem('nuckleo_items') || '[]');
        const idx = items.findIndex(i => i.id === item.id);
        if (idx >= 0) {
            items[idx] = updatedItem;
            localStorage.setItem('nuckleo_items', JSON.stringify(items));
        }

        this.state.items = this.state.items.map(i => i.id === item.id ? updatedItem : i);
        this.render();
    },

    renderLoginRequired() {
        const content = document.getElementById('favorites-content');
        content.innerHTML = `
            <div class="empty-state">
                <p class="text-muted">Faça login para ver seus favoritos.</p>
            </div>
        `;
    },

    render() {
        const content = document.getElementById('favorites-content');
        if (!content) return;

        content.innerHTML = `
            <div class="page-header">
                <h1>${NuckleoIcons.icon('star', 'icon')} Favoritos</h1>
                <p class="text-muted">Seus itens favoritos</p>
            </div>
        `;

        if (this.state.loading) {
            content.innerHTML += `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${[1,2,3,4,5,6].map(() => `
                        <div class="card skeleton"></div>
                    `).join('')}
                </div>
            `;
            return;
        }

        if (this.state.items.length === 0) {
            content.innerHTML += `
                <div class="empty-state">
                    ${NuckleoIcons.icon('star', 'icon-lg')}
                    <p>Nenhum item favorito ainda.</p>
                    <p class="text-dim-sm">Marque itens com ★ para encontrá-los aqui.</p>
                </div>
            `;
            return;
        }

        const itemsHtml = this.state.items.map((item, i) => window.NuckleoCards.renderItemCard(item)).join('');
        content.innerHTML += `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${itemsHtml}
            </div>
        `;
    },

    openItem(item) {
        this.state.selectedItem = item;
        window.NuckleoModals.openItemDetailModal(item);
    },
};

window.NuckleoFavorites = NuckleoFavorites;

document.addEventListener('DOMContentLoaded', () => NuckleoFavorites.init());