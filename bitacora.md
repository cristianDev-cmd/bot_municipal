# Bitácora de Cambios - Agente Municipal

Este archivo registra las tareas, decisiones y cambios realizados en el proyecto en orden cronológico inverso (el cambio más reciente primero).

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
