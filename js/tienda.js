const CATEGORIAS=[["todas","Todas"],["peluches","Peluches"],["figuras","Figuras"],["ropa","Ropa"],["accesorios","Accesorios"],["videojuegos","Videojuegos"],["otros","Otros"]];
let carritoActivo=null;
async function cargarProductosDesdeSupabase(){
  const {data,error}=await supabaseClient.from("products").select("id,name,description,category,price,stock,variant_options").order("id");
  if(error)throw error;
  catalogo.cargar(data||[]);
  const grid=document.getElementById("catalogo");
  if(grid&&window.dibujarCatalogo)window.dibujarCatalogo();
  return catalogo.productos;
}
function iniciarTienda(session){
  const carrito=new Carrito("fennestore_carrito_"+session.user.id);carritoActivo=carrito;
  const panel=new PanelCarrito(carrito);
  catalogo.alAgregar=(p,v)=>carrito.agregar(p,v);
  catalogo.alVerCarrito=()=>panel.abrir();
  const grid=document.getElementById("catalogo"),chips=document.getElementById("chips"),caja=document.getElementById("busqueda"),vacio=document.getElementById("sin-resultados");
  let categoria="todas";
  window.dibujarCatalogo=()=>{
    const lista=catalogo.filtrar(caja.value,categoria);catalogo.mostrarEn(grid,lista);
    document.getElementById("contador").textContent=`${lista.length} ${lista.length===1?"artículo":"artículos"}`;
    vacio.hidden=lista.length>0;
    if(!lista.length)document.getElementById("sin-texto").textContent=caja.value.trim()?`No encontramos artículos para “${caja.value.trim()}” en esta categoría.`:"No hay productos en esta categoría.";
  };
  chips.innerHTML="";
  CATEGORIAS.forEach(([id,nombre])=>{
    const b=document.createElement("button");b.type="button";b.className="chip-cat";b.textContent=nombre;b.setAttribute("aria-pressed",String(id===categoria));
    b.addEventListener("click",()=>{categoria=id;chips.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));window.dibujarCatalogo();});
    chips.appendChild(b);
  });
  caja.addEventListener("input",window.dibujarCatalogo);
  document.getElementById("limpiar").addEventListener("click",()=>{caja.value="";chips.querySelector('[aria-pressed="true"]')?.click();caja.focus();});
  window.dibujarCatalogo();
}
