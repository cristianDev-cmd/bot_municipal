// ==========================================
// 馃 CEREBRO PRINCIPAL (DIRECTO Y CON SESSIONID)
// ==========================================

// 1. OBTENER INPUTS, SESSION ID Y MENUID
let msg = '';
let sessionId = '';
let menuId = '';
let audio = undefined;

try {
    if ($('Webhook Entrada').first().json.body) {
        msg = $('Webhook Entrada').first().json.body.message || '';
        sessionId = $('Webhook Entrada').first().json.body.sessionId || '';
        menuId = $('Webhook Entrada').first().json.body.menuId || '';
        audio = $('Webhook Entrada').first().json.body.audio || undefined;
    }
} catch (e) {
    try {
        msg = $input.item.json.body.message || '';
        sessionId = $input.item.json.body.sessionId || '';
        menuId = $input.item.json.body.menuId || '';
        audio = $input.item.json.body.audio || undefined;
    } catch (e2) { }
}

const msgClean = msg.toString().trim();
const msgLower = msgClean.toLowerCase();

// 2. RECUPERAR ESTADO DE REDIS
let estadoActual = 'INICIO';
try {
    const itemsRedis = $('Redis').all();
    if (itemsRedis.length > 0) {
        const dataRedis = itemsRedis[0].json;
        if (dataRedis.propertyName) estadoActual = dataRedis.propertyName;
        else if (dataRedis.value) estadoActual = dataRedis.value;
        else if (dataRedis.estado) estadoActual = dataRedis.estado;
        else if (typeof dataRedis === 'string') estadoActual = dataRedis;
    }
} catch (error) {
    estadoActual = 'INICIO';
}
if (!estadoActual || estadoActual === 'undefined') estadoActual = 'INICIO';


// ============================================================
// 馃殌 3. NAVEGACI脫N GLOBAL
// ============================================================

// -> 馃専 INTERCEPTOR DE VALORACI脫N (PRIORIDAD M脕XIMA)
if (msgClean.includes('CALIFICACION_INTERNA')) {
    const rating = msgClean.split(':')[1] ? msgClean.split(':')[1].trim() : '0';
    return [{
        json: {
            accion: 'GUARDAR_VALORACION',
            proximoEstado: 'INICIO',
            trackingId: 1300,
            datosParaSub: { fase: 'GUARDAR_RATING', rating: rating },
            sessionId: sessionId
        }
    }];
}

// -> Volver / Start / Hola (ID 100)
if (msgLower === 'start' || msgClean.includes('Volver') || msgClean === '') {
    return [{ json: { accion: 'ENVIAR_MENU_PRINCIPAL', proximoEstado: 'INICIO', trackingId: 100, datosParaSub: {}, sessionId: sessionId } }];
}

// -> 馃専 INTERCEPTOR DIRECTO A IA CORREGIDO
// Si el frontend envi贸 ASESOR_NUBE, SOLO vamos a la IA si NO estamos en medio de un tr谩mite.
if (menuId === 'ASESOR_NUBE') {
    if (estadoActual !== 'ESPERANDO_INMUEBLE' &&
        estadoActual !== 'ESPERANDO_COMERCIO' &&
        estadoActual !== 'ESPERANDO_SUGERENCIA') {

        return [{
            json: {
                accion: 'EXEC_SUB_ASESOR_NUBE',
                proximoEstado: 'ESPERANDO_ASESOR_NUBE',
                trackingId: 1201,
                datosParaSub: { fase: 'MANTENER_ESPERA', mensaje: msgClean },
                sessionId: sessionId
            }
        }];
    }
}

