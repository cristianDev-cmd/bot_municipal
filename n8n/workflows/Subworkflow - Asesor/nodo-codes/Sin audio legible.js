// 1. Recuperamos los datos originales con los que entró el mensaje
const inputData = $input.first().json;

// 2. Preparamos la respuesta rápida de Gregorio
const respuestaCorta = "Perdón vecino, había mucho ruido o no alcancé a escucharte bien. ¿Podrías repetirme la consulta, por favor?";

// 3. Devolvemos el formato exacto que espera tu sistema para mandarlo a la web
return [{
    json: {
        ...inputData, // Mantenemos el sessionId y otros datos de rastreo
        reply: respuestaCorta,
        audio_respuesta: null, // No gastamos plata generando un audio para esto
        accion: "RESPUESTA_IA",
        fase: "CHAT",
        options: [
            { label: "🔙 Volver al inicio", nodoId: "MAIN", trackingId: 100 }
        ]
    }
}];