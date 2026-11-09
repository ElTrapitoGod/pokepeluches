# FenneStore

Tienda académica demostrativa de coleccionables Pokémon. Proyecto estático HTML, CSS y JavaScript conectado a Supabase mediante `supabase-js` v2 desde CDN.

## Abrir el proyecto

Abre la carpeta en VS Code y ejecútala con una extensión de servidor local (por ejemplo, Live Server). No abras los HTML directamente con `file://`, ya que la autenticación y las solicitudes de red requieren un origen local servido por HTTP.

Página pública: `index.html`  
Inicio de sesión: `login.html`  
Registro: `register.html`  
Tienda privada: `home.html`  
Perfil: `perfil.html`

## Supabase esperado

El proyecto utiliza las tablas ya creadas por `supabase_schema.sql`:

- `profiles`
- `products`
- `purchases`
- `purchase_items`

También utiliza Supabase Auth y la función RPC `create_purchase(p_items jsonb)` creada por el SQL. No vuelvas a ejecutar el SQL si ya creaste las tablas y cargaste los productos, salvo que sepas que necesitas reconstruir el esquema.

El catálogo consulta `products`; el trigger de Auth crea el perfil; el perfil se actualiza desde la tabla `profiles`; la compra se procesa con `supabase.rpc("create_purchase", { p_items })`.

La clave incluida en `js/supabaseClient.js` debe ser únicamente la clave pública publishable/anon del proyecto. Nunca pongas `service_role` ni una clave secreta en archivos del navegador.

## Imágenes temporales

Los recursos reemplazables de los 18 productos están en `img/productos/`:

- `01.svg` corresponde al producto con ID 1.
- `02.svg` corresponde al ID 2.
- ...
- `18.svg` corresponde al ID 18.

Para reemplazar una imagen, conserva el nombre y la extensión `.svg`, o cambia la ruta en `js/productos.js` si usarás otro formato. Las ilustraciones actuales son temporales.

## Funciones implementadas en esta versión

- Catálogo desde Supabase con búsqueda y filtros por categoría.
- Selector iPhone/Samsung para la funda de Gengar.
- Registro con datos de contacto y dirección.
- Login con correo y contraseña.
- Perfil editable.
- Menú de usuario y cierre de sesión.
- Carrito persistente por usuario con variantes, cantidades y total.
- Compra demostrativa mediante RPC transaccional.
- Actualización de existencias después de la compra.
- FAQ con acordeón.

Las compras son demostrativas; no existe una pasarela de pago real.
