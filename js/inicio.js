// Comportamiento de la Homepage: animaciones al hacer scroll y encabezado
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const alScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  alScroll();
  window.addEventListener("scroll", alScroll, { passive: true });

  // Aparición suave de las secciones (si el navegador no lo soporta, se muestran sin animar)
  const items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("visible"));
  }

  const anio = document.getElementById("anio");
  if (anio) anio.textContent = new Date().getFullYear();
});
