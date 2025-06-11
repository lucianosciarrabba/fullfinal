import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";  // Importar funciones necesarias de la base de datos

const firebaseConfig = {
  apiKey: "AIzaSyDI-nxjEL1rXvJ9K056zseypp5KrYkRajE",
  authDomain: "proyecto-45613.firebaseapp.com",
  projectId: "proyecto-45613",
  storageBucket: "proyecto-45613.firebasestorage.app",
  messagingSenderId: "1039764105933",
  appId: "1:1039764105933:web:2236e401b4f58586869784",
  measurementId: "G-PNFZ8J2EWF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar la base de datos en tiempo real
const db = getDatabase(app);

// Función para cargar los post-its desde Firebase
function loadPostIts() {
  const postItsRef = ref(db, 'postIts');  // Referencia a los post-its
  get(postItsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const savedPostIts = snapshot.val();
      Object.keys(savedPostIts).forEach(postItId => {
        const postItData = savedPostIts[postItId];
        createPostIt(postItData.name, postItData.type, postItData.stage, postItData.id);
      });
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error("Error loading post-its:", error);
  });
}

// Función para crear un post-it y agregarlo a la etapa correspondiente
function createPostIt(name, type, stageId, id) {
  const postIt = document.createElement('div');
  postIt.classList.add('post-it', 'p-2', 'd-inline-block', 'm-1');
  postIt.setAttribute('draggable', 'true');
  postIt.textContent = `${name} - ${type}`;
  postIt.setAttribute('id', id);
  
  // Asignar color según el tipo de edificio
  switch (type) {
    case 'Particular':
      postIt.classList.add('bg-info');  // Celeste
      break;
    case 'Full Tower':
      postIt.classList.add('bg-danger');  // Rosa
      break;
    case 'Key Tower':
      postIt.classList.add('bg-warning');  // Amarillo
      break;
    case 'Easy Tower':
      postIt.classList.add('bg-success');  // Verde
      break;
    case 'Adicional':
      postIt.classList.add('bg-naranja');  // Morado (Nuevo)
      break;
    case 'Upgrade':
      postIt.classList.add('bg-violet');  // Azul (Nuevo)
      break;
    case 'Downgrade':
      postIt.classList.add('bg-primary');  // Gris (Nuevo)
      break;
  }

  // Agregar el post-it a la etapa correspondiente
  document.getElementById(stageId).appendChild(postIt);
  
  // Añadir el evento de eliminar en la última etapa
  if (stageId = 'stage-8') {
    postIt.addEventListener('dblclick', function () {
      // Usamos SweetAlert2 para mostrar un mensaje de confirmación
      Swal.fire({
        title: '¿Estás seguro de que finalizó el proceso de este edificio?',
        icon: 'question',
        showCancelButton: true,  // Muestra el botón de cancelar
        confirmButtonText: 'Sí, finalizar',  // Texto del botón de confirmación
        cancelButtonText: 'No, cancelar'  // Texto del botón de cancelar
      }).then((result) => {
        if (result.isConfirmed) {
          postIt.remove();
          updateFirebase();  // Actualizar Firebase después de eliminar
          Swal.fire('Proceso finalizado', '', 'success');  // Mensaje de éxito
          // Recargar la página después de 2 segundos
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      });
    });
  }
}

// Función para actualizar Firebase con el estado actual de los post-its
function updateFirebase() {
  const postIts = [];
  document.querySelectorAll('.post-it').forEach(postIt => {
    postIts.push({
      id: postIt.id,
      name: postIt.textContent.split(' - ')[0],
      type: postIt.textContent.split(' - ')[1],
      stage: postIt.parentElement.id
    });
  });
  
  // Referencia a la base de datos y actualizar los post-its
  const postItsRef = ref(db, 'postIts');
  set(postItsRef, postIts.reduce((acc, postIt) => {
    acc[postIt.id] = postIt;
    return acc;
  }, {}));

  // Recargar la página después de 2 segundos
  setTimeout(() => {
    location.reload();
  }, 2000);
}

// Al enviar el formulario, agregar un nuevo post-it
document.getElementById('buildingForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const buildingName = document.getElementById('buildingName').value;
  const buildingType = document.getElementById('buildingType').value;
  if (buildingName.trim() === '') {
    alert("El nombre del edificio es obligatorio.");
    return;
  }

  // Crear el nuevo post-it
  const postItId = `postit-${new Date().getTime()}`;
  createPostIt(buildingName, buildingType, 'stage-1', postItId);

  // Limpiar los campos del formulario
  document.getElementById('buildingName').value = '';
  document.getElementById('buildingType').value = 'Particular';

  // Actualizar Firebase
  updateFirebase();
});

// Función para habilitar el arrastre de los post-its
document.addEventListener('dragstart', function (event) {
  if (event.target.classList.contains('post-it')) {
    event.dataTransfer.setData('text', event.target.id);  // Almacenar el ID del post-it arrastrado
  }
});

// Permitir que las celdas reciban los post-its
document.querySelectorAll('.process-stage').forEach(stage => {
  stage.addEventListener('dragover', function (event) {
    event.preventDefault();  // Necesario para permitir el "drop"
  });

  stage.addEventListener('drop', function (event) {
    event.preventDefault();  // Prevenir la acción predeterminada
    const postItId = event.dataTransfer.getData('text');  // Obtener el ID del post-it arrastrado
    const postIt = document.getElementById(postItId);  // Obtener el elemento del post-it
    // Agregar el post-it a la etapa correspondiente
    stage.appendChild(postIt);
    // Actualizar Firebase cuando un post-it se mueva
    updateFirebase();  // Actualiza los cambios en Firebase

    // Recargar la página después de 2 segundos
    setTimeout(() => {
      location.reload();
    }, 2000);
  });
});

// Cargar los post-its cuando se recargue la página
window.addEventListener('load', function () {
  loadPostIts();
});

// Recargar la página automáticamente cada 5 minutos (300000 ms)
setInterval(() => {
  location.reload();
}, 300000);  // 5 minutos
