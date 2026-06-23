// Dividimos el texto por saltos de línea o asteriscos
const fullText = $input.first().json.reply;
const paragraphs = fullText.split(/\n\n|\*/).filter(p => p.trim() !== '');

// Armamos la lista de mensajes
const listaMensajes = paragraphs.map(p => {
    return {
        reply: p.trim(),
        sessionId: $('Webhook Entrada').first().json.body.sessionId
    };
});

// Envolvemos toda la lista en UN SOLO ítem para que el servidor no bloquee la conexión
return [{
    json: {
        paqueteMensajes: listaMensajes
    }
}];