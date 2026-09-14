# PeluPoké — Avance de proyecto (Login)

Tienda de peluches coleccionables. Este avance incluye el login y registro funcionando con Supabase Auth.

## Estructura

```
pokepeluches/
├── index.html        → Página de login
├── register.html     → Página de registro
├── home.html          → Página protegida tras iniciar sesión
├── css/style.css
└── js/
    ├── supabaseClient.js  → Configuración de conexión a Supabase
    └── auth.js             → Lógica de login/registro
```

```bash
git init
git add .
git commit -m "Avance: login y registro con Supabase"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/pelupoke.git
git push -u origin main
```