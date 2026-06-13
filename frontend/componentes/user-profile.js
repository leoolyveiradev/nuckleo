/**
 * UserProfile page — portado de src/pages/UserProfile.jsx
 * Exibe perfil público de outro usuário
 */

const NuckleoUserProfile = {
    state: {
        profileUser: null,
        spaces: [],
        items: [],
        friends: [],
        activeTab: 'spaces',
    },

    async init() {
        const params = new URLSearchParams(window.location.search);
        const username = params.get('u') || params.get('id');

        if (!username) {
            this.renderNotFound(username);
            return;
        }

        await this.loadUser(username);
    },

    async loadUser(username) {
        try {
            const usersRes = await window.Nuckleo.apiFetch('/users?search=' + encodeURIComponent(username));
            const users = Array.isArray(usersRes) ? usersRes : [];

            const profileUser = users.find(u => {
                const handle = u.username || u.email?.split('@')[0];
                return handle?.toLowerCase() === username.toLowerCase();
            });

            if (!profileUser) {
                this.renderNotFound(username);
                return;
            }

            this.state.profileUser = profileUser;
            await this.loadUserData(profileUser.email);
            this.render();
        } catch (e) {
            this.renderNotFound(username);
        }
    },

    async loadUserData(email) {
        if (!email) return;

        try {
            const [spacesRes, itemsRes, friendsRes] = await Promise.all([
                window.Nuckleo.apiFetch('/spaces?created_by=' + encodeURIComponent(email) + '&visibility=public'),
                window.Nuckleo.apiFetch('/items?created_by=' + encodeURIComponent(email) + '&visibility=public'),
                window.Nuckleo.apiFetch('/friends?status=accepted'),
            ]);

            this.state.spaces = Array.isArray(spacesRes) ? spacesRes : [];
            this.state.items = Array.isArray(itemsRes) ? itemsRes : [];
            this.state.friends = Array.isArray(friendsRes) ? friendsRes : [];
        } catch (e) {
            this.state.spaces = [];
            this.state.items = [];
            this.state.friends = [];
        }
    },

    renderNotFound(username) {
        const content = document.getElementById('user-profile-content');
        content.innerHTML = `
            <div class="user-profile-not-found">
                <h1>Usuário não encontrado</h1>
                <p class="text-muted">@${username} não existe ou não foi encontrado.</p>
            </div>
        `;
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    },

    getHandle() {
        const u = this.state.profileUser;
        return u?.username || u?.email?.split('@')[0] || 'usuario';
    },

    getFriendCount() {
        return this.state.friends.filter(f =>
            f.from_user === this.state.profileUser?.email ||
            f.to_user === this.state.profileUser?.email
        ).length;
    },

    render() {
        const content = document.getElementById('user-profile-content');
        const u = this.state.profileUser;
        const handle = this.getHandle();

        const stats = [
            { label: 'Espaços', value: this.state.spaces.length, icon: '📁' },
            { label: 'Itens', value: this.state.items.length, icon: '📝' },
            { label: 'Amigos', value: this.getFriendCount(), icon: '👥' },
        ];

        const tabs = [
            { id: 'spaces', label: 'Espaços', count: this.state.spaces.length },
            { id: 'items', label: 'Itens públicos', count: this.state.items.length },
        ];

        const currentUser = JSON.parse(localStorage.getItem('nuckleo_user') || '{}');
        const isOwnProfile = currentUser?.email === u?.email;

        if (isOwnProfile) {
            window.location.href = '/pages/profile.html';
            return;
        }

        const tabItems = this.state[this.state.activeTab === 'spaces' ? 'spaces' : 'items'];

        content.innerHTML = `
            <div class="profile-page">
                <div class="profile-banner"></div>
                <div class="profile-main">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar profile-avatar--lg">
                            ${u?.avatar_url ? `<img src="${u.avatar_url}" alt="" />` : (u?.full_name?.charAt(0) || '?')}
                        </div>
                    </div>
                    <div class="profile-info">
                        <h1>${u?.full_name || 'Usuário'}</h1>
                        <p class="profile-handle">@${handle}</p>
                        ${u?.bio ? `<p class="profile-bio">${u.bio}</p>` : ''}
                        <div class="profile-meta">
                            ${u?.created_date ? `<span>📅 Entrou em ${this.formatDate(u.created_date)}</span>` : ''}
                            <span>🔗 nuckleo.app/u/${handle}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-stats">
                    ${stats.map(s => `
                        <div class="stat-item">
                            <span class="stat-icon">${s.icon}</span>
                            <span class="stat-value">${s.value}</span>
                            <span class="stat-label">${s.label}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="profile-tabs">
                    ${tabs.map(t => `
                        <button class="tab-item ${this.state.activeTab === t.id ? 'active' : ''}" onclick="NuckleoUserProfile.setTab('${t.id}')">
                            ${t.label}
                            <span class="tab-count">${t.count}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="profile-grid">
                    ${tabItems.length === 0 ? `
                        <p class="empty-state">
                            ${this.state.activeTab === 'spaces' ? 'Nenhum espaço público.' : 'Nenhum item público.'}
                        </p>
                    ` : tabItems.map(item => this.state.activeTab === 'spaces'
                        ? this.renderSpaceCard(item)
                        : this.renderItemCard(item)
                    ).join('')}
                </div>

                <p class="profile-owner-notice">
                    Este é o perfil público de @${handle}.
                </p>
            </div>
        `;
    },

    renderSpaceCard(space) {
        return `
            <div class="space-card" onclick="window.location.href='/pages/space.html?id=${space.id}'">
                <span class="space-emoji">${space.emoji || '📁'}</span>
                <h3>${space.title}</h3>
                <p class="space-count">${space.item_count || 0} itens</p>
                ${space.visibility === 'public' ? `<span class="space-visibility">${NuckleoIcons.icon('globe', 'icon-xs')}</span>` : ''}
            </div>
        `;
    },

    renderItemCard(item) {
        const labels = { note: 'Nota', link: 'Link', code: 'Código', file: 'Arquivo' };
        return `
            <div class="item-card" onclick="NuckleoModals.openItemDetailModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <span class="item-type-badge">${labels[item.type] || 'Item'}</span>
                <h3>${item.title}</h3>
                <p class="item-preview">${item.content?.substring(0, 80) || 'Sem conteúdo'}</p>
            </div>
        `;
    },

    setTab(tabId) {
        this.state.activeTab = tabId;
        this.render();
    },
};

window.NuckleoUserProfile = NuckleoUserProfile;

document.addEventListener('DOMContentLoaded', () => NuckleoUserProfile.init());