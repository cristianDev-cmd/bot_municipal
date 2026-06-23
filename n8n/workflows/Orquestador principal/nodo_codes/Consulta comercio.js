const input = $input.first().json;

// 1. Capturar mensaje y extraer números puros
const msg = (input.message || input.body?.message || input.datosParaSub?.mensaje || '').toString().trim();
const nros = msg.replace(/\D/g, '');

// 2. Rescatar Session ID dinámicamente sin riesgo de caídas
let sesId = input.sessionId || input.body?.sessionId;
try { sesId = sesId || $('Execute Workflow Trigger').first().json.sessionId || $('Execute Workflow Trigger').first().json.body.sessionId; } catch (e) { }
sesId = sesId || 'sesion_subworkflow';

// 3. Extraer el audio base64 de forma segura (NUEVO)
const audio = $('Webhook Entrada').first().json.body.audio || input.audio || undefined;

// 4. Determinar el tracking ID según el contexto del mensaje
const trackingId = (input.fase?.includes('COMERCIO') || /COMERCIO|casa/i.test(msg)) ? 201 : 202;

// 5. Evaluar si ya es una consulta directa (tiene 4 o más números) o si hay que pedirlo
const esConsulta = nros.length >= 4 || !!audio;

return [{
    json: {
        accion: "EXEC_SUB_TASAS",
        proximoEstado: esConsulta ? "INICIO" : "ESPERANDO_COMERCIO",
        trackingId,
        sessionId: sesId,
        body: {
            sessionId: sesId,
            audio: audio // <-- Opción A: Se envía en la raíz del body mapeado
        },
        datosParaSub: {
            fase: esConsulta ? "CONSULTA_COMERCIO" : "PEDIR_COMERCIO",
            id: esConsulta ? nros.padStart(6, '0') : undefined,
            origen_ia: true,
            audio: audio // <-- Opción B: Se envía encapsulado en los parámetros del sub-trámite
        }
    }
}];