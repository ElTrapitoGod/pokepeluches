// ============================================================
//  CLASE Carrito
//  Guarda qué productos eligió el usuario y cuántos de cada uno.
//  Se guarda en el navegador (localStorage), una vez por usuario.
// ============================================================
class Carrito {
  constructor(clave) {
    this.clave = clave;       // nombre con el que se guarda en el navegador
    this.items = [];          // lista de { producto, cantidad }
    this.alCambiar = () => {}; // función que se avisa cuando algo cambia
  }

  // Recupera lo guardado, convirtiendo cada id en su Producto
  cargar(productos) {
    try {
      const guardado = JSON.parse(localStorage.getItem(this.clave) || "[]");
      this.items = guardado
        .map(({ id, cantidad }) => ({ producto: productos.find((p) => p.id === id), cantidad }))
        .filter((i) => i.producto && i.cantidad > 0);
    } catch (e) {
      this.items = [];
    }
  }

  guardar() {
    try {
      const datos = this.items.map((i) => ({ id: i.producto.id, cantidad: i.cantidad }));
      localStorage.setItem(this.clave, JSON.stringify(datos));
    } catch (e) { /* si el navegador no deja guardar, el carrito sigue funcionando */ }
    this.alCambiar();
  }

  agregar(producto) {
    const item = this.items.find((i) => i.producto.id === producto.id);
    if (item) item.cantidad++;
    else this.items.push({ producto, cantidad: 1 });
    this.guardar();
  }

  quitar(id) {
    this.items = this.items.filter((i) => i.producto.id !== id);
    this.guardar();
  }

  cantidadDe(id) {
    const item = this.items.find((i) => i.producto.id === id);
    return item ? item.cantidad : 0;
  }

  get cantidadTotal() { return this.items.reduce((s, i) => s + i.cantidad, 0); }
  get total() { return this.items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0); }
}

// ============================================================
//  CLASE PanelCarrito
//  Dibuja el carrito en el panel lateral y maneja abrir/cerrar.
// ============================================================
class PanelCarrito {
  constructor(carrito) {
    this.carrito = carrito;
    const $ = (id) => document.getElementById(id);
    this.panel = $("carrito-panel");
    this.fondo = $("carrito-fondo");
    this.lista = $("carrito-lista");
    this.vacio = $("carrito-vacio");
    this.total = $("carrito-total");
    this.contador = $("carrito-contador");
    this.boton = $("btn-carrito");

    this.boton.addEventListener("click", () => this.abrir());
    $("carrito-cerrar").addEventListener("click", () => this.cerrar());
    this.fondo.addEventListener("click", () => this.cerrar());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.panel.hidden) this.cerrar();
    });
    // Un solo "oyente" para todos los botones "Quitar"
    this.lista.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quitar]");
      if (btn) this.carrito.quitar(Number(btn.dataset.quitar));
    });

    carrito.alCambiar = () => this.dibujar(true);
    this.dibujar(false);
  }

  dibujar(animar) {
    const c = this.carrito;
    this.lista.innerHTML = c.items.map(({ producto: p, cantidad }) => `
      <li class="carrito-item">
        <div class="item-img" style="background:${p.fondo}">${p.ilustracion}</div>
        <div class="item-datos">
          <strong>${p.nombre}</strong>
          <span>${formatearPrecio(p.precio)} · Cantidad: ${cantidad}</span>
          <button type="button" class="item-quitar" data-quitar="${p.id}">Quitar</button>
        </div>
        <div class="item-subtotal">${formatearPrecio(p.precio * cantidad)}</div>
      </li>`).join("");
    this.vacio.hidden = c.items.length > 0;
    this.total.textContent = formatearPrecio(c.total);
    this.contador.hidden = c.cantidadTotal === 0;
    this.contador.textContent = c.cantidadTotal;
    if (animar) {                       // pequeño "salto" del número al agregar
      this.contador.classList.remove("salta");
      void this.contador.offsetWidth;
      this.contador.classList.add("salta");
    }
  }

  abrir() {
    this.panel.hidden = false;
    this.fondo.hidden = false;
    document.body.classList.add("modal-abierto");
    document.getElementById("carrito-cerrar").focus();
  }

  cerrar() {
    this.panel.hidden = true;
    this.fondo.hidden = true;
    document.body.classList.remove("modal-abierto");
    this.boton.focus();
  }
}
