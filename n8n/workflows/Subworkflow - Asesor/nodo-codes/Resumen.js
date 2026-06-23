const input = $input.first().json;
const respuestaOriginal = (input.output || input.reply || '').toString();

// 🎯 REGLA DE LIMPIEZA EXTREMA (Regex):
// Removemos los corchetes [ ] y todo lo que tengan adentro para no contar los botones.
// También aplicamos .trim() para quitar espacios fantasmas al principio y al final.
const textoLimpio = respuestaOriginal.replace(/\[[\s\S]*?\]/g, '').trim();

// 📊 Contamos los caracteres reales (aquí los espacios entre palabras SÍ cuentan)
const cantidadCaracteres = textoLimpio.length;

return [{
    json: {
        ...input,
        reply: respuestaOriginal, // Conservamos el texto largo intacto para entregárselo a la IA resumidora
        texto_medido_limpio: textoLimpio, // Por si querés auditar qué se midió
        cantidad_caracteres: cantidadCaracteres // 🌟 Tu nueva variable de control
    }
}];