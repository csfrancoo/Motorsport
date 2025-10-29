// script.js - lógica simple de carrito para MotorSport
// Guarda el carrito en localStorage bajo la clave 'motorSportCart'

/* ---------- Helpers ---------- */
function formatCurrency(num) {
  // evita errores de float y devuelve string con 2 decimales
  return "$" + (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2) + " USD";
}

/* ---------- Estado del carrito ---------- */
let cart = {}; // estructura: { productId: { id, name, price, img, qty } }

function loadCart() {
  const stored = localStorage.getItem('motorSportCart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch {
      cart = {};
    }
  } else {
    cart = {};
  }
}

function saveCart() {
  localStorage.setItem('motorSportCart', JSON.stringify(cart));
}

/* ---------- Renderizado ---------- */
function updateCartCount() {
  const countElem = document.getElementById('cart-count');
  const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  countElem.textContent = totalQty;
  countElem.style.display = totalQty > 0 ? 'inline-block' : 'none';
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    container.innerHTML = '<p class="text-muted">Tu carrito está vacío.</p>';
    document.getElementById('cart-total').textContent = formatCurrency(0);
    updateCartCount();
    return;
  }

  let total = 0;

  Object.values(cart).forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-3 border-bottom pb-2';

    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="width:64px;height:48px;object-fit:cover" class="me-2 rounded">
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between">
          <strong style="font-size:0.95rem">${item.name}</strong>
          <small class="text-muted">${formatCurrency(item.price)}</small>
        </div>
        <div class="d-flex align-items-center mt-2">
          <button class="btn btn-sm btn-outline-secondary me-2 btn-decrease" data-id="${item.id}">-</button>
          <span class="mx-1">${item.qty}</span>
          <button class="btn btn-sm btn-outline-secondary ms-2 me-3 btn-increase" data-id="${item.id}">+</button>
          <button class="btn btn-sm btn-outline-danger ms-auto btn-remove" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });

  document.getElementById('cart-total').textContent = formatCurrency(total);
  updateCartCount();
}

/* ---------- Operaciones del carrito ---------- */
function addToCart(product) {
  const id = product.id;
  if (!cart[id]) {
    cart[id] = { ...product, qty: 1 };
  } else {
    cart[id].qty += 1;
  }
  saveCart();
  renderCartItems();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
  }
  saveCart();
  renderCartItems();
}

function removeItem(id) {
  if (!cart[id]) return;
  delete cart[id];
  saveCart();
  renderCartItems();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCartItems();
}

/* ---------- Eventos ---------- */
document.addEventListener('DOMContentLoaded', function () {
  loadCart();
  renderCartItems();

  // botones "Agregar al carrito"
  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', function () {
      const product = {
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price),
        img: this.dataset.img
      };
      addToCart(product);

      // pequeño feedback
      this.textContent = "Añadido ✓";
      setTimeout(() => this.textContent = "Agregar al carrito", 900);
    });
  });

  // delegación para botones dentro del offcanvas (aumentar, disminuir, eliminar)
  document.getElementById('cart-items').addEventListener('click', function (e) {
    const target = e.target;
    if (target.classList.contains('btn-increase')) {
      changeQty(target.dataset.id, +1);
    } else if (target.classList.contains('btn-decrease')) {
      changeQty(target.dataset.id, -1);
    } else if (target.classList.contains('btn-remove')) {
      removeItem(target.dataset.id);
    }
  });

  // Vaciar carrito
  document.getElementById('clear-cart-btn').addEventListener('click', function () {
    if (confirm('¿Querés vaciar todo el carrito?')) {
      clearCart();
    }
  });

  // Finalizar compra (simulación)
  document.getElementById('checkout-btn').addEventListener('click', function () {
    if (Object.keys(cart).length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    // Aquí se podría integrar con un backend o proceso real. Por ahora, simulamos.
    alert('Gracias por tu compra (simulada). Pronto nos contactaremos para coordinar la entrega.');
    clearCart();
    // cerramos el offcanvas automáticamente (si existe)
    const offcanvasEl = document.getElementById('cartOffcanvas');
    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (offcanvas) offcanvas.hide();
  });
});