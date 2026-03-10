const AnaliticasView = (() => {
  let activeTab = 'mejorCalificados';

  async function render() {
    UI.setTitle('Analiticas y Reportes');
    UI.loading();
    showTabs();
    await loadTab(activeTab);
  }

  function showTabs() {
    UI.render(`
      <div class="tabs" id="analyticsTabs">
        <button class="tab ${activeTab === 'mejorCalificados' ? 'active' : ''}" data-tab="mejorCalificados">Top Restaurantes</button>
        <button class="tab ${activeTab === 'masVendidos' ? 'active' : ''}" data-tab="masVendidos">Mas Vendidos</button>
        <button class="tab ${activeTab === 'ventasRest' ? 'active' : ''}" data-tab="ventasRest">Ventas x Restaurante</button>
        <button class="tab ${activeTab === 'ventasPeriodo' ? 'active' : ''}" data-tab="ventasPeriodo">Ventas x Periodo</button>
        <button class="tab ${activeTab === 'estados' ? 'active' : ''}" data-tab="estados">Ordenes x Estado</button>
        <button class="tab ${activeTab === 'distribucion' ? 'active' : ''}" data-tab="distribucion">Distribucion Calif.</button>
      </div>
      <div id="tabContent"><div class="loading-state"><div class="spinner"></div></div></div>
    `);

    document.getElementById('analyticsTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      loadTab(activeTab);
    });
  }

  async function loadTab(tab) {
    const container = document.getElementById('tabContent');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
      switch (tab) {
        case 'mejorCalificados': return await renderMejorCalificados(container);
        case 'masVendidos': return await renderMasVendidos(container);
        case 'ventasRest': return await renderVentasRest(container);
        case 'ventasPeriodo': return await renderVentasPeriodo(container);
        case 'estados': return await renderEstados(container);
        case 'distribucion': return await renderDistribucion(container);
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
    }
  }

  async function renderMejorCalificados(el) {
    const data = await API.analiticas.mejorCalificados({ limit: 15 });
    const items = Array.isArray(data) ? data : [];
    el.innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">Restaurantes Mejor Calificados (Aggregation Pipeline)</span></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Nombre</th><th>Categoria</th><th>Promedio</th><th>Resenas</th></tr></thead>
            <tbody>
              ${items.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.nombre}</td>
                  <td>${UI.badge(r.categoria || '-', 'accent')}</td>
                  <td>${UI.stars(r.promedio_calificacion)} ${(r.promedio_calificacion || 0).toFixed(2)}</td>
                  <td>${r.total_resenas || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  async function renderMasVendidos(el) {
    const data = await API.analiticas.masVendidos({ limit: 15 });
    const items = Array.isArray(data) ? data : [];
    const max = Math.max(...items.map(p => p.total_vendido || 0), 1);
    el.innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">Platillos Mas Vendidos ($unwind + $group)</span></div>
        <div class="bar-chart">
          ${items.map(p => `
            <div class="bar-row">
              <span class="bar-label">${UI.truncate(p.nombre, 18)}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(p.total_vendido / max * 100)}%;background:var(--success)"></div>
              </div>
              <span class="bar-value">${p.total_vendido} | ${UI.formatMoney(p.monto_total)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function renderVentasRest(el) {
    const data = await API.analiticas.ventasRestaurante({ limit: 15 });
    const items = Array.isArray(data) ? data : [];
    const max = Math.max(...items.map(v => v.monto_total || 0), 1);
    el.innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">Ventas por Restaurante (Aggregation Pipeline)</span></div>
        <div class="bar-chart">
          ${items.map(v => `
            <div class="bar-row">
              <span class="bar-label">${UI.truncate(v.nombre, 18)}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(v.monto_total / max * 100)}%;background:var(--info)"></div>
              </div>
              <span class="bar-value">${UI.formatMoney(v.monto_total)} (${v.total_ordenes})</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function renderVentasPeriodo(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Ventas por Periodo</span>
          <div class="btn-group">
            <select class="form-control" id="selPeriodo" style="width:120px">
              <option value="dia">Dia</option>
              <option value="semana">Semana</option>
              <option value="mes" selected>Mes</option>
            </select>
            <button class="btn btn-primary btn-sm" id="btnLoadPeriodo">Cargar</button>
          </div>
        </div>
        <div id="periodoContent"><div class="loading-state"><div class="spinner"></div></div></div>
      </div>
    `;

    const loadPeriodo = async () => {
      const periodo = document.getElementById('selPeriodo').value;
      const container = document.getElementById('periodoContent');
      container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
      const data = await API.analiticas.ventasPeriodo({ periodo });
      const items = (Array.isArray(data) ? data : []).slice(0, 20);
      const max = Math.max(...items.map(v => v.monto_total || 0), 1);
      container.innerHTML = `
        <div class="bar-chart">
          ${items.map(v => `
            <div class="bar-row">
              <span class="bar-label">${v.periodo || '-'}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(v.monto_total / max * 100)}%;background:var(--warning)"></div>
              </div>
              <span class="bar-value">${UI.formatMoney(v.monto_total)} (${v.total_ordenes})</span>
            </div>
          `).join('')}
        </div>
      `;
    };

    document.getElementById('btnLoadPeriodo').addEventListener('click', loadPeriodo);
    loadPeriodo();
  }

  async function renderEstados(el) {
    const data = await API.analiticas.ordenesPorEstado();
    const items = Array.isArray(data) ? data : [];
    const max = Math.max(...items.map(e => e.total || 0), 1);
    el.innerHTML = `
      <div class="card">
        <div class="card-header"><span class="card-title">Ordenes por Estado</span></div>
        <div class="bar-chart">
          ${items.map(e => `
            <div class="bar-row">
              <span class="bar-label">${e.estado || e._id}</span>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(e.total / max * 100)}%"></div>
              </div>
              <span class="bar-value">${e.total}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function renderDistribucion(el) {
    el.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Distribucion de Calificaciones por Restaurante</span>
          <div class="btn-group">
            <input class="form-control" id="distRestId" placeholder="ID del restaurante" style="width:260px">
            <button class="btn btn-primary btn-sm" id="btnLoadDist">Cargar</button>
          </div>
        </div>
        <div id="distContent"><div class="empty-state"><p>Ingresa un ID de restaurante</p></div></div>
      </div>
    `;
    document.getElementById('btnLoadDist').addEventListener('click', async () => {
      const id = UI.formValue('distRestId');
      if (!id) return;
      const container = document.getElementById('distContent');
      container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
      try {
        const data = await API.analiticas.distribucion(id);
        const items = Array.isArray(data) ? data : [];
        const max = Math.max(...items.map(d => d.total || 0), 1);
        container.innerHTML = `
          <div class="bar-chart">
            ${[5,4,3,2,1].map(n => {
              const d = items.find(i => i.calificacion === n || i._id === n) || { total: 0 };
              return `
                <div class="bar-row">
                  <span class="bar-label">${'&#9733;'.repeat(n)} (${n})</span>
                  <div class="bar-track">
                    <div class="bar-fill" style="width:${(d.total / max * 100)}%;background:var(--warning)"></div>
                  </div>
                  <span class="bar-value">${d.total}</span>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } catch (err) {
        container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
      }
    });
  }

  return { render };
})();
