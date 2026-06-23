const inputData = $input.first().json;

// 1. Buscamos el audio (por si viene en audio_respuesta o en audio)
const audioCompleto = inputData.audio_respuesta || inputData.audio;

// 2. Si por algún motivo no hay audio, dejamos pasar el JSON tal cual para que el bot responda por texto
if (!audioCompleto) {
    return [{ json: inputData }];
}

// 3. Re-empaquetamos TODO junto. 
// Usamos ...inputData para conservar el 'reply', 'options', 'sessionId', etc.
return [{
    json: {
        ...inputData,
        audio: audioCompleto,         // El script.js de tu web busca 'audio'
        audio_respuesta: audioCompleto // Lo dejamos también por si otro nodo lo busca
    }
}];

// NOTA: Eliminamos todo el bloque "binary: {}" a propósito.
// Esto obliga al Webhook a responder con el texto JSON y no forzar una descarga de archivo.