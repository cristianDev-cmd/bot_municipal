# Agente Municipal - Chatbot Conversacional con IA

Este repositorio contiene la estructura organizada para el desarrollo y control de versiones del chatbot conversacional con IA. 

## Estructura del Repositorio

La estructura del proyecto está organizada de la siguiente manera:

```text
Agente_municipal/
├── apex/                   # Recursos consumidos por Oracle APEX
│   ├── css/                # Hojas de estilo (.css) para el widget de chat
│   └── js/                 # Scripts de lógica (.js) que consume Oracle APEX
└── n8n/                    # Integraciones y flujos en n8n
    ├── workflows/          # Respaldos de flujos completos de n8n en formato JSON
    └── code_nodes/         # Scripts de JavaScript (.js) que se ejecutan dentro de los nodos "Code" de n8n
```

---

## Guía de Uso

### 1. Consumir JS y CSS en Oracle APEX desde GitHub

Dado que la estructura HTML del widget reside directamente en APEX, puedes cargar los archivos de JavaScript y CSS de forma dinámica desde este repositorio.

#### Opción recomendada: jsDelivr (CDN para GitHub)
Para evitar problemas de CORS y asegurarte de que el navegador reciba los archivos con el tipo MIME correcto (`text/javascript` y `text/css`), te recomendamos usar **jsDelivr** para servir tus archivos de producción:

1. Realiza un `git commit` y `git push` de tus archivos JS y CSS a tu repositorio público de GitHub.
2. Accede a ellos utilizando la URL de jsDelivr con el siguiente formato:
   - **JavaScript:** `https://cdn.jsdelivr.net/gh/TU_USUARIO/TU_REPOSITORIO@branch/apex/js/archivo.js`
   - **CSS:** `https://cdn.jsdelivr.net/gh/TU_USUARIO/TU_REPOSITORIO@branch/apex/css/archivo.css`

*(Nota: Reemplaza `TU_USUARIO`, `TU_REPOSITORIO` y `branch` (ej. `main`) con tus datos reales).*

#### Configuración en Oracle APEX:
- En las propiedades de tu página o aplicación en APEX, añade la URL del CSS en **File URLs** dentro de la sección **User Interface > CSS**.
- Añade la URL del JS en **File URLs** dentro de la sección **User Interface > JavaScript**.

---

### 2. Guardar Flujos y Código de n8n

Para mantener un control de versiones de lo que construyes en n8n:

#### Flujos completos:
1. Exporta tus flujos desde la interfaz de n8n (o usando la CLI de n8n si la tienes configurada).
2. Guarda el archivo `.json` exportado dentro de la carpeta `n8n/workflows/`.

#### Nodos de Código (JavaScript):
1. Cuando uses un nodo de tipo **Code** en n8n y escribas código JavaScript personalizado para transformar datos o consumir APIs, copia ese código y guárdalo en un archivo `.js` dentro de `n8n/code_nodes/`.
2. Esto facilitará la lectura, revisión de diferencias (git diff) y depuración del código en tu editor antes de pegarlo de vuelta en n8n.
