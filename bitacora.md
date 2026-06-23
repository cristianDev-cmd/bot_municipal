# Bitácora de Cambios - Agente Municipal

Este archivo registra las tareas, decisiones y cambios realizados en el proyecto en orden cronológico inverso (el cambio más reciente primero).

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
