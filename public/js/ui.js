const UI = (() => {
  const content = document.getElementById('content');
  const pageTitle = document.getElementById('pageTitle');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const toastContainer = document.getElementById('toastContainer');

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function setTitle(title) {
    pageTitle.textContent = title;
  }

  function render(html) {
    content.innerHTML = html;
  }

  function loading() {
    content.innerHTML = '<div class="loading-state"><div class="spinner"></div> Cargando...</div>';
  }

  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    modalBody.innerHTML = '';
  }

  function toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  function confirm(message) {
    return window.confirm(message);
  }

  function stars(rating) {
    const full = Math.round(rating || 0);
    return '<span class="stars">' + '&#9733;'.repeat(full) + '&#9734;'.repeat(5 - full) + '</span>';
  }

  function badge(text, type = 'info') {
    return `<span class="badge badge-${type}">${text}</span>`;
  }

  function estadoBadge(estado) {
    const map = {
      pendiente: 'warning',
      preparando: 'info',
      enviado: 'accent',
      entregado: 'success',
      cancelado: 'danger'
    };
    return badge(estado, map[estado] || 'info');
  }

  function pagination(current, total, onChange) {
    if (total <= 1) return '';
    let html = '<div class="pagination">';
    if (current > 1) html += `<button class="btn btn-outline btn-sm" data-page="${current - 1}">&laquo;</button>`;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      html += `<button class="btn btn-sm ${i === current ? 'active' : 'btn-outline'}" data-page="${i}">${i}</button>`;
    }
    if (current < total) html += `<button class="btn btn-outline btn-sm" data-page="${current + 1}">&raquo;</button>`;
    html += '</div>';
    return html;
  }

  function bindPagination(containerSelector, onChange) {
    const container = content.querySelector(containerSelector || '.pagination');
    if (!container) return;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (btn) onChange(parseInt(btn.dataset.page));
    });
  }

  function truncate(str, len = 40) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-GT', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function formatMoney(val) {
    if (val === undefined || val === null) return 'Q0.00';
    return `Q${Number(val).toFixed(2)}`;
  }

  function formValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function formFloat(id) {
    const v = formValue(id);
    return v ? parseFloat(v) : 0;
  }

  function formInt(id) {
    const v = formValue(id);
    return v ? parseInt(v) : 0;
  }

  return {
    content, setTitle, render, loading,
    openModal, closeModal,
    toast, confirm,
    stars, badge, estadoBadge,
    pagination, bindPagination,
    truncate, formatDate, formatMoney,
    formValue, formFloat, formInt
  };
})();
