// ============================================================
//  CLASE Producto
//  Representa UN artículo de la tienda. Guarda sus datos y sabe
//  cómo darse formato a sí mismo (por ejemplo, el precio).
// ============================================================
// Convierte un número en texto de precio: 349 -> "$349 MXN"
function formatearPrecio(n) {
  return `$${n.toLocaleString("es-MX")} MXN`;
}

class Producto {
  constructor({ id, nombre, tipo, categoria, precio, descripcion, color, fondo, detalles }) {
    this.id = id;
    this.nombre = nombre;
    this.categoria = categoria;     // id de la categoría: "peluches", "accesorios"...
    this.tipo = tipo;               // "peluche", "llavero" o "mochila"
    this.precio = precio;           // número, en pesos
    this.descripcion = descripcion; // texto corto para la tarjeta
    this.color = color;             // color principal del dibujo
    this.fondo = fondo;             // color suave detrás del dibujo
    this.detalles = detalles;       // información extra para la ventana de detalle
  }

  // Devuelve el precio como texto: 349 -> "$349 MXN"
  get precioFormateado() {
    return formatearPrecio(this.precio);
  }

  // Devuelve un dibujo SVG sencillo según el tipo de producto.
  // (Cuando tengas fotos reales, aquí puedes devolver una <img>.)
  get ilustracion() {
    const c = this.color;
    const dibujos = {
      peluche: `
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <ellipse cx="32" cy="26" rx="9" ry="20" fill="${c}" transform="rotate(-18 32 26)"/>
          <ellipse cx="88" cy="26" rx="9" ry="20" fill="${c}" transform="rotate(18 88 26)"/>
          <ellipse cx="60" cy="72" rx="40" ry="38" fill="${c}"/>
          <circle cx="46" cy="66" r="4.5" fill="#2B2621"/>
          <circle cx="74" cy="66" r="4.5" fill="#2B2621"/>
          <circle cx="37" cy="80" r="7" fill="#E4572E" opacity=".85"/>
          <circle cx="83" cy="80" r="7" fill="#E4572E" opacity=".85"/>
          <path d="M54 82 Q60 88 66 82" stroke="#2B2621" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>`,
      llavero: `
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="16" r="10" fill="none" stroke="#8a8378" stroke-width="4"/>
          <line x1="60" y1="26" x2="60" y2="44" stroke="#8a8378" stroke-width="4" stroke-linecap="round"/>
          <path d="M34 62 L26 28 L52 48 Z" fill="${c}"/>
          <path d="M86 62 L94 28 L68 48 Z" fill="${c}"/>
          <ellipse cx="60" cy="76" rx="32" ry="30" fill="${c}"/>
          <ellipse cx="60" cy="90" rx="19" ry="14" fill="#FFF6E9"/>
          <circle cx="48" cy="72" r="4" fill="#2B2621"/>
          <circle cx="72" cy="72" r="4" fill="#2B2621"/>
          <ellipse cx="60" cy="84" rx="4" ry="3" fill="#2B2621"/>
        </svg>`,
      mochila: `
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <path d="M42 24 Q60 4 78 24" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <rect x="24" y="26" width="72" height="84" rx="24" fill="${c}"/>
          <rect x="38" y="62" width="44" height="34" rx="10" fill="#FFF6E9" opacity=".92"/>
          <line x1="38" y1="74" x2="82" y2="74" stroke="${c}" stroke-width="3"/>
          <circle cx="60" cy="48" r="5" fill="#FFF6E9"/>
          <path d="M24 60 Q14 80 24 100" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
          <path d="M96 60 Q106 80 96 100" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
        </svg>`
    };
    return dibujos[this.tipo] || "";
  }
}

// ============================================================
//  CLASE Catalogo
//  Guarda una lista de Productos, los dibuja en la página y
//  maneja la ventana (modal) con el detalle de cada uno.
// ============================================================
class Catalogo {
  constructor() {
    this.productos = [];
    this.modal = null;              // se crea la primera vez que se necesita
    this.ultimoElementoActivo = null; // para devolver el foco al cerrar
    this.alAgregar = null;          // función que recibe el carrito (la pone tienda.js)
    this.alVerCarrito = null;
  }

  agregar(producto) {
    this.productos.push(producto);
  }

  // ---------- Tarjetas ----------

