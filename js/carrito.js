class Carrito {
  constructor(clave){this.clave=clave;this.items=[];this.alCambiar=()=>{};}
  cargar(productos){
    try {
      const saved=JSON.parse(localStorage.getItem(this.clave)||"[]");
      this.items=saved.map(x=>({producto:productos.find(p=>p.id===Number(x.id)),cantidad:Number(x.cantidad),variant:x.variant||null}))
        .filter(x=>x.producto&&Number.isInteger(x.cantidad)&&x.cantidad>0);
    } catch { this.items=[]; }
    this.guardar();
  }
  guardar(){
    try{localStorage.setItem(this.clave,JSON.stringify(this.items.map(x=>({id:x.producto.id,cantidad:x.cantidad,variant:x.variant}))));}catch{}
    this.alCambiar();
  }
  agregar(producto,variant=null){
    const item=this.items.find(x=>x.producto.id===producto.id&&x.variant===variant);
    const actual=item?.cantidad||0;
    if(actual>=producto.stock)return false;
    if(item)item.cantidad++;else this.items.push({producto,cantidad:1,variant});
    this.guardar();return true;
  }
  cambiar(id,variant,cantidad){
    const item=this.items.find(x=>x.producto.id===id&&x.variant===variant);
    if(!item)return;
    if(cantidad<=0){this.quitar(id,variant);return;}
    if(cantidad>item.producto.stock)return false;
    item.cantidad=cantidad;this.guardar();return true;
  }
  quitar(id,variant=null){this.items=this.items.filter(x=>!(x.producto.id===id&&x.variant===variant));this.guardar();}
  vaciar(){this.items=[];this.guardar();}
  get cantidadTotal(){return this.items.reduce((s,x)=>s+x.cantidad,0);}
  get total(){return this.items.reduce((s,x)=>s+x.producto.precio*x.cantidad,0);}
}
class PanelCarrito {
  constructor(carrito){
    this.carrito=carrito;
    const $=id=>document.getElementById(id);
    this.panel=$("carrito-panel");this.fondo=$("carrito-fondo");this.lista=$("carrito-lista");
    this.vacio=$("carrito-vacio");this.total=$("carrito-total");this.contador=$("carrito-contador");
    this.boton=$("btn-carrito");this.checkout=$("btn-comprar");this.estado=$("checkout-estado");
    this.boton.addEventListener("click",()=>this.abrir());
    $("carrito-cerrar").addEventListener("click",()=>this.cerrar());
    this.fondo.addEventListener("click",()=>this.cerrar());
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!this.panel.hidden)this.cerrar();});
    this.lista.addEventListener("click",e=>{
      const b=e.target.closest("[data-action]");if(!b)return;
      const id=Number(b.dataset.id),variant=b.dataset.variant||null,action=b.dataset.action;
      const item=this.carrito.items.find(x=>x.producto.id===id&&x.variant===variant);if(!item)return;
      if(action==="remove")this.carrito.quitar(id,variant);
      if(action==="minus")this.carrito.cambiar(id,variant,item.cantidad-1);
      if(action==="plus"){if(!this.carrito.cambiar(id,variant,item.cantidad+1))this.mensaje("No hay más existencias disponibles.","error");}
    });
    this.checkout.addEventListener("click",()=>this.comprar());
    carrito.alCambiar=()=>this.dibujar(true);this.dibujar(false);
  }
  mensaje(texto,tipo="success"){this.estado.textContent=texto;this.estado.className=`checkout-estado ${tipo}`;}
  dibujar(animar){
    const c=this.carrito;
    this.lista.innerHTML=c.items.map(({producto:p,cantidad,variant})=>`
      <li class="carrito-item"><div class="item-img" style="background:${p.fondo}">${p.ilustracion}</div>
      <div class="item-datos"><strong>${escaparHTML(p.nombre)}</strong>
      <span>${variant?`Marca: ${escaparHTML(variant)} · `:""}${formatearPrecio(p.precio)}</span>
      <div class="cantidad-controles"><button type="button" data-action="minus" data-id="${p.id}" data-variant="${escaparHTML(variant||"")}" aria-label="Disminuir">−</button><b>${cantidad}</b><button type="button" data-action="plus" data-id="${p.id}" data-variant="${escaparHTML(variant||"")}" aria-label="Aumentar">+</button></div>
      <button type="button" class="item-quitar" data-action="remove" data-id="${p.id}" data-variant="${escaparHTML(variant||"")}">Quitar</button></div>
      <div class="item-subtotal">${formatearPrecio(p.precio*cantidad)}</div></li>`).join("");
    this.vacio.hidden=c.items.length>0;this.total.textContent=formatearPrecio(c.total);
    this.contador.hidden=c.cantidadTotal===0;this.contador.textContent=c.cantidadTotal;
    this.checkout.disabled=c.items.length===0;
    if(animar&&c.cantidadTotal){this.contador.classList.remove("salta");void this.contador.offsetWidth;this.contador.classList.add("salta");}
  }
  async comprar(){
    if(!this.carrito.items.length)return;
    this.checkout.disabled=true;this.checkout.textContent="Procesando…";this.mensaje("Validando existencias…");
    const p_items=this.carrito.items.map(x=>({product_id:x.producto.id,quantity:x.cantidad,variant:x.variant}));
    const {data,error}=await supabaseClient.rpc("create_purchase",{p_items});
    this.checkout.disabled=false;this.checkout.textContent="Confirmar compra";
    if(error){this.mensaje(error.message||"No se pudo registrar la compra.","error");return;}
    this.carrito.vaciar();
    await cargarProductosDesdeSupabase();
    this.mensaje(`¡Compra registrada! Folio: ${data.purchase_id}. Total: ${formatearPrecio(data.total)}. ¡Gracias por comprar en FenneStore!`);
  }
  abrir(){this.panel.hidden=false;this.fondo.hidden=false;document.body.classList.add("modal-abierto");document.getElementById("carrito-cerrar").focus();}
  cerrar(){this.panel.hidden=true;this.fondo.hidden=true;document.body.classList.remove("modal-abierto");this.boton.focus();}
}
