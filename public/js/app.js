let usuarioActual = null;
let RECURSOS_DB = {};

function formatearLinkYouTube(url) {
    let videoId = "";
    if (url.includes("embed/")) return url;
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('hidden');
}

// ======================== RECURSOS ========================

async function cargarRecursos() {
    const response = await fetch('/api/recursos');
    RECURSOS_DB = await response.json();
    const grid = document.getElementById('recursos-grid');
    grid.innerHTML = '';

    if (Object.keys(RECURSOS_DB).length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-500 py-10">Aún no hay recursos guardados en la base de datos.</p>';
        navigate(null, 'view-recursos');
        return;
    }

    Object.keys(RECURSOS_DB).forEach(asignatura => {
        let totalVideos = 0;
        const temas = RECURSOS_DB[asignatura] || {};
        Object.keys(temas).forEach(tema => { totalVideos += temas[tema].length; });
        if (asignatura === "Química" || asignatura === "Submódulo de Programación") totalVideos += 1;

        grid.innerHTML += `
            <div onclick="abrirVideos('${asignatura}')" class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-[#3b71ca] cursor-pointer transition-colors text-center">
                <div class="w-16 h-16 bg-blue-50 text-[#3b71ca] rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <h3 class="font-bold text-lg text-slate-800">${asignatura}</h3>
                <p class="text-sm text-slate-500 mt-1">${totalVideos} recursos disponibles</p>
            </div>
        `;
    });

    navigate(null, 'view-recursos');
}
function abrirVideos(asignatura) {
    document.getElementById('videos-title').innerText = `Recursos: ${asignatura}`;
    const list = document.getElementById('videos-list');
    list.innerHTML = '';

    // --- SECCIONES DESTACADAS (Hardcoded) ---
    if (asignatura === "Química") {
        list.innerHTML += `
            <h2 class="text-2xl font-bold text-[#3b71ca] mt-8 mb-4 border-b border-slate-200 pb-2">Destacado: Videojuego Educativo</h2>
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 border-none rounded-xl p-6 shadow-lg flex flex-col md:flex-row gap-6 mb-8 text-white transform hover:scale-[1.01] transition-transform cursor-pointer" onclick="window.open('https://chemistryx.itch.io/chemistryx-resintetizado', '_blank')">
                <div class="w-full md:w-72 h-40 bg-white/10 rounded-lg flex flex-col items-center justify-center border border-white/20">
                    <span class="text-4xl mb-2">🎮</span>
                    <span class="font-bold tracking-widest text-xs uppercase">Juego Interactivo</span>
                </div>
                <div class="flex-1 flex flex-col justify-center">
                    <span class="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Recurso Oficial</span>
                    <h3 class="font-black text-2xl mb-2">ChemistryX Resintetizado</h3>
                    <p class="text-blue-100 text-sm mb-5">Aprende química de forma divertida explorando el mundo de Atomy en esta versión resintetizada.</p>
                    <button class="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg w-fit shadow-md">JUGAR EN ITCH.IO</button>
                </div>
            </div>
        `;
    } else if (asignatura === "Submódulo de Programación") {
        list.innerHTML += `
            <h2 class="text-2xl font-bold text-[#3b71ca] mt-8 mb-4 border-b border-slate-200 pb-2">Destacado: Curso de Godot</h2>
            <div class="bg-gradient-to-r from-emerald-600 to-teal-700 border-none rounded-xl p-6 shadow-lg flex flex-col md:flex-row gap-6 mb-8 text-white transform hover:scale-[1.01] transition-transform cursor-pointer" onclick="window.open('https://gdquest.itch.io/learn-godot-gdscript', '_blank')">
                <div class="w-full md:w-72 h-40 bg-white/10 rounded-lg flex flex-col items-center justify-center border border-white/20">
                    <span class="text-4xl mb-2">🤖</span>
                    <span class="font-bold tracking-widest text-xs uppercase">Curso Interactivo</span>
                </div>
                <div class="flex-1 flex flex-col justify-center">
                    <span class="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Recurso Oficial</span>
                    <h3 class="font-black text-2xl mb-2">Learn Godot GDScript From Zero</h3>
                    <p class="text-emerald-100 text-sm mb-5">Domina las bases de la programación de videojuegos con este tutorial interactivo de GDQuest.</p>
                    <button class="bg-white text-emerald-700 font-bold py-3 px-6 rounded-lg w-fit shadow-md">EMPEZAR CURSO</button>
                </div>
            </div>
        `;
    }

    // --- CARGA DINÁMICA DESDE RECURSOS_DB ---
    const temas = RECURSOS_DB[asignatura] || {};
    Object.keys(temas).forEach(temaNombre => {
        list.innerHTML += `<h2 class="text-2xl font-bold text-[#3b71ca] mt-8 mb-4 border-b border-slate-200 pb-2">${temaNombre}</h2>`;
        
        temas[temaNombre].forEach(recurso => {
            // Detectar si es imagen o video
            const esImagen = recurso.tipo === "imagen" || (recurso.url && recurso.url.match(/\.(jpeg|jpg|gif|png)$/) != null);
            
            let visualizadorHTML = "";
            let footerHTML = "";

            if (esImagen) {
                // Renderizado para el Cartel del Evento
                visualizadorHTML = `
                    <a href="${recurso.link_externo || recurso.url}" target="_blank" class="block h-full w-full relative group">
                        <img src="${recurso.url}" class="w-full h-full object-cover" alt="${recurso.titulo}">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="text-white text-xs font-bold bg-[#3b71ca] px-3 py-1 rounded-full shadow-lg">Ver en Instagram</span>
                        </div>
                    </a>`;
                footerHTML = `<p class="text-[11px] text-slate-500 text-center px-2 mt-1">📍 Haz clic en la imagen para ver detalles</p>`;
            } else {
                // Renderizado para Videos de Apoyo
                const linkEmbed = formatearLinkYouTube(recurso.url);
                const linkNormal = recurso.url.includes("embed/") ? recurso.url.replace("embed/", "watch?v=") : recurso.url;
                
                visualizadorHTML = `
                    <iframe class="w-full h-full" src="${linkEmbed}" title="${recurso.titulo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                
                footerHTML = `
                    <p class="text-[11px] text-slate-500 text-center px-2">
                        ¿Problemas con el video? <br>
                        <a href="${linkNormal}" target="_blank" class="text-[#3b71ca] hover:text-blue-800 font-bold underline">Ver en YouTube</a>
                    </p>`;
            }

            list.innerHTML += `
                <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow mb-3">
                    <div class="w-full md:w-72 flex-shrink-0 flex flex-col">
                        <div class="h-40 bg-slate-100 rounded-lg overflow-hidden mb-2 shadow-sm border border-slate-200">
                            ${visualizadorHTML}
                        </div>
                        ${footerHTML}
                    </div>
                    <div class="flex-1 flex flex-col justify-center py-2">
                        <span class="text-xs font-bold ${esImagen ? 'text-pink-600' : 'text-[#3b71ca]'} uppercase tracking-wider mb-1">
                            ${esImagen ? 'Evento Presencial' : 'Tutorial de Apoyo'}
                        </span>
                        <h3 class="font-bold text-xl text-slate-800 mb-2">${recurso.titulo}</h3>
                        <p class="text-sm text-slate-500 mb-4 flex items-center italic">
                            ${esImagen ? '📍 Veracruz, Ver.' : 'Canal: ' + recurso.canal}
                        </p>
                        ${esImagen ? `
                        <div class="flex items-center text-xs font-bold text-slate-700 bg-slate-100 w-fit px-3 py-1.5 rounded-md">
                            📅 18 DE ABRIL - CLUB ROTARIO
                        </div>` : ''}
                    </div>
                </div>
            `;
        });
    });

    navigate(null, 'view-videos');
}

// ======================== NAVEGACIÓN ========================

function navigate(event, targetViewId) {
    if (event) event.preventDefault();
    document.querySelectorAll('body > div[id^="view-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(targetViewId).classList.remove('hidden');
}

function cerrarSesion() {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
        localStorage.removeItem('usuario_misasesores');
        usuarioActual = null;
        navigate(null, 'view-login');
    }
}

// ======================== EDITAR PERFIL ========================

function toggleAsesorFields() {
    const rol = document.getElementById('role-select').value;
    const fields = document.getElementById('asesor-fields');
    if (rol === 'Asesor') {
        fields.classList.remove('hidden');
        if (typeof dibujarTablaRegistro === 'function') {
            dibujarTablaRegistro(document.getElementById('reg-turno').value);
        }
    } else {
        fields.classList.add('hidden');
    }
}

function toggleEditAsesorFields() {
    const rol = document.getElementById('edit-role-select').value;
    const fields = document.getElementById('edit-asesor-fields');
    if (rol === 'Asesor') {
        fields.classList.remove('hidden');
        if (typeof dibujarTablaRegistro === 'function') {
            dibujarTablaRegistro(document.getElementById('edit-turno').value, 'edit-schedule-body', 'edit-check-');
        }
    } else {
        fields.classList.add('hidden');
    }
}

function prepararEdicion() {
    document.getElementById('edit-nombre').value = usuarioActual.nombre;
    document.getElementById('edit-turno').value = usuarioActual.turno;
    document.getElementById('edit-semestre').value = usuarioActual.semestre;
    document.getElementById('edit-especialidad').value = usuarioActual.especialidad;
    document.getElementById('edit-role-select').value = usuarioActual.rol;

    // Muestra u oculta campos de asesor según el rol actual
    toggleEditAsesorFields();

    if (usuarioActual.rol === 'Asesor') {
        if (typeof dibujarTablaRegistro === 'function') {
            dibujarTablaRegistro(usuarioActual.turno, 'edit-schedule-body', 'edit-check-');
        }
        const materias = usuarioActual.materias ? usuarioActual.materias.split(', ') : [];
        document.querySelectorAll('.edit-materia-checkbox').forEach(cb => {
            cb.checked = materias.includes(cb.value);
        });
        try {
            const horario = JSON.parse(usuarioActual.horario || "[]");
            horario.forEach(h => {
                const cb = document.getElementById(`edit-check-${h.r}-${h.c}`);
                if (cb) cb.checked = true;
            });
        } catch (e) {}
    }

    navigate(null, 'view-edit-profile');
}

async function borrarCuenta() {
    if (!confirm("⚠️ ¿Estás seguro? Esto borrará tu cuenta y todos tus mensajes para siempre. Esta acción no se puede deshacer.")) return;
    if (!confirm("¿Confirmas que quieres borrar tu cuenta definitivamente?")) return;

    const response = await fetch(`/api/usuario/${usuarioActual.id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
        localStorage.removeItem('usuario_misasesores');
        usuarioActual = null;
        alert("Tu cuenta ha sido eliminada.");
        navigate(null, 'view-login');
    } else {
        alert("Error al borrar la cuenta.");
    }
}

document.getElementById('form-edit-profile').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rolEditado = document.getElementById('edit-role-select').value;
    let materias = [];
    let horario = [];

    if (rolEditado === 'Asesor') {
        document.querySelectorAll('.edit-materia-checkbox:checked').forEach(cb => materias.push(cb.value));
        document.querySelectorAll('[id^="edit-check-"]:checked').forEach(cb => {
            const p = cb.id.split('-');
            horario.push({ r: parseInt(p[2]), c: parseInt(p[3]) });
        });
    }

    const response = await fetch('/api/usuarios/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: usuarioActual.id,
            nombre: document.getElementById('edit-nombre').value,
            turno: document.getElementById('edit-turno').value,
            semestre: document.getElementById('edit-semestre').value,
            especialidad: document.getElementById('edit-especialidad').value,
            rol: rolEditado,
            materias: materias.join(', '),
            horario: JSON.stringify(horario)
        })
    });

    const result = await response.json();
    if (result.success) {
        usuarioActual = result.usuario;
        localStorage.setItem('usuario_misasesores', JSON.stringify(usuarioActual));
        document.getElementById('user-name-display').innerText = `(${usuarioActual.nombre})`;
        alert("Perfil actualizado correctamente");
        iniciarApp();
    } else {
        alert(result.error);
    }
});

