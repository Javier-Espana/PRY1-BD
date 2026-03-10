const DashboardView = (() => {
  async function render() {
    UI.setTitle('Dashboard');
    UI.loading();

    try {
      const resumen = await API.analiticas.resumen();
      const [topRest, topPlatos, estados] = await Promise.all([
        API.analiticas.mejorCalificados({ limit: 5 }),
        API.analiticas.masVendidos({ limit: 5 }),
        API.analiticas.ordenesPorEstado()
      ]);

      UI.render(`
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Restaurantes</div>
            <div class="stat-value accent">${resumen.total_restaurantes || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Usuarios</div>
            <div class="stat-value info">${resumen.total_usuarios || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Articulos Menu</div>
            <div class="stat-value success">${resumen.total_articulos_menu || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Ordenes</div>
            <div class="stat-value warning">${resumen.total_ordenes || 0}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Resenas</div>
            <div class="stat-value danger">${resumen.total_resenas || 0}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Top 5 Restaurantes</span>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Nombre</th><th>Rating</th><th>Resenas</th></tr></thead>
                <tbody>
                  ${(topRest || []).map((r, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${r.nombre || '-'}</td>
                      <td>${UI.stars(r.promedio_calificacion)} ${(r.promedio_calificacion || 0).toFixed(1)}</td>
                      <td>${r.total_resenas || 0}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Top 5 Platillos mas vendidos</span>
            </div>
            <div class="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Nombre</th><th>Vendidos</th><th>Monto</th></tr></thead>
                <tbody>
                  ${(topPlatos || []).map((p, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${p.nombre || '-'}</td>
                      <td>${p.total_vendido || 0}</td>
                      <td>${UI.formatMoney(p.monto_total)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card-header">
            <span class="card-title">Ordenes por Estado</span>
          </div>
          <div class="bar-chart">
            ${renderEstadosChart(estados || [])}
          </div>
        </div>
      `);
    } catch (err) {
      UI.render(`<div class="empty-state"><p>Error cargando dashboard: ${err.message}</p></div>`);
    }
  }

  function renderEstadosChart(estados) {
    if (!estados.length) return '<div class="empty-state"><p>Sin datos</p></div>';
    const max = Math.max(...estados.map(e => e.total));
    return estados.map(e => `
      <div class="bar-row">
        <span class="bar-label">${e.estado || e._id || '-'}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${max ? (e.total / max * 100) : 0}%"></div>
        </div>
        <span class="bar-value">${e.total}</span>
      </div>
    `).join('');
  }

  return { render };
})();
