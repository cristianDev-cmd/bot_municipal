const input = $input.first().json;
// Buscamos la fase en la raíz o dentro de datosParaSub por seguridad
const faseActual = input.fase || (input.datosParaSub ? input.datosParaSub.fase : 'PEDIR_INMUEBLE');

// 🔍 Rescatamos el sessionId de forma ultra-segura para evitar caídas
let currentSessionId = '';
try {
    currentSessionId = $('Execute Workflow Trigger').first().json.sessionId || $('Execute Workflow Trigger').first().json.body.sessionId;
} catch (e) {
    currentSessionId = input.sessionId || (input.body ? input.body.sessionId : '');
}

let datosSub = {
    accion: "EXEC_SUB_TASAS",
    sessionId: currentSessionId, // <-- Inyectamos la sesión en la raíz
    body: {
        sessionId: currentSessionId // <-- Y adentro de body por las dudas
    }
};

// 🤖 Evaluamos la fase e inyectamos la nueva variable "origen_ia"
if (faseActual === 'PEDIR_INMUEBLE') {
    datosSub.proximoEstado = "ESPERANDO_INMUEBLE";
    datosSub.trackingId = 201;
    datosSub.datosParaSub = {
        "fase": "PEDIR_INMUEBLE",
        "origen_ia": true // 🌟 Variable nueva para validar en el Logic Router
    };
} else {
    datosSub.proximoEstado = "ESPERANDO_COMERCIO";
    datosSub.trackingId = 202;
    datosSub.datosParaSub = {
        "fase": "PEDIR_COMERCIO",
        "origen_ia": true // 🌟 Variable nueva para validar en el Logic Router
    };
}

return [{ json: datosSub }];