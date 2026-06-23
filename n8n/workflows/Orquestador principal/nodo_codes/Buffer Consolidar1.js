// ==========================================
// 🔄 BUFFER - EVALUAR TIMER Y CONSOLIDAR
// ==========================================
const miTimerId = $('Buffer Preparar1').first().json.timerId;
const sessionId = $('Buffer Preparar1').first().json.sessionId;
const routerData = $('Buffer Preparar1').first().json;

// Leer timer actual de Redis
let timerActual = '';
try {
    const t = $('Redis Verificar Timer1').first().json;
    timerActual = t.value || t.propertyName || '';
} catch (e) { timerActual = ''; }

// Si NO soy el último, salir
if (timerActual !== miTimerId) {
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
    const raw = $('Redis Leer Buffer Final1').first().json;
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
            mensaje: consolidated
        }
    }
}];