# Bitácora de Cambios - Agente Municipal

Este archivo registra las tareas, decisiones y cambios realizados en el proyecto en orden cronológico inverso (el cambio más reciente primero).

## [2026-06-29] - Ajustes restrictivos en System Prompt y mejoras en agente reformulador

### Cambios Realizados:
- **Backend (n8n Workflows - Subworkflow Asesor):**
  - **Agente Reformulador (AI Agent2):** Se aplicaron instrucciones sistémicas mucho más estrictas para el rol de motor de optimización de consultas. Ahora tiene prohibido responder al usuario o emitir mensajes de fallback, y debe devolver única y exclusivamente la pregunta reformulada en texto plano sin bloques markdown.
  - **Condición de Validación (If1):** Se agregó una tercera frase de saludo institucional a la validación condicional para evitar que se procesen respuestas prearmadas del bot como si fuesen historiales válidos para reformular.
  - **Búsqueda Vectorial (Qdrant):** Se ajustaron nuevamente los parámetros `topK`, regresando la mayoría a `2`, mientras que `licencia_conducir` pasó a `3`.
  - **Seguridad (API Key):** Se reemplazó nuevamente la API Key de Google Gemini expuesta en el nodo TTS "Pedir audio" por el placeholder `{{TU_API_KEY_DE_GEMINI}}` para evitar bloqueos por el escaneo de secretos de GitHub.
- **System Prompt (`n8n/systempromt.md`):**
  - **Regla de Rentas:** Se corrigió el typo de la instrucción de explicación.
  - **Regla 4 (Fallback):** Se impuso un mensaje exacto de fallback obligatorio para cuando las preguntas están fuera de contexto municipal o faltan datos factuales.
  - **Regla 7 (Saludos):** Se prohibió estrictamente que el agente comience sus respuestas saludando, dando la bienvenida o utilizando frases de cortesía, ya que la interfaz se encarga del saludo inicial automáticamente.

## [2026-06-29] - Refactorización del reformulador de preguntas y actualizaciones en Subworkflow Asesor

### Cambios Realizados:
- **Backend (n8n Workflows - Subworkflow Asesor):**
  - **Reformulador de Preguntas:** Se reemplazó el nodo `Chain LLM` ("Reformular Pregunta") y el nodo de tipo `Set` ("Pasar Pregunta Original") por un nuevo nodo de tipo `AI Agent` ("AI Agent2"). Este nuevo agente se encarga de reformular la pregunta utilizando el historial del chat y el System Prompt original (`Leer_Sysstem_Prompt`).
  - **Condición de Validación:** Se actualizó el nodo condicional (ahora llamado "valida para reformular pregunta") para añadir condiciones más estrictas (`$runIndex === 0`, validación de longitud del historial, e inclusión de respuestas específicas de fallback en `$json.output`).
  - **Búsqueda Vectorial (Qdrant):** Se actualizó el parámetro `topK` a `3` en múltiples colecciones (`desarrollo_social`, `transparencia_institucional`, `Veterinaria`, `juzgado_vial`, `deporte_bien_estar`, `tramite_distancia`) y a `5` en la colección de `rentas`. Se eliminó el parámetro de la colección de licencias.
  - **Texto a Voz (TTS):** Se actualizó la URL de la API de Google Gemini TTS para incluir una clave de API directa en lugar de utilizar la variable `{{TU_API_KEY_DE_GEMINI}}`.
  - **Ajustes Visuales:** Se reposicionaron múltiples nodos y se reescalaron las notas adhesivas de organización ("Base de datos vectorial" y "Prepara audio") dentro del lienzo de n8n.
- **System Prompt (`n8n/systempromt.md`):**
  - Se eliminó un espacio en blanco sobrante al final de la directiva sobre pluralidad en "inmuebles y comercios".

## [2026-06-29] - Prevención del salto del input usando overflow: clip en el CSS

### Cambios Realizados:
- **Frontend - Estilos (styles_widget.css):**
  - Se modificó la propiedad `overflow: hidden;` a `overflow: clip;` en la clase `.chat-input-area`. Esta solución nativa de CSS evita que los navegadores móviles fuercen un scroll automático (scroll anchoring) dentro del contenedor cuando el código JavaScript hace un `input.focus()` sobre un contenedor que está momentáneamente desplazado por animaciones de transformación (`translateY`). Al cortar este comportamiento de raíz, se elimina definitivamente el problema donde el input se iba "más arriba y desaparecía" al quitar las estrellas o soltar el audio.

## [2026-06-29] - Corrección de barra de entrada en blanco y simplificación de textos de ayuda

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - **Corrección de interfaz en blanco:**
    - Se implementó un reseteo de scroll diferido (`inputArea.scrollTop = 0` tras 150ms) en `hideRecordingUI()`, `hideRatingSystem()` y `toggleChat()` para evitar que el ajuste de viewport que realiza el navegador móvil al enfocar el input y levantar el teclado virtual deje la barra de entrada desplazada fuera del contenedor oculto.
    - Se agregaron reseteos de scroll y la acción de hacer foco en `hideRatingSystem()` al salir del estado de calificación con estrellas.
    - Se condicionó la ejecución de `hideRatingSystem()` en `sendMessage()` para que solo ocurra cuando la calificación esté activa, evitando la creación de timeouts de 300ms innecesarios y solapados durante el envío de mensajes o audios normales.
  - **Textos de ayuda de grabación:**
    - Se simplificaron los textos de ayuda en la interfaz de grabación: se configuró `'Enviar'` como texto de envío para ambos modos de captura (Hold/Tap) dentro de `showRecordingUI`, y se definió `'Cancelar'` como texto de cancelación para los elementos creados de forma dinámica.

## [2026-06-26] - Dinamización del texto de ayuda de grabación según el modo de captura (Hold/Tap)

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó la visualización de la interfaz de grabación en `showRecordingUI` para actualizar de forma dinámica el texto de ayuda según si la grabación se inició manteniendo presionado (modo Hold: `"Soltar para enviar ▶"`) o pulsando una vez (modo Tap: `"Presiona ▶ para enviar"`).
  - Se cambió el texto por defecto en la creación del elemento a `"Presiona ▶ para enviar"`.

## [2026-06-26] - Corrección de espacio en blanco al abrir teclado móvil mediante limitación de desbordamiento en la entrada

### Cambios Realizados:
- **Frontend - Estilos (styles_widget.css):**
  - Se modificó la clase `.chat-input-area` para establecer un alto fijo (`height: 62px;`) y ocultar el desbordamiento (`overflow: hidden;`). Esto evita que los contenedores de entrada ocultos (`#textInputContainer`, `#recordingContainer`, `#ratingContainer`) que se trasladan verticalmente hacia abajo con `translateY(100%)` cuando están inactivos generen un área visible fantasma o empujen el viewport de visualización en dispositivos móviles.

## [2026-06-26] - Refactor profundo: Bugfix de touchcancel, compatibilidad ES5 y simplificación de UI de cancelación

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - **Bugfix (touchcancel):** Se movió el listener de `touchcancel` desde el botón del micrófono (`btnMic`) hacia el `document`, asignándole la función `handleTouchEnd`. Esto soluciona el problema crítico donde iOS/Android disparaba un evento de cancelación nativo al arrastrar el dedo unos píxeles fuera del botón, lo que borraba el audio indeseadamente.
  - **Simplificación de Slide-to-Cancel:** Se eliminó la compleja UI del candado y la flecha de deslizamiento en favor de una interacción más natural: ahora toda la pantalla actúa como un lienzo y deslizar el dedo sobre el botón de papelera (`btnRecDelete`) activa el estado visual de cancelación.
  - **Compatibilidad:** Se eliminaron las *arrow functions* (`=>`) y los *template literals* (`\``) para asegurar máxima compatibilidad con navegadores antiguos, usando funciones anónimas estándar y concatenación de cadenas.
