/* Click.byte — admin.js */

const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

const CLOUDINARY_CLOUD  = "dyaggwmph";
const CLOUDINARY_PRESET = "clickbyte_products";

let ADMIN_PASSWORD = "admin123";
let db = null;
let editingId = null;
let productos = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-login").addEventListener("click", doLogin);
  document.getElementById("login-password").addEventListener("keydown", e => { if(e.key==="Enter") doLogin(); });
  document.getElementById("btn-logout").addEventListener("click", () => {
    document.getElementById("admin-wrap").classList.remove("visible");
    document.getElementById("login-wrap").style.display = "flex";
  });
  document.querySelectorAll(".sidebar-item").forEach(item => item.addEventListener("click", () => switchTab(item.dataset.tab)));
  document.getElementById("btn-new-product").addEventListener("click", () => openModal());
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("btn-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", e => { if(e.target===e.currentTarget) closeModal(); });
  document.getElementById("btn-save").addEventListener("click", saveProduct);
  document.getElementById("upload-area").addEventListener("click", () => document.getElementById("file-input").click());
  document.getElementById("file-input").addEventListener("change", handleImageUpload);
  document.getElementById("btn-save-config").addEventListener("click", saveConfig);
  document.getElementById("table-search").addEventListener("input", filterTable);
});

function doLogin() {
  const pass = document.getElementById("login-password").value;
  const err  = document.getElementById("login-error");
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
  db.collection("config").doc("store").get().then(doc => {
    const storedPass = doc.exists && doc.data().adminPassword ? doc.data().adminPassword : ADMIN_PASSWORD;
    if (pass === storedPass) { loginSuccess(); } else { err.style.display="block"; err.textContent="Contraseña incorrecta."; }
  }).catch(() => {
    if (pass === ADMIN_PASSWORD) { loginSuccess(); } else { err.style.display="block"; err.textContent="Contraseña incorrecta."; }
  });
}

function loginSuccess() {
  document.getElementById("login-error").style.display = "none";
  document.getElementById("login-wrap").style.display = "none";
  document.getElementById("admin-wrap").classList.add("visible");
  loadAdminData();
}

function switchTab(tab) {
  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.toggle("active", i.dataset.tab===tab));
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = t.id===`tab-${tab}` ? "block" : "none");
}

function loadAdminData() { loadStats(); loadProductsTable(); loadConfigForm(); switchTab("productos"); }

async function loadStats() {
  try {
    const snap = await db.collection("productos").get();
    const activos = snap.docs.filter(d=>d.data().activo).length;
    document.getElementById("stat-total").textContent    = snap.size;
    document.getElementById("stat-activos").textContent  = activos;
    document.getElementById("stat-inactivos").textContent= snap.size-activos;
  } catch(e) { document.getElementById("stat-total").textContent="—"; }
}

async function loadProductsTable() {
  const tbody = document.getElementById("products-tbody");
  tbody.innerHTML = `<tr class="loading-row"><td colspan="7">Cargando productos...</td></tr>`;
  try {
    const snap = await db.collection("productos").orderBy("orden","asc").get();
    productos = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderTable(productos);
  } catch(e) {
    tbody.innerHTML = `<tr class="loading-row"><td colspan="7">Error. Verificá tu configuración de Firebase.</td></tr>`;
  }
}

function renderTable(list) {
  const tbody = document.getElementById("products-tbody");
  if (!list.length) { tbody.innerHTML=`<tr class="loading-row"><td colspan="7">No hay productos. ¡Agregá el primero!</td></tr>`; return; }
  const bl = {hot:"MÁS VENDIDO",sale:"OFERTA",new:"NUEVO","":"—"};
  const bc = {hot:"hot",sale:"sale",new:"new","":"none"};
  tbody.innerHTML = list.map(p=>`
    <tr>
      <td><div class="prod-thumb">${p.imagen?`<img src="${p.imagen}" alt="">`:`<i class="ti ti-device-mobile"></i>`}</div></td>
      <td><strong>${p.nombre}</strong></td>
      <td>$${Number(p.precio).toLocaleString("es-AR")}</td>
      <td>${p.precioAnterior?"$"+Number(p.precioAnterior).toLocaleString("es-AR"):"—"}</td>
      <td><span class="badge-tbl ${bc[p.badge||'']}">${bl[p.badge||'']}</span></td>
      <td><span style="font-size:12px;color:${p.activo?'#27ae60':'#e74c3c'}"><i class="ti ti-${p.activo?'check':'x'}"></i> ${p.activo?"Activo":"Inactivo"}</span></td>
      <td>
        <button class="btn-icon edit" onclick="openModal('${p.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-icon del"  onclick="deleteProduct('${p.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`).join("");
}

function filterTable() {
  const q = document.getElementById("table-search").value.trim().toLowerCase();
  renderTable(q ? productos.filter(p=>p.nombre.toLowerCase().includes(q)) : productos);
}

function openModal(id=null) {
  editingId = id;
  document.getElementById("modal-title").textContent = id ? "Editar producto" : "Nuevo producto";
  document.getElementById("save-alert").className = "alert";
  clearForm();
  if (id) { const p=productos.find(x=>x.id===id); if(p) fillForm(p); }
  document.getElementById("modal-overlay").classList.add("open");
}

function closeModal() { document.getElementById("modal-overlay").classList.remove("open"); editingId=null; }

