# DIRECCIÓN DE RENTAS - PAGO DE TASAS E INFRACCIONES
Categoría: Rentas
Última actualización: 27 de junio de 2026
## Descripción
Servicio online y presencial de la Dirección de Rentas para abonar o conocer el estado de cuenta de inmuebles, comercios, infracciones de tránsito y pago por número de recibo. Permite el pago con tarjeta de crédito/débito de forma online o la descarga e impresión del boleto para el pago presencial en comercios habilitados. Además, se puede realizar el pago de inmuebles o comercios directamente desde el asistente virtual. El Valor de la Unidad Tributaria fijado es de $160.
## Requisitos
- Para pago de inmuebles o comercio desde el bot: Número de padrón.
- Para infracciones de tránsito: Número de DNI.
- Para pago por recibo: Número de recibo del trámite o servicio.
## Link específicos
1. Portal General de Rentas -> https://lasheras.gob.ar/rentas/
2. Pago de Inmuebles -> https://rentasweb.lasheras.gob.ar/ords/f?p=204:5900:::::P5900_TIPO_IMPONIBLE:INM
3. Pago de Comercio -> https://rentasweb.lasheras.gob.ar/ords/f?p=204:5900:::::P5900_TIPO_IMPONIBLE:COM
4. Infracciones de Tránsito -> https://rentasweb.lasheras.gob.ar/ords/f?p=204:4081:::::P4081_TIPO_BUSQ,P4081_DOC_TIPO,P4081_DOC_NUMERO:DOC
5. Pago por Número de Recibo -> https://rentasweb.lasheras.gob.ar/ords/f?p=204:7087
## Horarios y Ubicación
- Dirección: Sarmiento esquina Rivadavia, Las Heras, Mendoza
- Horarios: Lunes a viernes de 08 a 14hs
- Teléfono: WhatsApp 2615559181
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d352.3150244655067!2d-68.84141476759201!3d-32.850433681328724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e0fed403d21d9%3A0x9ea1a0823fe435ec!2sMunicipalidad%20de%20Las%20Heras%20Mendoza!5e0!3m2!1ses-419!2sar!4v1779278507716!5m2!1ses-419!2sar" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

## Reglas Conversacionales para el Asistente Virtual (Sin Botones Intermedios)
Cuando el usuario pregunte de forma general por "pagar tasas", "rentas", "quiero pagar" o "dónde pago", DEBES responder de manera amable preguntando qué tipo de tasa desea abonar.
Texto obligatorio a responder: "¡Hola! En la Muni tenemos distintos sistemas de pago según lo que necesites abonar. ¿Qué trámite querés pagar? Podés decirme: Tasas de Inmueble (tu casa), Tasas de Comercio (tu negocio), Infracciones de Tránsito, o el Boleto Municipal para la Licencia."

Cuando el usuario responda específicamente que desea pagar "Inmueble", "la casa", “impuesto municipal ” o "impuesto inmobiliario", DEBES activar el inicio del trámite inmobiliario respondiendo EXCLUSIVAMENTE con la siguiente etiqueta de control interno, sin agregar saludos, emojis ni textos adicionales: “{"fase": "PEDIR_INMUEBLE"}”

Cuando el usuario responda específicamente que desea pagar "Comercio" o "mi negocio", DEBES activar el inicio del trámite comercial respondiendo textualmente:
" **Tasas de Comercio**\n\nPor favor, escribí el **número de padrón** de tu comercio (ejemplo: 123456)."
E incluir al final de tu respuesta el código de estado: [{"accion": "SET_ESTADO", "proximoEstado": "ESPERANDO_COMERCIO"}]

Cuando el usuario pregunte específicamente por pagar un "recibo", "número de recibo" o "código de recibo", DEBES guiarlo indicando que necesita el número de recibo del trámite/servicio y proporcionarle el enlace oficial.
Código de botón exacto a incluir al final de tu respuesta: [{"label": "Pagar por Recibo", "url": "https://rentasweb.lasheras.gob.ar/ords/f?p=204:7087"}]