  // Crea el HTML de UNA tarjeta a partir de un Producto
  crearTarjeta(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto-card";
    tarjeta.tabIndex = 0;                       // se puede alcanzar con teclado
    tarjeta.setAttribute("role", "button");
    tarjeta.setAttribute("aria-label", `Ver detalles de ${producto.nombre}`);
    tarjeta.innerHTML = `
      <div class="producto-visual" style="background:${producto.fondo}">
        ${producto.ilustracion}
      </div>
      <div class="producto-info">
        <span class="producto-tipo">${producto.tipo}</span>
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <div class="producto-pie">
          <span class="producto-precio">${producto.precioFormateado}</span>
          <span class="producto-ver">Ver detalles →</span>
        </div>
      </div>
    `;

    // Abrir con clic o con Enter / Espacio
    tarjeta.addEventListener("click", () => this.abrirDetalle(producto));
    tarjeta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.abrirDetalle(producto);
      }
    });
    return tarjeta;
  }

  // Dibuja todas las tarjetas dentro del contenedor indicado
  mostrarEn(contenedor, lista = this.productos) {
    contenedor.innerHTML = "";
    lista.forEach((p) => contenedor.appendChild(this.crearTarjeta(p)));
  }

  // Devuelve solo los productos que coinciden con el texto y la categoría
  filtrar(texto = "", categoria = "todas") {
    const limpiar = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const buscado = limpiar(texto.trim());
    return this.productos.filter((p) => {
      const coincideCategoria = categoria === "todas" || p.categoria === categoria;
      const textoProducto = limpiar(`${p.nombre} ${p.descripcion} ${p.tipo} ${p.categoria}`);
      return coincideCategoria && textoProducto.includes(buscado);
    });
  }

  // ---------- Ventana de detalle (modal) ----------

  // Crea la estructura del modal una sola vez y la agrega a la página
  crearModal() {
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.hidden = true;
    fondo.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <button class="modal-cerrar" type="button" aria-label="Cerrar">×</button>
        <div class="modal-contenido"></div>
      </div>
    `;

    // Cerrar: botón ×, clic fuera de la ventana, o tecla Escape
    fondo.addEventListener("click", (e) => {
      if (e.target === fondo) this.cerrarDetalle();
    });
    fondo.querySelector(".modal-cerrar").addEventListener("click", () => this.cerrarDetalle());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !fondo.hidden) this.cerrarDetalle();
    });

    document.body.appendChild(fondo);
    this.modal = fondo;
  }

  // Arma el contenido del modal con los datos de un Producto
  abrirDetalle(producto) {
    if (!this.modal) this.crearModal();
    this.ultimoElementoActivo = document.activeElement;

    const d = producto.detalles;
    const medidas = d.medidas
      .map(([etiqueta, valor]) => `<li><span>${etiqueta}</span><strong>${valor}</strong></li>`)
      .join("");
    const usos = d.usos.map((u) => `<li>${u}</li>`).join("");

    this.modal.querySelector(".modal-contenido").innerHTML = `
      <div class="detalle-visual" style="background:${producto.fondo}">
        ${producto.ilustracion}
      </div>
      <div class="detalle-cuerpo">
        <span class="producto-tipo">${producto.tipo}</span>
        <h2 id="modal-titulo">${producto.nombre}</h2>
        <div class="detalle-precio">${producto.precioFormateado}</div>
        <p class="detalle-descripcion">${d.descripcionLarga}</p>

        <h4>Medidas y materiales</h4>
        <ul class="detalle-medidas">${medidas}</ul>

        <h4>Dónde lucirlo</h4>
        <ul class="detalle-usos">${usos}</ul>

        <h4>Cuidados</h4>
        <p>${d.cuidados}</p>

        <div class="detalle-extra">
          <div><h4>Viene con</h4><p>${d.incluye}</p></div>
          <div><h4>Dato curioso</h4><p>${d.curiosidad}</p></div>
        </div>

        <button class="detalle-agregar" type="button">Agregar al carrito</button>
        <p class="detalle-estado" role="status"></p>
      </div>
    `;

    // Botón "Agregar al carrito": avisa a tienda.js, que es quien tiene el carrito
    const boton = this.modal.querySelector(".detalle-agregar");
    const estado = this.modal.querySelector(".detalle-estado");
    boton.addEventListener("click", () => {
      if (!this.alAgregar) return;
      const cantidad = this.alAgregar(producto);
      boton.textContent = "✓ Agregado";
      setTimeout(() => (boton.textContent = "Agregar al carrito"), 1600);
      estado.innerHTML = `Tienes ${cantidad} en tu carrito · <button type="button" class="enlace">Ver carrito</button>`;
      estado.querySelector(".enlace").addEventListener("click", () => {
        this.cerrarDetalle();
        if (this.alVerCarrito) this.alVerCarrito();
      });
    });

    this.modal.hidden = false;
    document.body.classList.add("modal-abierto");   // bloquea el scroll del fondo
    this.modal.querySelector(".modal").scrollTop = 0;
    this.modal.querySelector(".modal-cerrar").focus();
  }

  cerrarDetalle() {
    if (!this.modal) return;
    this.modal.hidden = true;
    document.body.classList.remove("modal-abierto");
    // Devuelve el foco a la tarjeta que se había abierto
    if (this.ultimoElementoActivo) this.ultimoElementoActivo.focus();
  }
}

// ============================================================
//  DATOS: los 3 artículos de la tienda (escritos directo aquí)
//  Todos los detalles son inventados: cámbialos cuando quieras.
//  Para agregar otro producto, copia un bloque y cambia los datos.
// ============================================================
const catalogo = new Catalogo();

catalogo.agregar(new Producto({
  id: 1,
  nombre: "Peluche de Pikachu",
  tipo: "peluche",
  categoria: "peluches",
  precio: 349,
  descripcion: "Suave, rechoncho y listo para dormir contigo. Mide unos 30 cm.",
  color: "#F5B935",
  fondo: "#FFF1C9",
  detalles: {
    descripcionLarga:
      "Un compañero de abrazos con mejillas bordadas y orejas que mantienen la forma. " +
      "Su felpa corta es tan suave que cuesta soltarlo, y su relleno lo deja firme sin quedar duro.",
    medidas: [
      ["Alto", "30 cm"],
      ["Ancho", "24 cm"],
      ["Peso", "280 g"],
      ["Exterior", "Felpa corta de poliéster"],
      ["Relleno", "Fibra siliconada"]
    ],
    usos: [
      "Sobre la almohada, como guardián del sueño",
      "En el escritorio, para los días de entrega pesada",
      "De copiloto en el asiento del coche",
      "Como regalo de cumpleaños (se envuelve muy bien)"
    ],
    cuidados:
      "Lávalo a mano con agua fría y jabón suave. Exprímelo sin torcer y sécalo al aire, " +
      "lejos del sol directo. Cepíllalo con suavidad para devolverle el volumen a la felpa.",
    incluye: "Etiqueta de colección numerada y bolsa de tela para guardarlo.",
    curiosidad:
      "Las mejillas van bordadas a mano en cada pieza, así que no hay dos exactamente iguales."
  }
}));

catalogo.agregar(new Producto({
  id: 2,
  nombre: "Llavero de Fennekin",
  tipo: "llavero",
  categoria: "accesorios",
  precio: 119,
  descripcion: "Pequeño compañero para tus llaves o tu mochila, con orejas enormes.",
  color: "#E88A3C",
  fondo: "#FFE3CC",
  detalles: {
    descripcionLarga:
      "Un zorrito de bolsillo con orejas desproporcionadas, justo como debe ser. " +
      "Es lo bastante ligero para no estorbar y lo bastante vistoso para que encuentres tus llaves al instante.",
    medidas: [
      ["Alto (sin cadena)", "9 cm"],
      ["Largo de la cadena", "8 cm"],
      ["Peso", "45 g"],
      ["Exterior", "Felpa suave"],
      ["Herraje", "Argolla de metal"]
    ],
    usos: [
      "Colgando de tus llaves de casa",
      "En el cierre de la mochila o la maleta",
      "En el espejo retrovisor del coche",
      "Como detalle pequeño para intercambio de regalos"
    ],
    cuidados:
      "Límpialo con un paño ligeramente húmedo. Evita mojarlo por completo para que la argolla no se oxide.",
    incluye: "Tarjeta de presentación del personaje y empaque individual.",
    curiosidad:
      "Sus orejas llevan una varilla flexible muy delgada por dentro, por eso se doblan pero vuelven a su forma."
  }
}));

catalogo.agregar(new Producto({
  id: 3,
  nombre: "Mochila de Greninja",
  tipo: "mochila",
  categoria: "accesorios",
  precio: 599,
  descripcion: "Mochila escolar resistente con bolsa frontal y tirantes acolchados.",
  color: "#3F6FB5",
  fondo: "#D9E6F7",
  detalles: {
    descripcionLarga:
      "Una mochila pensada para cargar con todo el día: clases, laptop y botella. " +
      "Su tela repele las salpicaduras y los tirantes acolchados reparten el peso sobre los hombros.",
    medidas: [
      ["Alto", "42 cm"],
      ["Ancho", "30 cm"],
      ["Fondo", "15 cm"],
      ["Capacidad", "18 litros"],
      ["Material", "Poliéster resistente al agua"]
    ],
    usos: [
      "Escuela o universidad (cabe una laptop de hasta 15 pulgadas)",
      "Trayectos diarios en camión o metro",
      "Excursiones cortas y paseos de fin de semana",
      "Viajes ligeros como equipaje de mano"
    ],
    cuidados:
      "Límpiala con un paño húmedo y jabón neutro. No la metas a la lavadora ni a la secadora, " +
      "y déjala abierta al aire para que se seque bien por dentro.",
    incluye: "Bolsa frontal con cierre, dos bolsillos laterales para botella y asa superior.",
    curiosidad:
      "El bolsillo frontal tiene un forro interior de color claro para que encuentres las cosas sin esforzarte."
  }
}));
