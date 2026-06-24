(function () {
    var webhookUrl = "https://n8n-asistentevirtual.lasheras.gob.ar/webhook/chat_apex2";

    // --- CONFIGURACIÓN DE TIEMPOS (MILISEGUNDOS) ---
    var INACTIVITY_TIME = 3 * 60 * 1000;  // 3 Minutos para mostrar las estrellas
    var SESSION_TIMEOUT = 60 * 60 * 1000; // 1 Hora para borrar localStorage y resetear sesión

    // ⏱️ VALIDACIÓN PASIVA INICIAL: Si pasó más de 1 hora desde la última acción, limpiamos antes de renderizar
    var lastActivity = localStorage.getItem("chat_last_activity");
    if (lastActivity && (Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT)) {
        localStorage.removeItem("chat_history");
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_last_activity");
    }

    // --- ELEMENTOS UI (Se inicializan en DOMContentLoaded) ---
    var launcher, widget, btnClose, btnClear, btnHome, btnSend, btnMic, btnCancelAudio, input, messages, badge;

    // --- ELEMENTOS UI GRABACIÓN WHATSAPP ---
    var recordingContainer, btnRecDelete, btnRecSend, recTimerText;

    // --- ELEMENTOS RATING (Se inicializan en DOMContentLoaded) ---
    var textContainer, ratingContainer, closeRatingBtn, stars;

    // --- ÍCONOS SVG BLANCOS ---
    var iconMicWhite = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
    var iconStopWhite = `<svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>`;
    var iconTrashWhite = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

    // --- ESTADO ---
    var sessionId = localStorage.getItem("chat_session_id") || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    })());
    localStorage.setItem("chat_session_id", sessionId);
    var history = JSON.parse(localStorage.getItem("chat_history") || "[]");
    var unreadCount = 0;
    var userRating = 0;

    // --- VARIABLES DE GRABACIÓN ---
    var isRecording = false;
    var mediaRecorder;
    var audioChunks = [];
    var recordTimeout;
    var isHolding = false;
    var pressStartTime = 0;
    var isRecordingCancelled = false;

    // --- VARIABLES DE TIMER DE GRABACIÓN ---
    var recTimerInterval;
    var recSeconds = 0;

    // --- VARIABLES DE TEMPORIZADOR DE INACTIVIDAD ---
    var inactivityTimer;
    var sessionTimer;

    // ==========================================
    // --- LÓGICA DE CONTROL DE INACTIVIDAD ---
    // ==========================================

    // Alarma 1: Desparrama el sistema de estrellas al minuto de quietud
    function iniciarTemporizadorInactividad() {
        clearTimeout(inactivityTimer);
        if (userRating > 0 || (ratingContainer && ratingContainer.classList.contains('active'))) return;

        inactivityTimer = setTimeout(function () {
            if (widget && !widget.classList.contains("hidden") && history.length > 1) {
                showRatingSystem();
            }
        }, INACTIVITY_TIME);
    }

    // Alarma 2: Registra actividad del usuario y setea el borrado total a la hora
    function registrarActividadGlobal() {
        localStorage.setItem("chat_last_activity", Date.now());
        clearTimeout(sessionTimer);

        sessionTimer = setTimeout(function () {
            if (widget && !widget.classList.contains("hidden")) {
                renderChatElement({ role: "assistant", content: "⏱️ Sesión expirada por inactividad. Reiniciando chat..." });
            }
            clearChat();
        }, SESSION_TIMEOUT);
    }

    // ==========================================
    // --- LÓGICA DE ALTERNANCIA DE BOTONES ---
    // ==========================================
    function toggleInputButtons() {
        if (!btnSend || !btnMic) return;

        if (input.value.trim().length > 0) {
            btnMic.classList.add('hidden');
            btnSend.classList.remove('hidden');
        } else {
            btnSend.classList.add('hidden');
            btnMic.classList.remove('hidden');
        }
    }

    // --- VINCULACIÓN DE EVENTOS INICIALES (Mapeados en initChat) ---

    // Evalúa si las coordenadas del cursor/dedo colisionan con el tacho de basura
    function isOverTrash(clientX, clientY) {
        if (!btnCancelAudio || btnCancelAudio.style.display === 'none') return false;
        var rect = btnCancelAudio.getBoundingClientRect();
        var padding = 15;
        return (
            clientX >= rect.left - padding &&
            clientX <= rect.right + padding &&
            clientY >= rect.top - padding &&
            clientY <= rect.bottom + padding
        );
    }

    function startPress() {
        pressStartTime = Date.now();
        isHolding = false;
        recordTimeout = setTimeout(function () {
            isHolding = true;
            if (!isRecording) startRecording();
        }, 300);
    }

    function endPress(e) {
        if (!pressStartTime) return;
        clearTimeout(recordTimeout);
        var pressDuration = Date.now() - pressStartTime;
        pressStartTime = 0;

        if (isHolding) {
            isHolding = false;
            if (isRecording) {
                if (isOverTrash(e.clientX, e.clientY)) cancelRecording();
                else stopRecording();
            }
        } else {
            if (pressDuration < 300) toggleRecording();
        }
    }

    function handleMouseMove(e) {
        if (!isRecording || !isHolding) return;
        if (isOverTrash(e.clientX, e.clientY)) btnCancelAudio.classList.add('trash-hovered');
        else btnCancelAudio.classList.remove('trash-hovered');
    }

    function handleTouchMove(e) {
        if (!isRecording || !isHolding) return;
        var touch = e.touches[0];
        if (isOverTrash(touch.clientX, touch.clientY)) btnCancelAudio.classList.add('trash-hovered');
        else btnCancelAudio.classList.remove('trash-hovered');
    }

    function handleTouchEnd(e) {
        if (!pressStartTime) return;
        clearTimeout(recordTimeout);
        var pressDuration = Date.now() - pressStartTime;
        pressStartTime = 0;

        if (isHolding) {
            isHolding = false;
            if (isRecording) {
                var touch = e.changedTouches[0];
                if (isOverTrash(touch.clientX, touch.clientY)) cancelRecording();
                else stopRecording();
            }
        } else {
            if (pressDuration < 300) toggleRecording();
        }
    }

    function cancelPress() {
        clearTimeout(recordTimeout);
        if (isHolding && isRecording) {
            cancelRecording();
            isHolding = false;
        }
    }

    async function toggleRecording() {
        if (isRecording) stopRecording();
        else startRecording();
    }

    // ==========================================
    // --- UI DE GRABACIÓN ESTILO WHATSAPP ---
    // ==========================================
    function showRecordingUI() {
        if (textContainer) {
            textContainer.classList.remove('active');
            textContainer.classList.add('hidden-mode');
        }
        if (recordingContainer) {
            recordingContainer.classList.remove('hidden-mode');
            setTimeout(function() { recordingContainer.classList.add('active'); }, 30);
        }
        startRecTimer();
    }

    function hideRecordingUI() {
        stopRecTimer();
        if (recordingContainer) {
            recordingContainer.classList.remove('active');
        }
        setTimeout(function() {
            if (textContainer) {
                textContainer.classList.remove('hidden-mode');
                textContainer.classList.add('active');
            }
        }, 300);
    }

    function startRecTimer() {
        recSeconds = 0;
        if (recTimerText) recTimerText.textContent = '0:00';
        recTimerInterval = setInterval(function() {
            recSeconds++;
            var m = Math.floor(recSeconds / 60);
            var s = recSeconds % 60;
            if (recTimerText) recTimerText.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        }, 1000);
    }

    function stopRecTimer() {
        clearInterval(recTimerInterval);
        recSeconds = 0;
        if (recTimerText) recTimerText.textContent = '0:00';
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecordingCancelled = false;

            mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) audioChunks.push(e.data); };

            mediaRecorder.onstop = async function () {
                if (isRecordingCancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    audioChunks = [];
                    return;
                }

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const base64Audio = await blobToBase64(audioBlob);
                stream.getTracks().forEach(track => track.stop());
                sendMessage(null, "🎤 Su Mensaje", null, base64Audio);
            };

            mediaRecorder.start();
            isRecording = true;

            if (btnMic) {
                btnMic.classList.add('recording-active');
                btnMic.innerHTML = iconStopWhite;
            }
            if (btnCancelAudio) {
                btnCancelAudio.style.display = 'flex';
            }
            if (input) {
                input.placeholder = "Grabando audio...";
                input.disabled = true;
            }
            // Mostrar UI de grabación WhatsApp
            showRecordingUI();
        } catch (err) {
            console.error("Error micrófono:", err);
            alert("No se pudo acceder al micrófono. Por favor, verifica los permisos de tu navegador.");
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            if (btnCancelAudio) {
                btnCancelAudio.style.display = 'none';
                btnCancelAudio.classList.remove('trash-hovered');
            }
            mediaRecorder.stop();
            isRecording = false;

            if (btnMic) {
                btnMic.classList.remove('recording-active');
                btnMic.innerHTML = iconMicWhite;
            }
            if (input) {
                input.placeholder = "Escribe un mensaje...";
                input.disabled = false;
                input.focus();
            }
            toggleInputButtons();
            // Ocultar UI de grabación WhatsApp
            hideRecordingUI();
        }
    }

    function cancelRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            isRecordingCancelled = true;
            mediaRecorder.stop();
            isRecording = false;

            if (btnCancelAudio) {
                btnCancelAudio.style.display = 'none';
                btnCancelAudio.classList.remove('trash-hovered');
            }
            if (btnMic) {
                btnMic.classList.remove('recording-active');
                btnMic.innerHTML = iconMicWhite;
            }
            if (input) {
                input.placeholder = "Escribe un mensaje...";
                input.disabled = false;
                input.focus();
            }
            toggleInputButtons();
            // Ocultar UI de grabación WhatsApp
            hideRecordingUI();
        }
    }

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function bloquearChat() {
        if (input) { input.disabled = true; input.placeholder = "Gregorio está procesando..."; }
        if (btnSend) { btnSend.disabled = true; btnSend.style.opacity = "0.5"; btnSend.style.pointerEvents = "none"; }
        if (btnMic) { btnMic.disabled = true; btnMic.style.opacity = "0.5"; btnMic.style.pointerEvents = "none"; }
    }

    function desbloquearChat() {
        if (input) { input.disabled = false; input.placeholder = "Escribe un mensaje..."; input.focus(); }
        if (btnSend) { btnSend.disabled = false; btnSend.style.opacity = "1"; btnSend.style.pointerEvents = "auto"; }
        if (btnMic) { btnMic.disabled = false; btnMic.style.opacity = "1"; btnMic.style.pointerEvents = "auto"; }
        toggleInputButtons();
    }

    // --- RATING Y ESTRELLAS (Mapeados en initChat) ---

    function highlightStars(value) {
        stars.forEach(function (s) {
            if (s.dataset.value <= value) s.classList.add('hovered');
            else s.classList.remove('hovered');
        });
    }

    async function submitRating(value) {
        hideRatingSystem();
        showTyping();

        var cleanHistory = history.map(function (m) {
            return { role: m.role, content: m.content, timestamp: m.timestamp };
        });

        try {
            var res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId,
                    message: "CALIFICACION_INTERNA:" + value,
                    menuId: "ASESOR_NUBE",
                    timestamp: new Date().toISOString(),
                    history: cleanHistory
                })
            });

            if (!res.ok) throw new Error("HTTP error " + res.status);

            var rawText = await res.text();
            var data = JSON.parse(rawText);
            stopTyping();


            processResponse(data, true);

        } catch (err) {
            console.error("❌ Error al guardar la valoración:", err);
            stopTyping();
            renderChatElement({ role: "assistant", content: "⚠️ No pudimos registrar tu calificación, pero volvemos al inicio." });
            sendStartSignal();
        }
    }

    function showRatingSystem() {
        textContainer.classList.remove('active');
        textContainer.classList.add('hidden-mode');
        ratingContainer.classList.remove('hidden-mode');
        setTimeout(() => ratingContainer.classList.add('active'), 50);
    }

    function hideRatingSystem() {
        ratingContainer.classList.remove('active');
        setTimeout(() => {
            textContainer.classList.remove('hidden-mode');
            textContainer.classList.add('active');
            iniciarTemporizadorInactividad();
        }, 300);
    }

    // --- FORMATO DE MAPAS ---
    function formatearEnlacesMapa(texto) {
        if (!texto || texto.indexOf('btn-mapa-flotante') !== -1) return texto;
        // Si el contenido ya tiene un iframe (mapa embebido), no procesarlo
        if (texto.indexOf('<iframe') !== -1) return texto;
        var mapRegex = /(?:<a[^>]*href=["'])?(https:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)[^\s<"']+)(?:["'][^>]*>.*<\/a>)?/gi;
        return texto.replace(mapRegex, function (match, url) {
            var cleanUrl = url.replace(/[.,;!?)\]]+$/, '');
            return `<br><br><a href="${cleanUrl}" target="_blank" class="btn-mapa-flotante" style="display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #212529; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; width: 100%; box-sizing: border-box;">Ver ubicación</a>`;
        });
    }

    // --- RENDERIZADO DEL CHAT (Mapeado en initChat) ---

    // --- FUNCIÓN DE INICIALIZACIÓN ---
    function initChat() {
        // --- ASIGNACIÓN DE ELEMENTOS UI ---
        launcher = document.getElementById('chatLauncher');
        widget = document.getElementById('chatWidget');
        btnClose = document.getElementById('btnClose');
        btnClear = document.getElementById('btnClear');
        btnHome = document.getElementById('btnHome');
        btnSend = document.getElementById('btnSend');
        btnMic = document.getElementById('btnMic');
        btnCancelAudio = document.getElementById('btnCancelAudio');
        input = document.getElementById('userInput');
        messages = document.getElementById('chatMessages');
        badge = document.getElementById('notificationBadge');

        // --- ASIGNACIÓN DE ELEMENTOS GRABACIÓN WHATSAPP ---
        recordingContainer = document.getElementById('recordingContainer');
        btnRecDelete = document.getElementById('btnRecDelete');
        btnRecSend = document.getElementById('btnRecSend');
        recTimerText = document.getElementById('recTimerText');

        // --- ASIGNACIÓN DE ELEMENTOS RATING ---
        textContainer = document.getElementById('textInputContainer');
        ratingContainer = document.getElementById('ratingContainer');
        closeRatingBtn = document.getElementById('closeRating');
        stars = document.querySelectorAll('.star');

        // --- CONFIGURACIÓN INICIAL DE BOTONES ---
        if (btnMic) btnMic.innerHTML = iconMicWhite;
        if (btnCancelAudio) {
            btnCancelAudio.innerHTML = iconTrashWhite;
            btnCancelAudio.style.display = 'none';
        }
        toggleInputButtons();

        // --- VINCULACIÓN DE EVENTOS ---
        if (input) input.addEventListener('input', toggleInputButtons);

        // --- EVENT LISTENERS UI ---
        if (launcher) launcher.addEventListener('click', toggleChat);
        if (btnClose) btnClose.addEventListener('click', toggleChat);
        if (btnClose) btnClose.addEventListener('click', clearChat);

        if (btnClear) btnClear.addEventListener('click', clearChat);
        if (btnHome) btnHome.addEventListener('click', goHome);
        if (btnSend) btnSend.addEventListener('click', function (e) { sendMessage(e); });
        if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
        if (closeRatingBtn) closeRatingBtn.addEventListener('click', function (e) { e.preventDefault(); hideRatingSystem(); });
        if (btnCancelAudio) btnCancelAudio.addEventListener('click', cancelRecording);

        // --- EVENT LISTENERS GRABACIÓN WHATSAPP ---
        if (btnRecDelete) btnRecDelete.addEventListener('click', cancelRecording);
        if (btnRecSend) btnRecSend.addEventListener('click', stopRecording);

        // --- EVENT LISTENERS MICRÓFONO ---
        if (btnMic) {
            btnMic.addEventListener('mousedown', startPress);
            document.addEventListener('mouseup', endPress);
            document.addEventListener('mousemove', handleMouseMove);

            btnMic.addEventListener('touchstart', function (e) { e.preventDefault(); startPress(); }, { passive: false });
            document.addEventListener('touchend', handleTouchEnd, { passive: false });
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            btnMic.addEventListener('touchcancel', cancelPress);
        }

        // --- RATING Y ESTRELLAS ---
        if (stars) {
            stars.forEach(function (star) {
                star.addEventListener('mouseover', function () { highlightStars(this.dataset.value); });
                star.addEventListener('mouseout', function () { highlightStars(userRating); });
                star.addEventListener('click', function () {
                    userRating = this.dataset.value;
                    highlightStars(userRating);
                    submitRating(userRating);
                });
            });
        }

        // --- RENDERIZADO DEL HISTORIAL INICIAL ---
        if (messages && history) {
            history.forEach(function (m) { renderChatElement(m); });
        }
    }

    // --- CARGA SEGURA ---
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChat);
    } else {
        initChat();
    }

    function renderChatElement(msg) {
        const textoValido = msg.content && String(msg.content).trim() !== "";
        const tieneBotones = msg.options && Array.isArray(msg.options) && msg.options.length > 0;
        const tieneMedia = msg.image || msg.audio;

        if (!textoValido && !tieneBotones && !tieneMedia) return;

        var div = document.createElement("div");
        div.className = "message " + (msg.role === 'user' ? 'user' : 'bot');

        if (!textoValido && tieneBotones && !tieneMedia) {
            div.style.background = "transparent";
            div.style.boxShadow = "none";
            div.style.padding = "0";
        }

        if (textoValido) {
            var p = document.createElement("div");
            p.innerHTML = (msg.role === 'bot' || msg.role === 'assistant') ? formatearEnlacesMapa(msg.content) : msg.content;
            div.appendChild(p);
        }

        if (msg.image) {
            var img = document.createElement("img");
            img.src = msg.image;
            img.style.maxWidth = "100%"; img.style.borderRadius = "8px";
            img.onload = scrollToBottom;
            div.appendChild(img);
        }

        if (msg.audio) {
            var audioPlayer = document.createElement("audio");
            audioPlayer.controls = true;
            audioPlayer.className = "chat-audio-player";
            audioPlayer.src = msg.audio.startsWith('data:audio') ? msg.audio : 'data:audio/wav;base64,' + msg.audio;
            audioPlayer.style.width = "100%";
            audioPlayer.style.marginTop = "8px";
            div.appendChild(audioPlayer);
            if (msg.role === 'bot') setTimeout(() => audioPlayer.play().catch(e => { }), 300);
        }

        if (tieneBotones) {
            var optDiv = document.createElement("div");
            optDiv.className = "options-container";
            optDiv.style.display = "flex";
            optDiv.style.flexWrap = "wrap";
            optDiv.style.gap = "8px";
            optDiv.style.marginTop = "10px";

            msg.options.forEach(function (opt) {
                var label = typeof opt === 'object' ? opt.label : opt;
                var id = typeof opt === 'object' ? (opt.nodoId || opt.menuId) : null;
                var url = typeof opt === 'object' ? opt.url : null;

                var btn = document.createElement("button");
                btn.className = "chat-option-btn";
                btn.innerHTML = (url ? '🔗 ' : '🔹 ') + label;
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (url) window.open(url, '_blank');
                    else sendMessage(null, label, id);
                };
                optDiv.appendChild(btn);
            });
            div.appendChild(optDiv);
        }

        if (textoValido || tieneMedia) {
            var time = document.createElement("span");
            time.style.cssText = "font-size:10px; opacity:0.6; display:block; text-align:right; margin-top:5px;";
            var d = msg.timestamp ? new Date(msg.timestamp) : new Date();
            time.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            div.appendChild(time);
        }

        messages.appendChild(div);
        scrollToBottom();
    }

    // LÓGICA DE APERTURA Y CIERRE DEL CHAT
    function toggleChat() {
        if (widget.classList.contains("hidden")) {
            widget.classList.remove("hidden");
            unreadCount = 0;
            updateBadge();
            scrollToBottom();

            if (history.length === 0 && messages.children.length === 0) {
                var welcomeMsg = {
                    role: 'assistant',
                    content: 'Hola soy el Asistente Virtual de la Municipalidad de Las Heras. ¿En qué puedo ayudarte?',
                    timestamp: new Date().toISOString()
                };
                renderChatElement(welcomeMsg);
                history.push(welcomeMsg);
                localStorage.setItem("chat_history", JSON.stringify(history));
            }
            // 🎯 CICLO INACTIVIDAD: Arrancamos el contador cuando abren el chat
            iniciarTemporizadorInactividad();
        } else {
            widget.classList.add("hidden");
            // 🎯 CICLO INACTIVIDAD: Frenamos el contador si ocultan el chat
            clearTimeout(inactivityTimer);
        }
    }

    function scrollToBottom() { setTimeout(() => messages.scrollTop = messages.scrollHeight, 50); }

    function updateBadge() {
        if (unreadCount > 0) { badge.textContent = unreadCount > 9 ? "+9" : unreadCount; badge.classList.remove("hidden"); }
        else badge.classList.add("hidden");
    }

    function goHome() {
        renderChatElement({ role: 'assistant', content: '↺ Volviendo al inicio...' });
        sendStartSignal();
    }

    function clearChat() {
        localStorage.removeItem("chat_history"); localStorage.removeItem("chat_session_id");
        history = []; sessionId = crypto.randomUUID();
        localStorage.setItem("chat_session_id", sessionId);
        messages.innerHTML = "";
        userRating = 0; // Reset de calificación
        clearTimeout(inactivityTimer); // Limpieza de timer
        sendStartSignal();
    }

    // --- COMUNICACIÓN CON N8N ---
    async function sendStartSignal() {
        showTyping();
        try {
            var res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: sessionId, message: "start", start: 1, history: [] })
            });
            var data = await res.json();
            stopTyping();
            processResponse(data, true);
        } catch (e) { stopTyping(); }
    }

    async function sendMessage(e, txt, menuId, audioBase64) {
        if (e) e.preventDefault();
        var val = txt || input.value.trim();
        if (!val && !audioBase64) return;

        // 🎯 CICLO INACTIVIDAD: Congelamos el timer inmediatamente al escribir/enviar datos
        clearTimeout(inactivityTimer);

        if (menuId === 'ASESOR_NUBE') {
            sessionId = crypto.randomUUID();
            localStorage.setItem("chat_session_id", sessionId);
            history = [];
        }

        var finalMenuId = menuId || 'ASESOR_NUBE';

        var userMsg = { role: "user", content: val, audio: audioBase64 || null, timestamp: new Date().toISOString() };
        renderChatElement(userMsg);

        history.push(userMsg);
        if (history.length > 40) history = history.slice(history.length - 40);
        localStorage.setItem("chat_history", JSON.stringify(history));

        input.value = "";
        toggleInputButtons();
        hideRatingSystem();
        showTyping();

        var cleanHistory = history.map(function (m) {
            return { role: m.role, content: m.content, timestamp: m.timestamp };
        });

        try {
            var res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId,
                    message: val,
                    audio: audioBase64 || null,
                    menuId: finalMenuId,
                    timestamp: new Date().toISOString(),
                    history: cleanHistory
                })
            });

            if (!res.ok) throw new Error("HTTP error " + res.status);

            var rawText = await res.text();
            var data = JSON.parse(rawText);
            stopTyping();

            var esMenuPrincipal = (finalMenuId === 'MAIN' || finalMenuId === 'INICIO');
            processResponse(data, esMenuPrincipal);

        } catch (err) {
            console.error("🚨 DETALLE DEL ERROR:", err);
            stopTyping();
            renderChatElement({ role: "assistant", content: "⚠️ Error procesando la respuesta." });
            // Reanudamos control si falla el server
            iniciarTemporizadorInactividad();
        }
    }

    // --- PROCESAMIENTO UNIFICADO ---
    // --- PROCESAMIENTO UNIFICADO ---
    function processResponse(data, isMainMenu) {
        var responses = data.paqueteMensajes ? data.paqueteMensajes : (Array.isArray(data) ? data : [data]);

        function renderSecuencial(index) {
            if (index >= responses.length) {
                // 🎯 REINICIO: Gregorio terminó de escribir, relanzamos los contadores
                iniciarTemporizadorInactividad();
                registrarActividadGlobal();
                return;
            }

            var resp = responses[index];
            var mainMenuFlag = (resp.isMainMenu !== undefined) ? resp.isMainMenu : (isMainMenu === true);
            var contenidoOriginal = resp.respuesta_chat || resp.reply || "";
            var botonesFinales = resp.opciones_botones || resp.options || [];

            // 🛠️ REPARACIÓN: Extractor de botones incrustados en texto plano
            if (botonesFinales.length === 0 && contenidoOriginal.includes('label')) {
                var arrayMatch = contenidoOriginal.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                    try {
                        botonesFinales = JSON.parse(arrayMatch[0]); // Convierte el [...] en botones reales
                        contenidoOriginal = contenidoOriginal.replace(arrayMatch[0], ''); // Saca el JSON del texto
                    } catch (e) { console.error("🚨 Fallo al parsear botones incrustados:", e); }
                }
            }

            var contenidoLimpio = contenidoOriginal.replace(/\[\s*\]/g, '').replace(/^[,\s]+|[,\s]+$/g, '').trim();
            if (contenidoLimpio === "," || contenidoLimpio === "") contenidoLimpio = "";

            var botMsg = {
                role: "assistant",
                content: contenidoLimpio,
                image: resp.image,
                audio: resp.audio || resp.audio_respuesta,
                options: botonesFinales,
                isMainMenu: mainMenuFlag,
                timestamp: new Date().toISOString()
            };

            renderChatElement(botMsg);

            var msgForHistory = Object.assign({}, botMsg);
            delete msgForHistory.audio;
            delete msgForHistory.image;
            history.push(msgForHistory);

            if (history.length > 40) history = history.slice(history.length - 40);
            localStorage.setItem("chat_history", JSON.stringify(history));

            if (widget.classList.contains("hidden")) { unreadCount++; updateBadge(); }
            showTyping();
            setTimeout(() => { stopTyping(); renderSecuencial(index + 1); }, 1500);
        }
        renderSecuencial(0);
    }

    function showTyping() {
        if (document.getElementById("typing-indicator")) return;
        var div = document.createElement("div");
        div.id = "typing-indicator"; div.className = "typing-indicator";
        div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        messages.appendChild(div); scrollToBottom();
    }

    function stopTyping() { var el = document.getElementById("typing-indicator"); if (el) el.remove(); }
})();