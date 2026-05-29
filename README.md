# Click.byte — Guía de configuración completa

## 📁 Estructura del proyecto

```
clickbyte/
├── index.html           ← Tienda principal
├── admin/
│   └── index.html       ← Panel de administración
├── css/
│   ├── style.css        ← Estilos de la tienda
│   └── admin.css        ← Estilos del panel admin
├── js/
│   ├── main.js          ← Lógica de tienda + carrito + WhatsApp
│   └── admin.js         ← Lógica del panel admin
└── img/                 ← Imágenes locales (opcional)
```

---

## 🔥 PASO 1 — Crear proyecto Firebase

1. Ir a https://console.firebase.google.com
2. Click en **Agregar proyecto** → poné el nombre `clickbyte`
3. Desactivar Google Analytics (opcional) → **Crear proyecto**
4. En el panel, click en el ícono **</>** (Web) → registrá la app con nombre `clickbyte`
5. Copiá el objeto `firebaseConfig` que aparece

### Configurar Firestore
1. En el menú izquierdo → **Firestore Database** → **Crear base de datos**
2. Elegí **Modo de producción** → seleccioná región → **Habilitar**
3. En **Reglas** pegá esto y publicá:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /productos/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /config/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

> ⚠️ Estas reglas son para producción. El admin escribe directamente desde el navegador usando las claves de Firebase. Si querés mayor seguridad, implementá Firebase Auth.

---

## ☁️ PASO 2 — Configurar Cloudinary

1. Entrar a https://cloudinary.com → Dashboard
2. Ir a **Settings → Upload → Upload presets**
3. Click **Add upload preset**
4. Nombre: `clickbyte_products`
5. **Signing Mode: Unsigned** ← importante
6. En **Folder** escribí: `clickbyte`
7. Guardar

---

## ⚙️ PASO 3 — Pegar credenciales Firebase

Abrí **js/main.js** y **js/admin.js** y reemplazá:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",          // ← reemplazá
  authDomain:        "TU_PROJECT.firebaseapp.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};
```

Con los valores reales de tu proyecto Firebase. Hacé esto en **ambos archivos**.

---

## 🚀 PASO 4 — Subir a Vercel

1. Subí la carpeta `clickbyte` a un repo de GitHub
2. Entrá a https://vercel.com → **New Project**
3. Importá el repo → Deploy
4. Tu tienda queda en `https://tu-proyecto.vercel.app`
5. El panel admin en `https://tu-proyecto.vercel.app/admin`

---

## 🛡️ Panel Admin

- **URL**: `/admin`
- **Contraseña por defecto**: `admin123`
- Cambiala desde el panel → Configuración → Seguridad

### Qué podés hacer desde el admin:
- ✅ Agregar, editar y eliminar productos
- ✅ Subir fotos directamente a Cloudinary
- ✅ Poner precio, precio anterior tachado, badge y orden
- ✅ Activar/desactivar productos sin eliminarlos
- ✅ Cambiar número de WhatsApp, alias/CBU
- ✅ Cambiar el nombre de la tienda
- ✅ Cambiar la contraseña del admin

---

## 🛒 Flujo de compra (cliente)

1. Cliente navega la tienda → agrega productos al carrito
2. Abre el carrito (drawer lateral)
3. Ve el resumen con total
4. Click en **"Finalizar pedido por WhatsApp"**
5. Se abre WhatsApp con un mensaje como:

```
¡Hola! Quiero hacer el siguiente pedido en Click.byte:

• Samsung Galaxy A55 5G x1 — $349.999
• Auriculares Sony WH-1000XM5 x2 — $519.998

*Total: $869.997*

💳 Formas de pago:
• Transferencia — Alias: montes0899
• Efectivo
• Contra entrega

¿Me podés confirmar disponibilidad y coordinar el envío? ¡Gracias! 😊
```

---

## 🎨 Cambiar colores

En `css/style.css` modificá las variables:

```css
:root {
  --primary:       #f5790a;   /* naranja principal */
  --primary-dark:  #c95f00;   /* naranja oscuro */
  --primary-light: #fff4ea;   /* fondo suave */
  --accent:        #ff9a3c;   /* acento */
  --yellow:        #ffd000;   /* amarillo */
}
```

---
© 2025 Click.byte