// ======================== INICIO DE APP ========================

document.addEventListener("DOMContentLoaded", () => {
    const usuarioGuardado = localStorage.getItem('usuario_misasesores');
    if (usuarioGuardado) {
        usuarioActual = JSON.parse(usuarioGuardado);
        document.getElementById('user-name-display').innerText = `(${usuarioActual.nombre})`;
        iniciarApp();
    } else {
        navigate(null, 'view-login');
    }

    const selectTurno = document.getElementById('reg-turno');
    if (selectTurno) {
        selectTurno.addEventListener('change', (e) => {
            if (typeof dibujarTablaRegistro === 'function') {
                dibujarTablaRegistro(e.target.value);
            }
        });
    }

    const editSelectTurno = document.getElementById('edit-turno');
    if (editSelectTurno) {
        editSelectTurno.addEventListener('change', (e) => {
            if (typeof dibujarTablaRegistro === 'function') {
                dibujarTablaRegistro(e.target.value, 'edit-schedule-body', 'edit-check-');
            }
        });
    }
});

function iniciarApp() {
    cargarAsesores();
    if (window.actualizarNotificaciones) window.actualizarNotificaciones();
    navigate(null, 'view-dashboard');
    if (window.socket) window.socket.emit('unirse', usuarioActual.id);
}

