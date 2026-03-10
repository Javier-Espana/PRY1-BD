const BulkView = (() => {
  async function render() {
    UI.setTitle('Operaciones Bulk');

    UI.render(`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Bulk Insert Restaurantes</span>
          </div>
          <div class="form-group">
            <label class="form-label">Cantidad a crear</label>
            <input class="form-control" type="number" id="bulkRestCant" value="5" min="1" max="100">
          </div>
          <button class="btn btn-primary" id="btnBulkRest">Ejecutar Bulk Insert</button>
          <div id="bulkRestResult" style="margin-top:12px"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">Bulk Update Ordenes</span>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
            Actualiza las primeras N ordenes pendientes a "preparando"
          </p>
          <div class="form-group">
            <label class="form-label">Cantidad de ordenes</label>
            <input class="form-control" type="number" id="bulkOrdCant" value="10" min="1" max="500">
          </div>
          <button class="btn btn-primary" id="btnBulkOrd">Ejecutar Bulk Update</button>
          <div id="bulkOrdResult" style="margin-top:12px"></div>
        </div>
      </div>
    `);

    document.getElementById('btnBulkRest').addEventListener('click', async () => {
      const cantidad = UI.formInt('bulkRestCant') || 5;
      const resultEl = document.getElementById('bulkRestResult');
      resultEl.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
      try {
        const restaurantes = [];
        for (let i = 0; i < cantidad; i++) {
          restaurantes.push({
            nombre: `Rest Bulk ${Date.now()}_${i}`,
            descripcion: 'Creado por operacion bulk desde frontend',
            categoria: 'Otro',
            longitud: -90.5 + Math.random() * 0.1,
            latitud: 14.6 + Math.random() * 0.1,
            telefono: '+502 0000-0000'
          });
        }
        const result = await API.bulk.restaurantes(restaurantes);
        resultEl.innerHTML = `<div class="badge badge-success" style="font-size:14px;padding:8px 12px">Insertados: ${result.insertados || result.insertedCount || cantidad}</div>`;
        UI.toast('Bulk insert completado', 'success');
      } catch (err) {
        resultEl.innerHTML = `<div class="badge badge-danger" style="font-size:14px;padding:8px 12px">Error: ${err.message}</div>`;
      }
    });

    document.getElementById('btnBulkOrd').addEventListener('click', async () => {
      const cantidad = UI.formInt('bulkOrdCant') || 10;
      const resultEl = document.getElementById('bulkOrdResult');
      resultEl.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';
      try {
        const ordenes = await API.ordenes.listar({ estado: 'pendiente', limit: cantidad });
        const items = Array.isArray(ordenes) ? ordenes : (ordenes.data || []);
        if (!items.length) {
          resultEl.innerHTML = '<div class="badge badge-warning" style="font-size:14px;padding:8px 12px">No hay ordenes pendientes</div>';
          return;
        }
        const ops = items.map(o => ({
          tipo: 'actualizarEstado',
          id: o._id.toString(),
          estado: 'preparando'
        }));
        const result = await API.bulk.ordenes(ops);
        resultEl.innerHTML = `<div class="badge badge-success" style="font-size:14px;padding:8px 12px">Actualizados: ${result.actualizados || result.modifiedCount || ops.length}</div>`;
        UI.toast('Bulk update completado', 'success');
      } catch (err) {
        resultEl.innerHTML = `<div class="badge badge-danger" style="font-size:14px;padding:8px 12px">Error: ${err.message}</div>`;
      }
    });
  }

  return { render };
})();
