(function () {
    var webhookUrl = "https://n8n-asistentevirtual.lasheras.gob.ar/webhook/chat_apex2";

    // --- CONFIGURACIÓN DE TIEMPOS (MILISEGUNDOS) ---
    var INACTIVITY_TIME = 3 * 60 * 1000;
    var SESSION_TIMEOUT = 60 * 60 * 1000;

    var lastActivity = localStorage.getItem("chat_last_activity");
    var hasHistory = localStorage.getItem("chat_history");
    if (hasHistory && (!lastActivity || (Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT))) {
        localStorage.removeItem("chat_history");
        localStorage.removeItem("chat_session_id");
        localStorage.removeItem("chat_last_activity");
    }

    // --- ELEMENTOS UI ---
    var launcher, widget, btnClose, btnClear, btnHome, btnSend, btnMic, btnCancelAudio, input, messages, badge;
    var recordingContainer, btnRecDelete, btnRecSend, recTimerText;
    var textContainer, ratingContainer, closeRatingBtn, stars;

    // --- ÍCONOS SVG ---
    var iconMicWhite = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
    var iconStopWhite = `<svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"/></svg>`;
    var iconTrashWhite = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;

    // --- ESTADO ---
    var sessionId = localStorage.getItem("chat_session_id") || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
    var isStartingRecording = false;
    var recordingShouldStop = false;
    var mediaRecorder;
    var audioChunks = [];
    var recordTimeout;
    var stopTimeout;
    var isHolding = false;
    var pressStartTime = 0;
    var isRecordingCancelled = false;
    var recordingStartTime = 0;

    // --- VARIABLES TIMER GRABACIÓN ---
    var recTimerInterval;
    var recSeconds = 0;

    // --- VARIABLES INACTIVIDAD ---
    var inactivityTimer;
    var sessionTimer;

    // ==========================================
    // --- LÓGICA DE CONTROL DE INACTIVIDAD ---
    // ==========================================
    function iniciarTemporizadorInactividad() {
        clearTimeout(inactivityTimer);
        if (userRating > 0 || (ratingContainer && ratingContainer.classList.contains('active'))) return;

        inactivityTimer = setTimeout(function () {
            if (widget && !widget.classList.contains("hidden") && history.length > 1) {
                showRatingSystem();
            }
        }, INACTIVITY_TIME);
    }

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

    // --- VARIABLES DE SLIDE-TO-CANCEL ---
    var holdStartX = 0;
    var holdStartY = 0;
    var SLIDE_CANCEL_THRESHOLD = 80;
    var slideCancelIndicator, slideCancelLock;
    var isSlideCancelled = false;
    var slideCancelActive = false;

    function isOverTrash(clientX, clientY) {
        var targetTrash = (btnRecDelete && btnRecDelete.offsetWidth > 0) ? btnRecDelete : btnCancelAudio;
        if (!targetTrash || targetTrash.offsetWidth === 0) return false;
        var rect = targetTrash.getBoundingClientRect();
        var padding = 15;
        return (
            clientX >= rect.left - padding &&
            clientX <= rect.right + padding &&
            clientY >= rect.top - padding &&
            clientY <= rect.bottom + padding
        );
    }

    // --- MANEJO DE EVENTOS DE PRESIÓN ---
    function startPress(e) {
        if (e) e.preventDefault();

        if (stopTimeout) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
            realStopRecording();
        }

        pressStartTime = Date.now();
        isHolding = false;
        isSlideCancelled = false;
        slideCancelActive = false;
        recordingShouldStop = false;

        if (e && e.clientX !== undefined) {
            holdStartX = e.clientX;
            holdStartY = e.clientY;
        } else if (e && e.touches && e.touches[0]) {
            holdStartX = e.touches[0].clientX;
            holdStartY = e.touches[0].clientY;
        }

        // Tiempo para diferenciar tap de hold
        recordTimeout = setTimeout(function () {
            isHolding = true;
            if (!isRecording && !isStartingRecording) startRecording(true);
        }, 150);
    }

    function endPress(e) {
        if (!pressStartTime) return;
        if (e && e.cancelable) e.preventDefault();

        clearTimeout(recordTimeout);
        var pressDuration = Date.now() - pressStartTime;
        pressStartTime = 0;

        if (isHolding) {
            isHolding = false;
            if (isRecording) {
                if (isSlideCancelled) {
                    cancelRecording();
                } else {
                    // Enviar automáticamente al soltar
                    stopRecording();
                }
            } else if (isStartingRecording) {
                recordingShouldStop = isSlideCancelled ? 'cancel' : 'stop';
            }
            hideSlideCancelUI();
        } else {
            // Tap corto: toggle tradicional
            if (pressDuration < 150) toggleRecording();
        }
    }

    function handleTouchEnd(e) {
        endPress(e);
    }

    function cancelPress(e) {
        if (!pressStartTime && !isHolding && !isRecording) return;
        clearTimeout(recordTimeout);
        pressStartTime = 0;

        if (isHolding) {
            isHolding = false;
            if (isRecording) {
                if (isSlideCancelled) {
                    cancelRecording();
                } else {
                    stopRecording();
                }
            } else if (isStartingRecording) {
                recordingShouldStop = isSlideCancelled ? 'cancel' : 'stop';
            }
        }
        hideSlideCancelUI();
    }

    // --- MANEJO DE MOVIMIENTO (SLIDE TO CANCEL) ---
    function handleMouseMove(e) {
        if ((!isRecording && !isStartingRecording) || !isHolding) return;
        processSlideMove(e.clientX, e.clientY);
    }

    function handleTouchMove(e) {
        if ((!isRecording && !isStartingRecording) || !isHolding) return;
        if (e && e.cancelable) e.preventDefault();
        if (e.touches && e.touches[0]) {
            processSlideMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }

    function processSlideMove(clientX, clientY) {
        var deltaX = holdStartX - clientX;
        var deltaY = Math.abs(holdStartY - clientY);

        // Solo activar si desliza predominantemente a la izquierda
        if (deltaX > 10 && deltaX > deltaY) {
            slideCancelActive = true;
            var distance = deltaX > 0 ? deltaX : 0;
            updateSlideCancelState(distance);
        } else if (slideCancelActive && deltaX < 10) {
            // Volvió a la posición original
            slideCancelActive = false;
            updateSlideCancelState(0);
        }

        var targetTrash = (btnRecDelete && btnRecDelete.offsetWidth > 0) ? btnRecDelete : btnCancelAudio;
        if (!targetTrash) return;
        if (isOverTrash(clientX, clientY)) targetTrash.classList.add('trash-hovered');
        else targetTrash.classList.remove('trash-hovered');
    }

    // --- UI SLIDE TO CANCEL ---
    function updateSlideCancelState(distance) {
        if (!slideCancelIndicator) slideCancelIndicator = document.getElementById('slideCancelIndicator');
        if (!slideCancelLock) slideCancelLock = document.getElementById('slideCancelLock');

        var trash = slideCancelIndicator ? slideCancelIndicator.querySelector('.slide-cancel-trash') : null;
        var slideAction = slideCancelIndicator ? slideCancelIndicator.querySelector('.slide-cancel-action') : null;

        var progress = Math.max(0, Math.min(distance / SLIDE_CANCEL_THRESHOLD, 1));

        if (trash) {
            var scale = 1 + progress * 0.4;
            trash.style.transform = 'scale(' + scale + ')';
            trash.style.backgroundColor = progress > 0.85 ? '#dc2626' : '#ef4444';
        }

        if (slideAction) {
            var translate = -progress * 25;
            slideAction.style.transform = 'translateX(' + translate + 'px)';
            slideAction.style.opacity = 1 - progress * 0.8;
        }

        if (distance >= SLIDE_CANCEL_THRESHOLD) {
            isSlideCancelled = true;
            if (slideCancelIndicator) slideCancelIndicator.classList.remove('visible');
            if (slideCancelLock) slideCancelLock.classList.add('visible');
            if (navigator.vibrate) navigator.vibrate(30);
        } else {
            isSlideCancelled = false;
            if (slideCancelLock) slideCancelLock.classList.remove('visible');
            if (slideCancelIndicator && isHolding) slideCancelIndicator.classList.add('visible');
        }
    }

    function showSlideCancelUI() {
        if (!slideCancelIndicator) slideCancelIndicator = document.getElementById('slideCancelIndicator');
        if (slideCancelIndicator) slideCancelIndicator.classList.add('visible');
    }

    function hideSlideCancelUI() {
        if (!slideCancelIndicator) slideCancelIndicator = document.getElementById('slideCancelIndicator');
        if (!slideCancelLock) slideCancelLock = document.getElementById('slideCancelLock');
        if (slideCancelIndicator) slideCancelIndicator.classList.remove('visible');
        if (slideCancelLock) slideCancelLock.classList.remove('visible');

        var trash = slideCancelIndicator ? slideCancelIndicator.querySelector('.slide-cancel-trash') : null;
        var slideAction = slideCancelIndicator ? slideCancelIndicator.querySelector('.slide-cancel-action') : null;
        if (trash) {
            trash.style.transform = '';
            trash.style.backgroundColor = '';
        }
        if (slideAction) {
            slideAction.style.transform = '';
            slideAction.style.opacity = '';
        }

        isSlideCancelled = false;
        slideCancelActive = false;
    }

    async function toggleRecording() {
        if (isRecording) stopRecording();
        else startRecording(false);
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
            setTimeout(function () { recordingContainer.classList.add('active'); }, 30);
        }
        startRecTimer();
    }

    function hideRecordingUI() {
        stopRecTimer();
        if (recordingContainer) {
            recordingContainer.classList.remove('active');
            setTimeout(function () {
                recordingContainer.classList.add('hidden-mode');
            }, 300);
        }
        setTimeout(function () {
            if (textContainer) {
                textContainer.classList.remove('hidden-mode');
                textContainer.classList.add('active');
                if (input && !input.disabled) input.focus();
                var inputArea = document.querySelector('.chat-input-area');
                if (inputArea) inputArea.scrollTop = 0;
            }
        }, 300);
    }

    function startRecTimer() {
        recSeconds = 0;
        if (recTimerText) recTimerText.textContent = '0:00';
        var holdTimerText = document.getElementById('holdTimerText');
        if (holdTimerText) holdTimerText.textContent = '0:00';
        recTimerInterval = setInterval(function () {
            recSeconds++;
            var m = Math.floor(recSeconds / 60);
            var s = recSeconds % 60;
            var formatted = m + ':' + (s < 10 ? '0' : '') + s;
            if (recTimerText) recTimerText.textContent = formatted;
            if (holdTimerText) holdTimerText.textContent = formatted;
        }, 1000);
    }

    function stopRecTimer() {
        clearInterval(recTimerInterval);
        recSeconds = 0;
        if (recTimerText) recTimerText.textContent = '0:00';
        var holdTimerText = document.getElementById('holdTimerText');
        if (holdTimerText) holdTimerText.textContent = '0:00';
    }

    function resetRecordingUI() {
        if (textContainer) {
            textContainer.classList.remove('recording-hold-active');
        }
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
        }
        toggleInputButtons();
        hideSlideCancelUI();
        hideRecordingUI();
    }

    async function startRecording(isHoldMode) {
        if (isRecording || isStartingRecording) return;
        isStartingRecording = true;
        recordingShouldStop = false;
        isRecordingCancelled = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (recordingShouldStop) {
                var action = recordingShouldStop;
                if (action === 'cancel') {
                    recordingShouldStop = false;
                    isStartingRecording = false;
                    stream.getTracks().forEach(track => track.stop());
                    resetRecordingUI();
                    return;
                }
            }

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) audioChunks.push(e.data); };

            mediaRecorder.onstop = async function () {
                if (isRecordingCancelled) {
                    stream.getTracks().forEach(track => track.stop());
                    audioChunks = [];
                    return;
                }

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    const base64Audio = await blobToBase64(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                    sendMessage(null, "🎤 Su Mensaje", null, base64Audio);
                } else {
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            recordingStartTime = Date.now();
            isStartingRecording = false;
            isRecording = true;

            if (btnMic) {
                btnMic.classList.add('recording-active');
                btnMic.innerHTML = iconMicWhite;
            }
            if (input) {
                input.placeholder = "Grabando audio...";
            }

            if (isHoldMode) {
                if (textContainer) textContainer.classList.add('recording-hold-active');
                showSlideCancelUI();
                startRecTimer();
            } else {
                if (btnMic) btnMic.innerHTML = iconStopWhite;
                if (btnCancelAudio) btnCancelAudio.style.display = 'flex';
                showRecordingUI();
            }

            if (recordingShouldStop) {
                var finalAction = recordingShouldStop;
                recordingShouldStop = false;
                if (finalAction === 'cancel') {
                    cancelRecording();
                } else {
                    stopRecording();
                }
            }
        } catch (err) {
            isStartingRecording = false;
            recordingShouldStop = false;
            console.error("Error micrófono:", err);
            alert("No se pudo acceder al micrófono. Por favor, verifica los permisos de tu navegador.");
        }
    }

    function stopRecording() {
        var elapsed = Date.now() - recordingStartTime;
        var minDuration = 400; // ms mínimos para asegurar chunks

        if (elapsed < minDuration) {
            stopTimeout = setTimeout(function () {
                realStopRecording();
            }, minDuration - elapsed);
        } else {
            realStopRecording();
        }
    }

    function realStopRecording() {
        if (stopTimeout) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        } else if (audioChunks.length > 0 && !isRecordingCancelled) {
            // Fallback de seguridad por si el recorder se detuvo inesperadamente
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            if (audioBlob.size > 0) {
                blobToBase64(audioBlob).then(base64Audio => {
                    sendMessage(null, "🎤 Su Mensaje", null, base64Audio);
                });
            }
        }

        isRecording = false;
        resetRecordingUI();
    }

    function cancelRecording() {
        if (stopTimeout) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
        }
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            isRecordingCancelled = true;
            mediaRecorder.stop();
        }
        isRecording = false;
        resetRecordingUI();
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
        if (input) { input.readOnly = true; input.placeholder = "Gregorio está procesando..."; }
        if (btnSend) { btnSend.disabled = true; btnSend.style.opacity = "0.5"; btnSend.style.pointerEvents = "none"; }
        if (btnMic) { btnMic.disabled = true; btnMic.style.opacity = "0.5"; btnMic.style.pointerEvents = "none"; }
    }

    function desbloquearChat() {
        if (input) {
            input.disabled = false;
            input.readOnly = false;
            input.placeholder = "Escribe un mensaje...";
            if (textContainer && !textContainer.classList.contains('hidden-mode')) {
                input.focus();
            }
        }
        if (btnSend) { btnSend.disabled = false; btnSend.style.opacity = "1"; btnSend.style.pointerEvents = "auto"; }
        if (btnMic) { btnMic.disabled = false; btnMic.style.opacity = "1"; btnMic.style.pointerEvents = "auto"; }
        toggleInputButtons();
        var inputArea = document.querySelector('.chat-input-area');
        if (inputArea) inputArea.scrollTop = 0;
    }

    // --- RATING Y ESTRELLAS ---
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

    function formatearEnlacesMapa(texto) {
        if (!texto || texto.indexOf('btn-mapa-flotante') !== -1) return texto;
        if (texto.indexOf('<iframe') !== -1) return texto;
        var mapRegex = /(?:<a[^>]*href=["'])?(https:\/\/(?:www\.)?(?:google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com)[^\s<"']+)(?:["'][^>]*>.*<\/a>)?/gi;
        return texto.replace(mapRegex, function (match, url) {
            var cleanUrl = url.replace(/[.,;!?)\]]+$/, '');
            return `<br><br><a href="${cleanUrl}" target="_blank" class="btn-mapa-flotante" style="display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #212529; color: #fff; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; width: 100%; box-sizing: border-box;">Ver ubicación</a>`;
        });
    }

    // --- INICIALIZACIÓN ---
    function initChat() {
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

        recordingContainer = document.getElementById('recordingContainer');
        btnRecDelete = document.getElementById('btnRecDelete');
        btnRecSend = document.getElementById('btnRecSend');
        recTimerText = document.getElementById('recTimerText');

        textContainer = document.getElementById('textInputContainer');
        ratingContainer = document.getElementById('ratingContainer');
        closeRatingBtn = document.getElementById('closeRating');
        stars = document.querySelectorAll('.star');

        if (btnMic) btnMic.innerHTML = iconMicWhite;
        if (btnCancelAudio) {
            btnCancelAudio.innerHTML = iconTrashWhite;
            btnCancelAudio.style.display = 'none';
        }
        toggleInputButtons();

        if (input) {
            input.addEventListener('input', toggleInputButtons);
            input.addEventListener('blur', function () {
                if (widget && !widget.classList.contains('hidden')) {
                    setTimeout(function () {
                        var activeEl = document.activeElement;
                        var isControlBtn = activeEl && (
                            activeEl.closest('.header-controls') ||
                            activeEl.id === 'btnClose' ||
                            activeEl.id === 'btnClear' ||
                            activeEl.id === 'chatLauncher'
                        );
                        if (!isControlBtn && input && !input.disabled && document.activeElement !== input) {
                            input.focus();
                        }
                    }, 80);
                }
            });
        }

        if (launcher) launcher.addEventListener('click', toggleChat);
        if (btnClose) btnClose.addEventListener('click', toggleChat);
        if (btnClose) btnClose.addEventListener('click', clearChat);
        if (btnClear) btnClear.addEventListener('click', clearChat);
        if (btnHome) btnHome.addEventListener('click', goHome);
        if (btnSend) btnSend.addEventListener('click', function (e) { sendMessage(e); });
        if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
        if (closeRatingBtn) closeRatingBtn.addEventListener('click', function (e) { e.preventDefault(); hideRatingSystem(); });
        if (btnCancelAudio) btnCancelAudio.addEventListener('click', cancelRecording);

        if (btnRecDelete) btnRecDelete.addEventListener('click', cancelRecording);
        if (btnRecSend) btnRecSend.addEventListener('click', stopRecording);

        // --- EVENT LISTENERS MICRÓFONO (con capture:true para evitar bloqueos externos) ---
        if (btnMic) {
            btnMic.addEventListener('mousedown', startPress);
            document.addEventListener('mouseup', endPress, true);
            document.addEventListener('mousemove', handleMouseMove, true);

            btnMic.addEventListener('touchstart', function (e) { e.preventDefault(); startPress(e); }, { passive: false });
            document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
            document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
            btnMic.addEventListener('touchcancel', cancelPress);
        }

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

        if (messages && history) {
            history.forEach(function (m) { renderChatElement(m); });
        }
    }

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
            if (input && !input.disabled) input.focus();
            iniciarTemporizadorInactividad();
        } else {
            widget.classList.add("hidden");
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
        localStorage.removeItem("chat_history");
        localStorage.removeItem("chat_session_id");
        history = [];
        sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        })());
        localStorage.setItem("chat_session_id", sessionId);
        messages.innerHTML = "";
        userRating = 0;
        clearTimeout(inactivityTimer);

        var welcomeMsg = {
            role: 'assistant',
            content: 'Hola soy el Asistente Virtual de la Municipalidad de Las Heras. ¿En qué puedo ayudarte?',
            timestamp: new Date().toISOString()
        };
        renderChatElement(welcomeMsg);
        history.push(welcomeMsg);
        localStorage.setItem("chat_history", JSON.stringify(history));

        iniciarTemporizadorInactividad();
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
            renderChatElement({ role: "assistant", content: "No pudimos procesar tu solicitud. Por favor, intenta enviarla nuevamente." });
            iniciarTemporizadorInactividad();
        }
    }

    function processResponse(data, isMainMenu) {
        var responses = data.paqueteMensajes ? data.paqueteMensajes : (Array.isArray(data) ? data : [data]);

        function renderSecuencial(index) {
            if (index >= responses.length) {
                iniciarTemporizadorInactividad();
                registrarActividadGlobal();
                return;
            }

            var resp = responses[index];
            var mainMenuFlag = (resp.isMainMenu !== undefined) ? resp.isMainMenu : (isMainMenu === true);
            var contenidoOriginal = resp.respuesta_chat || resp.reply || "";
            var botonesFinales = resp.opciones_botones || resp.options || [];

            if (botonesFinales.length === 0 && contenidoOriginal.includes('label')) {
                var arrayMatch = contenidoOriginal.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (arrayMatch) {
                    try {
                        botonesFinales = JSON.parse(arrayMatch[0]);
                        contenidoOriginal = contenidoOriginal.replace(arrayMatch[0], '');
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

            if (index + 1 < responses.length) {
                showTyping();
                setTimeout(() => { stopTyping(); renderSecuencial(index + 1); }, 1500);
            } else {
                iniciarTemporizadorInactividad();
                registrarActividadGlobal();
            }
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