// ======================== LOGIN ========================

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            correo: document.getElementById('login-correo').value,
            password: document.getElementById('login-password').value
        })
    });
    const result = await response.json();
    if (result.success) {
        usuarioActual = result.usuario;
        localStorage.setItem('usuario_misasesores', JSON.stringify(usuarioActual));
        document.getElementById('user-name-display').innerText = `(${usuarioActual.nombre})`;
        e.target.reset();
        iniciarApp();
    } else {
        alert(result.error);
    }
});

// ======================== SIGNUP ========================

document.getElementById('form-signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rol = document.getElementById('role-select').value;
    let materiasSeleccionadas = [];
    let horarioSeleccionado = [];

    if (rol === 'Asesor') {
        document.querySelectorAll('.materia-checkbox:checked').forEach(cb => materiasSeleccionadas.push(cb.value));
        document.querySelectorAll('.schedule-checkbox:checked').forEach(cb => {
            const parts = cb.id.split('-');
            horarioSeleccionado.push({ r: parseInt(parts[1]), c: parseInt(parts[2]) });
        });
    }

    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            correo: document.getElementById('reg-correo').value,
            password: document.getElementById('reg-password').value,
            no_control: document.getElementById('reg-nocontrol').value,
            curp: document.getElementById('reg-curp').value,
            nombre: document.getElementById('reg-nombre').value,
            turno: document.getElementById('reg-turno').value,
            semestre: document.getElementById('reg-semestre').value,
            especialidad: document.getElementById('reg-especialidad').value,
            rol: rol,
            materias: materiasSeleccionadas.join(', '),
            horario: JSON.stringify(horarioSeleccionado)
        })
    });

    const result = await response.json();
    if (result.id) {
        alert("Cuenta creada. Inicia sesión.");
        e.target.reset();
        navigate(null, 'view-login');
    } else {
        alert(result.error);
    }
});

