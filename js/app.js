// ===============================================================
// FASE 1: CONFIGURACIÓN E INICIALIZACIÓN
// ===============================================================
const firebaseConfig = {
    // ... Pega tu configuración de Firebase aquí ...
    apiKey: "AIzaSyCZqpDZvv9-TpRCB2YsZnXBtR8r2VhP1yM",
    authDomain: "turismo-mi-pueblo.firebaseapp.com",
    projectId: "turismo-mi-pueblo",
    storageBucket: "turismo-mi-pueblo.appspot.com",
    messagingSenderId: "499537377142",
    appId: "1:499537377142:web:600a807af619ea10aaec57"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===============================================================
// FASE 2: LÓGICA MULTILENGUAJE
// ===============================================================

// Variable global para guardar el idioma actual
let currentLang = 'es'; 
// Variable global para guardar las traducciones cargadas
let translations = {};

// Función principal para cambiar el idioma
async function setLanguage(lang) {
    currentLang = lang;
    // Guardar preferencia del usuario en su navegador
    localStorage.setItem('language', lang);

    // Cargar el archivo JSON de traducciones correspondiente
    const response = await fetch(`lang/${lang}.json`);
    translations = await response.json();

    // Actualizar todo el texto estático de la página
    translatePage();

    // Volver a cargar los datos dinámicos (de Firestore) en el nuevo idioma
    cargarBares();
    // En el futuro:
    // cargarLugares();
    // cargarRutas();
}

// Función que recorre la página y traduce los elementos marcados
function translatePage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        // Usamos .innerHTML para que respete etiquetas como &copy;
        element.innerHTML = translations[key] || key; 
    });
    // Actualizar el atributo 'lang' de la etiqueta <html> y la meta descripción
    document.documentElement.lang = currentLang;
    document.querySelector('meta[name="description"]').setAttribute('content', translations.metaDescription);
    document.title = translations.pageTitle;
}

// Función para configurar los botones del selector de idioma
function setupLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher');
    switcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const lang = e.target.getAttribute('data-lang');
            if (lang !== currentLang) {
                setLanguage(lang);
            }
        }
    });
}

// ===============================================================
// FASE 3: CARGA DE DATOS DINÁMICOS (FIRESTORE)
// ===============================================================
async function cargarBares() {
    const baresContainer = document.getElementById('bares-container');
    baresContainer.innerHTML = ''; // Limpiar antes de cargar

    try {
        const querySnapshot = await db.collection('bares').get();
        if (querySnapshot.empty) {
            // Usar la traducción para el mensaje de "no hay bares"
            baresContainer.innerHTML = `<p>${translations.noBaresMessage || 'No hay bares para mostrar.'}</p>`;
            return;
        }

        querySnapshot.forEach(doc => {
            const bar = doc.data();
            const card = document.createElement('div');
            card.className = 'card';
            
            const imagenUrl = bar.imagenUrl || 'https://via.placeholder.com/400x200.png?text=Imagen+no+disponible';

            // ¡Aquí está la magia!
            // Accedemos a la traducción correcta usando el 'currentLang'
            card.innerHTML = `
                <img src="${imagenUrl}" alt="Imagen de ${bar.nombre}">
                <div class="card-content">
                    <h3>${bar.nombre}</h3>
                    <p>${bar.descripcion[currentLang]}</p>
                </div>
            `;
            baresContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar los bares:", error);
        baresContainer.innerHTML = `<p>${translations.errorLoadingMessage || 'Hubo un error al cargar la información.'}</p>`;
    }
}


// ===============================================================
// FASE 4: INICIO DE LA APLICACIÓN
// ===============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Configurar los botones
    setupLanguageSwitcher();

    // Detectar el idioma guardado o el del navegador
    const savedLang = localStorage.getItem('language') || navigator.language.split('-')[0];
    const initialLang = ['es', 'en', 'fr'].includes(savedLang) ? savedLang : 'es';

    // Iniciar la aplicación con el idioma detectado
    setLanguage(initialLang);
});