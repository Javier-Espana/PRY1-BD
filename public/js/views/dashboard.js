const DashboardView = (() => {
  async function render() {
    UI.setTitle('Dashboard');
    UI.loading();

    try {
      const resumen = await API.analiticas.resumen();
      const [topRest, topPlatos, estados, ventasPeriodo] = await Promise.all([
        API.analiticas.mejorCalificados({ limit: 5 }),
        API.analiticas.masVendidos({ limit: 8 }),
        API.analiticas.ordenesPorEstado(),
        API.analiticas.ventasPeriodo({ periodo: 'mes' })
      ]);

      UI.render(`
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">Restaurantes</div>
              <div class="stat-value accent">${(resumen.total_restaurantes || 0).toLocaleString()}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">Usuarios</div>
              <div class="stat-value info">${(resumen.total_usuarios || 0).toLocaleString()}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">Articulos Menu</div>
              <div class="stat-value success">${(resumen.total_articulos_menu || 0).toLocaleString()}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">Ordenes</div>
              <div class="stat-value warning">${(resumen.total_ordenes || 0).toLocaleString()}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">Resenas</div>
              <div class="stat-value danger">${(resumen.total_resenas || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header"><span class="card-title">Ordenes por Estado</span></div>
            <div class="chart-container" style="max-width:240px">
              <canvas id="chartEstados"></canvas>
            </div>
            <div id="legendEstados"></div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">Platillos Mas Vendidos</span></div>
            <canvas id="chartPlatos"></canvas>
          </div>

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
            <div class="card-header"><span class="card-title">Ventas por Mes</span></div>
            <canvas id="chartVentas"></canvas>
          </div>
        </div>
      `);

      // Render charts
      const estadosArr = estados || [];
      const estadoColors = { pendiente: '#f59e0b', preparando: '#3b82f6', enviado: '#6366f1', entregado: '#22c55e', cancelado: '#ef4444' };
      const estadoData = estadosArr.map(e => ({
        label: e.estado || e._id || '-',
        value: e.total || 0,
        color: estadoColors[e.estado || e._id] || Charts.getColor(0)
      }));
      Charts.donut('chartEstados', estadoData, {
        size: 240,
        centerLabel: 'Total',
        centerValue: estadoData.reduce((s, d) => s + d.value, 0).toLocaleString()
      });
      document.getElementById('legendEstados').innerHTML = Charts.legend(estadoData);

      // Platos bar chart
      const platosArr = (topPlatos || []).slice(0, 8);
      Charts.horizontalBar('chartPlatos', platosArr.map((p, i) => ({
        label: p.nombre || '-',
        value: p.total_vendido || 0,
        displayValue: (p.total_vendido || 0).toLocaleString(),
        color: Charts.getColor(i)
      })));

      // Ventas line chart
      const ventasArr = (Array.isArray(ventasPeriodo) ? ventasPeriodo : []).slice(-12);
      Charts.line('chartVentas', ventasArr.map(v => ({
        label: v.periodo || '-',
        value: v.monto_total || 0
      })), { color: '#22c55e', formatValue: v => 'Q' + (v/1000).toFixed(0) + 'k' });

    } catch (err) {
      UI.render(`<div class="empty-state"><p>Error cargando dashboard: ${err.message}</p></div>`);
    }
  }

  return { render };
})();
