function showMessage(text,type){const el=document.getElementById("form-message");if(el){el.textContent=text;el.className=`message ${type}`;}}
function traducirError(m){const map={"Invalid login credentials":"Correo o contraseña incorrectos.","User already registered":"Ya existe una cuenta con ese correo.","Password should be at least 6 characters":"La contraseña debe tener al menos 6 caracteres."};return map[m]||m;}
const loginForm=document.getElementById("login-form");
if(loginForm)loginForm.addEventListener("submit",async e=>{
  e.preventDefault();const btn=document.getElementById("login-btn");btn.disabled=true;showMessage("Entrando…","success");
  try{const {error}=await supabaseClient.auth.signInWithPassword({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});if(error)throw error;location.href="home.html";}
  catch(err){showMessage(traducirError(err.message),"error");btn.disabled=false;}
});
const registerForm=document.getElementById("register-form");
if(registerForm)registerForm.addEventListener("submit",async e=>{
  e.preventDefault();const btn=document.getElementById("register-btn");btn.disabled=true;showMessage("Creando tu cuenta…","success");
  const ids=["name","email","password","phone","street","street_number","neighborhood","postal_code","city","state","country"];
  const v=Object.fromEntries(ids.map(id=>[id,document.getElementById(id)?.value.trim()||""]));
  try{
    const {data,error}=await supabaseClient.auth.signUp({email:v.email,password:v.password,options:{data:{full_name:v.name,phone:v.phone,street:v.street,street_number:v.street_number,neighborhood:v.neighborhood,postal_code:v.postal_code,city:v.city,state:v.state,country:v.country}}});
    if(error)throw error;
    if(data.session)location.href="home.html";else showMessage("Cuenta creada. Revisa tu correo para confirmar la dirección y después inicia sesión.","success");
  }catch(err){showMessage(traducirError(err.message),"error");}
  finally{btn.disabled=false;}
});
