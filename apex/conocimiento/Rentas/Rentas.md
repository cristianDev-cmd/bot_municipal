# DIRECCIÓN DE RENTAS - PAGO DE TASAS E INFRACCIONES
Categoría: Rentas
Última actualización: 27 de abril de 2026
## Descripción
Servicio online y presencial de la Dirección de Rentas para abonar o conocer el estado de cuenta de inmuebles, comercios, infracciones de tránsito y pago por número de recibo. Permite el pago con tarjeta de crédito/débito de forma online o la descarga e impresión del boleto para el pago presencial en comercios habilitados. Además, se puede realizar el pago de inmuebles o comercios directamente desde el asistente virtual. El Valor de la Unidad Tributaria fijado es de $160.
## Requisitos
- Para pago de inmuebles o comercio desde el bot: Número de padrón.
- Para infracciones de tránsito: Número de DNI.
- Para pago por recibo: Número de recibo del trámite o servicio.
## Link específicos
1. Portal General de Rentas ->
2. Pago de Inmuebles ->
https://rentasweb.lasheras.gob.ar/ords/f?p=204:5900:::::P5900_TIPO_IMPONIBLE:INM
3. Pago de Comercio ->
https://rentasweb.lasheras.gob.ar/ords/f?p=204:5900:::::P5900_TIPO_IMPONIBLE:COM
4. Infracciones de Tránsito ->
5. Pago por Número de Recibo -> https://rentasweb.lasheras.gob.ar/ords/f?p=204:7087
## Horarios y Ubicación
- Dirección: Sarmiento esquina Rivadavia, Las Heras, Mendoza
- Horarios: Lunes a viernes de 08 a 14hs
- Teléfono: WhatsApp 2615559181## Reglas Conversacionales para el Asistente Virtual (Sin Botones Intermedios)
Cuando el usuario pregunte de forma general por "pagar tasas", "rentas", "quiero pagar" o "dónde pago", DEBES responder de manera amable preguntando qué tipo de tasa desea abonar.
Texto obligatorio a responder: "¡Hola! En la Muni tenemos distintos sistemas de pago según lo que necesites abonar. ¿Qué trámite querés pagar? Podés decirme: Tasas de Inmueble (tu casa), Tasas de Comercio (tu negocio), Infracciones de Tránsito, o el Boleto Municipal para la Licencia."
Cuando el usuario responda específicamente que desea pagar "Inmueble", "la casa", “impuesto municipal ” o "impuesto inmobiliario", DEBES activar el inicio del trámite inmobiliario respondiendo EXCLUSIVAMENTE con la siguiente etiqueta de control interno, sin agregar saludos, emojis ni textos adicionales: “{"fase": "PEDIR_INMUEBLE"}”
Cuando el usuario responda específicamente que desea pagar "Comercio" o "mi negocio", DEBES activar el inicio del trámite comercial respondiendo textualmente:
" **Tasas de Comercio**\n\nPor favor, escribí el **número de padrón** de tu comercio (ejemplo: 123456)."
E incluir al final de tu respuesta el código de estado: [{"accion": "SET_ESTADO", "proximoEstado": "ESPERANDO_COMERCIO"}]
P: ¿Cómo puedo pagar las tasas de mi casa o de mi negocio? (Gregorio nota que es una consulta de rentas general y abre el abanico conversacional)
R: ¡Hola! En la Muni tenemos distintos sistemas de pago según lo que necesites abonar. ¿Qué trámite querés pagar? Podés decirme por acá mismo: Tasas de Inmueble (tu casa), Tasas de Comercio (tu negocio), Infracciones de Tránsito, o el Boleto Municipal para la Licencia.
P: Quiero pagar el impuesto de mi casa, ¿qué necesito? *(Gregorio nota que el usuario quiere consultar la tasa de un inmueble específico y simula el clic del botón inyectando la estructura rígida)*
R: “{"fase": "PEDIR_INMUEBLE"}”P: Quiero pagar el impuesto municipal *(Gregorio nota que el usuario quiere consultar la tasa de un inmueble específico y simula el clic del botón inyectando la estructura rígida)*  “{"fase": "PEDIR_INMUEBLE"}”
P: Necesito ver la deuda de las tasas de mi negocio. (Gregorio nota que el usuario necesita consultar una tasa comercial y cambia el estado para capturar el dato)
R: Tasas de Comercio Por favor, escribí el número de padrón de tu comercio (ejemplo: 123456-00).
[{"accion": "SET_ESTADO", "proximoEstado": "ESPERANDO_COMERCIO"}]