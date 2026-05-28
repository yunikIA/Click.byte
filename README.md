# Click.byte — Tienda de Tecnología

Plantilla de tienda online para celulares, tablets, accesorios e insumos informáticos.

## 📁 Estructura del proyecto

```
clickbyte/
├── index.html          ← Página principal
├── css/
│   └── style.css       ← Todos los estilos
├── js/
│   └── main.js         ← Carrito, buscador, favoritos
└── img/                ← Carpeta para tus imágenes
```

## 🚀 Cómo usar

### Opción 1 — Abrir directo
Abrí `index.html` en tu navegador. Funciona sin servidor.

### Opción 2 — Subir a Vercel
1. Subí la carpeta a un repositorio de GitHub
2. Conectá el repo en vercel.com
3. Deploy automático ✓

## ✏️ Personalizar productos

Cada producto está en `index.html` con esta estructura:

```html
<div class="prod-card">
  <div class="prod-img">
    <i class="ti ti-device-mobile"></i>   <!-- cambiá el ícono -->
    <button class="prod-fav" data-name="Nombre del producto" title="Favorito">
      <i class="ti ti-heart"></i>
    </button>
  </div>
  <div class="prod-info">
    <span class="badge badge-hot">MÁS VENDIDO</span>  <!-- badge-hot / badge-new / badge-sale -->
    <div class="prod-name">Nombre del producto</div>
    <div class="prod-old">$00.000</div>               <!-- precio tachado (opcional) -->
    <div class="prod-price">$00.000</div>
    <div class="prod-desc">Descripción corta</div>
    <button class="prod-btn">Agregar al carrito</button>
  </div>
</div>
```

## 🎨 Cambiar colores

Editá las variables en `css/style.css` al inicio:

```css
:root {
  --primary:        #f5790a;   /* naranja principal */
  --primary-dark:   #c95f00;   /* naranja oscuro */
  --primary-light:  #fff4ea;   /* fondo suave */
  --accent:         #ff9a3c;   /* acento */
  --yellow:         #ffd000;   /* amarillo botones */
}
```

## 🖼️ Agregar imágenes reales

Reemplazá el bloque `.prod-img` por:

```html
<div class="prod-img">
  <img src="img/nombre-producto.jpg" alt="Nombre" style="width:100%;height:148px;object-fit:contain;padding:10px;" />
</div>
```

## 📦 Íconos disponibles

Usamos **Tabler Icons** (gratis, más de 5800 íconos).
Buscá íconos en: https://tabler.io/icons

Uso: `<i class="ti ti-NOMBRE-DEL-ICONO"></i>`

---
Desarrollado con ❤️ · Click.byte 2025
