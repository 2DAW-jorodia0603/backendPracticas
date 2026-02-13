"use strict"

{
  // ==================== VERIFICACIÓN DE ACCESO ====================
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('access_token');

  // Verificar que el usuario esté logueado y sea admin
  if (!user || !token) {
    window.location.href = 'login.html';
  }

  if (user.rol !== 'admin') {
    alert('Acceso denegado. Esta área es solo para administradores.');
    window.location.href = 'bienvenida.html';
  }

  // ==================== CONFIGURACIÓN INICIAL ====================
  const API_URL = 'http://localhost:3000';

  document.getElementById('adminName').textContent = user.nombre || 'Administrador';

  // ==================== NAVEGACIÓN ENTRE SECCIONES ====================
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.admin-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remover active de todos
      sidebarLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Activar el seleccionado
      link.classList.add('active');
      const sectionId = link.getAttribute('data-section');
      document.getElementById(sectionId).classList.add('active');
      
      // Cargar datos según la sección
      switch(sectionId) {
        case 'dashboard':
          cargarDashboard();
          break;
        case 'usuarios':
          cargarUsuarios();
          break;
        case 'restaurantes':
          cargarRestaurantes();
          break;
        case 'actividad':
          cargarActividad();
          break;
      }
    });
  });

  // ==================== LOGOUT ====================
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }
  });

  // ==================== DASHBOARD ====================
  async function cargarDashboard() {
    try {
      // Cargar estadísticas
      const usuarios = await fetchUsuarios();
      const restaurantes = await fetchRestaurantes();
      
      document.getElementById('totalUsuarios').textContent = usuarios.length;
      document.getElementById('totalRestaurantes').textContent = restaurantes.length;
      document.getElementById('usuariosActivos').textContent = usuarios.filter(u => u.activo).length;
      document.getElementById('totalBusquedas').textContent = Math.floor(Math.random() * 100); // Mock data

      // Usuarios recientes
      const recentUsersHtml = usuarios.slice(0, 5).map(u => `
        <div class="recent-item">
          <div class="recent-avatar">${u.nombre.charAt(0).toUpperCase()}</div>
          <div class="recent-info">
            <h4>${u.nombre}</h4>
            <p>${u.email} • ${u.rol}</p>
          </div>
        </div>
      `).join('');
      
      document.getElementById('recentUsers').innerHTML = recentUsersHtml || '<p class="loading">No hay usuarios recientes</p>';

      // Actividad del sistema (mock data)
      const actividadHtml = `
        <div class="activity-item">
          <strong>${user.nombre}</strong> inició sesión como administrador
          <div class="activity-time">Hace 2 minutos</div>
        </div>
        <div class="activity-item">
          <strong>Sistema</strong> completó respaldo automático
          <div class="activity-time">Hace 1 hora</div>
        </div>
        <div class="activity-item">
          <strong>Usuario anónimo</strong> realizó una búsqueda
          <div class="activity-time">Hace 3 horas</div>
        </div>
      `;
      
      document.getElementById('systemActivity').innerHTML = actividadHtml;

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  }

  // ==================== GESTIÓN DE USUARIOS ====================
  async function fetchUsuarios() {
    try {
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await res.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async function cargarUsuarios() {
    const tbody = document.getElementById('usuariosTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Cargando usuarios...</td></tr>';

    try {
      const usuarios = await fetchUsuarios();

      if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No hay usuarios registrados</td></tr>';
        return;
      }

      const html = usuarios.map(u => `
        <tr>
          <td>${u.id.substring(0, 8)}...</td>
          <td>${u.nombre}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.rol}">${u.rol}</span></td>
          <td>${new Date(u.created_at).toLocaleDateString('es-ES')}</td>
          <td>
            <button class="btn-action edit" onclick="editarUsuario('${u.id}')" title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-action delete" onclick="eliminarUsuario('${u.id}')" title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.innerHTML = html;

    } catch (error) {
      console.error('Error cargando usuarios:', error);
      tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Error al cargar usuarios</td></tr>';
    }
  }

  // ==================== GESTIÓN DE RESTAURANTES ====================
  async function fetchRestaurantes() {
    // Mock data - aquí deberías conectar con tu API real
    return [
      { id: '1', nombre: 'La Toscana', categoria: 'Italiana', ubicacion: 'Sevilla Centro', rating: 4.5 },
      { id: '2', nombre: 'El Rincón Mexicano', categoria: 'Mexicana', ubicacion: 'Nervión', rating: 4.2 },
      { id: '3', nombre: 'Sushi Masters', categoria: 'Asiática', ubicacion: 'Triana', rating: 4.8 },
      { id: '4', nombre: 'Veggie Delight', categoria: 'Vegetariana', ubicacion: 'Macarena', rating: 4.6 },
    ];
  }

  async function cargarRestaurantes() {
    const tbody = document.getElementById('restaurantesTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Cargando restaurantes...</td></tr>';

    try {
      const restaurantes = await fetchRestaurantes();

      if (restaurantes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No hay restaurantes registrados</td></tr>';
        return;
      }

      const html = restaurantes.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.nombre}</td>
          <td>${r.categoria}</td>
          <td>${r.ubicacion}</td>
          <td>⭐ ${r.rating}</td>
          <td>
            <button class="btn-action edit" onclick="editarRestaurante('${r.id}')" title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-action delete" onclick="eliminarRestaurante('${r.id}')" title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `).join('');

      tbody.innerHTML = html;

    } catch (error) {
      console.error('Error cargando restaurantes:', error);
      tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Error al cargar restaurantes</td></tr>';
    }
  }

  // ==================== ACTIVIDAD ====================
  async function cargarActividad() {
    const tbody = document.getElementById('actividadTable');
    tbody.innerHTML = '<tr><td colspan="4" class="loading-row">Cargando actividad...</td></tr>';

    // Mock data
    const actividad = [
      { fecha: new Date(), usuario: 'Juan Pérez', accion: 'Login', detalles: 'Inicio de sesión exitoso' },
      { fecha: new Date(Date.now() - 3600000), usuario: 'María García', accion: 'Búsqueda', detalles: 'Buscó "restaurantes italianos"' },
      { fecha: new Date(Date.now() - 7200000), usuario: 'Admin', accion: 'Configuración', detalles: 'Cambió configuración del sistema' },
      { fecha: new Date(Date.now() - 10800000), usuario: 'Carlos López', accion: 'Favorito', detalles: 'Agregó restaurante a favoritos' },
    ];

    const html = actividad.map(a => `
      <tr>
        <td>${a.fecha.toLocaleString('es-ES')}</td>
        <td>${a.usuario}</td>
        <td><span class="badge success">${a.accion}</span></td>
        <td>${a.detalles}</td>
      </tr>
    `).join('');

    tbody.innerHTML = html;
  }

  // ==================== MODALS ====================
  window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  // Cerrar modal al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });

  // ==================== FUNCIONES DE USUARIO ====================
  document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    openModal('modalUsuario');
  });

  window.editarUsuario = function(id) {
    document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
    // Aquí cargarías los datos del usuario
    openModal('modalUsuario');
  }

  window.eliminarUsuario = async function(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Usuario eliminado correctamente');
        cargarUsuarios();
      } else {
        alert('Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar usuario');
    }
  }

  document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('usuarioNombre').value;
    const email = document.getElementById('usuarioEmail').value;
    const rol = document.getElementById('usuarioRol').value;
    const password = document.getElementById('usuarioPassword').value;

    try {
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, rol, password })
      });

      if (res.ok) {
        alert('Usuario guardado correctamente');
        closeModal('modalUsuario');
        cargarUsuarios();
      } else {
        const error = await res.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar usuario');
    }
  });

  // ==================== FUNCIONES DE RESTAURANTE ====================
  document.getElementById('btnNuevoRestaurante').addEventListener('click', () => {
    document.getElementById('modalRestauranteTitle').textContent = 'Nuevo Restaurante';
    document.getElementById('formRestaurante').reset();
    openModal('modalRestaurante');
  });

  window.editarRestaurante = function(id) {
    document.getElementById('modalRestauranteTitle').textContent = 'Editar Restaurante';
    // Aquí cargarías los datos del restaurante
    openModal('modalRestaurante');
  }

  window.eliminarRestaurante = function(id) {
    if (!confirm('¿Estás seguro de eliminar este restaurante?')) return;
    
    alert('Restaurante eliminado correctamente (mock)');
    cargarRestaurantes();
  }

  document.getElementById('formRestaurante').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Restaurante guardado correctamente (mock)');
    closeModal('modalRestaurante');
    cargarRestaurantes();
  });

  // ==================== CONFIGURACIÓN ====================
  document.getElementById('configGeneralForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Configuración general guardada correctamente');
  });

  document.getElementById('configSecurityForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Configuración de seguridad guardada correctamente');
  });

  // ==================== FILTROS ====================
  document.getElementById('btnFiltrar').addEventListener('click', () => {
    cargarActividad();
  });

  // ==================== CARGAR DASHBOARD AL INICIO ====================
  cargarDashboard();
}