// ==========================================
// 🤖 LÓGICA SUB-WORKFLOW: GREGORIO (ASESOR)
// ==========================================

const items = $input.all();
const mergedData = Object.assign({}, ...items.map(i => i.json));

const datosParaSub = mergedData.datosParaSub || {};
const fase = datosParaSub.fase || 'INICIO';
let sessionId = mergedData.sessionId || datosParaSub.sessionId || '';
let chatInput = mergedData.chatInput || '';

let reply = '';
let options = [];
let ir_a_ia = false;
let accion_local = 'ASESOR_GREGORIO';

// 🚨 VALIDACIÓN DE ENTRADA: MENU o INICIO disparan el saludo
if (fase === 'MENU' || fase === 'INICIO') {

    // 🕰️ Obtener la hora actual asegurando la zona horaria correcta
    let opcionesHora = { timeZone: 'America/Argentina/Mendoza', hour: 'numeric', hour12: false };
    let horaActual = parseInt(new Intl.DateTimeFormat('es-AR', opcionesHora).format(new Date()));

    // 🌤️ Lógica del saludo
    let saludo = 'Buenos días';
    if (horaActual >= 12 && horaActual < 20) {
        saludo = 'Buenas tardes';
    } else if (horaActual >= 20 || horaActual < 6) {
        saludo = 'Buenas noches';
    }

    reply = `¡${saludo}! ¿En qué puedo ayudarlo? Al finalizar le voy a enviar una encuesta de satisfacción para permitirnos conocer su opinión y mejorar el servicio.`;

    options = [
        { label: "🔙 Volver al inicio", nodoId: "MAIN", trackingId: 100 }
    ];

    ir_a_ia = false;
    accion_local = 'SALUDO_INICIAL';
}
else {
    // Si la fase es distinta (ej: ESPERANDO_ASESOR), activamos la IA
    ir_a_ia = true;
    accion_local = 'CONSULTA_IA';
}

return [{
    json: {
        reply: reply,
        options: options,
        ir_a_ia: ir_a_ia,
        accion: accion_local,
        sessionId: sessionId,
        chatInput: chatInput, // Pasamos el mensaje del vecino al siguiente nodo
        fase: 'CHAT'
    }
}];