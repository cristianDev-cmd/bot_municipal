// 1. Recuperamos el historial antiguo del nodo Redis ('Leer_Historial')
let historialCrudo = $('Leer_Historial').first().json.propertyName;
let historial = [];

// Validamos si historialCrudo existe y qué formato tiene
if (historialCrudo) {
    if (typeof historialCrudo === 'string') {
        try {
            historial = JSON.parse(historialCrudo);
        } catch (e) {
            historial = []; // Si falla, arrancamos desde cero
        }
    } else if (Array.isArray(historialCrudo)) {
        historial = historialCrudo;
    }
}

// 2. Recuperamos los datos del flujo actual
const inputData = $input.first().json;

// ==========================================
// NUEVO: RECUPERAR MENSAJE DEL VECINO
// ==========================================
let inputReal = "";

try {
    // 1ro: Intentamos atrapar el mensaje limpio del nodo 'transcripción'
    inputReal = $('transcripción').first().json.mensaje;
} catch (e) { }

// 2do: Si no lo encontró ahí (o si tiene la etiqueta de audio falsa), buscamos en 'Edit Fields'
if (!inputReal || inputReal.includes("[Mensaje de voz enviado]")) {
    try {
        let textoEdit = $('set variables').first().json.mensaje;
        if (textoEdit && !textoEdit.includes("[Mensaje de voz enviado]")) {
            inputReal = textoEdit;
        }
    } catch (e) { }
}

// Limpiamos y preparamos el mensaje final
let mensajeUsuario = (inputReal && inputReal.trim() !== "") ? inputReal.trim() : "hola";

// ==========================================

// Recuperamos la respuesta de texto del bot
let respuestaBot = inputData.output || inputData.reply || inputData.mensaje || "";

// Recuperamos el audio generado (si el flujo pasó por el camino de arriba)
let audioBot = null;
try {
    audioBot = $('prepara audio').first().json.audio_respuesta || null;
} catch (e) {
    audioBot = null;
}

// 3. Añadimos la nueva interacción al array de memoria (A Redis solo va texto, nunca audio)
if (mensajeUsuario) {
    historial.push(`Vecino: ${mensajeUsuario}`);
}
if (respuestaBot) {
    historial.push(`Gregorio: ${respuestaBot}`);
}

// 4. CONTROL DE TOKENS: Limitamos a las últimas 10 líneas (5 interacciones)
if (historial.length > 10) {
    historial = historial.slice(-10);
}

// 5. Retornamos la memoria y empaquetamos TODO para el final
return [{
    json: {
        // Los tres puntos (...) "desparraman" todas las variables originales (sessionId, trackingId, etc.) 
        // para que no se pierdan en el camino hacia tu webhook final.
        ...inputData,

        guardar_en_redis: historial,
        value_texto: historial.join('\n'),
        reply: respuestaBot,
        audio_respuesta: audioBot // Dejamos la variable lista para tu front-end
    }
}];