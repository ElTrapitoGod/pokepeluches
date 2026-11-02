// ============================================================
//  Lógica de la tienda: buscador, categorías y carrito.
//  home.html la llama cuando confirma que hay una sesión iniciada.
// ============================================================
const CATEGORIAS = [
  ["todas", "Todas"], ["peluches", "Peluches"], ["figuras", "Figuras"],
  ["ropa", "Ropa"], ["accesorios", "Accesorios"], ["videojuegos", "Videojuegos"], ["otros", "Otros"]
];

function iniciarTienda(session) {
  // --- Carrito (uno por usuario, para no mezclar cuentas en la misma compu) ---
  const carrito = new Carrito("fennestore_carrito_" + session.user.id);
  carrito.cargar(catalogo.productos);
  const panel = new PanelCarrito(carrito);
  catalogo.alAgregar = (producto) => { carrito.agregar(producto); return carrito.cantidadDe(producto.id); };
  catalogo.alVerCarrito = () => panel.abrir();

  // --- Buscador y categorías ---
  const grid = document.getElementById("catalogo");
  const chips = document.getElementById("chips");
  const caja = document.getElementById("busqueda");
  const vacio = document.getElementById("sin-resultados");
  let categoria = "todas";

  function dibujar() {
    const lista = catalogo.filtrar(caja.value, categoria);
    catalogo.mostrarEn(grid, lista);
    document.getElementById("contador").textContent =
      lista.length === 1 ? "1 artículo" : `${lista.length} artículos`;
    vacio.hidden = lista.length > 0;
    if (!lista.length) {
      const q = caja.value.trim();
      document.getElementById("sin-texto").textContent = q
        ? `No encontramos artículos para “${q}” en esta categoría.`
        : "Aún no tenemos artículos en esta categoría. ¡Pronto llegarán novedades!";
    }
  }

  chips.innerHTML = "";
  CATEGORIAS.forEach(([id, nombre]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip-cat";
    b.textContent = nombre;
    b.setAttribute("aria-pressed", String(id === categoria));
    b.addEventListener("click", () => {
      categoria = id;
      chips.querySelectorAll(".chip-cat").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      dibujar();
    });
    chips.appendChild(b);
  });

  caja.addEventListener("input", dibujar);
  document.getElementById("limpiar").addEventListener("click", () => {
    caja.value = "";
    chips.querySelector(".chip-cat").click();   // vuelve a "Todas"
    caja.focus();
  });

  dibujar();
}
