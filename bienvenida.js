"use strict"

{

  function capitalizarNombre(nombre) {
    if (!nombre) return '';
    return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('access_token');

  if (!user || !token) {
    window.location.href = 'login.html';
  }

  const nombreCapitalizado = capitalizarNombre(user.nombre);
  document.getElementById('headerUserName').textContent = nombreCapitalizado;
  document.getElementById('userAvatar').textContent = nombreCapitalizado.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = nombreCapitalizado;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileRole').textContent = user.rol;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    window.location.href = 'index.html';
  });

  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  const sidebar = document.getElementById('sidebar');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(nav => nav.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));
      link.classList.add('active');
      const sectionId = link.getAttribute('data-section');
      const activeSection = document.getElementById(sectionId);
      activeSection.classList.add('active');
      sidebar.classList.toggle('visible', sectionId === 'buscar');
    });
  });

  document.getElementById('savePreferences').addEventListener('click', () => {
    alert('Preferencias guardadas correctamente');
  });

  document.getElementById('btnCompare').addEventListener('click', () => {
    document.querySelector('.nav-link[data-section="comparativas"]').click();
  });

  // ================= MAPA LEAFLET =================
  let map;
  let markersLayer; // LayerGroup para limpiar marcadores anteriores

  document.addEventListener("DOMContentLoaded", function () {
    map = L.map('map').setView([37.3891, -5.9845], 13); // Sevilla por defecto
    markersLayer = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Intentar geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 14);
          L.marker([lat, lng])
            .addTo(map)
            .bindPopup("Tu ubicación actual 📍")
            .openPopup();
        },
        function () {
          L.marker([37.3891, -5.9845])
            .addTo(map)
            .bindPopup("Sevilla 📍")
            .openPopup();
        }
      );
    }

    // Buscar restaurantes con Enter
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.querySelector('.btn-search').click();
    });
  });

function buscarRestaurantes(nombre) {
  const restaurantList = document.querySelector('.restaurant-list');
  restaurantList.innerHTML = '<p>Cargando...</p>';

  // Limpiar marcadores anteriores
  markersLayer.clearLayers();

  // Buscar por nombre en España
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nombre)}&limit=10&countrycodes=ES`)
    .then(res => res.json())
    .then(data => {
      restaurantList.innerHTML = '';
      
      if (data.length === 0) {
        restaurantList.innerHTML = '<p class="no-results">No se encontraron restaurantes con ese nombre en España</p>';
        return;
      }

      data.forEach((place, index) => {
        // Crear marcador
        const marker = L.marker([place.lat, place.lon]).addTo(markersLayer);
        marker.bindPopup(`<b>${place.display_name}</b>`);

        // Crear elemento en la lista lateral
        const item = document.createElement('div');
        item.classList.add('restaurant-item');
        item.innerHTML = `
          <div class="restaurant-item-icon">🍽️</div>
          <div class="restaurant-item-info">
            <h4>${place.display_name}</h4>
            <p>Lat: ${place.lat}, Lon: ${place.lon}</p>
          </div>
        `;
        restaurantList.appendChild(item);

        // Centrar mapa en el primer resultado
        if (index === 0) map.setView([place.lat, place.lon], 16);

        // Al hacer clic en la lista, abrir popup y centrar mapa
        item.addEventListener('click', () => {
          marker.openPopup();
          map.setView([place.lat, place.lon], 16);
        });
      });
    })
    .catch(err => {
      console.error(err);
      restaurantList.innerHTML = '<p class="no-results">Error al buscar restaurantes</p>';
    });
}



  // Botón de búsqueda
  document.querySelector('.btn-search').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query.trim()) buscarRestaurantes(query);
  });

  // Reajustar mapa al volver a la pestaña "Restaurantes"
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('data-section') === 'buscar' && map) {
        setTimeout(() => map.invalidateSize(), 200);
      }
    });
  });

}