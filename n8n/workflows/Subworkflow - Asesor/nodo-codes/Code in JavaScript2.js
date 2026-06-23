const input = $input.first().json;
let textoIA = input.output || '';

// 1. Limpiamos los bloques de código markdown si la IA los puso (```json ... ```)
if (textoIA.includes('```')) {
    textoIA = textoIA.replace(/```json/g, '').replace(/```/g, '').trim();
}

try {
    // 2. Intentamos parsear el texto limpio a un objeto real
    const objetoParseado = JSON.parse(textoIA.trim());

    return [{
        json: {
            reply: objetoParseado.reply !== undefined ? objetoParseado.reply : '',
            fase: objetoParseado.fase !== undefined ? objetoParseado.fase : 'CHAT',
            sessionId: input.sessionId || '' // Mantenemos la sesión activa
        }
    }];
} catch (e) {
    // Fallback: Si la IA devolvió texto plano común por error, lo mandamos al CHAT
    return [{
        json: {
            reply: textoIA,
            fase: 'CHAT',
            sessionId: input.sessionId || ''
        }
    }];
}