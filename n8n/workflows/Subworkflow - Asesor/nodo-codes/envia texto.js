// Dividimos el texto por los dobles saltos de línea que configuramos en el prompt
const fullText = $('Call \'Subworkflow - Asesor IA Nube').first().json.reply;
const paragraphs = fullText.split('\n\n').filter(p => p.trim() !== '');
// Devolvemos cada párrafo como un ítem individual para que n8n dispare el webhook varias veces
return paragraphs.map(p => {
    return {
        json: {
            reply: p.trim(),
            sessionId: $('Webhook Entrada').first().json.body.sessionId
        }
    };
});