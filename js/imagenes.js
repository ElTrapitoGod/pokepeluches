// ============================================================
//  IMÁGENES DEL SITIO: aquí se cambian todas desde un solo lugar.
//  1) Guarda tu imagen en la carpeta img/ (o en una subcarpeta).
//  2) Cambia la ruta de abajo por la de tu archivo (con su extensión).
//  Si una ruta está mal, se muestra img/placeholder.svg en su lugar.
// ============================================================
const IMAGENES = {
  logo:     "img/logo.svg",       // 512 x 512 px, PNG transparente o SVG
  hero:     "img/hero.svg",       // 1200 x 1100 px, PNG transparente o WebP
  nosotros: "img/nosotros.svg",   // 1040 x 840 px, JPG o WebP
  respaldo: "img/placeholder.svg",
  categorias: {                   // cada una: 800 x 600 px, JPG o WebP (< 150 KB)
    peluches:    "img/categorias/peluches.svg",
    figuras:     "img/categorias/figuras.svg",
    ropa:        "img/categorias/ropa.svg",
    accesorios:  "img/categorias/accesorios.svg",
    videojuegos: "img/categorias/videojuegos.svg",
    otros:       "img/categorias/otros.svg"
  }
};

// Busca "categorias.ropa" dentro de IMAGENES y devuelve su ruta
function rutaImagen(clave) {
  return clave.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), IMAGENES);
}

// Pone la ruta correcta en cada <img data-img="...">
function aplicarImagenes() {
  document.querySelectorAll("img[data-img]").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.src.endsWith(IMAGENES.respaldo)) img.src = IMAGENES.respaldo;
    }, { once: true });
    img.src = rutaImagen(img.dataset.img) || IMAGENES.respaldo;
  });
}
document.addEventListener("DOMContentLoaded", aplicarImagenes);
