/* ════════════════════════════════════════════════════════
   TOKI Design System v2.1 — toki.js
   Sidebar toggle, theme, modals, toasts, form validation
════════════════════════════════════════════════════════ */

// ── Toast system ──────────────────────────────────────
(function() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);

  window.showToast = function(message, type = 'info', duration = 3500) {
    const icons = { success: 'ti-circle-check', error: 'ti-alert-circle', info: 'ti-info-circle', warning: 'ti-alert-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="ti ${icons[type] || icons.info} toast-icon ${type}" style="font-size:16px;flex-shrink:0;"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };
})();

// ── Sidebar toggle (desktop collapse + mobile drawer) ─
(function() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  if (!sidebar) return;

  // Desktop toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle-btn';
  toggleBtn.innerHTML = '<i class="ti ti-chevron-left"></i>';
  toggleBtn.title = 'Toggle sidebar';
  sidebar.appendChild(toggleBtn);

  let collapsed = localStorage.getItem('toki_sidebar') === 'collapsed';
  if (collapsed) sidebar.classList.add('collapsed');

  toggleBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    sidebar.classList.toggle('collapsed', collapsed);
    localStorage.setItem('toki_sidebar', collapsed ? 'collapsed' : 'expanded');
  });

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  // Mobile hamburger in topbar
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'topbar-menu-btn';
    menuBtn.innerHTML = '<i class="ti ti-menu-2"></i>';
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('visible');
    });
    // Insert before page title
    const firstChild = topBar.firstElementChild;
    topBar.insertBefore(menuBtn, firstChild);
  }

  // Close mobile sidebar
  overlay.addEventListener('click', closeMobileSidebar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileSidebar(); });

  function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('visible');
  }
})();

// ── Topbar scroll shadow ───────────────────────────────
(function() {
  const topBar = document.querySelector('.top-bar');
  const scroll = document.querySelector('.content-scroll');
  if (!topBar || !scroll) return;
  scroll.addEventListener('scroll', () => {
    topBar.classList.toggle('scrolled', scroll.scrollTop > 8);
  });
})();

// ── Modal system ──────────────────────────────────────
window.TOKI_Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },
  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
};

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    TOKI_Modal.closeAll();
  }
});

// ── Form validation utility ───────────────────────────
window.TOKI_Validate = {
  field(inputEl, errorEl, message) {
    const val = inputEl.value.trim();
    if (!val) {
      inputEl.classList.add('error');
      if (errorEl) { errorEl.textContent = message || 'This field is required.'; errorEl.classList.add('visible'); }
      return false;
    }
    inputEl.classList.remove('error');
    if (errorEl) errorEl.classList.remove('visible');
    return true;
  },
  clearAll(formEl) {
    formEl.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
    formEl.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
  }
};

// Remove error state on input
document.addEventListener('input', e => {
  if (e.target.classList.contains('form-input')) {
    e.target.classList.remove('error');
    const next = e.target.nextElementSibling;
    if (next && next.classList.contains('form-error')) next.classList.remove('visible');
  }
});

// ── Topbar scroll shadow (landing pages) ──────────────
(function() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('scrolled', window.scrollY > 10);
  });
})();

// ── Animate cards on scroll ───────────────────────────
(function() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .stat-card, .feed-item').forEach(el => {
    el.style.animationPlayState = 'paused';
    obs.observe(el);
  });
})();

console.log('[TOKI v2.1] System loaded ✓');
