/* =============================================
   Click.byte — main.js
   ============================================= */

// ── FIREBASE CONFIG ──────────────────────────
// REEMPLAZÁ estos valores con los de tu proyecto Firebase
const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

// ── CONFIGURACIÓN EDITABLE DESDE ADMIN ───────
let STORE_CONFIG = {
  whatsapp:  "5491176256401",
  alias:     "montes0899",
  cbu:       "",
  storeName: "Click.byte",
};

let db = null;

function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    loadConfig().then(() => loadProducts());
  } catch (e) {
    console.warn("Firebase no configurado. Mostrando demo.");
    renderDemoProducts();
  }
}

async function loadConfig() {
  try {
    const doc = await db.collection("config").doc("store").get();
    if (doc.exists) STORE_CONFIG = { ...STORE_CONFIG, ...doc.data() };
  } catch(e) {}
}

async function loadProducts() {
  const grid = document.getElementById("prod-grid");
  if (!grid) return;
  grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="ti ti-loader"></i><p>Cargando...</p></div>`;
  try {
    const snap = await db.collection("productos").where("activo","==",true).orderBy("orden","asc").get();
    if (snap.empty) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="ti ti-package-off"></i><p>No hay productos aún.</p></div>`;
      return;
    }
    grid.innerHTML = "";
    snap.forEach(doc => grid.appendChild(buildProductCard({ id: doc.id, ...doc.data() })));
    initFavBtns(); initCartBtns();
  } catch(e) { renderDemoProducts(); }
}

function buildProductCard(p) {
  const div = document.createElement("div");
  div.className = "prod-card";
  div.dataset.id    = p.id    || "";
  div.dataset.name  = p.nombre || "";
  div.dataset.price = p.precio || "";

  const badges = { hot:'<span class="badge badge-hot">MÁS VENDIDO</span>', sale:'<span class="badge badge-sale">OFERTA</span>', new:'<span class="badge badge-new">NUEVO</span>' };
  const imgHTML = p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">` : `<i class="ti ti-device-mobile"></i>`;
  const oldHTML = p.precioAnterior ? `<div class="prod-old">$${fmt(p.precioAnterior)}</div>` : "";

  div.innerHTML = `
    <div class="prod-img">${imgHTML}
      <button class="prod-fav" data-name="${p.nombre}" title="Favorito"><i class="ti ti-heart"></i></button>
    </div>
    <div class="prod-info">
      ${badges[p.badge]||""}
      <div class="prod-name">${p.nombre}</div>
      ${oldHTML}
      <div class="prod-price">$${fmt(p.precio)}</div>
      <div class="prod-desc">${p.descripcionCorta||""}</div>
      <button class="prod-btn">Agregar al carrito</button>
    </div>`;
  return div;
}

function renderDemoProducts() {
  const demos = [
    { id:"d1", nombre:"Samsung Galaxy A55 5G 256GB",       precio:349999, precioAnterior:389999, badge:"hot",  descripcionCorta:"10% OFF · Envío gratis" },
    { id:"d2", nombre:"Lenovo IdeaPad 3 Ryzen 5 16GB",     precio:689000, precioAnterior:749999, badge:"sale", descripcionCorta:"Envío gratis · 12 cuotas" },
    { id:"d3", nombre:"Auriculares Sony WH-1000XM5",        precio:259999, precioAnterior:289999, badge:"new",  descripcionCorta:"Noise Cancel · Envío gratis" },
    { id:"d4", nombre:"Samsung Galaxy Tab A9+ 64GB WiFi",   precio:189999, precioAnterior:219000, badge:"sale", descripcionCorta:"15% OFF · Envío gratis" },
    { id:"d5", nombre:"Mouse Logitech MX Master 3S",        precio:74999,  precioAnterior:89999,  badge:"new",  descripcionCorta:"Inalámbrico · Envío gratis" },
    { id:"d6", nombre:"SSD Kingston NV3 1TB M.2 NVMe",      precio:59999,  precioAnterior:69999,  badge:"hot",  descripcionCorta:"Envío gratis" },
    { id:"d7", nombre:"Xiaomi Redmi Watch 4 GPS Amoled",    precio:64999,  precioAnterior:79999,  badge:"sale", descripcionCorta:"20% OFF" },
    { id:"d8", nombre:"Impresora Epson EcoTank L3250 WiFi", precio:169000, precioAnterior:189999, badge:"new",  descripcionCorta:"Envío gratis · 6 cuotas" },
  ];
  const grid = document.getElementById("prod-grid");
  if (!grid) return;
  grid.innerHTML = "";
  demos.forEach(p => grid.appendChild(buildProductCard(p)));
  initFavBtns(); initCartBtns();
}

function fmt(n) { return Number(n).toLocaleString("es-AR"); }

// ── CARRITO ───────────────────────────────────
let cart = JSON.parse(localStorage.getItem("cb_cart")||"[]");

function saveCart() { localStorage.setItem("cb_cart",JSON.stringify(cart)); updateCartCount(); renderCartDrawer(); }

function updateCartCount() {
  const t = cart.reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll(".cart-count").forEach(el=>el.textContent=t);
}

function addToCart(id, name, price, img) {
  const ex = cart.find(i=>i.id===id);
  if (ex) ex.qty++; else cart.push({id,name,price:Number(price),img,qty:1});
  saveCart();
  showToast(`✓ "${name.substring(0,28)}..." agregado`);
}

function removeFromCart(id) { cart=cart.filter(i=>i.id!==id); saveCart(); }

function changeQty(id,delta) {
  const item=cart.find(i=>i.id===id); if(!item) return;
  item.qty+=delta;
  if(item.qty<=0) removeFromCart(id); else saveCart();
}

