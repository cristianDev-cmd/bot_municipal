// 1. Recuperamos tus variables originales de forma segura
let originalData = {};
try {
    // Intentamos recuperar los datos del AI Agent
    originalData = $('AI Agent').first().json;
} catch (e) {
    // Si el AI Agent no se ejecutó, recuperamos los datos del trigger original
    try {
        originalData = $('Execute Workflow Trigger').first().json;
    } catch (err) {
        originalData = {}; // Fallback final
    }
}

// 2. Extraemos el audio que acaba de generar Gemini (con validación de errores)
let pcmBase64 = null;
const inputJson = $input.first().json;

// Verificamos si hubo un error de PROHIBITED_CONTENT o si no hay contenido
if (inputJson.promptFeedback && inputJson.promptFeedback.blockReason) {
    console.warn("Gemini bloqueó la generación de audio. Razón:", inputJson.promptFeedback.blockReason);
    // Podemos devolver un audio nulo o manejarlo de otra manera
} else if (inputJson.candidates && inputJson.candidates.length > 0 && inputJson.candidates[0].content) {
    const parts = inputJson.candidates[0].content.parts;
    for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.includes("audio")) {
            pcmBase64 = part.inlineData.data;
            break;
        }
    }
}

// 3. --- MAGIA PURA: Convertir el PCM crudo a un WAV reproducible ---
let audioUrl = null;

if (pcmBase64) {
    const pcmBuffer = Buffer.from(pcmBase64, 'base64');
    const dataLength = pcmBuffer.length;
    const wavBuffer = Buffer.alloc(44 + dataLength);

    // Cabecera estándar WAV
    wavBuffer.write('RIFF', 0);
    wavBuffer.writeUInt32LE(36 + dataLength, 4);
    wavBuffer.write('WAVE', 8);
    wavBuffer.write('fmt ', 12);
    wavBuffer.writeUInt32LE(16, 16);
    wavBuffer.writeUInt16LE(1, 20); // Formato PCM
    wavBuffer.writeUInt16LE(1, 22); // Mono canal
    wavBuffer.writeUInt32LE(24000, 24); // Frecuencia de Gemini (24kHz)
    wavBuffer.writeUInt32LE(24000 * 2, 28);
    wavBuffer.writeUInt16LE(2, 32);
    wavBuffer.writeUInt16LE(16, 34); // 16 bits
    wavBuffer.write('data', 36);
    wavBuffer.writeUInt32LE(dataLength, 40);

    // Pegamos el audio real a la cabecera
    pcmBuffer.copy(wavBuffer, 44);

    // Lo pasamos a Base64 con la etiqueta para la web
    const wavBase64 = wavBuffer.toString('base64');
    audioUrl = `data:audio/wav;base64,${wavBase64}`;
}

// 4. Inyectamos el audio al JSON final y limpiamos lo demás
// Usamos el mensaje del AI Agent, o un mensaje predeterminado si no hay
const mensajeOriginal = originalData.output || originalData.reply || "Hubo un problema generando la respuesta.";

const respuestaFinal = {
    ...originalData,
    audio_respuesta: audioUrl, // Será null si hubo un error de contenido
    mensaje: mensajeOriginal
};

return [{ json: respuestaFinal }];