// -> INTERCEPTOR: LEER TEXTO COMPLETO RESPALDADO EN REDIS
if (menuId === 'LEER_MAS') {
    let textoLargoGuardado = '';
    try {
        const itemsRedis = $('Redis').all();
        if (itemsRedis.length > 0) {
            const dataRedis = itemsRedis[0].json;
            // Buscamos la variable donde respaldamos el texto completo
            textoLargoGuardado = dataRedis.texto_completo || dataRedis.value?.texto_completo || '';
        }
    } catch (e) { }

    // Si por algún motivo se borró de Redis, le damos un mensaje de auxilio
    if (!textoLargoGuardado) {
        textoLargoGuardado = "Disculpá, no alcancé a recuperar el texto completo. ¿Me podrías repetir qué trámite necesitabas hacer?";
    }

    return [{
        json: {
            accion: 'ENVIAR_TEXTO_DIRECTO', // Tu nodo final de WhatsApp/Chat
            proximoEstado: 'INICIO', // Liberamos el estado
            trackingId: 1500,
            datosParaSub: { fase: 'CHAT' },
            respuesta_chat: textoLargoGuardado, // Le mandamos el choclo de texto completo
            sessionId: sessionId
        }
    }];
}

// -> RECLAMOS (DIRECTO - ID 700)
if (msgClean.includes('Reclamos')) {
    return [{ json: { accion: 'EXEC_SUB_RECLAMOS', proximoEstado: 'MENU_RECLAMOS', trackingId: 700, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Salud (ID 300)
if (msgClean.includes('Salud') || msgClean.includes('Centros de Salud') || msgClean.includes('Turnos M茅dicos')) {
    return [{ json: { accion: 'EXEC_SUB_SALUD', proximoEstado: 'MENU_SALUD', trackingId: 300, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Pago de Tasas Men煤 Principal (ID 200) - ATRAPA TEXTO O BOT脫N
if (msgClean.includes('Pago de Tasas') || menuId === 'TASAS') {
    return [{ json: { accion: 'EXEC_SUB_TASAS', proximoEstado: 'MENU_TASAS', trackingId: 200, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Atajo: TASAS INMUEBLE (ID 201) - ATRAPA TEXTO O BOT脫N
if (msgClean.includes('Inmueble') || menuId === 'TASAS_INMUEBLE') {
    return [{ json: { accion: 'EXEC_SUB_TASAS', proximoEstado: 'ESPERANDO_INMUEBLE', trackingId: 201, datosParaSub: { fase: 'PEDIR_INMUEBLE' }, sessionId: sessionId } }];
}

// -> Atajo: TASAS COMERCIO (ID 202) - ATRAPA TEXTO O BOT脫N
if (msgClean.includes('Comercio') || menuId === 'TASAS_COMERCIO') {
    return [{ json: { accion: 'EXEC_SUB_TASAS', proximoEstado: 'ESPERANDO_COMERCIO', trackingId: 202, datosParaSub: { fase: 'PEDIR_COMERCIO' }, sessionId: sessionId } }];
}

// -> Desarrollo Social (ID 500)
if (msgClean.includes('Desarrollo Social') || msgClean.includes('Social')) {
    return [{ json: { accion: 'EXEC_SUB_SOCIAL', proximoEstado: 'MENU_SOCIAL', trackingId: 500, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Atajo: Acceso a Expedientes (ID 601)
if (menuId === 'TRAMITES_ACCESO') {
    return [{ json: { accion: 'EXEC_SUB_TRAMITES', proximoEstado: 'INICIO', trackingId: 601, datosParaSub: { fase: 'ACCESO' }, sessionId: sessionId } }];
}

// -> Atajo: Alta de Usuarios (ID 602)
if (menuId === 'TRAMITES_ALTA') {
    return [{ json: { accion: 'EXEC_SUB_TRAMITES', proximoEstado: 'INICIO', trackingId: 602, datosParaSub: { fase: 'ALTA' }, sessionId: sessionId } }];
}

// -> Tr谩mites a Distancia Men煤 General (Atrapa "Tr谩mite", "Expediente", "Mesa de entrada", o el bot贸n general)
if (msgClean.includes('Tramite') || msgClean.includes('Expediente') || msgClean.includes('Mesa de entrada') || menuId === 'TRAMITES') {
    return [{ json: { accion: 'EXEC_SUB_TRAMITES', proximoEstado: 'MENU_TRAMITES', trackingId: 600, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Atajo: Gu铆as e Instructivos (ID 401)
if (menuId === 'OBRAS_GUIAS') {
    return [{ json: { accion: 'EXEC_SUB_OBRAS', proximoEstado: 'INICIO', trackingId: 401, datosParaSub: { fase: 'GUIAS' }, sessionId: sessionId } }];
}

// -> Atajo: Previa Obras y Ampliaciones (ID 402)
if (menuId === 'OBRAS_PREVIA') {
    return [{ json: { accion: 'EXEC_SUB_OBRAS', proximoEstado: 'INICIO', trackingId: 402, datosParaSub: { fase: 'PREVIA' }, sessionId: sessionId } }];
}

// -> Atajo: Planos Digitales (ID 403)
if (menuId === 'OBRAS_PLANOS') {
    return [{ json: { accion: 'EXEC_SUB_OBRAS', proximoEstado: 'INICIO', trackingId: 403, datosParaSub: { fase: 'PLANOS' }, sessionId: sessionId } }];
}

// -> Obras y Catastro Men煤 General (Atrapa la palabra o el bot贸n general)
if (msgClean.includes('Obras') || msgClean.includes('Catastro') || menuId === 'OBRAS') {
    return [{ json: { accion: 'EXEC_SUB_OBRAS', proximoEstado: 'MENU_OBRAS', trackingId: 400, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Atajo: Infracciones de Tr谩nsito (ID 803)
if (menuId === 'LICENCIA_INFRACCIONES') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'INICIO', trackingId: 803, datosParaSub: { fase: 'INFRACCIONES' }, sessionId: sessionId } }];
}

// -> Atajo: Turnos Online (ID 801)
if (menuId === 'LICENCIA_TURNOS') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'INICIO', trackingId: 801, datosParaSub: { fase: 'TURNOS' }, sessionId: sessionId } }];
}

// -> Atajo: Consultar Turnos (ID 802)
if (menuId === 'LICENCIA_CONSULTAR') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'INICIO', trackingId: 802, datosParaSub: { fase: 'CONSULTAR' }, sessionId: sessionId } }];
}

// -> Atajo: Boleto Municipal (ID 804)
if (menuId === 'LICENCIA_MUNICIPAL') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'INICIO', trackingId: 804, datosParaSub: { fase: 'MUNICIPAL' }, sessionId: sessionId } }];
}

// -> Atajo: Boleta CENAT (ID 805)
if (menuId === 'LICENCIA_CENAT') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'INICIO', trackingId: 805, datosParaSub: { fase: 'CENAT' }, sessionId: sessionId } }];
}

// -> Licencias Men煤 General (Atrapa la palabra "licencia", "carnet", o el bot贸n general)
if (msgClean.includes('Licencia') || msgClean.includes('Carnet') || menuId === 'LICENCIA') {
    return [{ json: { accion: 'EXEC_SUB_LICENCIA', proximoEstado: 'MENU_LICENCIA', trackingId: 800, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> JUZGADO: DETECTAR CLICS INTERNOS (TRACKING)
if (msgClean.includes('Consulta Infracciones')) {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'MENU_JUZGADO', trackingId: 1002, datosParaSub: { fase: 'POPUP_INFRACCIONES' }, sessionId: sessionId } }];
}
if (msgClean.includes('Restituci贸n Vehicular')) {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'MENU_JUZGADO', trackingId: 1003, datosParaSub: { fase: 'POPUP_RESTITUCION' }, sessionId: sessionId } }];
}
if (msgClean.includes('Descargo de Multas')) {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'MENU_JUZGADO', trackingId: 1004, datosParaSub: { fase: 'POPUP_DESCARGO' }, sessionId: sessionId } }];
}