// ======================== ASESORES ========================

async function cargarAsesores() {
    const response = await fetch('/api/asesores');
    const asesores = await response.json();
    const grid = document.getElementById('asesores-grid');
    grid.innerHTML = '';
    let hayOtros = false;

    asesores.forEach(asesor => {
        if (usuarioActual && asesor.id === usuarioActual.id) return;
        hayOtros = true;
        grid.innerHTML += `
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-12 h-12 rounded-full bg-blue-50 text-[#3b71ca] flex items-center justify-center font-bold text-xl">${asesor.nombre.charAt(0)}</div>
                    <div>
                        <h3 class="font-bold text-slate-900">${asesor.nombre}</h3>
                        <p class="text-xs text-slate-500">${asesor.especialidad} • ${asesor.turno}</p>
                    </div>
                </div>
                <div class="mb-4 text-sm text-slate-600">Semestre ${asesor.semestre}</div>
                <div class="mb-4 truncate text-xs">
                    <span class="inline-block bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">${asesor.materias || 'Sin materias'}</span>
                </div>
                <button onclick="verPerfilCompleto(${asesor.id})" class="w-full border hover:bg-slate-50 font-medium py-2 rounded-lg text-sm">Ver perfil</button>
            </div>
        `;
    });

    if (!hayOtros) grid.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">No hay asesores disponibles.</p>';
}

