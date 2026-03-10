const API = (() => {
  const BASE = '/api';

  async function request(method, path, body) {
    const opts = {
      method,
      headers: {}
    };
    if (body && !(body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      opts.body = body;
    }
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
    return data;
  }

  function qs(params) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p.append(k, v);
    });
    const s = p.toString();
    return s ? `?${s}` : '';
  }

  return {
    // Restaurantes
    restaurantes: {
      listar: (params = {}) => request('GET', `/restaurantes${qs(params)}`),
      obtener: (id) => request('GET', `/restaurantes/${id}`),
      crear: (data) => request('POST', '/restaurantes', data),
      actualizar: (id, data) => request('PUT', `/restaurantes/${id}`, data),
      eliminar: (id) => request('DELETE', `/restaurantes/${id}`),
      eliminarVarios: (filtro) => request('DELETE', '/restaurantes/varios', { filtro }),
      actualizarVarios: (filtro, datos) => request('PATCH', '/restaurantes/varios', { filtro, datos }),
      agregarEtiqueta: (id, etiqueta) => request('POST', `/restaurantes/${id}/etiquetas`, { etiqueta }),
      eliminarEtiqueta: (id, etiqueta) => request('DELETE', `/restaurantes/${id}/etiquetas/${encodeURIComponent(etiqueta)}`),
      cercanos: (params) => request('GET', `/restaurantes/cercanos${qs(params)}`),
      buscar: (params) => request('GET', `/restaurantes/buscar${qs(params)}`),
      categorias: () => request('GET', '/restaurantes/categorias')
    },

    // Usuarios
    usuarios: {
      listar: (params = {}) => request('GET', `/usuarios${qs(params)}`),
      obtener: (id) => request('GET', `/usuarios/${id}`),
      crear: (data) => request('POST', '/usuarios', data),
      actualizar: (id, data) => request('PUT', `/usuarios/${id}`, data),
      eliminar: (id) => request('DELETE', `/usuarios/${id}`)
    },

    // Menu
    menu: {
      listar: (restauranteId, params = {}) => request('GET', `/menu/restaurante/${restauranteId}${qs(params)}`),
      obtener: (id) => request('GET', `/menu/${id}`),
      crear: (data) => request('POST', '/menu', data),
      crearVarios: (articulos) => request('POST', '/menu/varios', { articulos }),
      actualizar: (id, data) => request('PUT', `/menu/${id}`, data),
      eliminar: (id) => request('DELETE', `/menu/${id}`),
      buscar: (params) => request('GET', `/menu/buscar${qs(params)}`)
    },

    // Ordenes
    ordenes: {
      listar: (params = {}) => request('GET', `/ordenes${qs(params)}`),
      obtener: (id) => request('GET', `/ordenes/${id}`),
      crear: (data) => request('POST', '/ordenes', data),
      actualizarEstado: (id, estado) => request('PATCH', `/ordenes/${id}/estado`, { estado }),
      actualizarVarios: (filtro, datos) => request('PATCH', '/ordenes/varios', { filtro, datos }),
      agregarItem: (id, item) => request('POST', `/ordenes/${id}/items`, item),
      eliminarItem: (id, menuItemId) => request('DELETE', `/ordenes/${id}/items/${menuItemId}`),
      eliminar: (id) => request('DELETE', `/ordenes/${id}`),
      eliminarVarios: (filtro) => request('DELETE', '/ordenes/varios', { filtro }),
      porUsuario: (userId, params = {}) => request('GET', `/ordenes/usuario/${userId}${qs(params)}`),
      porRestaurante: (restId, params = {}) => request('GET', `/ordenes/restaurante/${restId}${qs(params)}`)
    },

    // Resenas
    resenas: {
      listar: (params = {}) => request('GET', `/resenas${qs(params)}`),
      obtener: (id) => request('GET', `/resenas/${id}`),
      crear: (data) => request('POST', '/resenas', data),
      actualizar: (id, data) => request('PUT', `/resenas/${id}`, data),
      eliminar: (id) => request('DELETE', `/resenas/${id}`),
      porRestaurante: (id, params = {}) => request('GET', `/resenas/restaurante/${id}${qs(params)}`),
      porUsuario: (id, params = {}) => request('GET', `/resenas/usuario/${id}${qs(params)}`),
      subirImagen: (id, formData) => {
        return fetch(`${BASE}/resenas/${id}/imagenes`, { method: 'POST', body: formData })
          .then(r => r.json());
      },
      eliminarImagen: (id, fileId) => request('DELETE', `/resenas/${id}/imagenes/${fileId}`),
      listarArchivos: () => request('GET', '/resenas/archivos')
    },

    // Analiticas
    analiticas: {
      resumen: () => request('GET', '/analiticas/resumen'),
      mejorCalificados: (params = {}) => request('GET', `/analiticas/restaurantes-mejor-calificados${qs(params)}`),
      masVendidos: (params = {}) => request('GET', `/analiticas/platillos-mas-vendidos${qs(params)}`),
      ventasRestaurante: (params = {}) => request('GET', `/analiticas/ventas-por-restaurante${qs(params)}`),
      ventasPeriodo: (params = {}) => request('GET', `/analiticas/ventas-por-periodo${qs(params)}`),
      ordenesPorEstado: () => request('GET', '/analiticas/ordenes-por-estado'),
      distribucion: (id) => request('GET', `/analiticas/distribucion-calificaciones/${id}`)
    },

    // Bulk
    bulk: {
      articulos: (operaciones) => request('POST', '/bulk/articulos', { operaciones }),
      ordenes: (operaciones) => request('POST', '/bulk/ordenes', { operaciones }),
      restaurantes: (restaurantes) => request('POST', '/bulk/restaurantes', { restaurantes })
    }
  };
})();