// -> Veterinaria Men煤 General (Atrapa la palabra o el bot贸n general)
if (msgClean.includes('Veterinaria') || menuId === 'VETERINARIA') {
    return [{ json: { accion: 'EXEC_SUB_VETERINARIA', proximoEstado: 'MENU_VETERINARIA', trackingId: 900, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Atajo: Solicitar Turno Veterinaria (ID 901)
if (menuId === 'VETERINARIA_SOLICITAR') {
    return [{ json: { accion: 'EXEC_SUB_VETERINARIA', proximoEstado: 'INICIO', trackingId: 901, datosParaSub: { fase: 'SOLICITAR_TURNO' }, sessionId: sessionId } }];
}

// -> Atajo: Consultar Turno Veterinaria (ID 902)
if (menuId === 'VETERINARIA_CONSULTAR') {
    return [{ json: { accion: 'EXEC_SUB_VETERINARIA', proximoEstado: 'INICIO', trackingId: 902, datosParaSub: { fase: 'CONSULTAR_TURNO' }, sessionId: sessionId } }];
}

// -> Atajo: Consulta Infracciones (ID 1002)
if (menuId === 'JUZGADO_INF') {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'INICIO', trackingId: 1002, datosParaSub: { fase: 'INFRACCIONES' }, sessionId: sessionId } }];
}

// -> Atajo: Restituci贸n Vehicular (ID 1003)
if (menuId === 'JUZGADO_RES') {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'INICIO', trackingId: 1003, datosParaSub: { fase: 'RESTITUCION' }, sessionId: sessionId } }];
}

