
const reply = "👋 ¡Hola! soy el asistente virtual de la Municipalidad de Las Heras en que puedo ayudarte?. <br> ;

const options = [
    { label: "💲 Pago de Tasas", nodoId: "TASAS", trackingId: 200 },

    { label: "💲 Pago de Tasas Copy", nodoId: "TASASCOPY", trackingId: 200 },
    // { label: "📢 Reclamos", nodoId: "RECLAMOS", trackingId: 700 },
    { label: "🏗️ Obras Privadas", nodoId: "OBRAS", trackingId: 400 },
    { label: "🤝 Desarrollo Social", nodoId: "SOCIAL", trackingId: 500 },
    { label: "🚗 Licencia de Conducir", nodoId: "LICENCIA", trackingId: 800 },
    { label: "🏥 Centros de Salud", nodoId: "SALUD", trackingId: 300 },
    { label: "🐶 Veterinaria", nodoId: "VETERINARIA", trackingId: 900 },
    { label: "⚖️ Juzgado vial", nodoId: "JUZGADO", trackingId: 1000 },
    { label: "📄 Mesa de Entrada Virtual", nodoId: "TRAMITES", trackingId: 600 }
];

// Intentamos recuperar el sessionId por seguridad para el nodo Oracle
const sessionId = $input.first().json.sessionId || '';

return [{
    json: {
        reply: reply,
        options: options,

        // --- DATOS EXTRAS PARA EL NODO ORACLE (INSERT) ---
        tracking_actual: 100,       // ID del Menú Principal
        accion: 'MENU_PRINCIPAL',   // Para la columna RC_ESTADO
        sessionId: sessionId        // Aseguramos que pase al siguiente nodo
    }
}];