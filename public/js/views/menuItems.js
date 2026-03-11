const MenuItemsView = (() => {
  let selectedRestId = null;
  let page = 1;
  const limit = 20;
  let soloDisponibles = false;
  let filtroCategoria = '';

  async function render() {
    UI.setTitle('Articulos del Menu');
    UI.loading();
    await showRestaurantSelector();
  }

  async function showRestaurantSelector() {
    try {
      const rests = await API.restaurantes.listar({ limit: 100 });
      const items = Array.isArray(rests) ? rests : (rests.data || []);

      UI.render(`
        <div class="toolbar">
          <div class="toolbar-left">
            <select class="form-control" id="selRest" style="width:300px">
              <option value="">-- Seleccionar restaurante --</option>
              ${items.map(r => `<option value="${r._id}" ${r._id === selectedRestId ? 'selected' : ''}>${r.nombre}</option>`).join('')}
            </select>
            <select class="form-control" id="filtroCatMenu" style="width:180px">
              <option value="">Todas las categorias</option>
              ${['Entrada','Plato Fuerte','Postre','Bebida','Acompañamiento','Ensalada','Sopa','Snack','Otro'].map(c => `<option value="${c}" ${c === filtroCategoria ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <label style="display:flex;align-items:center;gap:4px;color:var(--text-secondary);font-size:13px;cursor:pointer">
              <input type="checkbox" id="chkDisponibles" ${soloDisponibles ? 'checked' : ''}> Solo disponibles
            </label>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline" id="btnBulkUpdateMenu" ${!selectedRestId ? 'disabled' : ''}>Actualizar varios</button>
            <button class="btn btn-outline" id="btnBulkDeleteMenu" ${!selectedRestId ? 'disabled' : ''}>Eliminar varios</button>
            <button class="btn btn-primary" id="btnNewItem" ${!selectedRestId ? 'disabled' : ''}>+ Nuevo Articulo</button>
          </div>
        </div>
        <div class="toolbar" style="margin-top:-8px">
          <div class="toolbar-left">
            <input type="text" class="search-input" id="menuSearch" placeholder="Buscar articulos...">
            <button class="btn btn-outline btn-sm" id="btnSearchMenu">Buscar</button>
          </div>
        </div>
        <div id="menuContent">
          ${selectedRestId ? '<div class="loading-state"><div class="spinner"></div> Cargando...</div>' : '<div class="empty-state"><p>Selecciona un restaurante para ver su menu</p></div>'}
        </div>
      `);

      document.getElementById('selRest').addEventListener('change', (e) => {
        selectedRestId = e.target.value || null;
        page = 1;
        if (selectedRestId) {
          loadMenu();
          document.getElementById('btnNewItem').disabled = false;
          document.getElementById('btnBulkUpdateMenu').disabled = false;
          document.getElementById('btnBulkDeleteMenu').disabled = false;
        } else {
          document.getElementById('btnNewItem').disabled = true;
          document.getElementById('btnBulkUpdateMenu').disabled = true;
          document.getElementById('btnBulkDeleteMenu').disabled = true;
          const content = document.getElementById('menuContent');
          if (content) {
            content.innerHTML = '<div class="empty-state"><p>Selecciona un restaurante para ver su menu</p></div>';
          }
        }
      });

      document.getElementById('filtroCatMenu')?.addEventListener('change', (e) => {
        filtroCategoria = e.target.value;
        page = 1;
        if (selectedRestId) loadMenu();
      });

      document.getElementById('chkDisponibles')?.addEventListener('change', (e) => {
        soloDisponibles = e.target.checked;
        page = 1;
        if (selectedRestId) loadMenu();
      });

      document.getElementById('btnNewItem')?.addEventListener('click', showCreateForm);
      document.getElementById('btnBulkUpdateMenu')?.addEventListener('click', showBulkUpdateForm);
      document.getElementById('btnBulkDeleteMenu')?.addEventListener('click', showBulkDeleteForm);
      document.getElementById('btnSearchMenu')?.addEventListener('click', performSearch);
      document.getElementById('menuSearch')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
      });

      if (selectedRestId) loadMenu();
    } catch (err) {
      UI.render(`<div class="empty-state"><p>Error: ${err.message}</p></div>`);
    }
  }

  async function loadMenu() {
    if (!selectedRestId) return;
    const container = document.getElementById('menuContent');
    if (!container) return;
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
      const skip = (page - 1) * limit;
      const params = { skip, limit, solo_disponibles: !soloDisponibles ? false : true };
      if (filtroCategoria) params.categoria = filtroCategoria;
      const data = await API.menu.listar(selectedRestId, params);
      const items = Array.isArray(data) ? data : (data.data || []);

      container.innerHTML = `
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${items.length ? items.map(a => `
                  <tr>
                    <td>${a.nombre}</td>
                    <td>${UI.badge(a.categoria || '-', 'accent')}</td>
                    <td>${UI.formatMoney(a.precio)}</td>
                    <td>${a.stock ?? '-'}</td>
                    <td>${a.disponible ? UI.badge('Si', 'success') : UI.badge('No', 'danger')}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline btn-sm btn-edit-item" data-id="${a._id}">Editar</button>
                        <button class="btn btn-danger btn-sm btn-del-item" data-id="${a._id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="6" class="empty-state">Sin articulos</td></tr>'}
              </tbody>
            </table>
          </div>
          ${UI.pagination(page, items.length === limit ? page + 1 : page)}
        </div>
      `;

      container.querySelectorAll('.btn-edit-item').forEach(el => {
        el.addEventListener('click', () => showEditForm(el.dataset.id));
      });
      container.querySelectorAll('.btn-del-item').forEach(el => {
        el.addEventListener('click', () => deleteItem(el.dataset.id));
      });
      UI.bindPagination('.pagination', (p) => { page = p; loadMenu(); });
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
    }
  }

  function showCreateForm() {
    if (!selectedRestId) return UI.toast('Selecciona un restaurante primero', 'error');
    UI.openModal('Nuevo Articulo', `
      <div class="form-group">
        <label class="form-label">Nombre *</label>
        <input class="form-control" id="fNombre">
      </div>
      <div class="form-group">
        <label class="form-label">Descripcion</label>
        <textarea class="form-control" id="fDesc"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select class="form-control" id="fCat">
            ${['Entrada','Plato Fuerte','Postre','Bebida','Acompañamiento','Ensalada','Sopa','Snack','Otro'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Precio *</label>
          <input class="form-control" type="number" step="0.01" id="fPrecio" value="50">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Stock</label>
        <input class="form-control" type="number" id="fStock" value="100">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveItem">Guardar</button>
      </div>
    `);
    document.getElementById('btnSaveItem').addEventListener('click', async () => {
      const nombre = UI.formValue('fNombre');
      if (!nombre) return UI.toast('El nombre es obligatorio', 'error');
      try {
        await API.menu.crear({
          restaurante_id: selectedRestId,
          nombre,
          descripcion: UI.formValue('fDesc'),
          categoria: UI.formValue('fCat'),
          precio: UI.formFloat('fPrecio'),
          stock: UI.formInt('fStock')
        });
        UI.closeModal();
        UI.toast('Articulo creado', 'success');
        loadMenu();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showEditForm(id) {
    try {
      const a = await API.menu.obtener(id);
      UI.openModal('Editar Articulo', `
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Precio</label>
            <input class="form-control" type="number" step="0.01" id="fPrecio" value="${a.precio || 0}">
          </div>
          <div class="form-group">
            <label class="form-label">Stock</label>
            <input class="form-control" type="number" id="fStock" value="${a.stock || 0}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
          <button class="btn btn-primary" id="btnUpdateItem">Actualizar</button>
        </div>
      `);
      document.getElementById('btnUpdateItem').addEventListener('click', async () => {
        try {
          await API.menu.actualizar(id, {
            precio: UI.formFloat('fPrecio'),
            stock: UI.formInt('fStock')
          });
          UI.closeModal();
          UI.toast('Articulo actualizado', 'success');
          loadMenu();
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function deleteItem(id) {
    if (!UI.confirm('Eliminar este articulo?')) return;
    try {
      await API.menu.eliminar(id);
      UI.toast('Articulo eliminado', 'success');
      loadMenu();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  function showBulkUpdateForm() {
    if (!selectedRestId) return UI.toast('Selecciona un restaurante primero', 'error');
    UI.openModal('Actualizar varios articulos', `
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
        Actualiza disponibilidad o stock de varios articulos del restaurante seleccionado.
      </p>
      <div class="form-group">
        <label class="form-label">Categoria (opcional)</label>
        <select class="form-control" id="fBulkCatMenu">
          <option value="">Todas</option>
          ${['Entrada','Plato Fuerte','Postre','Bebida','Acompañamiento','Ensalada','Sopa','Snack','Otro'].map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Disponible</label>
          <select class="form-control" id="fBulkDispMenu">
            <option value="true">Si</option>
            <option value="false">No</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Stock nuevo (opcional)</label>
          <input class="form-control" type="number" id="fBulkStockMenu" placeholder="Ej: 100">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnExecBulkUpdateMenu">Actualizar varios</button>
      </div>
    `);

    document.getElementById('btnExecBulkUpdateMenu')?.addEventListener('click', async () => {
      const categoria = UI.formValue('fBulkCatMenu');
      const disponible = UI.formValue('fBulkDispMenu') === 'true';
      const stockRaw = UI.formValue('fBulkStockMenu');

      const filtro = { restaurante_id: selectedRestId };
      if (categoria) filtro.categoria = categoria;

      const datos = { disponible };
      if (stockRaw !== '') {
        const stock = parseInt(stockRaw, 10);
        if (Number.isNaN(stock) || stock < 0) return UI.toast('Stock inválido', 'error');
        datos.stock = stock;
      }

      try {
        const result = await API.menu.actualizarVarios(filtro, datos);
        UI.closeModal();
        UI.toast(`Articulos actualizados: ${result.modificados || 0}`, 'success');
        loadMenu();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  function showBulkDeleteForm() {
    if (!selectedRestId) return UI.toast('Selecciona un restaurante primero', 'error');
    UI.openModal('Eliminar varios articulos', `
      <p style="font-size:13px;color:var(--danger);margin-bottom:12px">
        Elimina artículos del restaurante seleccionado.
      </p>
      <div class="form-group">
        <label class="form-label">Categoria a eliminar (opcional)</label>
        <select class="form-control" id="fBulkDeleteCatMenu">
          <option value="">Todas las categorias del restaurante</option>
          ${['Entrada','Plato Fuerte','Postre','Bebida','Acompañamiento','Ensalada','Sopa','Snack','Otro'].map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmacion (escribe ELIMINAR)</label>
        <input class="form-control" id="fBulkDeleteConfirmMenu" placeholder="ELIMINAR">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-danger" id="btnExecBulkDeleteMenu">Eliminar varios</button>
      </div>
    `);

    document.getElementById('btnExecBulkDeleteMenu')?.addEventListener('click', async () => {
      const categoria = UI.formValue('fBulkDeleteCatMenu');
      const confirmText = UI.formValue('fBulkDeleteConfirmMenu');
      if (confirmText !== 'ELIMINAR') return UI.toast('Debes escribir ELIMINAR para confirmar', 'error');

      const filtro = { restaurante_id: selectedRestId };
      if (categoria) filtro.categoria = categoria;

      try {
        const result = await API.menu.eliminarVarios(filtro);
        UI.closeModal();
        UI.toast(`Articulos eliminados: ${result.eliminados || 0}`, 'success');
        page = 1;
        loadMenu();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function performSearch() {
    const texto = document.getElementById('menuSearch')?.value?.trim();
    if (!texto) return;
    try {
      const data = await API.menu.buscar({ texto, limit: 20 });
      const items = Array.isArray(data) ? data : (data.data || []);
      const container = document.getElementById('menuContent');
      if (!container) return;
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <span class="card-title">Resultados para "${texto}" (${items.length})</span>
            <button class="btn btn-outline btn-sm" id="btnBackMenu">Volver</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Nombre</th><th>Categoria</th><th>Precio</th><th>Score</th></tr></thead>
              <tbody>
                ${items.map(a => `
                  <tr>
                    <td>${a.nombre}</td>
                    <td>${UI.badge(a.categoria || '-', 'accent')}</td>
                    <td>${UI.formatMoney(a.precio)}</td>
                    <td>${(a.score || 0).toFixed(2)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="empty-state">Sin resultados</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
      document.getElementById('btnBackMenu')?.addEventListener('click', () => {
        if (selectedRestId) loadMenu();
      });
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  return { render };
})();
