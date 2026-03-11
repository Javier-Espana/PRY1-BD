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
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Restaurantes Mejor Calificados</span></div>
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
        <div class="card">
          <div class="card-header"><span class="card-title">Rating (grafica)</span></div>
          <canvas id="chartTopRest"></canvas>
        </div>
      </div>
    `;
    Charts.horizontalBar('chartTopRest', items.slice(0, 10).map((r, i) => ({
      label: r.nombre,
      value: r.promedio_calificacion || 0,
      displayValue: (r.promedio_calificacion || 0).toFixed(1) + ' ★',
      color: Charts.getColor(i)
    })));
  }

  async function renderMasVendidos(el) {
    const data = await API.analiticas.masVendidos({ limit: 15 });
    const items = Array.isArray(data) ? data : [];
    el.innerHTML = `
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Platillos Mas Vendidos ($unwind + $group)</span></div>
          <canvas id="chartMasVendidos"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Proporcion de ventas</span></div>
          <div class="chart-container" style="max-width:280px">
            <canvas id="chartMasVendidosPie"></canvas>
          </div>
          <div id="legendMasVendidos"></div>
        </div>
      </div>
    `;
    Charts.horizontalBar('chartMasVendidos', items.map((p, i) => ({
      label: p.nombre,
      value: p.total_vendido || 0,
      displayValue: `${(p.total_vendido||0).toLocaleString()} | ${UI.formatMoney(p.monto_total)}`,
      color: Charts.getColor(i)
    })));
    const pieData = items.slice(0, 8).map((p, i) => ({
      label: UI.truncate(p.nombre, 14),
      value: p.total_vendido || 0,
      color: Charts.getColor(i)
    }));
    Charts.donut('chartMasVendidosPie', pieData, { size: 260, centerLabel: 'Vendidos', centerValue: pieData.reduce((s,d) => s + d.value, 0).toLocaleString() });
    document.getElementById('legendMasVendidos').innerHTML = Charts.legend(pieData);
  }

  async function renderVentasRest(el) {
    const data = await API.analiticas.ventasRestaurante({ limit: 15 });
    const items = Array.isArray(data) ? data : [];
    el.innerHTML = `
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Ventas por Restaurante</span></div>
          <canvas id="chartVentasRest"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Distribucion de ingresos</span></div>
          <div class="chart-container" style="max-width:280px">
            <canvas id="chartVentasRestPie"></canvas>
          </div>
          <div id="legendVentasRest"></div>
        </div>
      </div>
    `;
    Charts.horizontalBar('chartVentasRest', items.map((v, i) => ({
      label: v.nombre,
      value: v.monto_total || 0,
      displayValue: `${UI.formatMoney(v.monto_total)} (${v.total_ordenes})`,
      color: Charts.getColor(i)
    })));
    const pieData = items.slice(0, 8).map((v, i) => ({
      label: UI.truncate(v.nombre, 14),
      value: v.monto_total || 0,
      color: Charts.getColor(i)
    }));
    Charts.donut('chartVentasRestPie', pieData, { size: 260, centerLabel: 'Total', centerValue: UI.formatMoney(pieData.reduce((s,d) => s + d.value, 0)) });
    document.getElementById('legendVentasRest').innerHTML = Charts.legend(pieData);
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
        <canvas id="chartPeriodo"></canvas>
      </div>
    `;

    const loadPeriodo = async () => {
      const periodo = document.getElementById('selPeriodo').value;
      const data = await API.analiticas.ventasPeriodo({ periodo });
      const items = (Array.isArray(data) ? data : []).slice(0, 30);
      Charts.line('chartPeriodo', items.map(v => ({
        label: v.periodo || '-',
        value: v.monto_total || 0
      })), { color: '#f59e0b', formatValue: v => 'Q' + (v/1000).toFixed(0) + 'k' });
    };

    document.getElementById('btnLoadPeriodo').addEventListener('click', loadPeriodo);
    loadPeriodo();
  }

  async function renderEstados(el) {
    const data = await API.analiticas.ordenesPorEstado();
    const items = Array.isArray(data) ? data : [];
    const estadoColors = { pendiente: '#f59e0b', preparando: '#3b82f6', enviado: '#6366f1', entregado: '#22c55e', cancelado: '#ef4444' };
    el.innerHTML = `
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Ordenes por Estado</span></div>
          <div class="chart-container" style="max-width:280px">
            <canvas id="chartEstadosAn"></canvas>
          </div>
          <div id="legendEstadosAn"></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Detalle por estado</span></div>
          <canvas id="chartEstadosBar"></canvas>
        </div>
      </div>
    `;
    const chartData = items.map(e => ({
      label: e.estado || e._id || '-',
      value: e.total || 0,
      color: estadoColors[e.estado || e._id] || Charts.getColor(0)
    }));
    Charts.donut('chartEstadosAn', chartData, {
      size: 260, centerLabel: 'Ordenes',
      centerValue: chartData.reduce((s,d) => s + d.value, 0).toLocaleString()
    });
    document.getElementById('legendEstadosAn').innerHTML = Charts.legend(chartData);
    Charts.horizontalBar('chartEstadosBar', chartData.map(d => ({
      ...d, displayValue: d.value.toLocaleString()
    })));
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
        container.innerHTML = `
          <div class="dashboard-grid">
            <div>
              <canvas id="chartDistBar"></canvas>
            </div>
            <div class="chart-container" style="max-width:220px">
              <canvas id="chartDistPie"></canvas>
              <div id="legendDist"></div>
            </div>
          </div>
        `;
        const starColors = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'];
        const chartData = [5,4,3,2,1].map(n => {
          const d = items.find(i => i.calificacion === n || i._id === n) || { total: 0 };
          return { label: '★'.repeat(n) + ' (' + n + ')', value: d.total || 0, color: starColors[5-n] };
        });
        Charts.horizontalBar('chartDistBar', chartData);
        Charts.donut('chartDistPie', chartData, { size: 200, centerLabel: 'Total', centerValue: chartData.reduce((s,d) => s + d.value, 0).toLocaleString() });
        document.getElementById('legendDist').innerHTML = Charts.legend(chartData);
      } catch (err) {
        container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
      }
    });
  }

  return { render };
})();