function cartTotal() { return cart.reduce((s,i)=>s+(i.price*i.qty),0); }

// ── DRAWER ────────────────────────────────────
function openCart()  { document.getElementById("cart-overlay")?.classList.add("open"); document.getElementById("cart-drawer")?.classList.add("open"); renderCartDrawer(); }
function closeCart() { document.getElementById("cart-overlay")?.classList.remove("open"); document.getElementById("cart-drawer")?.classList.remove("open"); }

function renderCartDrawer() {
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total-val");
  const wspBtn  = document.getElementById("cart-wsp-btn");
  if (!itemsEl) return;

  if (cart.length===0) {
    itemsEl.innerHTML=`<div class="cart-empty"><i class="ti ti-shopping-cart-off"></i><p>Tu carrito está vacío</p></div>`;
    if(totalEl) totalEl.textContent="$0";
    if(wspBtn)  wspBtn.disabled=true;
    return;
  }
  if(wspBtn) wspBtn.disabled=false;

  itemsEl.innerHTML = cart.map(item=>`
    <div class="cart-item">
      <div class="cart-item-img">${item.img?`<img src="${item.img}" alt="">`:`<i class="ti ti-device-mobile"></i>`}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${fmt(item.price)}</div>
        <div class="cart-qty">
          <button onclick="changeQty('${item.id}',-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-item-del" onclick="removeFromCart('${item.id}')"><i class="ti ti-trash"></i></button>
    </div>`).join("");

  if(totalEl) totalEl.textContent=`$${fmt(cartTotal())}`;
}

// ── WHATSAPP ──────────────────────────────────
function sendToWhatsApp() {
  if (!cart.length) return;
  const lines = cart.map(i=>`• ${i.name} x${i.qty} — $${fmt(i.price*i.qty)}`);
  const msg = [
    `¡Hola! Quiero hacer el siguiente pedido en *${STORE_CONFIG.storeName}*:`,"",...lines,"",
    `*Total: $${fmt(cartTotal())}*`,"",
    `💳 *Formas de pago:*`,
    `• Transferencia — Alias: *${STORE_CONFIG.alias}*`+(STORE_CONFIG.cbu?` / CBU: *${STORE_CONFIG.cbu}*`:""),
    `• Efectivo`,`• Contra entrega`,"",
    "¿Me podés confirmar disponibilidad y coordinar el envío? ¡Gracias! 😊"
  ].join("\n");
  window.open(`https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
}

// ── FAVORITOS ─────────────────────────────────
let favorites = JSON.parse(localStorage.getItem("cb_favs")||"[]");
function saveFavs() { localStorage.setItem("cb_favs",JSON.stringify(favorites)); }
function toggleFav(btn,name) {
  const idx=favorites.indexOf(name);
  if(idx===-1){favorites.push(name);btn.classList.add("active");showToast("❤️ Favorito agregado");}
  else{favorites.splice(idx,1);btn.classList.remove("active");showToast("💔 Favorito quitado");}
  saveFavs();
}
function initFavBtns() {
  document.querySelectorAll(".prod-fav").forEach(btn=>{
    if(favorites.includes(btn.dataset.name)) btn.classList.add("active");
    btn.addEventListener("click",e=>{e.stopPropagation();toggleFav(btn,btn.dataset.name);});
  });
}

// ── CARRITO BTNS ──────────────────────────────
function initCartBtns() {
  document.querySelectorAll(".prod-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const card=btn.closest(".prod-card");
      const id   =card.dataset.id||card.querySelector(".prod-name").textContent.trim();
      const name =card.querySelector(".prod-name").textContent.trim();
      const rawP =card.querySelector(".prod-price").textContent.replace(/[$.\s]/g,"").replace(",",".");
      const img  =card.querySelector(".prod-img img")?.src||"";
      addToCart(id,name,rawP,img);
      btn.textContent="✓ Agregado"; btn.style.background="#27ae60";
      setTimeout(()=>{btn.textContent="Agregar al carrito";btn.style.background="";},1300);
    });
  });
}

// ── BUSCADOR ──────────────────────────────────
function initSearch() {
  const input=document.querySelector(".search-bar input");
  const btn  =document.querySelector(".search-bar button");
  if(!input) return;
  function run(){
    const q=input.value.trim().toLowerCase();
    const cards=document.querySelectorAll(".prod-card");
    let n=0;
    cards.forEach(c=>{const m=!q||c.querySelector(".prod-name")?.textContent.toLowerCase().includes(q);c.style.display=m?"":"none";if(m)n++;});
    if(q) showToast(n>0?`🔍 ${n} resultado(s) para "${q}"`:`Sin resultados para "${q}"`);
  }
  btn.addEventListener("click",run);
  input.addEventListener("keydown",e=>{if(e.key==="Enter")run();});
  input.addEventListener("input",()=>{if(!input.value.trim())document.querySelectorAll(".prod-card").forEach(c=>c.style.display="");});
}

// ── TOAST ─────────────────────────────────────
let _tt=null;
function showToast(msg){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);}
  t.textContent=msg; t.classList.add("show");
  clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove("show"),2800);
}

// ── INIT ──────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  initFirebase();
  updateCartCount();
  initSearch();
  document.getElementById("cart-btn-nav")?.addEventListener("click",openCart);
  document.getElementById("cart-overlay")?.addEventListener("click",closeCart);
  document.getElementById("cart-close")?.addEventListener("click",closeCart);
  document.getElementById("cart-wsp-btn")?.addEventListener("click",sendToWhatsApp);
});
