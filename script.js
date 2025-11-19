// ====== PRODUCT DATA (Default) ======
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    title: "Engineering Mathematics (Semester Book)",
    category: "Academic Book",
    price: 450
  },
  {
    id: 2,
    title: "Objective Quantitative Aptitude",
    category: "Competitive Exam",
    price: 380
  },
  {
    id: 3,
    title: "A4 Spiral Notebook (200 Pages)",
    category: "Stationery",
    price: 120
  },
  {
    id: 4,
    title: "Premium Ball Pen (Pack of 5)",
    category: "Stationery",
    price: 90
  },
  {
    id: 5,
    title: "Hardbound Journal Diary",
    category: "Journals",
    price: 260
  },
  {
    id: 6,
    title: "Study Table Lamp (LED)",
    category: "Accessories",
    price: 799
  }
];

// ====== LOCAL STORAGE KE KEYS ======
const CART_KEY = "srf_cart";
const PRODUCT_KEY = "srf_products";

// ========== PRODUCT STORAGE HELPERS ==========
function getStoredProducts() {
  const stored = localStorage.getItem(PRODUCT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing products from storage", e);
    }
  }
  // First-time default load
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function setStoredProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

// ========== CART STORAGE HELPERS ==========
function getCart() {
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing cart", e);
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountUI();
}

function updateCartCountUI() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = totalItems;
}

// ========== HOME PAGE: PRODUCT RENDER ==========

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const products = getStoredProducts();
  const input = document.getElementById("searchInput");
  const query = input ? input.value.toLowerCase().trim() : "";

  let filtered = products;
  if (query) {
    filtered = products.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  grid.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-category">${p.category}</div>
      <div class="product-title">${p.title}</div>
      <div class="product-price">₹${p.price}</div>
      <div class="product-actions">
        <button class="btn" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="btn btn-secondary" onclick="buyNow(${p.id})">Buy Now</button>
      </div>
    `;

    grid.appendChild(card);
  });

  const info = document.getElementById("productCountInfo");
  if (info) {
    info.textContent = `Showing ${filtered.length} of ${products.length} products`;
  }
}

function addToCart(id) {
  const products = getStoredProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      qty: 1
    });
  }

  setCart(cart);
  alert("Product added to cart!");
}

function buyNow(id) {
  addToCart(id);
  window.location.href = "cart.html";
}

function scrollToProducts() {
  const sec = document.getElementById("productsSection");
  if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

// ========== CART PAGE LOGIC ==========

function renderCart() {
  const container = document.getElementById("cartContainer");
  const summary = document.getElementById("cartSummary");
  if (!container) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="product-card">
        <p>Your cart is empty. Go back to Home and add some products.</p>
      </div>
    `;
    if (summary) summary.classList.add("hidden");
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-info">
        <div class="cart-title">${item.title}</div>
        <div class="cart-meta">Price: ₹${item.price} · Subtotal: ₹${item.price * item.qty}</div>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;

    container.appendChild(row);
  });

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (summary) {
    summary.classList.remove("hidden");
    document.getElementById("summaryItems").textContent = totalItems;
    document.getElementById("summaryTotal").textContent = totalAmount;
  }
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }

  setCart(cart);
  renderCart();
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  setCart(cart);
  renderCart();
}

function placeOrder() {
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const addr = document.getElementById("custAddress").value.trim();

  if (!name || !phone || !addr) {
    alert("Please fill all customer details before placing the order.");
    return;
  }

  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  alert(`Thank you, ${name}! Your demo order has been placed successfully.`);
  setCart([]);
  renderCart();

  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custAddress").value = "";
}

// ========== ADMIN PANEL LOGIC ==========

function adminLogin() {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();
  const error = document.getElementById("adminError");

  if (user === "admin" && pass === "admin123") {
    document.getElementById("adminLoginBox").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    error.textContent = "";
    loadAdminProducts();
  } else {
    error.textContent = "Invalid username or password.";
  }
}

function loadAdminProducts() {
  const list = document.getElementById("adminProductList");
  if (!list) return;
  const products = getStoredProducts();
  list.innerHTML = "";
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.id}. ${p.title} (₹${p.price})`;
    list.appendChild(li);
  });
}

function addNewProduct() {
  const title = document.getElementById("pTitle").value.trim();
  const category = document.getElementById("pCategory").value.trim() || "Misc";
  const priceVal = document.getElementById("pPrice").value.trim();
  const msg = document.getElementById("adminMsg");

  if (!title || !priceVal) {
    msg.textContent = "Please enter at least product name and price.";
    msg.style.color = "#dc2626";
    return;
  }

  const price = Number(priceVal);
  if (isNaN(price) || price <= 0) {
    msg.textContent = "Please enter a valid price.";
    msg.style.color = "#dc2626";
    return;
  }

  const products = getStoredProducts();
  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  products.push({ id: newId, title, category, price });
  setStoredProducts(products);

  document.getElementById("pTitle").value = "";
  document.getElementById("pCategory").value = "";
  document.getElementById("pPrice").value = "";

  msg.textContent = "Product added successfully! Refresh Home page to see it.";
  msg.style.color = "#16a34a";

  loadAdminProducts();
}

function resetProducts() {
  localStorage.removeItem(PRODUCT_KEY);
  setStoredProducts(DEFAULT_PRODUCTS);
  loadAdminProducts();
  alert("Products reset to default list.");
}

// ========== INIT (HAR PAGE PE) ==========

document.addEventListener("DOMContentLoaded", () => {
  updateCartCountUI();

  // Home page
  if (document.getElementById("productsGrid")) {
    renderProducts();
    const input = document.getElementById("searchInput");
    if (input) {
      input.addEventListener("keyup", e => {
        if (e.key === "Enter") renderProducts();
      });
    }
  }

  // Cart page
  if (document.getElementById("cartContainer")) {
    renderCart();
  }

  // Admin page -> list tab admin login ke baad
});
