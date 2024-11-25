// login.js
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Aquí puedes poner tus credenciales fijas o verificar en Firebase.
    // Vamos a usar un ejemplo simple con credenciales fijas:
    const validUser = "tecnica";
    const validPass = "Full.3456";
  
    if (username === validUser && password === validPass) {
      // Guardamos un flag en el localStorage indicando que el usuario ha iniciado sesión.
      localStorage.setItem('isLoggedIn', 'true');
      // Redirigimos al usuario a la página principal.
      window.location.href = "page.html";
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  });
  