- **Frontend - Estilos e Interfaz (styles_widget.css / widget.html):**
  - Se eliminó el bloque HTML y CSS correspondiente a `.slide-cancel-indicator` y `.slide-cancel-lock`.
  - Se agregaron textos de ayuda de manera dinámica ("Soltar para enviar" y "Soltar para cancelar") dentro del contenedor de grabación para guiar al usuario.## [2026-06-26] - Refactorización de código y mejoras en animaciones UI

### Cambios Realizados:
- **Frontend - Estilos (styles_widget.css):**
  - Se optimizaron y formatearon las animaciones clave (`pulseMic`, `trashPulse`, `slideCancelPulse`, `slideCancelArrow`, `lockPulse`, `recWave`).
  - Se ajustaron los selectores y clases relacionadas al estado `recording-hold-active` y `.slide-cancel-indicator` para un diseño más pulido.
  - Se implementó la clase `swing-animation` con la animación `swing-with-pause`.
- **Frontend - Lógica (script_widget.js):**
  - Se limpiaron comentarios innecesarios y se organizaron mejor los bloques lógicos.
  - Se refinó la lógica de captura del micrófono, añadiendo `capture: true` a los eventos táctiles y de mouse para mejorar la prioridad y evitar bloqueos.
  - Se introdujo un fallback de seguridad en `realStopRecording` para asegurar el envío de `audioChunks` en caso de que el `MediaRecorder` se detenga inesperadamente.
  - Se perfeccionó el algoritmo `processSlideMove` para que solo active la cancelación cuando el desplazamiento horizontal supere los 10px hacia la izquierda y sea predominante frente al vertical.## [2026-06-26] - Mensaje de error amigable en la comunicación con n8n

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó el texto del bloque `catch` dentro de la función `sendMessage`. En lugar del mensaje técnico frío `"⚠️ Error procesando la respuesta."`, ahora se muestra un texto mucho más amigable y resolutivo para el usuario: `"⚠️ No pudimos procesar tu solicitud. Por favor, intenta enviarla nuevamente."`.## [2026-06-26] - Tolerancia de movimiento direccional (1D) para cancelar grabación

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó la lógica matemática del deslizamiento para cancelar (Slide-to-Cancel). Anteriormente calculaba la distancia absoluta en 2D (arriba, abajo, izquierda, derecha), lo que provocaba que vibraciones o leves movimientos involuntarios del dedo al presionar se acumularan rápidamente y cancelaran el audio por accidente.
  - Ahora solo se calcula el vector de desplazamiento hacia la **izquierda** (Eje X negativo). Los movimientos verticales (arriba/abajo) o hacia la derecha se ignoran por completo.
  - Se incrementó la distancia necesaria (umbral) para cancelar de `40px` a `100px`, dándole al usuario un área de tolerancia mucho mayor para acomodar o mover levemente el dedo sin perder su mensaje.## [2026-06-26] - Corrección de envío de audio al soltar el micrófono y ajuste de tap

### Cambios Realizados:
- **Frontend - Estilos (styles_widget.css):**
  - Se eliminaron las propiedades `z-index: 10;` y `position: relative;` de la clase `.chat-mic-btn.recording-active`. Esto previene la alteración brusca de la estructura de capas de renderizado del navegador durante una interacción táctil activa, eliminando la principal causa de que navegadores móviles (iOS/Android) aborten la pulsación prematuramente disparando un evento `touchcancel`.
- **Frontend - Lógica (script_widget.js):**
  - Se redujo drásticamente el umbral de tiempo que diferencia un toque corto (tap) de un toque sostenido (hold) sobre el micrófono, bajando de `300ms` a `100ms` en las funciones `startPress`, `endPress` y `handleTouchEnd`. 
  - Esta modificación corrige el error de usabilidad donde los usuarios hablaban rápidamente (entre 100ms y 300ms) y al soltar el botón no se enviaba el audio, debido a que el sistema lo interpretaba como un "tap" (activando el modo manos libres) en lugar de un "hold" (que envía automáticamente al soltar). Ahora, cualquier pulsación superior a 100ms se considera grabación sostenida y se detiene/envía satisfactoriamente al levantar el dedo de la pantalla.
  - Se añadió la inicialización segura `pressStartTime = 0;` dentro de `cancelPress(e)` para garantizar que el estado temporal se reinicie completamente ante cancelaciones abruptas del sistema móvil.
## [2026-06-26] - Medición de distancia de cancelación en 2D y resolución de bloqueos en toques rápidos

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó la detección de gestos en [handleTouchMove(e)](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L187) y [handleMouseMove(e)](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L170) para calcular la distancia absoluta de arrastre del dedo en 2D (distancia euclidiana usando coordenadas X e Y iniciales: `holdStartX` y `holdStartY`). Así, si el dedo del usuario se mueve más de 40px en *cualquier* dirección (arriba, abajo, izquierda, derecha o diagonal), se marca la cancelación (`isSlideCancelled = true`), mientras que movimientos menores se procesan y envían de forma limpia.
  - Se solucionó una condición de carrera en toques consecutivos rápidos: se implementó el almacenamiento del identificador del retardo mínimo en la variable global `stopTimeout`. Al pulsar nuevamente el micrófono en [startPress(e)](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L129), si existe una detención asíncrona pendiente, se cancela y se fuerza el cierre de la grabación anterior de forma síncrona mediante [realStopRecording()](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L492). Esto libera la variable de estado `isRecording = false` de forma inmediata, permitiendo que la segunda pulsación consecutiva grabe e interactúe sin bloquearse.

## [2026-06-26] - Reducción del umbral de cancelación de audio a 40px

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se redujo el valor de `SLIDE_CANCEL_THRESHOLD` de `80` a `40` píxeles. Esto incrementa la sensibilidad de cancelación del micrófono, permitiendo que un deslizamiento de dedo hacia la izquierda de más de 40px descarte la grabación, mientras que desplazamientos menores de 40px se envíen automáticamente al soltar.

