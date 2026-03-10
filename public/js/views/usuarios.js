const UsuariosView = (() => {
  let page = 1;
  const limit = 15;

  async function render() {
    UI.setTitle('Usuarios');
    UI.loading();
    await loadList();
  }

  async function loadList() {
    try {
      const skip = (page - 1) * limit;
      const data = await API.usuarios.listar({ skip, limit });
      const items = Array.isArray(data) ? data : (data.data || []);

      UI.render(`
        <div class="toolbar">
          <div class="toolbar-left"></div>
          <button class="btn btn-primary" id="btnNewUser">+ Nuevo Usuario</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Telefono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${items.length ? items.map(u => `
                  <tr>
                    <td><a href="#" class="user-detail" data-id="${u._id}" style="color:var(--accent)">${u.nombre}</a></td>
                    <td>${u.email || '-'}</td>
                    <td>${UI.badge(u.rol || 'cliente', u.rol === 'admin' ? 'warning' : 'info')}</td>
                    <td>${u.telefono || '-'}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline btn-sm btn-edit-user" data-id="${u._id}">Editar</button>
                        <button class="btn btn-danger btn-sm btn-del-user" data-id="${u._id}">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="5" class="empty-state">Sin usuarios</td></tr>'}
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
    document.getElementById('btnNewUser')?.addEventListener('click', showCreateForm);
    document.querySelectorAll('.user-detail').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); showDetail(el.dataset.id); });
    });
    document.querySelectorAll('.btn-edit-user').forEach(el => {
      el.addEventListener('click', () => showEditForm(el.dataset.id));
    });
    document.querySelectorAll('.btn-del-user').forEach(el => {
      el.addEventListener('click', () => deleteUser(el.dataset.id));
    });
    UI.bindPagination('.pagination', (p) => { page = p; loadList(); });
  }

  function showCreateForm() {
    UI.openModal('Nuevo Usuario', `
      <div class="form-group">
        <label class="form-label">Nombre completo *</label>
        <input class="form-control" id="fNombre">
      </div>
      <div class="form-group">
        <label class="form-label">Email *</label>
        <input class="form-control" type="email" id="fEmail">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Telefono</label>
          <input class="form-control" id="fTel">
        </div>
        <div class="form-group">
          <label class="form-label">Rol</label>
          <select class="form-control" id="fRol">
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Direccion principal</label>
        <input class="form-control" id="fDir">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSaveUser">Guardar</button>
      </div>
    `);
    document.getElementById('btnSaveUser').addEventListener('click', async () => {
      const nombre = UI.formValue('fNombre');
      const email = UI.formValue('fEmail');
      if (!nombre || !email) return UI.toast('Nombre y email son obligatorios', 'error');
      try {
        await API.usuarios.crear({
          nombre, email,
          password_hash: `hash_${Date.now()}`,
          telefono: UI.formValue('fTel'),
          rol: UI.formValue('fRol'),
          direccion_principal: UI.formValue('fDir')
        });
        UI.closeModal();
        UI.toast('Usuario creado', 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  async function showEditForm(id) {
    try {
      const u = await API.usuarios.obtener(id);
      UI.openModal('Editar Usuario', `
        <div class="form-group">
          <label class="form-label">Nombre</label>
          <input class="form-control" id="fNombre" value="${u.nombre || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Telefono</label>
          <input class="form-control" id="fTel" value="${u.telefono || ''}">
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
          <button class="btn btn-primary" id="btnUpdateUser">Actualizar</button>
        </div>
      `);
      document.getElementById('btnUpdateUser').addEventListener('click', async () => {
        try {
          const datos = {};
          const nombre = UI.formValue('fNombre');
          const telefono = UI.formValue('fTel');
          if (nombre) datos.nombre = nombre;
          if (telefono) datos.telefono = telefono;
          await API.usuarios.actualizar(id, datos);
          UI.closeModal();
          UI.toast('Usuario actualizado', 'success');
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
      const u = await API.usuarios.obtener(id);
      UI.openModal('Detalle de Usuario', `
        <div class="detail-list">
          <span class="detail-label">ID</span><span>${u._id}</span>
          <span class="detail-label">Nombre</span><span>${u.nombre}</span>
          <span class="detail-label">Email</span><span>${u.email || '-'}</span>
          <span class="detail-label">Rol</span><span>${UI.badge(u.rol || 'cliente', u.rol === 'admin' ? 'warning' : 'info')}</span>
          <span class="detail-label">Telefono</span><span>${u.telefono || '-'}</span>
          <span class="detail-label">Direccion</span><span>${u.direccion_principal || '-'}</span>
          <span class="detail-label">Creado</span><span>${UI.formatDate(u.fecha_registro)}</span>
        </div>
      `);
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  async function deleteUser(id) {
    if (!UI.confirm('Eliminar este usuario?')) return;
    try {
      await API.usuarios.eliminar(id);
      UI.toast('Usuario eliminado', 'success');
      loadList();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  }

  return { render };
})();
