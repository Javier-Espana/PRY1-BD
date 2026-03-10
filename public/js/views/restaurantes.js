const RestaurantesView = (() => {
  let page = 1;
  const limit = 15;

  async function render() {
    UI.setTitle('Restaurantes');
    UI.loading();
    await loadList();
  }

  async function loadList() {
    try {
      const skip = (page - 1) * limit;
      const data = await API.restaurantes.listar({ skip, limit });
      const items = Array.isArray(data) ? data : (data.data || []);

      UI.render(`
        <div class="toolbar">
          <div class="toolbar-left">
            <input type="text" class="search-input" id="restSearch" placeholder="Buscar por texto...">
            <button class="btn btn-outline btn-sm" id="btnSearchRest">Buscar</button>
            <button class="btn btn-outline btn-sm" id="btnCercanos">Cercanos</button>
          </div>
          <button class="btn btn-primary" id="btnNewRest">+ Nuevo Restaurante</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Rating</th>
                  <th>Resenas</th>
                  <th>Telefono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${items.length ? items.map(r => `
                  <tr>
                    <td><a href="#" class="rest-detail" data-id="${r._id}" style="color:var(--accent)">${r.nombre}</a></td>
                    <td>${UI.badge(r.categoria || '-', 'accent')}</td>
                    <td>${UI.stars(r.rating_promedio)} ${(r.rating_promedio || 0).toFixed(1)}</td>
                    <td>${r.total_resenas || 0}</td>
                    <td>${r.telefono || '-'}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline btn-sm btn-edit-rest" data-id="${r._id}">Editar</button>
                        <button class="btn btn-danger btn-sm btn-del-rest" data-id="${r._id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="6" class="empty-state">Sin restaurantes</td></tr>'}
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
    document.getElementById('btnNewRest')?.addEventListener('click', showCreateForm);
    document.getElementById('btnSearchRest')?.addEventListener('click', performSearch);
    document.getElementById('btnCercanos')?.addEventListener('click', showCercanosForm);
    document.getElementById('restSearch')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });

    document.querySelectorAll('.rest-detail').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); showDetail(el.dataset.id); });
    });
    document.querySelectorAll('.btn-edit-rest').forEach(el => {
      el.addEventListener('click', () => showEditForm(el.dataset.id));
    });
    document.querySelectorAll('.btn-del-rest').forEach(el => {
      el.addEventListener('click', () => deleteRestaurante(el.dataset.id));
    });
    UI.bindPagination('.pagination', (p) => { page = p; loadList(); });
  }

  function showCreateForm() {
    UI.openModal('Nuevo Restaurante', `
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
          <label class="form-label">Categoria *</label>
          <select class="form-control" id="fCat">
            ${['Comida Rapida','Italiana','Asiatica','Mexicana','Americana','Mediterranea','Francesa','Japonesa','China','Peruana','Guatemalteca','Postres','Cafe','Otro'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Telefono</label>
          <input class="form-control" id="fTel">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Latitud</label>
          <input class="form-control" type="number" step="any" id="fLat" value="14.6349">
        </div>
        <div class="form-group">
          <label class="form-label">Longitud</label>
          <input class="form-control" type="number" step="any" id="fLon" value="-90.5069">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email contacto</label>
        <input class="form-control" type="email" id="fEmail">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveRest">Guardar</button>
      </div>
    `);
    document.getElementById('btnSaveRest').addEventListener('click', async () => {
      const nombre = UI.formValue('fNombre');
      if (!nombre) return UI.toast('El nombre es obligatorio', 'error');
      try {
        await API.restaurantes.crear({
          nombre,
          descripcion: UI.formValue('fDesc'),
          categoria: UI.formValue('fCat'),
          telefono: UI.formValue('fTel'),
          latitud: UI.formFloat('fLat'),
          longitud: UI.formFloat('fLon'),
          email_contacto: UI.formValue('fEmail')
        });
        UI.closeModal();
        UI.toast('Restaurante creado', 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showEditForm(id) {
    try {
      const r = await API.restaurantes.obtener(id);
      UI.openModal('Editar Restaurante', `
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input class="form-control" id="fNombre" value="${r.nombre || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Descripcion</label>
          <textarea class="form-control" id="fDesc">${r.descripcion || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Telefono</label>
            <input class="form-control" id="fTel" value="${r.telefono || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" id="fEmail" value="${r.email_contacto || ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
          <button class="btn btn-primary" id="btnUpdateRest">Actualizar</button>
        </div>
      `);
      document.getElementById('btnUpdateRest').addEventListener('click', async () => {
        try {
          const datos = {};
          const nombre = UI.formValue('fNombre');
          const descripcion = UI.formValue('fDesc');
          const telefono = UI.formValue('fTel');
          const email_contacto = UI.formValue('fEmail');
          if (nombre) datos.nombre = nombre;
          if (descripcion) datos.descripcion = descripcion;
          if (telefono) datos.telefono = telefono;
          if (email_contacto) datos.email_contacto = email_contacto;
          await API.restaurantes.actualizar(id, datos);
          UI.closeModal();
          UI.toast('Restaurante actualizado', 'success');
          loadList();
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function showDetail(id) {
    try {
      const r = await API.restaurantes.obtener(id);
      UI.openModal('Detalle de Restaurante', `
        <div class="detail-list">
          <span class="detail-label">ID</span><span>${r._id}</span>
          <span class="detail-label">Nombre</span><span>${r.nombre}</span>
          <span class="detail-label">Descripcion</span><span>${r.descripcion || '-'}</span>
          <span class="detail-label">Categoria</span><span>${UI.badge(r.categoria, 'accent')}</span>
          <span class="detail-label">Rating</span><span>${UI.stars(r.rating_promedio)} ${(r.rating_promedio || 0).toFixed(1)}</span>
          <span class="detail-label">Total Resenas</span><span>${r.total_resenas || 0}</span>
          <span class="detail-label">Telefono</span><span>${r.telefono || '-'}</span>
          <span class="detail-label">Email</span><span>${r.email_contacto || '-'}</span>
          <span class="detail-label">Creado</span><span>${UI.formatDate(r.fecha_creacion)}</span>
        </div>
      `);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function deleteRestaurante(id) {
    if (!UI.confirm('Eliminar este restaurante?')) return;
    try {
      await API.restaurantes.eliminar(id);
      UI.toast('Restaurante eliminado', 'success');
      loadList();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function performSearch() {
    const texto = document.getElementById('restSearch')?.value?.trim();
    if (!texto) return loadList();
    try {
      const items = await API.restaurantes.buscar({ texto, limit: 20 });
      const arr = Array.isArray(items) ? items : (items.data || []);
      renderSearchResults(arr, `Resultados para "${texto}"`);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  function showCercanosForm() {
    UI.openModal('Buscar Cercanos (2dsphere)', `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Latitud</label>
          <input class="form-control" type="number" step="any" id="cLat" value="14.6349">
        </div>
        <div class="form-group">
          <label class="form-label">Longitud</label>
          <input class="form-control" type="number" step="any" id="cLon" value="-90.5069">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Distancia maxima (metros)</label>
        <input class="form-control" type="number" id="cDist" value="5000">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnBuscarCerc">Buscar</button>
      </div>
    `);
    document.getElementById('btnBuscarCerc').addEventListener('click', async () => {
      try {
        const items = await API.restaurantes.cercanos({
          latitud: UI.formFloat('cLat'),
          longitud: UI.formFloat('cLon'),
          distancia: UI.formInt('cDist')
        });
        UI.closeModal();
        const arr = Array.isArray(items) ? items : (items.data || []);
        renderSearchResults(arr, 'Restaurantes cercanos');
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  function renderSearchResults(items, title) {
    UI.render(`
      <div class="toolbar">
        <div class="toolbar-left">
          <strong>${title} (${items.length})</strong>
        </div>
        <button class="btn btn-outline" id="btnBackList">Volver a lista</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Nombre</th><th>Categoria</th><th>Rating</th></tr></thead>
            <tbody>
              ${items.map(r => `
                <tr>
                  <td>${r.nombre}</td>
                  <td>${UI.badge(r.categoria || '-', 'accent')}</td>
                  <td>${UI.stars(r.rating_promedio)} ${(r.rating_promedio || 0).toFixed(1)}</td>
                </tr>
              `).join('') || '<tr><td colspan="3" class="empty-state">Sin resultados</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `);
    document.getElementById('btnBackList')?.addEventListener('click', loadList);
  }

  return { render };
})();
