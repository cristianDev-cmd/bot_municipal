return [{
    json: {
        reply: "Para acceder a " + $json.datosParaSub.texto + ", haz clic en el siguiente enlace:",
        options: [
            { label: "🔗 Abrir Enlace", action: "open_url", url: $json.datosParaSub.url },
            { label: "🔙 Volver al inicio", nodoId: "MAIN" }
        ]
    }
}];