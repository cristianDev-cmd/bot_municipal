// ==========================================
// 🔄 BUFFER - EVALUAR TIMER Y CONSOLIDAR
// ==========================================
const routerData = $('Buffer Preparar').first().json;
const miTimerId = routerData.timerId;
const sessionId = routerData.sessionId;

// Buscamos el audio: ya sea que venga suelto en la raíz o adentro de datosParaSub
const audio = routerData.audio || routerData.datosParaSub?.audio || null;

// Leer timer actual de Redis
let timerActual = '';
try {
    const t = $('Redis Verificar Timer').first().json;
    timerActual = t.value || t.propertyName || '';
} catch (e) { timerActual = ''; }

// Si NO soy el último, salir (Usamos String() por si Redis devuelve texto y el timer es número)
if (timerActual !== String(miTimerId)) {
    return [{
        json: {
            shouldProcess: false,
            reply: '',
            options: [],
            buffering: true,
            sessionId
        }
    }];
}

// SOY el último → consolidar mensajes
let messages = [];
try {
    const raw = $('Redis Leer Buffer Final').first().json;
    const val = raw.value || raw.propertyName || '[]';
    messages = JSON.parse(val);
} catch (e) { messages = []; }

// Ordenar por timestamp
messages.sort((a, b) => a.ts - b.ts);

// Consolidar
let consolidated = '';
if (messages.length === 0) {
    consolidated = routerData.datosParaSub?.mensaje || '';
} else if (messages.length === 1) {
    consolidated = messages[0].text;
} else {
    consolidated = messages.map(m => m.text.trim()).filter(t => t.length > 0).join('. ');
}

return [{
    json: {
        shouldProcess: true,
        sessionId,
        accion: routerData.accion || 'EXEC_SUB_ASESOR_NUBE',
        proximoEstado: routerData.proximoEstado || 'ESPERANDO_ASESOR_NUBE',
        trackingId: routerData.trackingId || 1201,
        datosParaSub: {
            fase: 'MANTENER_ESPERA',
            mensaje: consolidated,
            audio: audio // 👈 AHORA SÍ: El audio viaja empaquetado para que el subflujo lo encuentre
        }
    }
}];