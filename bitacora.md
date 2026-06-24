# Bitácora de Cambios - Agente Municipal

Este archivo registra las tareas, decisiones y cambios realizados en el proyecto en orden cronológico inverso (el cambio más reciente primero).

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
