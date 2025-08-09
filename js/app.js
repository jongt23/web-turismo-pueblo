// Función para cargar los bares desde Firestore
async function cargarBares() {
    const baresContainer = document.getElementById('bares-container');
    try {
        const querySnapshot = await db.collection('bares').get();
        
        if (querySnapshot.empty) {
            baresContainer.innerHTML = '<p>No hay bares para mostrar en este momento.</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach(doc => {
            const bar = doc.data();
            html += `
                <div class="card">
                    <img src="${bar.imagenUrl}" alt="Imagen de ${bar.nombre}">
                    <div class="card-content">
                        <h3>${bar.nombre}</h3>
                        <p>${bar.descripcion}</p>
                    </div>
                </div>
            `;
        });
        baresContainer.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar los bares:", error);
        baresContainer.innerHTML = '<p>Hubo un error al cargar la información. Inténtalo de nuevo más tarde.</p>';
    }
}

// Esperar a que el DOM esté completamente cargado para ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    cargarBares();
    // Aquí llamarías a funciones para cargar rutas, lugares, etc.
    // cargarRutas();
    // cargarLugares();
});