function clearForm() {
  ["prod-nombre","prod-precio","prod-precio-ant","prod-desc-corta","prod-desc","prod-orden"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  document.getElementById("prod-badge").value="";
  document.getElementById("prod-activo").value="true";
  document.getElementById("upload-preview").style.display="none";
  document.getElementById("upload-icon").style.display="block";
  document.getElementById("upload-text").textContent="Hacé click para subir una imagen";
  document.getElementById("current-image-url").value="";
}

function fillForm(p) {
  document.getElementById("prod-nombre").value     = p.nombre||"";
  document.getElementById("prod-precio").value     = p.precio||"";
  document.getElementById("prod-precio-ant").value = p.precioAnterior||"";
  document.getElementById("prod-badge").value      = p.badge||"";
  document.getElementById("prod-activo").value     = String(p.activo!==false);
  document.getElementById("prod-desc-corta").value = p.descripcionCorta||"";
  document.getElementById("prod-desc").value       = p.descripcion||"";
  document.getElementById("prod-orden").value      = p.orden||"0";
  document.getElementById("current-image-url").value = p.imagen||"";
  if(p.imagen){
    const prev=document.getElementById("upload-preview");
    prev.src=p.imagen; prev.style.display="block";
    document.getElementById("upload-icon").style.display="none";
    document.getElementById("upload-text").textContent="Imagen actual (click para cambiar)";
  }
}

async function handleImageUpload(e) {
  const file=e.target.files[0]; if(!file) return;
  const spinner=document.getElementById("upload-spinner");
  const preview=document.getElementById("upload-preview");
  const icon   =document.getElementById("upload-icon");
  const text   =document.getElementById("upload-text");
  spinner.style.display="block"; text.textContent="Subiendo..."; icon.style.display="none"; preview.style.display="none";
  try {
    const fd=new FormData();
    fd.append("file",file); fd.append("upload_preset",CLOUDINARY_PRESET); fd.append("folder","clickbyte");
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,{method:"POST",body:fd});
    const data = await res.json();
    if(data.secure_url){
      document.getElementById("current-image-url").value=data.secure_url;
      preview.src=data.secure_url; preview.style.display="block";
      text.textContent="Imagen subida ✓ (click para cambiar)";
    } else throw new Error(data.error?.message||"Error");
  } catch(err){ text.textContent="Error al subir. Intentá de nuevo."; icon.style.display="block"; console.error(err); }
  finally { spinner.style.display="none"; }
}

async function saveProduct() {
  const alertEl=document.getElementById("save-alert"); alertEl.className="alert";
  const nombre=document.getElementById("prod-nombre").value.trim();
  const precio=parseFloat(document.getElementById("prod-precio").value);
  if(!nombre||isNaN(precio)){ alertEl.className="alert error show"; alertEl.textContent="Nombre y precio son obligatorios."; return; }
  const data={
    nombre, precio,
    precioAnterior: parseFloat(document.getElementById("prod-precio-ant").value)||null,
    badge:          document.getElementById("prod-badge").value,
    activo:         document.getElementById("prod-activo").value==="true",
    descripcionCorta:document.getElementById("prod-desc-corta").value.trim(),
    descripcion:    document.getElementById("prod-desc").value.trim(),
    orden:          parseInt(document.getElementById("prod-orden").value)||0,
    imagen:         document.getElementById("current-image-url").value||"",
    updatedAt:      firebase.firestore.FieldValue.serverTimestamp()
  };
  try {
    if(editingId){ await db.collection("productos").doc(editingId).update(data); }
    else { data.createdAt=firebase.firestore.FieldValue.serverTimestamp(); await db.collection("productos").add(data); }
    alertEl.className="alert success show";
    alertEl.textContent=editingId?"Producto actualizado ✓":"Producto creado ✓";
    setTimeout(()=>{ closeModal(); loadProductsTable(); loadStats(); },1000);
  } catch(err){ alertEl.className="alert error show"; alertEl.textContent="Error: "+err.message; }
}

async function deleteProduct(id) {
  if(!confirm("¿Seguro que querés eliminar este producto?")) return;
  try { await db.collection("productos").doc(id).delete(); loadProductsTable(); loadStats(); }
  catch(err){ alert("Error: "+err.message); }
}

async function loadConfigForm() {
  try {
    const doc=await db.collection("config").doc("store").get();
    if(doc.exists){
      const d=doc.data();
      document.getElementById("cfg-whatsapp").value  = d.whatsapp ||"5491176256401";
      document.getElementById("cfg-alias").value     = d.alias    ||"montes0899";
      document.getElementById("cfg-cbu").value       = d.cbu      ||"";
      document.getElementById("cfg-storename").value = d.storeName||"Click.byte";
      document.getElementById("cfg-password").value  = "";
    }
  } catch(e){}
}

async function saveConfig() {
  const alertEl=document.getElementById("cfg-alert"); alertEl.className="alert";
  try {
    const newPass=document.getElementById("cfg-password").value.trim();
    const data={
      whatsapp:  document.getElementById("cfg-whatsapp").value.trim(),
      alias:     document.getElementById("cfg-alias").value.trim(),
      cbu:       document.getElementById("cfg-cbu").value.trim(),
      storeName: document.getElementById("cfg-storename").value.trim(),
    };
    if(newPass) data.adminPassword=newPass;
    await db.collection("config").doc("store").set(data,{merge:true});
    alertEl.className="alert success show"; alertEl.textContent="Configuración guardada ✓";
    setTimeout(()=>alertEl.className="alert",2500);
  } catch(err){ alertEl.className="alert error show"; alertEl.textContent="Error: "+err.message; }
}
