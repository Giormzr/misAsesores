require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== SUPABASE =====
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ===== TEMAS PARA BÚSQUEDA AUTOMÁTICA =====
const TEMAS_A_BUSCAR = [
    { asig: "Química", tema: "Videojuego Educativo", query: "MANUAL_GAME", titulo: "ChemistryX Resintetizado", url: "https://chemistryx.itch.io/chemistryx-resintetizado", canal: "ChemistryX Team" },
    { asig: "Matemáticas", tema: "Álgebra", query: "Suma y resta de números enteros matematicas" },
    { asig: "Matemáticas", tema: "Álgebra", query: "Jerarquia de operaciones daniel carreon" },
    { asig: "Matemáticas", tema: "Álgebra", query: "Ecuaciones de primer grado profe alex" },
    { asig: "Matemáticas", tema: "Álgebra", query: "Sistemas de ecuaciones 2x2 sustitucion" },
    { asig: "Matemáticas", tema: "Geometría y Trigonometría", query: "Teorema de pitagoras facil" },
    { asig: "Matemáticas", tema: "Geometría y Trigonometría", query: "Razones trigonometricas seno coseno" },
    { asig: "Matemáticas", tema: "Geometría y Trigonometría", query: "Ley de senos" },
    { asig: "Matemáticas", tema: "Geometría y Trigonometría", query: "Ley de cosenos" },
    { asig: "Matemáticas", tema: "Cálculo", query: "Derivadas desde cero basico" },
    { asig: "Matemáticas", tema: "Cálculo", query: "Integrales basicas" },
    { asig: "Submódulo de Programación", tema: "Backend", query: "Que es Node JS y Express" },
    { asig: "Submódulo de Programación", tema: "Backend", query: "Que es una API RESTful" },
    { asig: "Submódulo de Programación", tema: "Backend", query: "Curso basico bases de datos SQL" },
    { asig: "Submódulo de Programación", tema: "Backend", query: "Introduccion a Fastify node" },
    { asig: "Submódulo de Programación", tema: "C#", query: "Programacion orientada a objetos en C#" },
    { asig: "Submódulo de Programación", tema: "C#", query: "C# desde cero" },
    { asig: "Submódulo de Programación", tema: "Unity y 3D", query: "Introduccion a Unity 3D" },
    { asig: "Submódulo de Programación", tema: "Unity y 3D", query: "Movimiento de personaje 2D Unity" },
    { asig: "Submódulo de Programación", tema: "Unity y 3D", query: "Interfaz de Blender basico" },
    { asig: "Submódulo de Programación", tema: "Unity y 3D", query: "Exportar FBX a Unity" },
    { asig: "Química", tema: "Conceptos Básicos", query: "Modelos atomicos quimica" },
    { asig: "Química", tema: "Conceptos Básicos", query: "Configuracion electronica explicacion" },
    { asig: "Química", tema: "Conceptos Básicos", query: "Tabla periodica facil" },
    { asig: "Química", tema: "Conceptos Básicos", query: "Enlaces quimicos ionico covalente" },
    { asig: "Química", tema: "Nomenclatura", query: "Nomenclatura de oxidos" },
    { asig: "Química", tema: "Nomenclatura", query: "Nomenclatura de acidos hidracidos" },
    { asig: "Química", tema: "Estequiometría", query: "Que es un mol quimica" },
    { asig: "Química", tema: "Estequiometría", query: "Balanceo de ecuaciones por tanteo" },
    { asig: "Química", tema: "Estequiometría", query: "Reactivo limitante" },
    { asig: "Química", tema: "Estequiometría", query: "Calculos estequiometricos masa masa" },
    { asig: "Física", tema: "Cinemática", query: "Conversion de unidades fisica" },
    { asig: "Física", tema: "Cinemática", query: "Vectores suma y componentes" },
    { asig: "Física", tema: "Cinemática", query: "Movimiento Rectilineo Uniforme MRU" },
    { asig: "Física", tema: "Cinemática", query: "Caida libre y tiro vertical" },
    { asig: "Física", tema: "Dinámica", query: "Leyes de Newton" },
    { asig: "Física", tema: "Dinámica", query: "Fuerza de friccion" },
    { asig: "Física", tema: "Dinámica", query: "Energia cinetica y potencial" },
    { asig: "Física", tema: "Electricidad", query: "Ley de Coulomb fisica" },
    { asig: "Física", tema: "Electricidad", query: "Ley de Ohm" },
    { asig: "Física", tema: "Electricidad", query: "Circuitos en serie y paralelo" },
    { asig: "Biología", tema: "Célula", query: "Diferencia celula animal y vegetal" },
    { asig: "Biología", tema: "Célula", query: "Organelos celulares funciones" },
    { asig: "Biología", tema: "Célula", query: "Mitosis y meiosis" },
    { asig: "Biología", tema: "Célula", query: "Fotosintesis explicacion" },
    { asig: "Biología", tema: "Genética", query: "Leyes de Mendel biologia" },
    { asig: "Biología", tema: "Genética", query: "ADN y ARN diferencias" },
    { asig: "Biología", tema: "Genética", query: "Cuadros de Punnett" },
    { asig: "Biología", tema: "Ecología", query: "Teoria de la evolucion Darwin" },
    { asig: "Biología", tema: "Ecología", query: "Cadenas troficas" },
    { asig: "Biología", tema: "Ecología", query: "Ciclos biogeoquimicos" },
    { asig: "Ciencias Sociales", tema: "Historia", query: "Culturas mesoamericanas" },
    { asig: "Ciencias Sociales", tema: "Historia", query: "Conquista de Mexico resumen" },
    { asig: "Ciencias Sociales", tema: "Historia", query: "Independencia de Mexico" },
    { asig: "Ciencias Sociales", tema: "Historia", query: "Revolucion Mexicana resumen" },
    { asig: "Ciencias Sociales", tema: "Economía", query: "Capitalismo y socialismo" },
    { asig: "Ciencias Sociales", tema: "Economía", query: "Globalizacion" },
    { asig: "Ciencias Sociales", tema: "Economía", query: "Sectores economicos" },
    { asig: "Ciencias Sociales", tema: "Investigación", query: "Metodo cientifico ciencias sociales" },
    { asig: "Ciencias Sociales", tema: "Investigación", query: "Planteamiento del problema" },
    { asig: "Ciencias Sociales", tema: "Investigación", query: "Normas APA 7ma edicion" },
    { asig: "Humanidades", tema: "Filosofía", query: "Que es la filosofia" },
    { asig: "Humanidades", tema: "Filosofía", query: "Socrates Platon y Aristoteles" },
    { asig: "Humanidades", tema: "Filosofía", query: "Mito de la caverna" },
    { asig: "Humanidades", tema: "Ética", query: "Etica y moral diferencias" },
    { asig: "Humanidades", tema: "Ética", query: "El utilitarismo" },
    { asig: "Humanidades", tema: "Lógica", query: "Logica matematica" },
    { asig: "Humanidades", tema: "Lógica", query: "Premisas y conclusiones" },
    { asig: "Humanidades", tema: "Lógica", query: "Falacias argumentativas" },
    { asig: "Humanidades", tema: "Lógica", query: "Tablas de verdad" },
    { asig: "Humanidades", tema: "Ética", query: "Que es la bioetica" }
,
{ 
        asig: "Eventos", 
        tema: "Congresos", 
        query: "MANUAL_EVENT", 
        titulo: "Congreso: Vocación que Impacta", 
        url: "/img/evento.jpg", // Aquí pones la ruta a la imagen que guardaste
        canal: "Club Rotaract Veracruz",
        tipo: "imagen", // Flag para el frontend
        link_externo: "https://www.instagram.com/club_rotaract_hv"
    }
];

