(function(){
  const form = document.getElementById('formLogin');
  if (!form) return;

  function doLogin(email, password){
    const USERS = [
      { email:'admin@empresa.com',   password:'admin123',   role:'ADMIN' },
      { email:'cliente@empresa.com', password:'cliente123', role:'CLIENTE' }
    ];
    const u = USERS.find(x => x.email.toLowerCase() === (email||'').trim().toLowerCase() &&
                               x.password === (password||'').trim());
    if(!u) return {ok:false,msg:'Usuario o contraseña incorrectos'};
    localStorage.setItem('sessionRole',u.role);
    localStorage.setItem('sessionUser',u.email);
    return {ok:true, role:u.role};
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = form.email.value;
    const pass  = form.password.value;
    const res = doLogin(email, pass);
    const out = document.getElementById('loginError');
    if(!res.ok){ out.textContent = res.msg; return; }
    // redirect a SPA
    window.location.href = 'index.html#' + (res.role==='ADMIN' ? 'cargas' : 'clientes');
  });
})();
