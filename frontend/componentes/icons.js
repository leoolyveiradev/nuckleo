/** Ícones Lucide — carrega via CDN e re-renderiza após DOM dinâmico */
function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) refreshIcons();
});
window.addEventListener('load', refreshIcons);

function icon(name, cls = 'icon') {
    return `<i data-lucide="${name}" class="${cls}"></i>`;
}

window.NuckleoIcons = { refreshIcons, icon };
