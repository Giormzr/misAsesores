window.socket = io(window.location.origin);
let contactoSeleccionado = null;

function iniciarVideollamada(receptorId) {
    if (confirm("¿Seguro que desea crear una reunión en Meet / Videollamada?")) {
        const idUnico = Math.floor(Math.random() * 1000000);
        const nombreLimpio = usuarioActual.nombre.replace(/\s+/g, '');
        const link = `https://meet.jit.si/Asesoria-${nombreLimpio}-${idUnico}`;
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const texto = `🎥 ¡Hola! He creado una sala para nuestra asesoría. Únete haciendo clic aquí: <br><a href="${link}" target="_blank" class="underline font-bold mt-2 inline-block">ENTRAR A LA REUNIÓN</a>`;

        pintarMensaje(texto, hora, 'der', 0, 'temp-' + idUnico);

        if (window.socket) {
            window.socket.emit('mensaje_privado', {
                remitente_id: usuarioActual.id,
                receptor_id: receptorId,
                texto: texto,
                hora: hora
            });
        }
        window.open(link, '_blank');
    }
}

function pintarMensaje(texto, hora, lado, leido = 0, msgId = '') {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const isRight = lado === 'der';
    const position = isRight ? 'justify-end' : 'justify-start';
    const bg = isRight ? 'bg-[#3b71ca] text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm';
    const vistoHtml = isRight ? `<span id="visto-${msgId}" class="text-[10px] ml-1 ${leido ? 'text-blue-200' : 'opacity-40'} font-bold">✓✓</span>` : '';
    
    const msgHtml = `
        <div class="flex ${position}">
            <div class="${bg} rounded-2xl px-4 py-2 max-w-xs shadow-sm">
                <p class="break-words text-sm">${texto}</p>
                <div class="flex items-center justify-end mt-1">
                    <span class="text-[9px] opacity-70">${hora}</span>
                    ${vistoHtml}
                </div>
            </div>
        </div>`;
    chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function abrirChat(id, nombre) {
    contactoSeleccionado = { id, nombre };
    document.getElementById('chat-title').innerText = nombre;
    const initialDiv = document.getElementById('chat-initial');
    if(initialDiv) initialDiv.innerText = nombre.charAt(0);
    document.getElementById('chat-messages').innerHTML = ''; 
    
    const contenedorBoton = document.getElementById('contenedor-boton-meet');
    if (contenedorBoton) {
        if (usuarioActual && usuarioActual.rol === 'Asesor') {
            contenedorBoton.innerHTML = `<button onclick="iniciarVideollamada(${id})" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors shadow-sm ml-auto"><svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>Crear Meet</button>`;
        } else {
            contenedorBoton.innerHTML = '';
        }
    }

    try {
        await fetch('/api/mensajes/marcar-leidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ miId: usuarioActual.id, suId: id })
        });
        
        if(window.actualizarNotificaciones) window.actualizarNotificaciones();

        const response = await fetch(`/api/mensajes/historial/${usuarioActual.id}/${id}`);
        const historial = await response.json();
        
        historial.forEach(msg => {
            const lado = msg.remitente_id === usuarioActual.id ? 'der' : 'izq';
            pintarMensaje(msg.texto, msg.hora, lado, msg.leido, msg.id);
        });

        navigate(null, 'view-chat');
    } catch (e) {
        console.error("Error al cargar chat:", e);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById('chat-input');
    const chatButton = document.getElementById('chat-send-btn');

    window.socket.on('recibir_mensaje', (data) => {
        const isChatOpen = contactoSeleccionado && data.remitente_id === contactoSeleccionado.id && document.getElementById('view-chat').classList.contains('hidden') === false;
        if(isChatOpen) {
            pintarMensaje(data.texto, data.hora, 'izq');
            fetch('/api/mensajes/marcar-leidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ miId: usuarioActual.id, suId: data.remitente_id })
            });
        } else {
            if(window.actualizarNotificaciones) window.actualizarNotificaciones();
        }
    });

    window.socket.on('visto_confirmado', (data) => {
        if (contactoSeleccionado && data.por === contactoSeleccionado.id) {
            document.querySelectorAll('[id^="visto-"]').forEach(el => {
                el.classList.remove('opacity-40');
                el.classList.add('text-blue-200');
            });
        }
    });

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text !== "" && usuarioActual && contactoSeleccionado) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
            pintarMensaje(text, time, 'der', 0, 'new');
            window.socket.emit('mensaje_privado', {
                remitente_id: usuarioActual.id,
                receptor_id: contactoSeleccionado.id,
                texto: text,
                hora: time
            });
            chatInput.value = "";
        }
    }

    if(chatButton) chatButton.addEventListener('click', sendMessage);
    if(chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
});