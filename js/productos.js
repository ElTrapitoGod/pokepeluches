// Catálogo FenneStore: los datos se obtienen de Supabase.
function formatearPrecio(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(Number(n) || 0);
}
function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
const PALETAS = {
  peluches:["#F3A847","#FFF0CE"], figuras:["#8C9FD0","#E8ECFA"], ropa:["#D77D9A","#F9E6EF"],
  accesorios:["#7B86B8","#E8EAF8"], videojuegos:["#65A78B","#E2F3E9"], otros:["#C28A52","#F8EBDD"]
};
class Producto {
  constructor(row) {
    this.id = Number(row.id);
    this.nombre = row.name;
    this.descripcion = row.description;
    this.categoria = row.category;
    this.precio = Number(row.price);
    this.stock = Number(row.stock);
    this.variantOptions = Array.isArray(row.variant_options) ? row.variant_options : [];
    [this.color, this.fondo] = PALETAS[this.categoria] || ["#D7A36B","#FFF0CE"];
    this.tipo = this.categoria;
  }
  get precioFormateado() { return formatearPrecio(this.precio); }
  get ilustracion() {
    const numero = String(this.id).padStart(2, "0");
    return `<img class="producto-imagen" src="img/productos/${numero}.svg" alt="${escaparHTML(this.nombre)}" loading="lazy">`;
  }
}
class Catalogo {
  constructor() { this.productos=[]; this.modal=null; this.alAgregar=null; this.alVerCarrito=null; }
  cargar(rows) { this.productos = rows.map(row => new Producto(row)); }
  filtrar(texto="", categoria="todas") {
    const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const q=norm(texto.trim());
    return this.productos.filter(p=>(categoria==="todas"||p.categoria===categoria) && norm(`${p.nombre} ${p.descripcion} ${p.categoria}`).includes(q));
  }
  crearTarjeta(p) {
    const card=document.createElement("article");
    card.className="producto-card"; card.tabIndex=0; card.setAttribute("role","button");
    card.setAttribute("aria-label",`Ver detalles de ${p.nombre}`);
    card.innerHTML=`<div class="producto-visual" style="background:${p.fondo}">${p.ilustracion}</div>
      <div class="producto-info"><span class="producto-tipo">${escaparHTML(p.categoria)}</span>
      <h3>${escaparHTML(p.nombre)}</h3><p>${escaparHTML(p.descripcion)}</p>
      <div class="producto-pie"><span class="producto-precio">${p.precioFormateado}</span>
      <span class="producto-ver">${p.stock>0?"Ver detalles →":"Agotado"}</span></div></div>`;
    const open=()=>this.abrirDetalle(p);
    card.addEventListener("click",open); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
    return card;
  }
  mostrarEn(el, lista=this.productos) { el.innerHTML=""; lista.forEach(p=>el.appendChild(this.crearTarjeta(p))); }
  crearModal() {
    const bg=document.createElement("div"); bg.className="modal-fondo"; bg.hidden=true;
    bg.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <button class="modal-cerrar" type="button" aria-label="Cerrar">×</button><div class="modal-contenido"></div></div>`;
    bg.addEventListener("click",e=>{if(e.target===bg)this.cerrarDetalle();});
    bg.querySelector(".modal-cerrar").addEventListener("click",()=>this.cerrarDetalle());
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!bg.hidden)this.cerrarDetalle();});
    document.body.appendChild(bg); this.modal=bg;
  }
  abrirDetalle(p) {
    if(!this.modal)this.crearModal();
    const d=this.modal.querySelector(".modal-contenido");
    const opciones=p.variantOptions.length?`<label class="variant-label" for="producto-variante">Selecciona la marca</label>
      <select id="producto-variante" class="variant-select"><option value="">Elige una opción</option>${p.variantOptions.map(v=>`<option value="${escaparHTML(v)}">${escaparHTML(v)}</option>`).join("")}</select>`:"";
    d.innerHTML=`<div class="detalle-visual" style="background:${p.fondo}">${p.ilustracion}</div>
      <div class="detalle-cuerpo"><span class="producto-tipo">${escaparHTML(p.categoria)}</span>
      <h2 id="modal-titulo">${escaparHTML(p.nombre)}</h2><div class="detalle-precio">${p.precioFormateado}</div>
      <p class="detalle-descripcion">${escaparHTML(p.descripcion)}</p>
      <p class="stock-disponible">${p.stock>0?`Disponibles: ${p.stock}`:"Producto agotado"}</p>
      ${opciones}<button class="detalle-agregar" type="button" ${p.stock<1?"disabled":""}>Agregar al carrito</button>
      <p class="detalle-estado" role="status"></p></div>`;
    const btn=d.querySelector(".detalle-agregar"), estado=d.querySelector(".detalle-estado");
    btn.addEventListener("click",()=>{
      const variant=p.variantOptions.length?d.querySelector("#producto-variante").value:null;
      if(p.variantOptions.length&&!variant){estado.textContent="Selecciona la marca de tu teléfono.";return;}
      const result=this.alAgregar?.(p,variant);
      if(result===false){estado.textContent="No hay existencias suficientes.";return;}
      estado.textContent="¡Agregado al carrito!";
      btn.textContent="✓ Agregado";
      setTimeout(()=>{if(btn.isConnected)btn.textContent="Agregar al carrito";},1200);
    });
    this.modal.hidden=false; document.body.classList.add("modal-abierto");
    this.modal.querySelector(".modal").scrollTop=0; this.modal.querySelector(".modal-cerrar").focus();
  }
  cerrarDetalle(){if(!this.modal)return;this.modal.hidden=true;document.body.classList.remove("modal-abierto");}
}
const catalogo=new Catalogo();
