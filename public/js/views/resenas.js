const ResenasView = (() => {
  let page = 1;
  const limit = 15;

  async function render() {
    UI.setTitle('Resenas');
    UI.loading();
    await loadList();
  }

  async function loadList() {
    try {
      const skip = (page - 1) * limit;
      const data = await API.resenas.listar({ skip, limit });
      const items = Array.isArray(data) ? data : (data.data || []);

      UI.render(`
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="btn btn-outline btn-sm" id="btnGridFS">Archivos GridFS</button>
          </div>
          <button class="btn btn-primary" id="btnNewResena">+ Nueva Resena</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Calificacion</th>
                  <th>Usuario</th>
                  <th>Restaurante</th>
                  <th>Comentario</th>
                  <th>Imagenes</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${items.length ? items.map(r => `
                  <tr>
                    <td>${UI.stars(r.calificacion)} ${r.calificacion}</td>
                    <td>${r.usuario?.nombre || UI.truncate(r.usuario_id, 8)}</td>
                    <td>${r.restaurante?.nombre || UI.truncate(r.restaurante_id, 8)}</td>
                    <td>${UI.truncate(r.comentario, 50)}</td>
                    <td>${r.imagenes?.length || 0}</td>
                    <td>${UI.formatDate(r.fecha_creacion)}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline btn-sm btn-detail-res" data-id="${r._id}">Ver</button>
                        <button class="btn btn-outline btn-sm btn-img-res" data-id="${r._id}">Imagen</button>
                        <button class="btn btn-danger btn-sm btn-del-res" data-id="${r._id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="7" class="empty-state">Sin resenas</td></tr>'}
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
    document.getElementById('btnNewResena')?.addEventListener('click', showCreateForm);
    document.getElementById('btnGridFS')?.addEventListener('click', showGridFSFiles);
    document.querySelectorAll('.btn-detail-res').forEach(el => {
      el.addEventListener('click', () => showDetail(el.dataset.id));
    });
    document.querySelectorAll('.btn-img-res').forEach(el => {
      el.addEventListener('click', () => showUploadForm(el.dataset.id));
    });
    document.querySelectorAll('.btn-del-res').forEach(el => {
      el.addEventListener('click', () => deleteResena(el.dataset.id));
    });
    UI.bindPagination('.pagination', (p) => { page = p; loadList(); });
  }

  function showCreateForm() {
    UI.openModal('Nueva Resena', `
      <div class="form-group">
        <label class="form-label">ID del usuario *</label>
        <input class="form-control" id="fUserId">
      </div>
      <div class="form-group">
        <label class="form-label">ID de la orden (debe estar entregada) *</label>
        <input class="form-control" id="fOrdenId">
      </div>
      <div class="form-group">
        <label class="form-label">Calificacion (1-5) *</label>
        <select class="form-control" id="fCalif">
          ${[5,4,3,2,1].map(n => `<option value="${n}">${n} - ${'&#9733;'.repeat(n)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Comentario</label>
        <textarea class="form-control" id="fComentario"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveResena">Guardar</button>
      </div>
    `);
    document.getElementById('btnSaveResena').addEventListener('click', async () => {
      const usuario_id = UI.formValue('fUserId');
      const orden_id = UI.formValue('fOrdenId');
      if (!usuario_id || !orden_id) return UI.toast('Usuario y orden son obligatorios', 'error');
      try {
        await API.resenas.crear({
          usuario_id, orden_id,
          calificacion: UI.formInt('fCalif'),
          comentario: UI.formValue('fComentario')
        });
        UI.closeModal();
        UI.toast('Resena creada', 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showDetail(id) {
    try {
      const r = await API.resenas.obtener(id);
      UI.openModal('Detalle de Resena', `
        <div class="detail-list">
          <span class="detail-label">ID</span><span>${r._id}</span>
          <span class="detail-label">Calificacion</span><span>${UI.stars(r.calificacion)} ${r.calificacion}/5</span>
          <span class="detail-label">Usuario</span><span>${r.usuario?.nombre || r.usuario_id}</span>
          <span class="detail-label">Restaurante</span><span>${r.restaurante?.nombre || r.restaurante_id}</span>
          <span class="detail-label">Comentario</span><span>${r.comentario || '-'}</span>
          <span class="detail-label">Fecha</span><span>${UI.formatDate(r.fecha_creacion)}</span>
        </div>
        ${r.imagenes?.length ? `
          <h4 style="margin:16px 0 8px;font-size:14px">Imagenes (${r.imagenes.length})</h4>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${r.imagenes.map(img => `
              <div class="card" style="padding:8px;font-size:12px">
                <div>${img.filename || img.file_id}</div>
                <div class="btn-group" style="margin-top:4px">
                  <a href="/api/resenas/archivos/${img.file_id}" target="_blank" class="btn btn-outline btn-sm">Descargar</a>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  function showUploadForm(resenaId) {
    UI.openModal('Subir Imagen (GridFS)', `
      <div class="form-group">
        <label class="form-label">Archivo de imagen *</label>
        <input class="form-control" type="file" id="fImagen" accept="image/*">
      </div>
      <div class="form-group">
        <label class="form-label">Descripcion</label>
        <input class="form-control" id="fImgDesc">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnUploadImg">Subir</button>
      </div>
    `);
    document.getElementById('btnUploadImg').addEventListener('click', async () => {
      const fileInput = document.getElementById('fImagen');
      if (!fileInput.files.length) return UI.toast('Selecciona un archivo', 'error');
      const fd = new FormData();
      fd.append('imagen', fileInput.files[0]);
      fd.append('descripcion', UI.formValue('fImgDesc'));
      try {
        await API.resenas.subirImagen(resenaId, fd);
        UI.closeModal();
        UI.toast('Imagen subida', 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showGridFSFiles() {
    try {
      const data = await API.resenas.listarArchivos();
      const archivos = Array.isArray(data) ? data : (data.data || []);
      UI.openModal('Archivos en GridFS', `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Nombre</th><th>Tamano</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              ${archivos.length ? archivos.map(a => `
                <tr>
                  <td>${a.filename}</td>
                  <td>${(a.length / 1024).toFixed(1)} KB</td>
                  <td>${UI.formatDate(a.uploadDate)}</td>
                  <td><a href="/api/resenas/archivos/${a._id}" target="_blank" class="btn btn-outline btn-sm">Descargar</a></td>
                </tr>
              `).join('') : '<tr><td colspan="4" class="empty-state">Sin archivos</td></tr>'}
            </tbody>
          </table>
        </div>
      `);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function deleteResena(id) {
    if (!UI.confirm('Eliminar esta resena?')) return;
    try {
      await API.resenas.eliminar(id);
      UI.toast('Resena eliminada', 'success');
      loadList();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  return { render };
})();