async function verPerfilCompleto(idAsesor) {
    try {
        const response = await fetch(`/api/usuario/${idAsesor}`);
        const asesor = await response.json();

        if (!asesor) { alert("No se encontró la información del asesor."); return; }

        const elInitial = document.getElementById('prof-initial');
        if (elInitial) elInitial.innerText = asesor.nombre ? asesor.nombre.charAt(0) : '?';

        const elNombre = document.getElementById('prof-nombre');
        if (elNombre) elNombre.innerText = asesor.nombre || 'Sin nombre';

        const elTurno = document.getElementById('prof-turno');
        if (elTurno) elTurno.innerText = asesor.turno || '-';

        const elSemestre = document.getElementById('prof-semestre');
        if (elSemestre) elSemestre.innerText = asesor.semestre || '-';

        const elEspecialidad = document.getElementById('prof-especialidad');
        if (elEspecialidad) elEspecialidad.innerText = asesor.especialidad || '-';

        const mDiv = document.getElementById('prof-materias');
        if (mDiv) {
            mDiv.innerHTML = '';
            if (asesor.materias) {
                asesor.materias.split(',').forEach(mat => {
                    mDiv.innerHTML += `<span class="bg-blue-50 text-[#3b71ca] border border-blue-100 text-sm px-3 py-1 rounded-md">${mat.trim()}</span>`;
                });
            }
        }

        try {
            let horarioParseado = [];
            if (asesor.horario && asesor.horario !== "undefined" && asesor.horario !== "null") {
                horarioParseado = JSON.parse(asesor.horario);
            }
            if (window.dibujarHorarioPerfil) {
                window.dibujarHorarioPerfil(horarioParseado, asesor.turno);
            }
        } catch (errHorario) {
            console.warn("Detalle en horario:", errHorario);
        }

        const btnMensaje = document.getElementById('btn-mandar-mensaje');
        if (btnMensaje) {
            btnMensaje.onclick = () => {
                if (typeof abrirChat === 'function') abrirChat(asesor.id, asesor.nombre);
            };
        }

        navigate(null, 'view-profile');

    } catch (e) {
        console.error("Error crítico:", e);
    }
}

// ======================== BANDEJA / NOTIFICACIONES ========================

async function cargarBandeja() {
    const response = await fetch(`/api/mensajes/contactos/${usuarioActual.id}`);
    const contactos = await response.json();
    const list = document.getElementById('inbox-list');
    list.innerHTML = contactos.length === 0 ? '<p class="text-center text-gray-500 py-8">Aún no tienes mensajes.</p>' : '';
    contactos.forEach(c => {
        list.innerHTML += `
            <div onclick="abrirChat(${c.id}, '${c.nombre}')" class="bg-white border p-4 rounded-xl shadow-sm cursor-pointer hover:border-[#3b71ca] flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full bg-blue-50 text-[#3b71ca] flex items-center justify-center font-bold">${c.nombre.charAt(0)}</div>
                    <div><h3 class="font-bold">${c.nombre}</h3><p class="text-xs text-slate-500">${c.rol}</p></div>
                </div>
                <span class="text-[#3b71ca] font-bold">→</span>
            </div>
        `;
    });
    navigate(null, 'view-inbox');
}

async function actualizarNotificaciones() {
    if (!usuarioActual) return;
    try {
        const response = await fetch(`/api/mensajes/no-leidos/${usuarioActual.id}`);
        const data = await response.json();
        const badge = document.getElementById('badge-notif');
        if (badge) {
            if (data.total > 0) { badge.innerText = data.total; badge.classList.remove('hidden'); }
            else badge.classList.add('hidden');
        }
    } catch (e) {}
}
window.actualizarNotificaciones = actualizarNotificaciones;

function mostrarConfidencialidad() {
    alert("El equipo de MisAsesores se compromete a bajo ninguna circunstancia revelar datos de los usuarios.");
}

function mostrarAdvertencia() {
    alert("Crear perfiles falsos o suplantar identidades es ilegal y puede ser penado.");
}