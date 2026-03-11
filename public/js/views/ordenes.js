const OrdenesView = (() => {
  let page = 1;
  let pageSize = 15;
  let filtroEstado = '';
  let filtroMetodoPago = '';
  let sortField = 'fecha_creacion';
  let sortOrder = -1;
  let projectionPreset = 'completa';

  async function render() {
    UI.setTitle('Ordenes');
    UI.loading();
    await loadList();
  }

  async function loadList() {
    try {
      const skip = (page - 1) * pageSize;
      const params = {
        skip,
        limit: pageSize,
        sort_field: sortField,
        sort_order: sortOrder
      };
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroMetodoPago) params.metodo_pago = filtroMetodoPago;
      const campos = getProjectionFields(projectionPreset);
      if (campos) params.campos = campos;

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
            <select class="form-control" id="filtroMetodoPago" style="width:170px">
              <option value="">Todos los pagos</option>
              ${['efectivo','tarjeta','transferencia'].map(m =>
                `<option value="${m}" ${m === filtroMetodoPago ? 'selected' : ''}>${m}</option>`
              ).join('')}
            </select>
            <select class="form-control" id="sortFieldOrd" style="width:170px">
              <option value="fecha_creacion" ${sortField === 'fecha_creacion' ? 'selected' : ''}>Ordenar por fecha</option>
              <option value="total" ${sortField === 'total' ? 'selected' : ''}>Ordenar por total</option>
              <option value="estado" ${sortField === 'estado' ? 'selected' : ''}>Ordenar por estado</option>
            </select>
            <select class="form-control" id="sortOrderOrd" style="width:120px">
              <option value="-1" ${sortOrder === -1 ? 'selected' : ''}>Desc ▼</option>
              <option value="1" ${sortOrder === 1 ? 'selected' : ''}>Asc ▲</option>
            </select>
            <select class="form-control" id="projectionOrd" style="width:190px">
              <option value="completa" ${projectionPreset === 'completa' ? 'selected' : ''}>Proyeccion: Completa</option>
              <option value="resumen" ${projectionPreset === 'resumen' ? 'selected' : ''}>Proyeccion: Resumen</option>
              <option value="operativa" ${projectionPreset === 'operativa' ? 'selected' : ''}>Proyeccion: Operativa</option>
            </select>
            <select class="form-control" id="limitOrd" style="width:110px">
              ${[15, 30, 50].map(n => `<option value="${n}" ${pageSize === n ? 'selected' : ''}>Limite ${n}</option>`).join('')}
            </select>
          </div>
          <div class="btn-group">
            <button class="btn btn-outline" id="btnBulkUpdateOrder">Actualizar varios</button>
            <button class="btn btn-outline" id="btnBulkDeleteOrder">Eliminar varios</button>
            <button class="btn btn-primary" id="btnNewOrder">+ Nueva Orden</button>
          </div>
        </div>
        <div class="toolbar" style="margin-top:-8px">
          <div class="toolbar-left" style="font-size:13px;color:var(--text-secondary)">
            Consulta actual: skip=${skip}, limite=${pageSize}, lookup=Usuarios+Restaurantes
          </div>
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
          ${UI.pagination(page, items.length === pageSize ? page + 1 : page)}
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
    document.getElementById('filtroMetodoPago')?.addEventListener('change', (e) => {
      filtroMetodoPago = e.target.value;
      page = 1;
      loadList();
    });
    document.getElementById('sortFieldOrd')?.addEventListener('change', (e) => {
      sortField = e.target.value || 'fecha_creacion';
      page = 1;
      loadList();
    });
    document.getElementById('sortOrderOrd')?.addEventListener('change', (e) => {
      sortOrder = parseInt(e.target.value, 10) === 1 ? 1 : -1;
      page = 1;
      loadList();
    });
    document.getElementById('projectionOrd')?.addEventListener('change', (e) => {
      projectionPreset = e.target.value || 'completa';
      page = 1;
      loadList();
    });
    document.getElementById('limitOrd')?.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10) || 15;
      page = 1;
      loadList();
    });
    document.getElementById('btnNewOrder')?.addEventListener('click', showCreateForm);
    document.getElementById('btnBulkUpdateOrder')?.addEventListener('click', showBulkUpdateForm);
    document.getElementById('btnBulkDeleteOrder')?.addEventListener('click', showBulkDeleteForm);
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

  async function showCreateForm() {
    UI.openModal('Nueva Orden', '<div class="loading-state"><div class="spinner"></div> Preparando formulario...</div>');

    try {
      const [usersData, restaurantesData] = await Promise.all([
        API.usuarios.listar({ limit: 300 }),
        API.restaurantes.listar({ limit: 100 })
      ]);

      const state = {
        users: extractArray(usersData),
        restaurants: extractArray(restaurantesData),
        menuItems: [],
        selectedUserId: '',
        selectedRestaurantId: '',
        selectedMenuItemId: '',
        userSearch: '',
        restaurantSearch: '',
        menuSearch: '',
        menuRequestId: 0,
        openPicker: '',
        items: [],
        menuLoading: false,
        submitting: false
      };

      UI.openModal('Nueva Orden', `
        <div class="order-builder">
          <div class="order-builder-grid">
            <section class="selection-panel">
              <h4>1. Usuario</h4>
              <p>Busca por nombre, correo o telefono y luego selecciona el usuario.</p>
              <div class="form-group">
                <label class="form-label">Buscar usuario</label>
                <div class="picker">
                  <input class="form-control" id="orderUserSearch" placeholder="Ej: Diego, correo o telefono" autocomplete="off">
                  <div class="picker-results" id="orderUserResults"></div>
                </div>
              </div>
              <div class="selection-summary empty" id="orderUserSummary">
                <small>No has seleccionado un usuario todavia.</small>
              </div>
            </section>

            <section class="selection-panel">
              <h4>2. Restaurante</h4>
              <p>Selecciona el restaurante para cargar automaticamente su menu disponible.</p>
              <div class="form-group">
                <label class="form-label">Buscar restaurante</label>
                <div class="picker">
                  <input class="form-control" id="orderRestaurantSearch" placeholder="Ej: pizza, sushi, categoria" autocomplete="off">
                  <div class="picker-results" id="orderRestaurantResults"></div>
                </div>
              </div>
              <div class="selection-summary empty" id="orderRestaurantSummary">
                <small>No has seleccionado un restaurante todavia.</small>
              </div>
            </section>
          </div>

          <section class="order-builder-section">
            <h4>3. Items de la orden</h4>
            <p>Agrega articulos desde el menu del restaurante seleccionado. La orden se arma visualmente aqui mismo.</p>
            <div class="helper-text" id="orderMenuStatus">Selecciona un restaurante para cargar su menu.</div>
            <div class="order-item-controls">
              <div class="form-group">
                <label class="form-label">Buscar articulo</label>
                <div class="picker">
                  <input class="form-control" id="orderMenuSearch" placeholder="Ej: hamburguesa, bebida" autocomplete="off" disabled>
                  <div class="picker-results" id="orderMenuResults"></div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Cantidad</label>
                <input class="form-control" id="orderItemQuantity" type="number" min="1" value="1" disabled>
              </div>
              <button class="btn btn-primary" id="btnAddOrderItem" disabled>Agregar item</button>
            </div>
            <div id="orderItemsSummary"></div>
          </section>

          <div class="form-group">
            <label class="form-label">Metodo de pago</label>
            <select class="form-control" id="orderPaymentMethod">
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnSaveOrder">Crear Orden</button>
          </div>
        </div>
      `);

      const userSearchInput = document.getElementById('orderUserSearch');
      const userResults = document.getElementById('orderUserResults');
      const userSummary = document.getElementById('orderUserSummary');

      const restaurantSearchInput = document.getElementById('orderRestaurantSearch');
      const restaurantResults = document.getElementById('orderRestaurantResults');
      const restaurantSummary = document.getElementById('orderRestaurantSummary');

      const menuStatus = document.getElementById('orderMenuStatus');
      const menuSearchInput = document.getElementById('orderMenuSearch');
      const menuResults = document.getElementById('orderMenuResults');
      const itemQuantityInput = document.getElementById('orderItemQuantity');
      const addItemButton = document.getElementById('btnAddOrderItem');
      const itemsSummary = document.getElementById('orderItemsSummary');
      const saveButton = document.getElementById('btnSaveOrder');
      const paymentMethodSelect = document.getElementById('orderPaymentMethod');

      function renderUserResults() {
        const filtered = limitResults(state.users.filter(u => matchesSearch(
          [u.nombre, u.email, u.telefono, u.rol],
          state.userSearch
        )), state.userSearch, 6);

        renderPickerResults(userResults, filtered, {
          isOpen: state.openPicker === 'user',
          emptyLabel: 'No se encontraron usuarios',
          selectedValue: state.selectedUserId,
          getValue: (u) => u._id,
          getTitle: (u) => u.nombre || 'Sin nombre',
          getMeta: (u) => `${u.email || 'Sin email'}${u.telefono ? ` | ${u.telefono}` : ''}`,
          dataAttr: 'data-user-id'
        });
      }

      function renderRestaurantResults() {
        const filtered = limitResults(state.restaurants.filter(r => matchesSearch(
          [r.nombre, r.categoria, r.telefono],
          state.restaurantSearch
        )), state.restaurantSearch, 6);

        renderPickerResults(restaurantResults, filtered, {
          isOpen: state.openPicker === 'restaurant',
          emptyLabel: 'No se encontraron restaurantes',
          selectedValue: state.selectedRestaurantId,
          getValue: (r) => r._id,
          getTitle: (r) => r.nombre || 'Sin nombre',
          getMeta: (r) => `${r.categoria || 'Sin categoria'}${r.telefono ? ` | ${r.telefono}` : ''}`,
          dataAttr: 'data-restaurant-id'
        });
      }

      function renderUserSummary() {
        const user = state.users.find(u => String(u._id) === String(state.selectedUserId));
        if (!user) {
          userSummary.className = 'selection-summary empty';
          userSummary.innerHTML = '<small>No has seleccionado un usuario todavia.</small>';
          return;
        }

        userSummary.className = 'selection-summary';
        userSummary.innerHTML = `
          <strong>${escapeHtml(user.nombre || 'Sin nombre')}</strong>
          <small>${escapeHtml(user.email || 'Sin email')}</small>
          <small>${escapeHtml(user.telefono || 'Sin telefono')} | Rol: ${escapeHtml(user.rol || 'cliente')}</small>
        `;
      }

      function renderRestaurantSummary() {
        const restaurant = state.restaurants.find(r => String(r._id) === String(state.selectedRestaurantId));
        if (!restaurant) {
          restaurantSummary.className = 'selection-summary empty';
          restaurantSummary.innerHTML = '<small>No has seleccionado un restaurante todavia.</small>';
          return;
        }

        restaurantSummary.className = 'selection-summary';
        restaurantSummary.innerHTML = `
          <strong>${escapeHtml(restaurant.nombre || 'Sin nombre')}</strong>
          <small>Categoria: ${escapeHtml(restaurant.categoria || 'Sin categoria')}</small>
          <small>Rating: ${(restaurant.rating_promedio || 0).toFixed(1)} | Telefono: ${escapeHtml(restaurant.telefono || '-')}</small>
        `;
      }

      function renderMenuResults() {
        const hasRestaurant = !!state.selectedRestaurantId;
        const filtered = getFilteredMenuItems(state);
        const canSearchMenu = hasRestaurant && !state.menuLoading && state.menuItems.length > 0;
        const visibleItems = limitResults(filtered, state.menuSearch, 8);
        const canAddItem = canSearchMenu && !!state.selectedMenuItemId;

        menuSearchInput.disabled = !canSearchMenu;
        itemQuantityInput.disabled = !canAddItem;
        addItemButton.disabled = !canAddItem;

        if (!hasRestaurant) {
          menuStatus.textContent = 'Selecciona un restaurante para cargar su menu.';
          renderPickerResults(menuResults, [], {
            isOpen: false,
            emptyLabel: 'No hay menu cargado',
            dataAttr: 'data-menu-id'
          });
          return;
        }

        if (state.menuLoading) {
          menuStatus.textContent = 'Cargando articulos del menu...';
          renderPickerResults(menuResults, [], {
            isOpen: state.openPicker === 'menu',
            emptyLabel: 'Cargando menu...',
            dataAttr: 'data-menu-id'
          });
          return;
        }

        if (!state.menuItems.length) {
          menuStatus.textContent = 'Este restaurante no tiene articulos disponibles para ordenar.';
          renderPickerResults(menuResults, [], {
            isOpen: state.openPicker === 'menu',
            emptyLabel: 'Sin articulos disponibles',
            dataAttr: 'data-menu-id'
          });
          return;
        }

        menuStatus.textContent = visibleItems.length
          ? `${visibleItems.length} sugerencia(s) disponibles para agregar a la orden.`
          : 'No hay coincidencias para esta busqueda.';

        renderPickerResults(menuResults, visibleItems, {
          isOpen: state.openPicker === 'menu',
          emptyLabel: 'No hay coincidencias para esta busqueda',
          selectedValue: state.selectedMenuItemId,
          getValue: (item) => item._id,
          getTitle: (item) => item.nombre,
          getMeta: (item) => `${UI.formatMoney(item.precio)} | Stock ${getRemainingStock(state, item._id)}`,
          dataAttr: 'data-menu-id'
        });
      }

      function renderItemsSummary() {
        if (!state.items.length) {
          itemsSummary.innerHTML = `
            <div class="selection-summary empty">
              <small>No has agregado items a la orden.</small>
            </div>
          `;
          return;
        }

        const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0);
        const totalMonto = state.items.reduce((sum, item) => sum + item.subtotal, 0);

        itemsSummary.innerHTML = `
          <div class="table-wrapper">
            <table class="order-items-table">
              <thead>
                <tr>
                  <th>Articulo</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${state.items.map(item => `
                  <tr>
                    <td>${escapeHtml(item.nombre)}</td>
                    <td>${UI.formatMoney(item.precio_unitario)}</td>
                    <td>
                      <input
                        class="form-control order-qty-input"
                        type="number"
                        min="1"
                        max="${getItemStock(state, item.menu_item_id)}"
                        value="${item.cantidad}"
                        data-qty-id="${item.menu_item_id}"
                      >
                    </td>
                    <td>${UI.formatMoney(item.subtotal)}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" data-remove-id="${item.menu_item_id}">Quitar</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="order-summary" style="margin-top:12px">
            <span>${totalItems} item(s) en la orden</span>
            <strong>${UI.formatMoney(totalMonto)}</strong>
          </div>
        `;
      }

      async function loadMenuForRestaurant(restauranteId) {
        if (!restauranteId) {
          state.menuItems = [];
          state.selectedMenuItemId = '';
          state.menuSearch = '';
          menuSearchInput.value = '';
          renderMenuResults();
          renderItemsSummary();
          return;
        }

        state.menuLoading = true;
        state.menuItems = [];
        state.selectedMenuItemId = '';
        state.menuSearch = '';
        menuSearchInput.value = '';
        itemQuantityInput.value = '1';
        renderMenuResults();

        const requestId = ++state.menuRequestId;
        try {
          const data = await API.menu.listar(restauranteId, {
            limit: 200,
            solo_disponibles: true
          });
          if (requestId !== state.menuRequestId) return;
          state.menuItems = extractArray(data).filter(item => (item.stock || 0) > 0);
        } catch (err) {
          if (requestId !== state.menuRequestId) return;
          state.menuItems = [];
          UI.toast(err.message, 'error');
        } finally {
          if (requestId !== state.menuRequestId) return;
          state.menuLoading = false;
          renderMenuResults();
          renderItemsSummary();
        }
      }

      function addSelectedItem() {
        if (!state.selectedRestaurantId) {
          UI.toast('Selecciona un restaurante primero', 'error');
          return;
        }

        const menuItemId = state.selectedMenuItemId;
        if (!menuItemId) {
          UI.toast('Selecciona un articulo del menu', 'error');
          return;
        }

        const menuItem = state.menuItems.find(item => String(item._id) === String(menuItemId));
        if (!menuItem) {
          UI.toast('El articulo seleccionado ya no esta disponible', 'error');
          return;
        }

        const cantidad = parseInt(itemQuantityInput.value, 10) || 1;
        if (cantidad < 1) {
          UI.toast('La cantidad debe ser mayor a cero', 'error');
          return;
        }

        const existente = state.items.find(item => String(item.menu_item_id) === String(menuItemId));
        const cantidadActual = existente ? existente.cantidad : 0;
        if (cantidadActual + cantidad > menuItem.stock) {
          UI.toast(`Stock insuficiente para "${menuItem.nombre}". Disponible: ${menuItem.stock - cantidadActual}`, 'error');
          return;
        }

        if (existente) {
          existente.cantidad += cantidad;
          existente.subtotal = existente.cantidad * existente.precio_unitario;
        } else {
          state.items.push({
            menu_item_id: menuItemId,
            nombre: menuItem.nombre,
            precio_unitario: menuItem.precio,
            cantidad,
            subtotal: menuItem.precio * cantidad
          });
        }

        state.selectedMenuItemId = '';
        state.menuSearch = '';
        menuSearchInput.value = '';
        state.openPicker = '';
        itemQuantityInput.value = '1';
        renderMenuResults();
        renderItemsSummary();
      }

      async function submitOrder() {
        if (state.submitting) return;
        if (!state.selectedUserId) return UI.toast('Selecciona un usuario', 'error');
        if (!state.selectedRestaurantId) return UI.toast('Selecciona un restaurante', 'error');
        if (!state.items.length) return UI.toast('Agrega al menos un item', 'error');

        state.submitting = true;
        saveButton.disabled = true;
        saveButton.textContent = 'Creando...';

        try {
          const result = await API.ordenes.crear({
            usuario_id: state.selectedUserId,
            restaurante_id: state.selectedRestaurantId,
            metodo_pago: paymentMethodSelect.value,
            items: state.items.map(item => ({
              menu_item_id: item.menu_item_id,
              cantidad: item.cantidad
            }))
          });

          UI.closeModal();
          UI.toast(`Orden creada - Total: ${UI.formatMoney(result.total)}`, 'success');
          loadList();
        } catch (err) {
          UI.toast(err.message, 'error');
        } finally {
          state.submitting = false;
          saveButton.disabled = false;
          saveButton.textContent = 'Crear Orden';
        }
      }

      userSearchInput.addEventListener('input', (e) => {
        state.userSearch = e.target.value;
        state.openPicker = 'user';
        renderUserResults();
      });

      userSearchInput.addEventListener('focus', () => {
        state.openPicker = 'user';
        renderUserResults();
      });

      userResults.addEventListener('click', (e) => {
        const option = e.target.closest('[data-user-id]');
        if (!option) return;
        const user = state.users.find(entry => String(entry._id) === String(option.dataset.userId));
        if (!user) return;
        state.selectedUserId = option.dataset.userId;
        state.userSearch = user.nombre || '';
        userSearchInput.value = state.userSearch;
        state.openPicker = '';
        renderUserSummary();
        renderUserResults();
      });

      restaurantSearchInput.addEventListener('input', (e) => {
        state.restaurantSearch = e.target.value;
        state.openPicker = 'restaurant';
        renderRestaurantResults();
      });

      restaurantSearchInput.addEventListener('focus', () => {
        state.openPicker = 'restaurant';
        renderRestaurantResults();
      });

      restaurantResults.addEventListener('click', async (e) => {
        const option = e.target.closest('[data-restaurant-id]');
        if (!option) return;
        const nextRestaurantId = option.dataset.restaurantId;
        if (nextRestaurantId === state.selectedRestaurantId) return;

        if (state.items.length && state.selectedRestaurantId) {
          const confirmed = UI.confirm('Cambiar el restaurante limpiara los items agregados. Continuar?');
          if (!confirmed) {
            const restaurant = state.restaurants.find(entry => String(entry._id) === String(state.selectedRestaurantId));
            state.restaurantSearch = restaurant ? (restaurant.nombre || '') : '';
            restaurantSearchInput.value = state.restaurantSearch;
            state.openPicker = '';
            renderRestaurantResults();
            return;
          }
        }

        const restaurant = state.restaurants.find(entry => String(entry._id) === String(nextRestaurantId));
        state.selectedRestaurantId = nextRestaurantId;
        state.restaurantSearch = restaurant ? (restaurant.nombre || '') : '';
        restaurantSearchInput.value = state.restaurantSearch;
        state.openPicker = '';
        state.items = [];
        renderRestaurantSummary();
        renderItemsSummary();
        renderRestaurantResults();
        await loadMenuForRestaurant(nextRestaurantId);
      });

      menuSearchInput.addEventListener('input', (e) => {
        state.menuSearch = e.target.value;
        state.selectedMenuItemId = '';
        state.openPicker = 'menu';
        renderMenuResults();
      });

      menuSearchInput.addEventListener('focus', () => {
        if (menuSearchInput.disabled) return;
        state.openPicker = 'menu';
        renderMenuResults();
      });

      menuResults.addEventListener('click', (e) => {
        const option = e.target.closest('[data-menu-id]');
        if (!option) return;
        const menuItem = state.menuItems.find(entry => String(entry._id) === String(option.dataset.menuId));
        if (!menuItem) return;
        state.selectedMenuItemId = option.dataset.menuId;
        state.menuSearch = menuItem.nombre || '';
        menuSearchInput.value = state.menuSearch;
        state.openPicker = '';
        renderMenuResults();
      });

      addItemButton.addEventListener('click', addSelectedItem);
      saveButton.addEventListener('click', submitOrder);

      itemsSummary.addEventListener('click', (e) => {
        const removeButton = e.target.closest('[data-remove-id]');
        if (!removeButton) return;
        state.items = state.items.filter(item => String(item.menu_item_id) !== String(removeButton.dataset.removeId));
        renderMenuResults();
        renderItemsSummary();
      });

      itemsSummary.addEventListener('change', (e) => {
        const qtyInput = e.target.closest('[data-qty-id]');
        if (!qtyInput) return;

        const item = state.items.find(entry => String(entry.menu_item_id) === String(qtyInput.dataset.qtyId));
        if (!item) return;

        const newQty = parseInt(qtyInput.value, 10) || 1;
        const stock = getItemStock(state, item.menu_item_id);
        if (newQty < 1 || newQty > stock) {
          UI.toast(`La cantidad debe estar entre 1 y ${stock}`, 'error');
          renderItemsSummary();
          return;
        }

        item.cantidad = newQty;
        item.subtotal = item.cantidad * item.precio_unitario;
        renderMenuResults();
        renderItemsSummary();
      });

      const outsideClickHandler = (e) => {
        if (!document.body.contains(userResults)) {
          document.removeEventListener('click', outsideClickHandler);
          return;
        }
        if (e.target.closest('.picker')) return;
        if (!state.openPicker) return;
        state.openPicker = '';
        renderUserResults();
        renderRestaurantResults();
        renderMenuResults();
      };

      document.addEventListener('click', outsideClickHandler);

      renderUserResults();
      renderRestaurantResults();
      renderUserSummary();
      renderRestaurantSummary();
      renderMenuResults();
      renderItemsSummary();
    } catch (err) {
      UI.openModal('Nueva Orden', `<div class="empty-state"><p>Error preparando formulario: ${err.message}</p></div>`);
    }
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

  function showBulkUpdateForm() {
    UI.openModal('Actualizar varias ordenes', `
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">
        Actualiza varias ordenes usando un filtro por estado.
      </p>
      <div class="form-group">
        <label class="form-label">Estado actual (filtro) *</label>
        <select class="form-control" id="fBulkEstadoActual">
          <option value="">Selecciona estado</option>
          ${['pendiente','preparando','enviado','entregado','cancelado'].map(e => `<option value="${e}">${e}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Nuevo estado *</label>
        <select class="form-control" id="fBulkEstadoNuevo">
          ${['pendiente','preparando','enviado','entregado','cancelado'].map(e => `<option value="${e}">${e}</option>`).join('')}
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnExecBulkUpdateOrder">Actualizar varios</button>
      </div>
    `);

    document.getElementById('btnExecBulkUpdateOrder')?.addEventListener('click', async () => {
      const estadoActual = UI.formValue('fBulkEstadoActual');
      const estadoNuevo = UI.formValue('fBulkEstadoNuevo');
      if (!estadoActual || !estadoNuevo) return UI.toast('Completa ambos estados', 'error');
      if (estadoActual === estadoNuevo) return UI.toast('El nuevo estado debe ser distinto', 'error');

      try {
        const result = await API.ordenes.actualizarVarios(
          { estado: estadoActual },
          { estado: estadoNuevo }
        );
        UI.closeModal();
        UI.toast(`Ordenes actualizadas: ${result.modificados || 0}`, 'success');
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  function showBulkDeleteForm() {
    UI.openModal('Eliminar varias ordenes', `
      <p style="font-size:13px;color:var(--danger);margin-bottom:12px">
        Esta accion elimina de forma permanente todas las ordenes que cumplan el filtro.
      </p>
      <div class="form-group">
        <label class="form-label">Estado a eliminar *</label>
        <select class="form-control" id="fBulkEstadoEliminar">
          <option value="">Selecciona estado</option>
          ${['pendiente','preparando','enviado','entregado','cancelado'].map(e => `<option value="${e}">${e}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmacion (escribe ELIMINAR)</label>
        <input class="form-control" id="fBulkDeleteConfirm" placeholder="ELIMINAR">
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="UI.closeModal()">Cancelar</button>
        <button class="btn btn-danger" id="btnExecBulkDeleteOrder">Eliminar varios</button>
      </div>
    `);

    document.getElementById('btnExecBulkDeleteOrder')?.addEventListener('click', async () => {
      const estado = UI.formValue('fBulkEstadoEliminar');
      const confirmText = UI.formValue('fBulkDeleteConfirm');
      if (!estado) return UI.toast('Selecciona un estado', 'error');
      if (confirmText !== 'ELIMINAR') return UI.toast('Debes escribir ELIMINAR para confirmar', 'error');

      try {
        const result = await API.ordenes.eliminarVarios({ estado });
        UI.closeModal();
        UI.toast(`Ordenes eliminadas: ${result.eliminados || 0}`, 'success');
        page = 1;
        loadList();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  function extractArray(data) {
    return Array.isArray(data) ? data : (data.data || []);
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function matchesSearch(values, query) {
    const normalizedQuery = normalizeText(query).trim();
    if (!normalizedQuery) return true;
    return values.some(value => normalizeText(value).includes(normalizedQuery));
  }

  function limitResults(items, query, defaultLimit = 6) {
    const trimmedQuery = String(query || '').trim();
    return items.slice(0, trimmedQuery ? 12 : defaultLimit);
  }

  function renderPickerResults(container, items, {
    isOpen,
    emptyLabel,
    selectedValue,
    getValue,
    getTitle,
    getMeta,
    dataAttr
  } = {}) {
    if (!isOpen) {
      container.classList.remove('open');
      container.innerHTML = '';
      return;
    }

    if (!items.length) {
      container.classList.add('open');
      container.innerHTML = `<div class="picker-empty">${emptyLabel || 'Sin resultados'}</div>`;
      return;
    }

    container.classList.add('open');
    container.innerHTML = items.map(item => {
      const value = getValue ? getValue(item) : item.value;
      const title = escapeHtml(getTitle ? getTitle(item) : item.title);
      const meta = escapeHtml(getMeta ? getMeta(item) : item.meta || '');
      const activeClass = selectedValue && String(value) === String(selectedValue) ? ' active' : '';
      return `
        <button type="button" class="picker-option${activeClass}" ${dataAttr}="${value}">
          <strong>${title}</strong>
          ${meta ? `<small>${meta}</small>` : ''}
        </button>
      `;
    }).join('');
  }

  function getFilteredMenuItems(state) {
    return state.menuItems.filter(item => {
      const remaining = getRemainingStock(state, item._id);
      if (remaining <= 0) return false;
      return matchesSearch([item.nombre, item.categoria, item.descripcion], state.menuSearch);
    });
  }

  function getRemainingStock(state, itemId) {
    const stock = getItemStock(state, itemId);
    const current = state.items.find(item => String(item.menu_item_id) === String(itemId));
    return stock - (current ? current.cantidad : 0);
  }

  function getItemStock(state, itemId) {
    const menuItem = state.menuItems.find(item => String(item._id) === String(itemId));
    return menuItem ? (menuItem.stock || 0) : 0;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProjectionFields(preset) {
    if (preset === 'resumen') {
      return '_id,estado,total,fecha_creacion,usuario.nombre,restaurante.nombre';
    }
    if (preset === 'operativa') {
      return '_id,estado,total,metodo_pago,items,fecha_creacion,usuario.nombre,restaurante.nombre';
    }
    return '';
  }

  return { render };
})();