## [2026-06-26] - Estabilización de toques de micrófono y tolerancia de touchcancel en móviles

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó la función [cancelPress(e)](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L226) (que responde al evento `touchcancel`) para que actúe de forma tolerante: en lugar de cancelar la grabación incondicionalmente, ahora comprueba si se superó el umbral de cancelación (`isSlideCancelled`). Si el usuario no lo superó (por ejemplo, el toque fue interrumpido por el sistema al mover ligeramente el dedo fuera de las coordenadas iniciales), la grabación se detiene y se envía de forma exitosa mediante [stopRecording()](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js#L480).
- **Frontend - Estilos (styles_widget.css):**
  - Se refactorizó la clase `.chat-mic-btn.recording-active` y la animación `@keyframes pulseMic` para realizar la ampliación visual del micrófono (de 40px a 68px/80px) y su desplazamiento hacia arriba (`top: -8px`) utilizando únicamente propiedades de transformación (`transform: translateY(-8px) scale(...)`). Al mantener inalteradas las dimensiones físicas (`width: 40px`, `height: 40px`) y la posición de layout del elemento, se previene que los navegadores de móviles calculen un reflow geométrico de forma síncrona durante un toque activo, lo cual es la principal causa de que se dispare el evento `touchcancel`.

## [2026-06-26] - Corrección de persistencia del teclado móvil en el widget de chat

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó la función de apertura de chat `toggleChat()` para realizar el `.focus()` sobre el input de texto de forma síncrona dentro del hilo de ejecución del evento `click`. Esto evita que los navegadores móviles bloqueen el foco programático que antes se ejecutaba en un `setTimeout` asíncrono, permitiendo levantar el teclado virtual de inmediato.
  - Se optimizaron las funciones de gestos táctiles `handleTouchMove(e)` y `handleTouchEnd(e)` para invocar `e.preventDefault()` cuando la interacción se ha iniciado en el botón del micrófono (`pressStartTime` activo o grabando). Esto previene que el navegador móvil simule eventos de click o scroll al arrastrar o soltar el dedo en otras partes del chat, evitando que el input de texto pierda el foco y por ende que el teclado se cierre automáticamente.
- **Frontend - Estilos (styles_widget.css):**
  - Se removió `pointer-events: none !important;` del input de texto bajo la regla `#textInputContainer.recording-hold-active input`. De esta forma, el input mantiene su interactividad nativa por CSS aunque su opacidad sea cero durante la grabación interactiva por voz, previniendo que los motores móviles de renderizado (WebKit/Blink) descarten el foco y bajen el teclado de manera automática.

## [2026-06-26] - Mejoras de UX en grabación por voz: corrección de envío, deslizamiento interactivo y botón flotante de micrófono

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Se modificó `startRecording(isHoldMode)` para evitar que se aborte la grabación al soltar rápidamente el micrófono en modo hold si el inicio fue muy rápido (ahora solo se aborta si la acción recibida fue 'cancel', de lo contrario se deja continuar el inicio y se detiene correctamente para enviar el audio).
  - Se actualizaron `startRecTimer()` y `stopRecTimer()` para inicializar y actualizar dinámicamente el tiempo de grabación en la etiqueta `#holdTimerText` del indicador hold.
  - Se actualizó `updateSlideCancelState(deltaX)` para ofrecer feedback interactivo y fluido al usuario mientras arrastra el dedo hacia la izquierda: el tacho de basura se escala (de 1.0x hasta 1.4x) y cambia su color de fondo (`backgroundColor`) a un rojo más oscuro al aproximarse al umbral de cancelación, y el texto deslizante se traslada a la izquierda y se desvanece de forma proporcional al movimiento.
  - Se actualizó `hideSlideCancelUI()` para restaurar dinámicamente las transformaciones y opacidades aplicadas a los elementos del indicador de cancelación al finalizar la interacción.
  - Se implementó la persistencia del teclado móvil durante la grabación: se añadió `e.preventDefault()` en `startPress(e)` para evitar que el evento de pulsado del botón robe el foco del input de texto. Además, se reemplazó `input.disabled = true` por `input.readOnly = true` durante la grabación y el procesamiento (`bloquearChat`), evitando que el navegador oculte automáticamente el teclado virtual y cause que la pantalla se desplace y el dedo del usuario pierda contacto con el micrófono.
  - Se implementó un mecanismo de duración mínima de grabación de `600ms` (`recordingStartTime` y `realStopRecording()`) en `stopRecording()`. Esto asegura que incluso si el usuario presiona y suelta el micrófono muy rápidamente (o si hay retrasos en la respuesta de permisos de la cámara/micrófono de Android), el grabador recolecte suficientes datos para evitar archivos de audio vacíos de 0 bytes (que causan fallos de envío) y permite al navegador renderizar y mantener visible la animación del modo hold durante un tiempo mínimo perceptible por el usuario.
  - Se implementó una lógica de auto-refocus permanente en el input de texto: se añadió un listener al evento `'blur'` del input que lo vuelve a enfocar automáticamente tras un breve retardo si el widget de chat se encuentra abierto (evitando enfocar únicamente cuando se hace clic en los botones de control de cabecera como cerrar o limpiar). Asimismo, se fuerza el enfoque al abrir el chat en `toggleChat()`. Esto mantiene el teclado virtual del móvil siempre activo y visible para el usuario.
- **Frontend - Estructura HTML (widget.html):**
  - Se rediseñó el indicador `#slideCancelIndicator` en el modo hold para integrar las barras de ondas de audio (`.hold-waves`), el indicador de tiempo de grabación (`#holdTimer`) y agrupar el texto/flecha en una sección dedicada (`.slide-cancel-action`), todo encapsulado dentro de un contenedor de información de hold (`.hold-info`) idéntico al del modo tap.
  - Se modificó el icono de papelera en el modo hold para que use relleno blanco (`fill="#ffffff"`) a fin de que contraste correctamente con el fondo circular rojo.
- **Frontend - Estilos (styles_widget.css):**
  - Se cambió `overflow: hidden;` por `overflow: visible;` en `.chat-input-area` para permitir que el botón flotante del micrófono en grabación activa sobresalga de la caja de texto sin recortarse en la parte superior e inferior.
  - Se añadió `top: -8px;` a la clase `.chat-mic-btn.recording-active` para desplazar verticalmente hacia arriba el botón agrandado del micrófono durante la grabación, asegurando que sobresalga estéticamente del chat y no se recorte con el borde inferior del widget (que tiene `overflow: hidden;`).
  - Se definieron y optimizaron estilos CSS para los nuevos componentes del modo hold: se agregó la clase `.hold-info` (representada por una cápsula blanca flotante en el centro con sombra y bordes redondeados), se configuró la papelera `.slide-cancel-trash` como un botón circular rojo con sombra idéntico al de eliminación en modo tap, y se optimizó la alineación flexible (`justify-content: space-between`) del contenedor del indicador.
  - Se incrementó el `z-index` de `.slide-cancel-indicator` a `99999 !important;` para asegurar que el indicador de cancelación en modo hold se renderice siempre por encima de la caja de texto (`#userInput`), evitando que quede oculto detrás de su fondo blanco opaco debido a posibles superposiciones de estilos globales de la plataforma.
  - Se reemplazó la transparencia de color de texto del input durante la grabación hold por `opacity: 0 !important; pointer-events: none !important;` en el input del `textInputContainer`, asegurando que la caja de texto blanca del input se vuelva completamente transparente e invisible, dejando el indicador de cancelación al descubierto y visible sin obstrucciones.
  - Se añadió `touch-action: none;` a `.chat-input-area` y a `.input-mode` para evitar que gestos de arrastre u otras interacciones de scroll del navegador móvil interrumpan o disparen el evento `touchcancel` de la grabación activa.

---

## [2026-06-26] - Propagación de audio en el Logic Router y persistencia de estado en Rentas

### Cambios Realizados:
- **Orquestador Principal - Lógica (🧠 Logic Router.js):**
  - Se modificó la extracción de parámetros del webhook de entrada para capturar de forma segura el campo `audio` (base64) del cuerpo de la petición.
  - Se actualizó el retorno final para inyectar y propagar la variable `audio` hacia los subworkflows en la raíz, en el objeto `body` y encapsulado en `datosParaSub.audio`. Esto asegura que los subworkflows de destino (como el de Tasas) puedan transcribir y procesar la entrada de voz en lugar de fallar de inmediato al recibir fases vacías o de error.

---

## [2026-06-25] - Corrección de envío de audio en hold-to-record y mejoras de UI

### Cambios Realizados:
- **Frontend - Lógica (script_widget.js):**
  - Corregido error de carrera asíncrona donde el audio no se enviaba al soltar el botón de micrófono. Se agregaron variables `isStartingRecording` y `recordingShouldStop` para controlar cuándo el usuario suelta el dedo antes de que `navigator.mediaDevices.getUserMedia` resuelva su promesa.
  - Creado helper `resetRecordingUI()` para unificar el reinicio y limpieza de estados del micrófono y la barra de entrada de texto.
  - Implementada la clase `recording-hold-active` en el contenedor del input para ocultar transparentemente el placeholder y texto escrito mientras se graba manteniendo presionado, preservando el fondo blanco del pill.
- **Frontend - Estilos (styles_widget.css):**
  - Incrementado el tamaño del botón del micrófono de `54px` a `68px` cuando está activo, y ajustada la escala de animación de pulso de `1.0` a `1.18` (alcanzando ~80px).
  - Diseñado un estilo premium para el indicador de cancelación en modo hold: el indicador del lado izquierdo ahora se corre a `85px` a la derecha para dejar espacio al nuevo tamaño del mic, con un icono de basura rojo pulsante y una secuencia animada de flechas `<<<` moviéndose a la izquierda.
- **Frontend - Estructura HTML (widget.html):**
  - Actualizado `#slideCancelIndicator` para incluir un SVG de la papelera, las flechas `<<<` y el texto "Deslizar para borrar".

---

## [2026-06-25] - Implementación de grabación Hold-to-Record (mantener presionado para grabar)

### Cambios Realizados:
- **Frontend - Lógica de Grabación (script_widget.js):**
  - Se refactorizó completamente la interacción del botón de micrófono para implementar el patrón "hold-to-record" (mantener presionado para grabar):
    - **Mantener presionado (>300ms):** Inicia la grabación de audio automáticamente con animación visual de pulso en el botón.
    - **Soltar el dedo/mouse:** Envía el audio grabado automáticamente (sin necesidad de presionar un botón de envío separado).
    - **Deslizar hacia la izquierda (>80px) mientras graba:** Cancela la grabación y descarta el audio. Se muestra un indicador visual "◀ Desliza para cancelar" que aparece durante la grabación. Al superar el umbral, aparece un icono de cancelación (tacho de basura) con feedback háptico (vibración) en dispositivos móviles.
    - **Tap corto (<300ms):** Mantiene el comportamiento de toggle tradicional (iniciar/detener grabación con UI WhatsApp completa) para compatibilidad.
  - Se añadieron nuevas variables y funciones de estado: `holdStartX`, `isSlideCancelled`, `SLIDE_CANCEL_THRESHOLD`, `updateSlideCancelState()`, `showSlideCancelUI()`, `hideSlideCancelUI()`.
  - Se bifurcó `startRecording(isHoldMode)` para diferenciar el modo "hold" (indicador slide-to-cancel) del modo "tap" (UI WhatsApp con botones).
- **Frontend - Estilos CSS (styles_widget.css):**
  - Mejorada la animación del botón de micrófono durante la grabación: crece de 40px a 54px, con glow rojo intenso (doble box-shadow) y pulso más dramático (escala 1.0→1.15).
  - Añadidas transiciones suaves para `width`, `height` y `box-shadow` en el botón del mic.
  - Se añadieron los estilos para el indicador "desliza para cancelar": `.slide-cancel-indicator`, `.slide-cancel-arrow`, `.slide-cancel-lock` con animaciones de pulso (`slideCancelPulse`) y flecha deslizante (`slideCancelArrow`).
  - Se añadió `touch-action: none` y `user-select: none` al botón del mic para prevenir comportamientos no deseados del navegador en mobile.
- **Frontend - HTML (widget.html):**
  - Se añadieron los elementos del indicador de cancelación dentro del `#textInputContainer`: `#slideCancelIndicator` (texto + flecha animada) y `#slideCancelLock` (icono de tacho al superar umbral).

---

## [2026-06-25] - Actualización de documentación de Rentas y corrección de respuestas

### Cambios Realizados:
- **Git y Control de Versiones:**
  - Se realizó la fusión (merge) de la rama `pre` en la rama `main` de forma exitosa tras la solicitud explícita del usuario en el chat, subiendo todos los cambios de producción a GitHub.
- **Base de Conocimiento (Rentas.md):**
  - Se completaron las URLs vacías en la sección de `## Link específicos` (como el Portal General de Rentas redirigiendo a `https://lasheras.gob.ar/rentas/` e Infracciones de Tránsito a la consulta por DNI de rentasweb).
  - Se agregó el iframe de Google Maps para la ubicación de la Dirección de Rentas bajo la sección `## Horarios y Ubicación` a fin de que el bot pueda renderizar el mapa cuando se le pregunte por la dirección física.
  - Se corrigió un error de formateo en la sección `## Horarios y Ubicación` donde el título de las reglas conversacionales estaba pegado a la línea del teléfono.
  - Se definieron nuevas reglas conversacionales y preguntas frecuentes específicas para el pago por número de recibo (redirigiendo al enlace oficial `https://rentasweb.lasheras.gob.ar/ords/f?p=204:7087` en lugar de la web general de rentas).
  - Se añadieron reglas conversacionales y preguntas frecuentes específicas para el pago presencial (explicando la descarga e impresión del boleto y el pago en Rapipago / Pago Fácil), evitando que el bot intente invocar la regla de pago general inmobiliario/comercial por error o genere outputs inválidos.
  - Se creó una directiva fáctica y su correspondiente pregunta frecuente (FAQ) para que el bot pueda responder y adjuntar el `<iframe>` del mapa cada vez que se le pregunte por la ubicación, dirección u horarios de la Dirección de Rentas, simplificando la redacción del archivo de conocimiento para evitar interpretaciones metalógicas del modelo.
- **Configuración del Repositorio (AGENTS.md):**
  - Se agregó una regla local del proyecto en `AGENTS.md` prohibiendo al agente AI el uso de la herramienta `browser_subagent` o cualquier inspección en el navegador interactivo a menos que sea explícitamente solicitado por el usuario.
- **Instrucciones del Sistema (systempromt.md):**
  - Se reforzó la sección de *Instrucciones de Salida Conversacional* añadiendo la regla número 5 para prohibir de forma estricta que el bot responda en metalenguaje, confirme la recepción de directivas conversacionales del contexto de Qdrant, o explique cómo aplica las reglas. Esto asegura que Gregorio siempre responda de forma directa y exclusiva con la respuesta dirigida al vecino.
- **Frontend (script_widget.js):**
  - Se corrigió el bug en `processResponse` que causaba que el indicador de escritura ("está escribiendo") se mostrara de manera errónea por un segundo y medio después del último mensaje. Ahora el código valida que exista una siguiente respuesta en la cola (`index + 1 < responses.length`) antes de invocar a `showTyping()`, liberando los temporizadores de inactividad de inmediato si es el mensaje final.
  - Se modificó la función `clearChat()` para que limpie el localStorage de historial y sesión (generando un nuevo `sessionId` de forma limpia) y renderice de forma inmediata el mensaje de bienvenida local ("Hola soy el Asistente Virtual..."), emulando el inicio fresco del chat en su primer arranque en lugar de llamar a `sendStartSignal()`.
  - Se corrigió el error en la validación pasiva inicial que impedía que el historial se limpiara de forma correcta después de 1 hora de inactividad. Anteriormente, si no existía el registro de actividad (`chat_last_activity` era `null` porque el usuario había cerrado la página sin chatear o habiendo borrado el chat recientemente), la condición no se cumplía y el historial persistía de forma indefinida en el navegador. Ahora se valida que si hay historial pero el timestamp de actividad no existe o ya expiró, se proceda con la limpieza forzada.

---

## [2026-06-24] - Fusión de desarrollos y correcciones en la rama main

### Cambios Realizados:
- **Git y Control de Versiones:**
  - Se realizó la fusión (merge) de la rama `pre` en la rama `main` de forma exitosa tras la solicitud del usuario.
  - Se subieron los cambios de `main` a GitHub. La rama `main` se encuentra sincronizada con la última versión de producción.

---

## [2026-06-24] - Corrección de envío de audio al cancelar/borrar grabación

### Cambios Realizados:
- **Frontend (script_widget.js):**
  - Se corrigió el bug que enviaba el mensaje de audio al presionar el botón de borrar/cancelar o al arrastrar el dedo al tacho de basura en dispositivos táctiles.
  - Se modificó `isOverTrash()`, `handleMouseMove()` y `handleTouchMove()` para que detecten dinámicamente el botón de papelera visible activo (`btnRecDelete` de la interfaz estilo WhatsApp, o `btnCancelAudio` como respaldo).
  - Al detectar la colisión o el click en el botón de borrar, se setea correctamente la bandera `isRecordingCancelled = true` antes de llamar a `mediaRecorder.stop()`, garantizando que la grabación se descarte en el evento `onstop` y no sea enviada al servidor.
- **Frontend (styles_widget.css):**
  - Se agregó la clase `.trash-hovered` para los botones `.rec-delete-btn` y `.chat-cancel-btn` para dar feedback visual (aumentar escala y oscurecer el fondo rojo) cuando el cursor o el dedo se deslizan sobre el botón de papelera.

---

## [2026-06-24] - Reversión de versión al commit a45d6e5 en la rama pre

### Cambios Realizados:
- **Git y Control de Versiones:**
  - Se realizó una reversión forzada (`git reset --hard`) de la rama `pre` al commit `a45d6e5` (`fix: corregir caja blanca al enviar audio`) a petición del usuario.
  - Se actualizó de manera forzada la rama remota `pre` en GitHub para regresar al estado de esta versión del código.

---

## [2026-06-24] - Corrección de Caja Blanca al Enviar Grabación de Audio

### Cambios Realizados:
- **Frontend (script_widget.js):**
  - Se solucionó el error donde la caja de texto quedaba en blanco (desplazada visualmente) tras **enviar** un audio. Esto se producía por condiciones de carrera entre la animación de salida (`hideRecordingUI()`) y las respuestas rápidas del servidor en `desbloquearChat()`.
  - Se ajustó `desbloquearChat()` para que solo intente enfocar el input (`input.focus()`) si el contenedor está completamente visible, evitando saltos de scroll abruptos. Además, se añadió un restablecimiento forzado de `scrollTop = 0` al final de la función.
  - Se mejoró `hideRecordingUI()` reordenando la lógica para que el restablecimiento del scroll (`scrollTop = 0`) ocurra **después** del `input.focus()`, anulando cualquier salto generado por el navegador. Además, se añadió la clase `hidden-mode` al `recordingContainer` una vez terminada su transición para retirarlo completamente del área visual y de eventos.

---

## [2026-06-24] - Formateo de código en CSS del Widget

### Cambios Realizados:
- **Frontend (styles_widget.css):**
  - Se aplicó autoformateo al archivo para mejorar la legibilidad del código (ajuste de identación, saltos de línea en selectores y keyframes como `recWave` y `recDotPulse`).

---

## [2026-06-24] - Corrección de Caja de Texto Blanca al Cancelar/Detener Grabación
- **Frontend (script_widget.js):**
  - Corregido el bug que dejaba la caja de texto en blanco y sin controles tras cancelar/eliminar la grabación. El error se producía porque al enfocar (`input.focus()`) el elemento de texto desplazado verticalmente fuera de los límites visibles de `.chat-input-area` (con `overflow: hidden`), el navegador realizaba un scroll vertical interno automático (`scrollTop = 59px`), dejando los controles fuera de la vista del usuario tras finalizar la animación.
  - Modificada la función `hideRecordingUI()` para restablecer `scrollTop = 0` y retrasar el enfoque de texto (`input.focus()`) mediante `setTimeout` para que se ejecute únicamente cuando la animación de transición haya completado y el input sea visible.
  - Mejorada la robustez de `cancelRecording()` y `stopRecording()` desacoplando el flujo de restauración de la UI del estado de la instancia de `mediaRecorder`. Esto garantiza que los botones y la caja de texto se restablezcan correctamente incluso ante fallos de hardware o denegación de permisos del micrófono.
  - Realizados tests automatizados simulados en el navegador en vivo, confirmando la correcta restauración del layout.

---

## [2026-06-24] - Fusión de Ramas y Solución de Caché del CSS en el Chat Widget

### Cambios Realizados:
- **Gestión de Repositorio (Git):**
  - Fusionada la rama de desarrollo `pre` en la rama `main` tras la solicitud del usuario para actualizar el entorno en producción.
  - Subidos los cambios fusionados a la rama remota `origin/main` en GitHub.
- **Frontend (Widget Chat):**
  - Identificada superposición del contenedor `#recordingContainer` con el input de texto en vivo debido a la caché agresiva del CDN `raw.githack.com` (`styles_widget.css?v=2`), que seguía sirviendo los estilos antiguos sin las reglas de la UI de grabación de audio.
  - Confirmado el correcto funcionamiento del widget tras la inyección dinámica del CSS actualizado (comprobando que `#recordingContainer` se oculta correctamente con `opacity: 0` y `transform: translateY(100%)` cuando no está activo, y que el input de texto es 100% interactivo).

---

## [2026-06-24] - UI de Grabación de Audio estilo WhatsApp

### Cambios Realizados:
- **Frontend (Widget Chat):**
  - Modificado [widget.html](file:///c:/Users/PC/Desktop/Agente_municipal/apex/html/widget.html): Agregado contenedor `#recordingContainer` con UI de grabación que incluye botón de eliminar (rojo), timer con punto pulsante, barras de onda de audio animadas, y botón de enviar (verde).
  - Modificado [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css): Agregados estilos para la UI de grabación estilo WhatsApp: punto rojo pulsante (`rec-dot`), barras de audio animadas (`rec-wave-bar`) con 20 barras de altura variable, botones de acción circulares (eliminar/enviar), transiciones de entrada/salida del contenedor, y fondo blanco con sombra para la zona de info.
  - Modificado [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js): Implementadas funciones `showRecordingUI()`/`hideRecordingUI()` para transición animada entre modo texto y modo grabación, timer de grabación con `setInterval` que muestra `0:00`, `0:01`, etc., vinculación de eventos para `btnRecDelete` (cancelar) y `btnRecSend` (enviar audio). Ambos modos (tap y hold) muestran la misma UI.

---

## [2026-06-24] - Gestión de Rama, Tiempos, Corrección de Formulario, Enlaces de Mapas, Reglas de Git, Optimización de Reformulador de Preguntas y Definición de Rentas

### Cambios Realizados:
- **Reglas del Proyecto y Git:**
  - Modificado [.agents/AGENTS.md](file:///c:/Users/PC/Desktop/Agente_municipal/.agents/AGENTS.md) para agregar una regla sobre el flujo de trabajo en Git. Se establece que todos los cambios se suben únicamente a la rama `pre` y la fusión con `main` solo debe realizarse bajo petición explícita del usuario.
- **Backend (n8n Workflows):**
  - Modificado [Subworkflow - Asesor (23-6-2026).json](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/Subworkflow%20-%20Asesor%20(23-6-2026).json) para integrar un agente reformulador de preguntas (Query Condenser) usando el modelo Gemini 1.5 Flash y un nodo de tipo Basic LLM Chain. Esto reescribe consultas basadas en el historial del chat a formatos autocontenidos y sin ambigüedad antes de que entren al enrutador y al AI Agent principal, mejorando significativamente la precisión de la búsqueda vectorial en Qdrant y la ejecución de herramientas.
  - Optimizado el subworkflow del Asesor agregando el nodo condicional `Tiene Historial` (IF) y el nodo de paso `Pasar Pregunta Original` (Set). Esto evita ejecutar el reformulador de preguntas en el primer mensaje de una conversación (cuando no hay historial previo), disminuyendo el consumo de tokens y eliminando latencias innecesarias de respuesta.
  - Actualizado el System Prompt de `Reformular Pregunta` para incluir el catálogo completo de los temas de conocimiento municipal de la base vectorial (Rentas, Licencia, Veterinaria, Obras, Juzgado Vial, Trámite a Distancia, Deportes, Transparencia, Desarrollo Social) y la regla de mantener las preguntas sin reformular si no pertenecen a la municipalidad.
  - Optimizada la propiedad `toolDescription` de la herramienta `rentas` en el JSON para asegurar que el agente enrute correctamente las consultas genéricas sobre la oficina al nodo de Qdrant correspondiente.
- **System Prompt (`n8n/systempromt.md`):**
  - Modificada la sección de Rentas del System Prompt general del AI Agent para definir explícitamente qué es la Dirección de Rentas municipal de Las Heras (encargada del cobro de tasas, boletas, deudas de inmueble/comercio y códigos) y prohibir la generación de respuestas de conocimiento económico general (como alquileres, IRPF o inversiones).
  - Corregidos los datos de ubicación y horario en el ejemplo de fe-shot para la Dirección de Rentas, ajustándolo al horario correcto (lunes a viernes de 08 a 14hs) y dirección exacta (Sarmiento esquina Rivadavia).
  - Añadidas instrucciones estrictas de salida conversacional al final de [systempromt.md](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/systempromt.md) para prohibir que la IA dé respuestas meta-conversacionales (hablar sobre las reglas del prompt, dialogar con el programador o repetir los ejemplos) y forzar respuestas directas orientadas al vecino.
  - Inyectada una regla estricta de idioma español en la Regla de Estructura Visual de [systempromt.md](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/systempromt.md) para prohibir respuestas, frases o palabras en inglés (incluso ante entradas ambiguas o únicamente numéricas).
- **Gestión de Repositorio:**
  - Renombrada la rama de desarrollo `preproduccion` a `pre` tanto a nivel local como en el repositorio remoto de GitHub (`origin/pre`) para simplificar su nomenclatura.
- **Oracle APEX Frontend:**
  - Modificado [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) para cambiar el valor de `INACTIVITY_TIME` de 1 minuto (`1 * 60 * 1000`) a 3 minutos (`3 * 60 * 1000`).
  - Corregida una declaración duplicada y redundante de `var INACTIVITY_TIME = 1 * 60 * 1000` en [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) que invalidaba el valor configurado arriba, asegurando que el tiempo real de inactividad ahora sea efectivamente de 3 minutos.
  - Corregido el comportamiento del botón de cerrar rating (`#closeRating`) agregando `e.preventDefault()` en su evento `click`, evitando que envíe el formulario de chat principal al interactuar con él (hacer submit no deseado).
  - Corregida la función `formatearEnlacesMapa` en [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) para omitir el formateo si el mensaje contiene una etiqueta `<iframe>`, evitando que se corrompa el código embebido de los mapas.
  - Agregado un fallback/polyfill seguro para `crypto.randomUUID()` en [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) para evitar que el script falle en navegadores o servidores que utilicen conexiones HTTP no seguras (donde la API Web Crypto nativa no está disponible).

---

## [2026-06-23] - Creación de Rama de Preproducción

### Cambios Realizados:
- **Gestión de Repositorio:**
  - Creada la rama `preproduccion` localmente y subida al repositorio remoto (`origin/preproduccion`) para aislar los nuevos desarrollos antes de impactar en el entorno de producción vinculado a n8n.
  - Modificado `.gitignore` para exceptuar y permitir el seguimiento del archivo de reglas locales `.agents/AGENTS.md` y del archivo de dependencias `skills-lock.json`.
  - Añadido y subido `skills-lock.json` al repositorio en la rama `preproduccion` para permitir la reinstalación automática de todas las skills en otras máquinas de desarrollo.
  - Instalada la skill `n8n-workflow-architect` desde el repositorio `promptadvisers/n8n-powerhouse` y registrada en `skills-lock.json` para dar soporte al diseño de flujos en n8n.

---

## [2026-06-23] - Optimización de Selección de Herramientas de Obras en n8n y System Prompt

### Cambios Realizados:
- **System Prompt (`n8n/systempromt.md`):**
  - Ajustadas las descripciones y palabras clave de `obras_general` y `obras_tecnico`.
  - Se indicó explícitamente al LLM que `obras_tecnico` debe consultarse **únicamente** para preguntas muy específicas y técnicas de profesionales (normativas de edificación, FOS/FOT, cálculo estructural).
  - Se instruyó al LLM a consultar **siempre** `obras_general` para saber cómo realizar o comenzar cualquier trámite o expediente (como previa, obra nueva o relevamiento), evitando llamadas innecesarias a múltiples nodos de Qdrant.
- **Workflow Asesor (`Subworkflow - Asesor (23-6-2026).json`):**
  - Modificadas las propiedades `toolDescription` de los nodos `obras_general` y `obras_tecnico` con las mismas directrices del System Prompt para asegurar coherencia y forzar el enrutamiento correcto del agente de LangChain.

---

## [2026-06-23] - Enlace y Ejemplo de Previa de Obras en Obras.md

### Cambios Realizados:
- **Base de Conocimiento (Conocimiento):**
  - Se agregó la URL del trámite de Previa, Obra Nueva o Relevamiento (`https://web6.lasheras.gob.ar/apex/f?p=125:25`) en el archivo [Obras.md](file:///c:/Users/PC/Desktop/Agente_municipal/apex/conocimiento/Obras_general/Obras.md).
  - Se agregó un ejemplo simple de consulta/respuesta sobre "previa" en la sección de Preguntas Frecuentes del mismo archivo para optimizar la búsqueda semántica.
  - Se mejoró el formato y espaciado de las Reglas y Preguntas Frecuentes en [Obras.md](file:///c:/Users/PC/Desktop/Agente_municipal/apex/conocimiento/Obras_general/Obras.md), introduciendo saltos de línea y líneas de división (`---`) para evitar que el contenido se compacte y optimizar su lectura tanto para humanos como para motores RAG/Qdrant.
  - Se aplicó una estructura de listas anidadas con negrita (`- **P:**` y `  - **R:**`) para todas las preguntas frecuentes e instrucciones de botones en [Obras.md](file:///c:/Users/PC/Desktop/Agente_municipal/apex/conocimiento/Obras_general/Obras.md), garantizando una indentación limpia y jerárquica en todo el documento.

---

## [2026-06-23] - Conversión de Documentos de Conocimiento a Formato Markdown (.md)

### Cambios Realizados:
- **Base de Conocimiento (Conocimiento):**
  - Implementado un script parser de conversión batch para procesar de forma automatizada y local los archivos de conocimiento.
  - Convertidos **10 archivos `.docx`** binarios a formato de texto plano estructurado **`.md` (Markdown)** en sus respectivas subcarpetas bajo `apex/conocimiento/`.
  - Esta conversión mejora significativamente la calidad de indexación en la base vectorial Qdrant, ya que evita ruidos o pérdida de formato binarios, y facilita la segmentación de texto (chunking) estructurada basada en los encabezados.

---

## [2026-06-23] - Diferenciación de Herramientas Qdrant Obras y Sincronización de Memoria en JSON

### Cambios Realizados:
- **Subworkflow Asesor (JSON):**
  - **Diferenciadas las descripciones** de las herramientas `obras_general` y `obras_tecnico` en el archivo [Subworkflow - Asesor (23-6-2026).json](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/Subworkflow%20-%20Asesor%20(23-6-2026).json). Anteriormente tenían la misma descripción genérica, lo que provocaba que el modelo de IA pudiera invocar `obras_tecnico` (que consulta la colección `memoriaNube2`) en lugar de `obras_general` (que consulta la colección correcta `chat_municipalidad_las_heras_nube_2` para trámites sencillos de vecinos como la "previa").
  - **Sincronizado el script de "Preparar Memoria"** dentro del JSON del subworkflow para reflejar el aumento a 10 líneas de historial (5 interacciones) que ya se había modificado en el archivo `.js` independiente, garantizando que al importar el JSON en n8n el cambio tome efecto real.

---

## [2026-06-23] - Alternancia de Botones de Entrada del Chat puramente por CSS

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Implementada lógica de alternancia reactiva puramente en CSS en el archivo [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css).
  - Usando la pseudoclase `:placeholder-shown` y el combinador hermano general (`~`), se define que cuando el input está vacío (`placeholder-shown`) se oculte `.enviar-btn` y se muestre `.chat-mic-btn`. Cuando el usuario escribe (`not(:placeholder-shown)`), se muestra `.enviar-btn` y se oculta `.chat-mic-btn`.
  - Esta solución es 100% robusta, funciona a nivel de navegador y soluciona cualquier problema si la página del usuario tiene en caché versiones anteriores del script de JavaScript.

---

## [2026-06-23] - Corrección de Desbordamiento Flexbox en Imágenes y Limpieza de CSS

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Añadido `min-width: 0 !important` y `box-sizing: border-box !important` al selector `.message` en [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css). Esto soluciona el comportamiento por defecto de Flexbox (`min-width: auto`) que impedía a los globos de mensajes contraerse por debajo del ancho natural de las imágenes grandes, eliminando la aparición de barras de desplazamiento horizontal.
  - Eliminado el archivo redundante `styles_widget_apex.css` a petición implícita del usuario, manteniendo únicamente [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css).

---

## [2026-06-23] - Corrección de Estilos en Imagen de Chat y Alternancia de Micrófono

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Modificado [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) en `toggleInputButtons()` para usar el método `classList.add('hidden')` y `classList.remove('hidden')` en lugar de `.style.display`. Esto soluciona el problema de que el botón de micrófono no se ocultaba al escribir debido a la prioridad de `!important` en el CSS de `.chat-mic-btn`.
  - Agregada regla CSS para `.message img` en [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css) y [styles_widget_apex.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget_apex.css) limitando el ancho de las imágenes al `100%` con `height: auto` y `display: block` para asegurar que queden contenidas perfectamente dentro del globo del chat.

---

## [2026-06-23] - Eliminación de Nodo de Prueba en Asesor

### Cambios Realizados:
- **Subworkflow Asesor:**
  - Eliminado el archivo temporal [Code de prueba.js](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/nodo-codes/Code%20de%20prueba.js).
  - Removido el nodo `"Code de prueba"` del archivo [Subworkflow - Asesor (23-6-2026).json](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/Subworkflow%20-%20Asesor%20(23-6-2026).json) y restauradas las conexiones de `"Append row in sheet"` a su estado original sin salidas.

---

## [2026-06-23] - Creación de Nodo de Prueba en Asesor

### Cambios Realizados:
- **Subworkflow Asesor:**
  - Creado un nuevo archivo de script vacío [Code de prueba.js](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/nodo-codes/Code%20de%20prueba.js).
  - Añadida la definición del nodo `"Code de prueba"` de tipo `n8n-nodes-base.code` en el archivo [Subworkflow - Asesor (23-6-2026).json](file:///c:/Users/PC/Desktop/Agente_municipal/n8n/workflows/Subworkflow%20-%20Asesor/Subworkflow%20-%20Asesor%20(23-6-2026).json) posicionado después de `"Append row in sheet"`.
  - Configurada la conexión de salida de `"Append row in sheet"` para que apunte a `"Code de prueba"`.

---

## [2026-06-23] - Auditoría Completa del Sistema n8n y Correcciones

### Análisis Realizado:
- **Auditoría exhaustiva** de los workflows JSON del Orquestador Principal y Subworkflow Asesor, todos los nodos Code (26 archivos .js), y el System Prompt completo.
- Identificados 8 problemas categorizados por severidad (1 crítico, 7 importantes).

### Cambios Implementados:

#### System Prompt (`n8n/systempromt.md`):
- Eliminada línea interna de instrucción al modelo ("Siempre entra al nodo de chat model").
- Corregidos typos: `inmpuesto muinipal` → `impuesto municipal`, `Gregorado` → `Gregorio`, coma suelta al final de palabras clave de rentas.
- Clarificada regla de emojis: prohibidos en texto de respuestas, permitidos en labels de botones JSON.
- Agregado guardrail de seguridad: regla para rechazar amablemente consultas que no sean municipales.

#### Herramientas Qdrant (JSON del workflow Asesor):
- Diferenciadas las descripciones de las 9 herramientas que tenían descripción genérica idéntica. Cada herramienta ahora tiene una descripción específica para su área temática.
- Agregado `topK: 3` a `licencia_conducir` que no tenía definido.

#### Memoria Conversacional (`Preparar Memoria.js`):
- Aumentado el historial de 6 líneas (3 interacciones) a 10 líneas (5 interacciones) para mejorar el contexto del modelo.

### Pendiente (requiere acción en n8n UI):
- **API Key de Gemini TTS** expuesta en el nodo HTTP Request del workflow. Debe moverse a credenciales de n8n.
- Archivos duplicados (`*1.js`) pendientes de revisión y limpieza.
- Nodo "retorno a workflow principal" deshabilitado en el Asesor.

---

## [2026-06-23] - Ajuste de Estilos del Micrófono en styles_widget.css

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Ajustados los estilos del botón de micrófono (`.chat-mic-btn`) en [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css) para optimizar la transición (`transition: transform 0.1s !important`), configurar el relleno y añadir el estado `:hover`.
  - Eliminados los estilos redundantes del botón de cancelar audio (`.chat-cancel-btn`) en este archivo para evitar duplicidades de estilo.
- **Control de Versiones:**
  - Realizado commit y push de las modificaciones en los estilos.

---

## [2026-06-23] - Instalación Global de la Skill responsive-design

### Cambios Realizados:
- **Habilidades Globales (Skills):**
  - Instalada la skill `responsive-design` a nivel global (de usuario) desde el repositorio `https://github.com/wshobson/agents`. Esta skill proporciona directrices para el diseño responsivo de las interfaces de usuario.
- **Control de Versiones:**
  - Los archivos locales de configuración del espacio de trabajo que registran las skills asociadas (`skills-lock.json` u otros) fueron actualizados y sincronizados.

---

## [2026-06-23] - Estilos del Botón de Micrófono en styles_widget.css

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Modificado [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css) para incorporar estilos específicos a la clase `.chat-mic-btn` (botón de micrófono). Esto soluciona la visualización por defecto en APEX (gris rectangular) y hace que se muestre redondo y de color naranja, consistente con la estética del botón de enviar.
  - Añadidos estilos para la clase `.recording-active` con su respectiva animación de pulso (`pulseMic`) para indicar visualmente el estado de grabación de voz en rojo brillante.
- **Control de Versiones:**
  - Realizado commit y push del fix con el mensaje: `fix: agregar estilos de microfono naranja redondo a styles_widget.css`.

---

## [2026-06-23] - Fusión de Hojas de Estilos CSS

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Realizada la fusión completa de `styles_widget.css` y `styles_widget_apex.css` en un único archivo integrado: [styles_widget_apex.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget_apex.css).
  - El diseño consolidado implementa la estética oscura (`#020617`), mejora el contraste del texto del bot (`#f8fafc`), recupera la animación de balanceo del avatar flotante, integra todas las clases interactivas del chat (estrellas de valoración, micrófono, indicador de escritura) y corrige el centrado del avatar en el botón flotante.
- **Control de Versiones:**
  - Realizado commit y push del archivo fusionado con el mensaje: `fix: fusionar estilos CSS de widget y APEX en un unico archivo integrado`.

---

## [2026-06-23] - Carga de Nuevos Estilos CSS para APEX

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Añadido el archivo de estilos específico para la integración final del chatbot en Oracle APEX llamado [styles_widget_apex.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget_apex.css). Este archivo contiene reglas de presentación optimizadas para el widget de chat, diseño responsivo, estilos para reproducción de audios y compatibilidad con las plantillas de la aplicación municipal.
- **Control de Versiones:**
  - Realizado commit y push del archivo con el mensaje en español: `feat: agregar estilos CSS especificos para APEX (styles_widget_apex.css)`.

---

## [2026-06-23] - Estilos de Respaldo en HTML (Avatar Gigante)

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Añadido un bloque `<style>` de respaldo y a prueba de fallos directamente en [widget.html](file:///c:/Users/PC/Desktop/Agente_municipal/apex/html/widget.html) para controlar el tamaño y la posición `fixed` del botón flotante y el avatar. Esto previene que si el archivo de estilos externo (`styles_widget.css`) falla al cargarse por problemas de red o caché, la imagen del avatar aparezca gigante rompiendo el diseño de la página.
- **Control de Versiones:**
  - Realizado commit y push del fix con el mensaje: `fix: agregar estilos CSS de seguridad en linea para evitar avatar gigante`.

---

## [2026-06-23] - Corrección de Inicialización de JS para Oracle APEX

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Modificado [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) para diferir la selección de elementos del DOM y el enlace de eventos mediante el evento `DOMContentLoaded`. Esto previene fallos al cargar el script en Oracle APEX si se inyecta antes de que el cuerpo HTML del widget esté renderizado.
- **Control de Versiones:**
  - Realizado commit y push del fix con el mensaje: `fix: inicializacion diferida del JS con DOMContentLoaded para Oracle APEX`.

---

## [2026-06-23] - Carga del Widget para Oracle APEX

### Cambios Realizados:
- **Oracle APEX Frontend:**
  - Agregado el archivo de estilos personalizados [styles_widget.css](file:///c:/Users/PC/Desktop/Agente_municipal/apex/css/styles_widget.css) con animaciones, diseño móvil y áreas de interacción.
  - Agregado el archivo de estructura [widget.html](file:///c:/Users/PC/Desktop/Agente_municipal/apex/html/widget.html) que compone la interfaz visual del chat, controles superiores, botones y área de mensajes.
  - Agregado el script de lógica [script_widget.js](file:///c:/Users/PC/Desktop/Agente_municipal/apex/js/script_widget.js) que maneja las sesiones, eventos del chat, grabación de audio, calificaciones por estrellas e integración con el Webhook de n8n.
- **Control de Versiones:**
  - Se realizó el commit en español y push correspondiente de los archivos del frontend de APEX.

---

## [2026-06-23] - Vinculación del Repositorio de GitHub

### Cambios Realizados:
- **Control de Versiones (Git):**
  - Inicializado el repositorio Git local en la raíz del proyecto.
  - Vinculado el repositorio remoto `origin` apuntando a [bot_municipal](https://github.com/cristianDev-cmd/bot_municipal).
  - Configurada la rama por defecto a `main`.
  - Realizado el primer commit inicial con toda la estructura de archivos y configuraciones.
  - **Resolución de Conflicto de Push:** El push inicial fue rechazado por existir un commit de inicialización genérico con un `README.md` vacío en GitHub. Se resolvió realizando un push forzado (`git push -u origin main --force`) para sincronizar el repositorio remoto con nuestra estructura local limpia y la documentación del proyecto.

---

## [2026-06-23] - Estructuración Inicial y Reglas de Documentación

### Cambios Realizados:
- **Estructura de Carpetas:**
  - Creados directorios para recursos de Oracle APEX: `apex/js/` y `apex/css/` (con archivos `.gitkeep` para su mantenimiento inicial en Git).
  - Creados directorios para flujos y scripts de n8n: `n8n/workflows/` y `n8n/code_nodes/` (con archivos `.gitkeep` para su mantenimiento inicial en Git).
- **Archivos Base:**
  - Creado [.gitignore](file:///c:/Users/PC/Desktop/Agente_municipal/.gitignore) para ignorar archivos del sistema operativo, variables de entorno y dependencias.
  - Creado [README.md](file:///c:/Users/PC/Desktop/Agente_municipal/README.md) instructivo detallando cómo consumir los recursos en APEX desde GitHub mediante jsDelivr y cómo respaldar los flujos de n8n.
- **Configuración de Reglas locales:**
  - Creado el archivo de reglas locales [.agents/AGENTS.md](file:///c:/Users/PC/Desktop/Agente_municipal/.agents/AGENTS.md) con la regla para mantener esta bitácora actualizada.
- **Habilidades (Skills):**
  - Iniciada la instalación de la skill `documentation-writer` para dar soporte a la documentación técnica del repositorio.