// ===== SIGNUP =====
app.post('/api/signup', async (req, res) => {
    try {
        const { correo, password, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;
        const pass = bcrypt.hashSync(password, 10);
        const { data, error } = await supabase.from('usuarios').insert([{
            correo, password: pass, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario
        }]).select();
        if (error) throw error;
        res.json({ id: data[0].id, nombre, rol });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== LOGIN =====
app.post('/api/login', async (req, res) => {
    try {
        const { data, error } = await supabase.from('usuarios').select('*').eq('correo', req.body.correo).single();
        if (error || !data) return res.status(401).json({ success: false });
        if (bcrypt.compareSync(req.body.password, data.password)) {
            delete data.password;
            res.json({ success: true, usuario: data });
        } else {
            res.status(401).json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ACTUALIZAR USUARIO =====
app.put('/api/usuarios/actualizar', async (req, res) => {
    try {
        const { id, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;
        const { error } = await supabase.from('usuarios').update({ nombre, turno, semestre, especialidad, rol, materias, horario }).eq('id', id);
        if (error) throw error;
        const { data } = await supabase.from('usuarios').select('*').eq('id', id).single();
        delete data.password;
        res.json({ success: true, usuario: data });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== ELIMINAR CUENTA =====
app.delete('/api/usuario/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await supabase.from('mensajes').delete().or(`remitente_id.eq.${id},receptor_id.eq.${id}`);
        await supabase.from('usuarios').delete().eq('id', id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== ASESORES =====
app.get('/api/asesores', async (req, res) => {
    const { data } = await supabase.from('usuarios').select('id, nombre, turno, semestre, especialidad, materias').eq('rol', 'Asesor');
    res.json(data || []);
});

// ===== PERFIL USUARIO =====
app.get('/api/usuario/:id', async (req, res) => {
    const { data } = await supabase.from('usuarios').select('*').eq('id', req.params.id).single();
    res.json(data);
});

// ===== HISTORIAL DE CHAT =====
app.get('/api/mensajes/historial/:miId/:suId', async (req, res) => {
    const { data } = await supabase.from('mensajes').select('*')
        .or(`and(remitente_id.eq.${req.params.miId},receptor_id.eq.${req.params.suId}),and(remitente_id.eq.${req.params.suId},receptor_id.eq.${req.params.miId})`)
        .order('id', { ascending: true });
    res.json(data || []);
});

// ===== CONTACTOS BANDEJA =====
app.get('/api/mensajes/contactos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('mensajes').select('remitente_id, receptor_id').or(`remitente_id.eq.${id},receptor_id.eq.${id}`);
        if (error) throw error;
        const ids = [...new Set(data.map(m => m.remitente_id == id ? m.receptor_id : m.remitente_id))];
        const { data: contactos } = await supabase.from('usuarios').select('id, nombre, rol, especialidad').in('id', ids);
        res.json(contactos || []);
    } catch (err) { res.status(500).json([]); }
});

// ===== RECURSOS (LÓGICA AUTOMÁTICA) =====
app.get('/api/recursos', async (req, res) => {
    try {
        let { data: dbRecursos } = await supabase.from('recursos').select('*');

        if (!dbRecursos || dbRecursos.length === 0) {
            console.log("Primer acceso: Registrando temas en la DB...");
            const insertList = [];
            for (const item of TEMAS_A_BUSCAR) {
                // Se agregan tanto MANUAL_GAME como MANUAL_EVENT
                if (item.query === "MANUAL_GAME" || item.query === "MANUAL_EVENT") {
                    insertList.push({ 
                        asignatura: item.asig, 
                        tema: item.tema, 
                        titulo: item.titulo, 
                        canal: item.canal, 
                        url: item.url,
                        tipo: item.tipo || "video",
                        link_externo: item.link_externo || item.url
                    });
                } else {
                    try {
                        const yt = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                            params: { part: 'snippet', maxResults: 1, q: item.query, type: 'video', key: process.env.YOUTUBE_API_KEY }
                        });
                        if (yt.data.items.length > 0) {
                            const v = yt.data.items[0];
                            insertList.push({ 
                                asignatura: item.asig, 
                                tema: item.tema, 
                                titulo: v.snippet.title, 
                                canal: v.snippet.channelTitle, 
                                url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
                                tipo: "video",
                                link_externo: `https://www.youtube.com/watch?v=${v.id.videoId}`
                            });
                        }
                    } catch (e) { console.error("Error YT:", item.query); }
                }
            }
            const { data: inserted } = await supabase.from('recursos').insert(insertList).select();
            dbRecursos = inserted;
        }

        // ¡ESTA LÍNEA FALTABA!
        const formatted = {};

        dbRecursos.forEach(r => {
            if (!formatted[r.asignatura]) formatted[r.asignatura] = {};
            if (!formatted[r.asignatura][r.tema]) formatted[r.asignatura][r.tema] = [];
            formatted[r.asignatura][r.tema].push({ 
                titulo: r.titulo, 
                canal: r.canal, 
                url: r.url,
                tipo: r.tipo || "video", // Por defecto es video
                link_externo: r.link_externo || r.url
            });
        });

        // ¡ESTA LÍNEA TAMBIÉN FALTABA!
        res.json(formatted);

    // ¡AQUÍ ESTÁ EL CATCH MODIFICADO!
    } catch (err) { 
        console.error("ERROR CRÍTICO EN RECURSOS:", err);
        res.status(500).json({ 
            mensaje: "El servidor falló", 
            error_real: err.message,
            detalles: err
        }); 
    }
});

app.get('/api/mensajes/no-leidos/:id', (req, res) => res.json({ total: 0 }));

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
    socket.on('unirse', (userId) => socket.join(userId.toString()));
    socket.on('mensaje_privado', async (data) => {
        try {
            const { data: ins, error } = await supabase.from('mensajes').insert([data]).select();
            if (!error && ins) {
                data.id = ins[0].id;
                socket.to(data.receptor_id.toString()).emit('recibir_mensaje', data);
            }
        } catch (e) {}
    });
});

server.listen(3000, () => console.log("Servidor MisAsesores corriendo en puerto 3000"));