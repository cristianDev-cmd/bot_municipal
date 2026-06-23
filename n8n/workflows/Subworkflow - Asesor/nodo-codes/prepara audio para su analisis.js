// Separamos la cabecera "data:audio/webm;base64," del contenido real
const base64Data = $input.first().json.audio.split(',')[1];

return [{
    json: $input.first().json,
    binary: {
        audioData: {
            data: base64Data,
            mimeType: 'audio/webm',
            fileName: 'nota_de_voz.webm'
        }
    }
}];