// -> Atajo: Descargo de Multas (ID 1004)
if (menuId === 'JUZGADO_DES') {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'INICIO', trackingId: 1004, datosParaSub: { fase: 'DESCARGO' }, sessionId: sessionId } }];
}

// -> Juzgado Men煤 General (Atrapa "Juzgado", "Vial", "Choque", "Siniestro" o el bot贸n general)
if (msgClean.includes('Juzgado') || msgClean.includes('Vial') || msgClean.includes('Siniestro') || msgClean.includes('Choque') || menuId === 'JUZGADO') {
    return [{ json: { accion: 'EXEC_SUB_JUZGADO', proximoEstado: 'MENU_JUZGADO', trackingId: 1000, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}


// -> Sugerencias (ID 1100)
if (msgClean.includes('Sugerencias') || msgClean.includes('Dejar Sugerencia')) {
    return [{ json: { accion: 'PEDIR_SUGERENCIA', proximoEstado: 'ESPERANDO_SUGERENCIA', trackingId: 1100, datosParaSub: {}, sessionId: sessionId } }];
}

// -> Asesor Nube Backup (ID 1200)
if (msgClean.includes('Asesor Nube') || msgClean.includes('nube') || msgLower.includes('humano') || msgLower.includes('operador')) {
    return [{ json: { accion: 'EXEC_SUB_ASESOR_NUBE', proximoEstado: 'ESPERANDO_ASESOR_NUBE', trackingId: 1200, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}

// -> Asesor Local (ID 1300)
if (msgClean.includes('Asesor Local') || msgClean.includes('local')) {
    return [{ json: { accion: 'EXEC_SUB_ASESOR_LOCAL', proximoEstado: 'ESPERANDO_ASESOR_LOCAL', trackingId: 1200, datosParaSub: { fase: 'MENU' }, sessionId: sessionId } }];
}


// ============================================================
// 馃 4. M脕QUINA DE ESTADOS
// ============================================================
let accion = 'ENVIAR_MENU_PRINCIPAL';
let proximoEstado = 'INICIO';
let datosParaSub = {};
let trackingId = 100;

switch (estadoActual) {

    case 'INICIO':
        accion = 'ENVIAR_MENU_PRINCIPAL';
        proximoEstado = 'INICIO';
        trackingId = 100;
        break;

    // --- TASAS ---
    case 'MENU_TASAS':
        accion = 'EXEC_SUB_TASAS';
        proximoEstado = 'MENU_TASAS';
        trackingId = 200;
        datosParaSub = { fase: 'MENU' };
        break;

    case 'ESPERANDO_INMUEBLE':
        if (/^\d+$/.test(msgClean)) {
            let padronArreglado = msgClean.padStart(6, '0');
            accion = 'EXEC_SUB_TASAS';
            proximoEstado = 'INICIO';
            trackingId = 201;
            datosParaSub = { fase: 'CONSULTA_INMUEBLE', id: padronArreglado };
        } else {
            accion = 'EXEC_SUB_TASAS';
            proximoEstado = 'ESPERANDO_INMUEBLE';
            trackingId = 201;
            datosParaSub = { fase: 'ERROR_NUMERO', tipo: 'Inmueble' };
        }
        break;

    case 'ESPERANDO_COMERCIO':
        if (/^[\d-]+$/.test(msgClean)) {
            let padronArreglado = msgClean;
            if (padronArreglado.includes('-')) {
                let partes = padronArreglado.split('-');
                let numBase = partes[0].padStart(6, '0');
                let sucursal = partes[1].padStart(2, '0');
                padronArreglado = `${numBase}-${sucursal}`;
            }
            else {
                let sucursal = padronArreglado.slice(-2).padStart(2, '0');
                let numBase = padronArreglado.slice(0, -2).padStart(6, '0');
                padronArreglado = `${numBase}-${sucursal}`;
            }
            accion = 'EXEC_SUB_TASAS';
            proximoEstado = 'INICIO';
            trackingId = 202;
            datosParaSub = { fase: 'CONSULTA_COMERCIO', id: padronArreglado };
        } else {
            accion = 'EXEC_SUB_TASAS';
            proximoEstado = 'ESPERANDO_COMERCIO';
            trackingId = 202;
            datosParaSub = { fase: 'ERROR_NUMERO', tipo: 'Comercio' };
        }
        break;

    // --- OBRAS PRIVADAS ---
    case 'MENU_OBRAS':
        accion = 'EXEC_SUB_OBRAS';
        proximoEstado = 'INICIO';
        trackingId = 400;
        datosParaSub = { fase: 'SELECCION', opcion: msgClean };
        break;

    // --- SALUD ---
    case 'MENU_SALUD':
        accion = 'EXEC_SUB_SALUD';
        proximoEstado = 'INICIO';
        trackingId = 300;
        datosParaSub = { fase: 'SELECCION', opcion: msgClean };
        break;

    // --- DESARROLLO SOCIAL ---        
    case 'MENU_SOCIAL':
        accion = 'EXEC_SUB_SOCIAL';
        proximoEstado = 'INICIO';
        trackingId = 500;
        datosParaSub = { fase: 'SELECCION', opcion: msgClean };
        break;

    // --- SUGERENCIAS ---
    case 'ESPERANDO_SUGERENCIA':
        if (msgClean.length > 2) {
            accion = 'PEDIR_SUGERENCIA';
            datosParaSub = { fase: 'RECIBIR', suggestion: msgClean };
            proximoEstado = 'INICIO';
            trackingId = 1101;
        }
        else {
            accion = 'ENVIAR_MENU_PRINCIPAL';
            proximoEstado = 'INICIO';
            trackingId = 100;
        }
        break;

    // --- ASESOR NUBE (GEMINI/GROQ) ---
    case 'ESPERANDO_ASESOR_NUBE':
        accion = 'EXEC_SUB_ASESOR_NUBE';
        proximoEstado = 'ESPERANDO_ASESOR_NUBE';
        trackingId = 1201;
        datosParaSub = { fase: 'MANTENER_ESPERA', mensaje: msgClean };
        break;

    // --- ASESOR LOCAL (OLLAMA) ---
    case 'ESPERANDO_ASESOR_LOCAL':
        accion = 'EXEC_SUB_ASESOR_LOCAL';
        proximoEstado = 'ESPERANDO_ASESOR_LOCAL';
        trackingId = 1301;
        datosParaSub = { fase: 'MANTENER_ESPERA', mensaje: msgClean };
        break;

    // Fallbacks
    case 'MENU_RECLAMOS':
    case 'MENU_TRAMITES':
    case 'MENU_LICENCIA':
    case 'MENU_VETERINARIA':
    case 'MENU_JUZGADO':
        accion = 'ENVIAR_MENU_PRINCIPAL';
        proximoEstado = 'INICIO';
        trackingId = 100;
        break;

    default:
        accion = 'ENVIAR_MENU_PRINCIPAL';
        proximoEstado = 'INICIO';
        trackingId = 100;
        break;
}

let responseJson = { accion, proximoEstado, datosParaSub, trackingId, sessionId };

// Propagar el audio si existe en el webhook de entrada para que los subworkflows de destino lo transcriban
if (audio) {
    responseJson.audio = audio;
    responseJson.body = { sessionId, audio };
    responseJson.datosParaSub = {
        ...datosParaSub,
        audio: audio
    };
}

return [{ json: responseJson }];