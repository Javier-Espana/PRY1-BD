(() => {
  const routes = {
    '#/': DashboardView,
    '#/restaurantes': RestaurantesView,
    '#/usuarios': UsuariosView,
    '#/menu': MenuItemsView,
    '#/ordenes': OrdenesView,
    '#/resenas': ResenasView,
    '#/analiticas': AnaliticasView,
    '#/bulk': BulkView
  };

  const navLinks = document.querySelectorAll('.nav-link');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('menuToggle');

  function activateNav(hash) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }

  async function navigate() {
    const hash = location.hash || '#/';
    const view = routes[hash];
    if (!view) {
      location.hash = '#/';
      return;
    }
    activateNav(hash);
    sidebar.classList.remove('open');
    try {
      await view.render();
    } catch (err) {
      console.error('Error rendering view:', err);
      UI.render(`<div class="card"><p style="color:var(--danger)">Error al cargar la vista: ${err.message}</p></div>`);
    }
  }

  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  document.getElementById('modalClose').addEventListener('click', UI.closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) UI.closeModal();
  });

  window.addEventListener('hashchange', navigate);
  navigate();
})();
