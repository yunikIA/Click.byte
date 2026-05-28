/* =============================================
   Click.byte — main.js
   ============================================= */

// ── CARRITO ─────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cb_cart') || '[]');

function saveCart() {
  localStorage.setItem('cb_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
  });
}

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  updateCartCount();
  showToast(`✓ "${name.substring(0, 28)}..." agregado al carrito`);
}

// ── FAVORITOS ────────────────────────────────
let favorites = JSON.parse(localStorage.getItem('cb_favs') || '[]');

function saveFavs() {
  localStorage.setItem('cb_favs', JSON.stringify(favorites));
}

function toggleFav(btn, name) {
  const idx = favorites.indexOf(name);
  if (idx === -1) {
    favorites.push(name);
    btn.classList.add('active');
    showToast('❤️ Agregado a favoritos');
  } else {
    favorites.splice(idx, 1);
    btn.classList.remove('active');
    showToast('💔 Quitado de favoritos');
  }
  saveFavs();
}

function initFavBtns() {
  document.querySelectorAll('.prod-fav').forEach(btn => {
    const name = btn.dataset.name;
    if (favorites.includes(name)) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFav(btn, name);
    });
  });
}

// ── TOAST ────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── BUSCADOR ─────────────────────────────────
function initSearch() {
  const input = document.querySelector('.search-bar input');
  const btn   = document.querySelector('.search-bar button');

  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    const cards = document.querySelectorAll('.prod-card');
    let found = 0;
    cards.forEach(card => {
      const name = card.querySelector('.prod-name')?.textContent.toLowerCase() || '';
      const match = name.includes(q.toLowerCase());
      card.style.display = match ? '' : 'none';
      if (match) found++;
    });
    showToast(found > 0 ? `🔍 ${found} resultado(s) para "${q}"` : `Sin resultados para "${q}"`);
    if (q === '') cards.forEach(c => c.style.display = '');
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  input.addEventListener('input', () => {
    if (input.value.trim() === '') {
      document.querySelectorAll('.prod-card').forEach(c => c.style.display = '');
    }
  });
}

// ── BOTONES AGREGAR AL CARRITO ────────────────
function initCartBtns() {
  document.querySelectorAll('.prod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.prod-card');
      const name  = card.querySelector('.prod-name').textContent.trim();
      const price = card.querySelector('.prod-price').textContent.trim();
      addToCart(name, price);

      // Animación breve del botón
      btn.textContent = '✓ Agregado';
      btn.style.background = '#27ae60';
      setTimeout(() => {
        btn.textContent = 'Agregar al carrito';
        btn.style.background = '';
      }, 1200);
    });
  });
}

// ── SMOOTH SCROLL en nav links ────────────────
function initNavLinks() {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const section = document.querySelector('#productos');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initFavBtns();
  initSearch();
  initCartBtns();
  initNavLinks();
});
