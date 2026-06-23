// ==========================================
// 🔄 RESTAURAR MENSAJE Y BOTONES
// ==========================================

// 1. Buscamos los datos que generó el nodo de lógica (antes de Oracle)
// CAMBIA 'Desarrollo Social' POR EL NOMBRE EXACTO DE TU NODO ANTERIOR
const datosOriginales = $('logica asesor').first().json;

// 2. Devolvemos la respuesta visual (Texto + Botón Volver)
return [{
    json: {
        reply: datosOriginales.reply,
        options: datosOriginales.options
    }
}];