Cuando el usuario pregunte por "pago presencial", "pagar en efectivo", "pagar en persona" o "dónde pago físicamente", DEBES informarle que puede descargar e imprimir su boleto desde el Portal de Rentas para abonar de manera presencial en comercios habilitados (como Rapipago o Pago Fácil).
Código de botón exacto a incluir al final de tu respuesta: [{"label": "Portal de Rentas", "url": "https://lasheras.gob.ar/rentas/"}]

Ubicación de Rentas: Sarmiento esquina Rivadavia, Las Heras, Mendoza.
Horario de atención: Lunes a viernes de 08 a 14hs.
Para consultas sobre ubicación, dirección, mapa, oficinas o cómo llegar a la Dirección de Rentas, se debe proveer la dirección, el horario y el mapa correspondiente.
Iframe de mapa de Rentas: <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d352.3150244655067!2d-68.84141476759201!3d-32.850433681328724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e0fed403d21d9%3A0x9ea1a0823fe435ec!2sMunicipalidad%20de%20Las%20Heras%20Mendoza!5e0!3m2!1ses-419!2sar!4v1779278507716!5m2!1ses-419!2sar" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>


## Preguntas Frecuentes
P: ¿Cómo puedo pagar las tasas de mi casa o de mi negocio? (Gregorio nota que es una consulta de rentas general y abre el abanico conversacional)
R: ¡Hola! En la Muni tenemos distintos sistemas de pago según lo que necesites abonar. ¿Qué trámite querés pagar? Podés decirme por acá mismo: Tasas de Inmueble (tu casa), Tasas de Comercio (tu negocio), Infracciones de Tránsito, o el Boleto Municipal para la Licencia.

P: Quiero pagar el impuesto de mi casa, ¿qué necesito? *(Gregorio nota que el usuario quiere consultar la tasa de un inmueble específico y simula el clic del botón inyectando la estructura rígida)*
R: “{"fase": "PEDIR_INMUEBLE"}”

P: Quiero pagar el impuesto municipal *(Gregorio nota que el usuario quiere consultar la tasa de un inmueble específico y simula el clic del botón inyectando la estructura rígida)*
R: “{"fase": "PEDIR_INMUEBLE"}”

P: Necesito ver la deuda de las tasas de mi negocio. (Gregorio nota que el usuario necesita consultar una tasa comercial y cambia el estado para capturar el dato)
R: Tasas de Comercio Por favor, escribí el número de padrón de tu comercio (ejemplo: 123456-00).
[{"accion": "SET_ESTADO", "proximoEstado": "ESPERANDO_COMERCIO"}]

P: Tengo un número de recibo, ¿dónde lo puedo pagar en línea? (Gregorio nota que es un pago por recibo y le provee el botón correspondiente)
R: Para realizar el pago por número de recibo, necesitás el número de recibo del trámite o servicio. Podés abonarlo en línea ingresando al portal oficial tocando el botón a continuación. [{"label": "Pagar por Recibo", "url": "https://rentasweb.lasheras.gob.ar/ords/f?p=204:7087"}]

P: ¿Cómo puedo hacer si quiero pagar de forma presencial? (Gregorio le explica el procedimiento de descarga y le adjunta el portal de rentas)
R: Para realizar el pago de forma presencial, tenés que descargar e imprimir el boleto de pago desde nuestro Portal de Rentas. Con ese boleto impreso podés abonar en efectivo en cualquier comercio habilitado (como Rapipago o Pago Fácil). Puedes acceder al portal tocando el botón de abajo. [{"label": "Portal de Rentas", "url": "https://lasheras.gob.ar/rentas/"}]

P: ¿Dónde queda la Dirección de Rentas y en qué horario atienden? (Gregorio da la ubicación de Rentas y le adjunta el mapa)
R: La Dirección de Rentas se encuentra en Sarmiento esquina Rivadavia, Las Heras, Mendoza. El horario de atención es de lunes a viernes de 08 a 14hs.
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d352.3150244655067!2d-68.84141476759201!3d-32.850433681328724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e0fed403d21d9%3A0x9ea1a0823fe435ec!2sMunicipalidad%20de%20Las%20Heras%20Mendoza!5e0!3m2!1ses-419!2sar!4v1779278507716!5m2!1ses-419!2sar" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>