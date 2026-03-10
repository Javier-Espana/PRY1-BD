const OrdenesView = (() => {
  let page = 1;
  const limit = 15;
  let filtroEstado = '';

  async function render() {
    UI.setTitle('Ordenes');
    UI.loading();
    await loadList();
  }

  async function loadList() {
    try {
      const skip = (page - 1) * limit;
      const params = { skip, limit };
      if (filtroEstado) params.estado = filtroEstado;
      const data = await API.ordenes.listar(params);
      const items = Array.isArray(data) ? data : (data.data || []);

      UI.render(`
        <div class="toolbar">
          <div class="toolbar-left">
            <select class="form-control" id="filtroEstado" style="width:180px">
              <option value="">Todos los estados</option>
              ${['pendiente','preparando','enviado','entregado','cancelado'].map(e =>
                `<option value="${e}" ${e === filtroEstado ? 'selected' : ''}>${e}</option>`
              ).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="btnNewOrder">+ Nueva Orden</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Restaurante</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Items</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${items.length ? items.map(o => `
                  <tr>
                    <td><a href="#" class="order-detail" data-id="${o._id}" style="color:var(--accent)">${String(o._id).slice(-6)}</a></td>
                    <td>${o.usuario?.nombre || UI.truncate(o.usuario_id, 8)}</td>
                    <td>${o.restaurante?.nombre || UI.truncate(o.restaurante_id, 8)}</td>
                    <td>${UI.formatMoney(o.total)}</td>
                    <td>${UI.estadoBadge(o.estado)}</td>
                    <td>${o.items?.length || 0}</td>
                    <td>${UI.formatDate(o.fecha_creacion)}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline btn-sm btn-estado" data-id="${o._id}">Estado</button>
                        <button class="btn btn-danger btn-sm btn-del-order" data-id="${o._id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="8" class="empty-state">Sin ordenes</td></tr>'}
              </tbody>
            </table>
          </div>
          ${UI.pagination(page, items.length === limit ? page + 1 : page)}
        </div>
      `);

      bindEvents();
    } catch (err) {
      UI.render(`<div class="empty-state"><p>Error: ${err.message}</p></div>`);
    }
  }

  function bindEvents() {
    document.getElementById('filtroEstado')?.addEventListener('change', (e) => {
      filtroEstado = e.target.value;
      page = 1;
      loadList();
    });
    document.getElementById('btnNewOrder')?.addEventListener('click', showCreateForm);
    document.querySelectorAll('.order-detail').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); showDetail(el.dataset.id); });
    });
    document.querySelectorAll('.btn-estado').forEach(el => {
      el.addEventListener('click', () => showEstadoForm(el.dataset.id));
    });
    document.querySelectorAll('.btn-del-order').forEach(el => {
      el.addEventListener('click', () => deleteOrder(el.dataset.id));
    });
    UI.bindPagination('.pagination', (p) => { page = p; loadList(); });
  }

  function showCreateForm() {
    UI.openModal('Nueva Orden (Transaccion Multi-Documento)', `
      <div class="form-group">
        <label class="form-label">ID del usuario *</label>
        <input class="form-control" id="fUserId">
      </div>
      <div class="form-group">
        <label class="form-label">ID del restaurante *</label>
        <input class="form-control" id="fRestId">
      </div>
      <div class="form-group">
        <label class="form-label">Metodo de pago</label>
        <select class="form-control" id="fPago">
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>
      <hr style="border-color:var(--border);margin:12px 0">
      <div id="itemsList">
        <div class="form-row item-row">
          <div class="form-group">
            <label class="form-label">ID articulo menu *</label>
            <input class="form-control item-menu-id">
          </div>
          <div class="form-group">
            <label class="form-label">Cantidad</label>
            <input class="form-control item-cantidad" type="number" value="1" min="1">
          </div>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" id="btnAddItem" style="margin-bottom:12px">+ Agregar item</button>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveOrder">Crear Orden</button>
      </div>
    `);

    document.getElementById('btnAddItem').addEventListener('click', () => {
      const list = document.getElementById('itemsList');
      const row = document.createElement('div');
      row.className = 'form-row item-row';
      row.innerHTML = `
        <div class="form-group">
          <label class="form-label">ID articulo menu *</label>
          <input class="form-control item-menu-id">
        </div>
        <div class="form-group">
          <label class="form-label">Cantidad</label>
          <input class="form-control item-cantidad" type="number" value="1" min="1">
        </div>
      `;
      list.appendChild(row);
    });

    document.getElementById('btnSaveOrder').addEventListener('click', async () => {
      const usuario_id = UI.formValue('fUserId');
      const restaurante_id = UI.formValue('fRestId');
      if (!usuario_id || !restaurante_id) return UI.toast('Usuario y restaurante son obligatorios', 'error');

      const rows = document.querySelectorAll('.item-row');
      const items = [];
      rows.forEach(row => {
        const mid = row.querySelector('.item-menu-id')?.value?.trim();
        const cant = parseInt(row.querySelector('.item-cantidad')?.value) || 1;
        if (mid) items.push({ menu_item_id: mid, cantidad: cant });
      });

      if (!items.length) return UI.toast('Agrega al menos un item', 'error');

      try {
        const result = await API.ordenes.crear({
          usuario_id, restaurante_id,
          metodo_pago: UI.formValue('fPago'),
          items
        });
        UI.closeModal();
        UI.toast(`Orden creada - Total: ${UI.formatMoney(result.total)}`, 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showDetail(id) {
    try {
      const o = await API.ordenes.obtener(id);
      UI.openModal('Detalle de Orden', `
        <div class="detail-list">
          <span class="detail-label">ID</span><span>${o._id}</span>
          <span class="detail-label">Usuario</span><span>${o.usuario?.nombre || o.usuario_id}</span>
          <span class="detail-label">Restaurante</span><span>${o.restaurante?.nombre || o.restaurante_id}</span>
          <span class="detail-label">Estado</span><span>${UI.estadoBadge(o.estado)}</span>
          <span class="detail-label">Total</span><span><strong>${UI.formatMoney(o.total)}</strong></span>
          <span class="detail-label">Metodo Pago</span><span>${o.metodo_pago || '-'}</span>
          <span class="detail-label">Fecha</span><span>${UI.formatDate(o.fecha_creacion)}</span>
        </div>
        <h4 style="margin:16px 0 8px;font-size:14px">Items (${o.items?.length || 0})</h4>
        <table>
          <thead><tr><th>Nombre</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${(o.items || []).map(item => `
              <tr>
                <td>${item.nombre || item.menu_item_id}</td>
                <td>${item.cantidad}</td>
                <td>${UI.formatMoney(item.precio_unitario)}</td>
                <td>${UI.formatMoney(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  function showEstadoForm(id) {
    UI.openModal('Actualizar Estado', `
      <div class="form-group">
        <label class="form-label">Nuevo estado</label>
        <select class="form-control" id="fEstado">
          ${['pendiente','preparando','enviado','entregado','cancelado'].map(e => `<option value="${e}">${e}</option>`).join('')}
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnUpdateEstado">Actualizar</button>
      </div>
    `);
    document.getElementById('btnUpdateEstado').addEventListener('click', async () => {
      try {
        await API.ordenes.actualizarEstado(id, UI.formValue('fEstado'));
        UI.closeModal();
        UI.toast('Estado actualizado', 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function deleteOrder(id) {
    if (!UI.confirm('Eliminar esta orden?')) return;
    try {
      await API.ordenes.eliminar(id);
      UI.toast('Orden eliminada', 'success');
      loadList();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  return { render };
})();
