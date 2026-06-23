// ==========================================
// 📦 BUFFER - PREPARAR MENSAJE
// ==========================================
const routerData = $('🧠 Logic Router').first().json;
const sessionId = routerData.sessionId;
const mensaje = routerData.datosParaSub?.mensaje || '';
const timerId = $execution.id;

// Leer buffer existente
let bufferActual = [];
try {
    const raw = $('Redis Leer Buffer1').first().json;
    const val = raw.value || raw.propertyName || null;
    if (val && typeof val === 'string' && val.startsWith('[')) {
        bufferActual = JSON.parse(val);
    }
} catch (e) { bufferActual = []; }

// Agregar nuevo mensaje
bufferActual.push({
    text: mensaje,
    ts: Date.now()
});

return [{
    json: {
        sessionId,
        timerId,
        bufferString: JSON.stringify(bufferActual),
        accion: routerData.accion,
        trackingId: routerData.trackingId,
        proximoEstado: routerData.proximoEstado,
        datosParaSub: routerData.datosParaSub
    }
}];