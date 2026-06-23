// 1. Obtenemos la respuesta de Gregorio
let textoOriginal = $input.first().json.output || "";
let textoParaChat = textoOriginal;
let botonesExtraidos = [];

// 2. Limpieza de bloques de código Markdown (por si la IA los agrega)
textoParaChat = textoParaChat.replace(/```json/gi, '').replace(/```/g, '');

// 3. ASPIRADORA SELECTIVA: Buscamos objetos que parezcan botones
// Esta regex busca patrones de { "label": ... }
const regexBotones = /\{\s*["']label["']\s*:[\s\S]*?\}/g;
let coincidencias = textoOriginal.match(regexBotones);

if (coincidencias) {
    coincidencias.forEach(jsonString => {
        // Borramos el JSON del texto del chat
        textoParaChat = textoParaChat.replace(jsonString, '');

        try {
            // Arreglamos comillas simples y parseamos
            let jsonArreglado = jsonString.replace(/'/g, '"');
            let objBoton = JSON.parse(jsonArreglado);
            botonesExtraidos.push(objBoton);
        } catch (e) {
            console.error("Error parseando botón individual:", e);
        }
    });
}

// 4. LIMPIEZA FINAL DEL TEXTO
// Quitamos corchetes sobrantes, comas huérfanas y espacios extra
textoParaChat = textoParaChat
    .replace(/\[\s*\]/g, '') // Quita [] vacíos
    .replace(/,\s*$/, '')    // Quita coma al final
    .replace(/\s+/g, ' ')    // Normaliza espacios
    .trim();

// 5. Si después de limpiar el texto quedó vacío, le ponemos un fallback 
// para que no aparezca la burbuja vacía
if (textoParaChat === "" && botonesExtraidos.length > 0) {
    textoParaChat = "Aquí tenés las opciones disponibles:";
}

// 6. Texto para el Audio (sin URLs ni etiquetas)
let textoParaAudio = textoParaChat
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
    .replace(/<[^>]*>?/gm, '');

return [{
    json: {
        ...$input.first().json,
        respuesta_chat: textoParaChat,
        texto_limpio: textoParaAudio,
        opciones_botones: botonesExtraidos
    }
}];