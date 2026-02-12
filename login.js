"use strict"

{

    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const welcomeDiv = document.getElementById('welcome');

    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const res = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          // Guardar token e info del usuario
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));

          loginForm.style.display = 'none';
          welcomeDiv.style.display = 'block';
          welcomeDiv.innerText = `Bienvenido ${data.user.nombre}`;
          messageDiv.innerText = '';
        } else {
          messageDiv.style.color = 'red';
          messageDiv.innerText = data.error || JSON.stringify(data.error);
        }
      } catch (error) {
        messageDiv.style.color = 'red';
        messageDiv.innerText = error.message;
      }
    });

    // Si el usuario ya está logueado, mostrar bienvenida
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
    window.location.href = 'bienvenida.html';
    }

}