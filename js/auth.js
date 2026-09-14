function showMessage(text, type) {
  const el = document.getElementById("form-message");
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn = document.getElementById("login-btn");

    btn.disabled = true;
    showMessage("Entrando…", "success");

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    btn.disabled = false;

    if (error) {
      showMessage(traducirError(error.message), "error");
      return;
    }

    showMessage("¡Bienvenido de vuelta!", "success");
    window.location.href = "home.html";
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn = document.getElementById("register-btn");

    btn.disabled = true;
    showMessage("Creando tu cuenta…", "success");

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    btn.disabled = false;

    if (error) {
      showMessage(traducirError(error.message), "error");
      return;
    }

    // no se si agregar que pida confirmacion, tal vez en un futuro
    if (data.session) {
      window.location.href = "home.html";
    } else {
      showMessage("Cuenta creada. Revisa tu correo para confirmar.", "success");
    }
  });
}

function traducirError(mensaje) {
  const mapa = {
    "Invalid login credentials": "Correo o contraseña incorrectos.",
    "User already registered": "Ya existe una cuenta con ese correo.",
    "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  };
  return mapa[mensaje] || mensaje;
}
