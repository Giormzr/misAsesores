require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const fs = require('fs');
if (!fs.existsSync('/data/database.sqlite')) {
    fs.copyFileSync('./database.sqlite', '/data/database.sqlite');
}
const db = new sqlite3.Database('/data/database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, correo TEXT UNIQUE, password TEXT, no_control TEXT, curp TEXT, nombre TEXT, turno TEXT, semestre INTEGER, especialidad TEXT, rol TEXT, materias TEXT, horario TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS mensajes (id INTEGER PRIMARY KEY AUTOINCREMENT, remitente_id INTEGER, receptor_id INTEGER, texto TEXT, hora TEXT, leido INTEGER DEFAULT 0, FOREIGN KEY(remitente_id) REFERENCES usuarios(id), FOREIGN KEY(receptor_id) REFERENCES usuarios(id))`);
    db.run(`CREATE TABLE IF NOT EXISTS recursos (id INTEGER PRIMARY KEY AUTOINCREMENT, asignatura TEXT, tema TEXT, titulo TEXT, url TEXT, canal TEXT)`);

    db.get(`SELECT COUNT(*) as total FROM recursos`, async (err, row) => {
        if (row && row.total === 0) {
            const API_KEY = process.env.YOUTUBE_API_KEY;
            if (!API_KEY) return console.log("Falta YOUTUBE_API_KEY");

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
            ];

            for (let item of TEMAS_A_BUSCAR) {
                if (item.query === "MANUAL_GAME") {
                    db.run(`INSERT INTO recursos (asignatura, tema, titulo, url, canal) VALUES (?, ?, ?, ?, ?)`, 
                        [item.asig, item.tema, item.titulo, item.url, item.canal]);
                    continue;
                }
                try {
                    const q = encodeURIComponent(item.query);
                    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${q}&part=snippet&type=video&maxResults=1&videoEmbeddable=true&key=${API_KEY}`);
                    const data = await res.json();
                    if (data.items && data.items.length > 0) {
                        const v = data.items[0];
                        db.run(`INSERT INTO recursos (asignatura, tema, titulo, url, canal) VALUES (?, ?, ?, ?, ?)`, 
                            [item.asig, item.tema, v.snippet.title, `https://www.youtube.com/embed/${v.id.videoId}`, v.snippet.channelTitle]);
                    }
                } catch (e) {}
            }
        }
    });
});



app.post('/api/signup', (req, res) => {
    const { correo, password, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;
    const pass = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO usuarios (correo, password, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [correo, pass, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario], function(err) {
        if (err) {
            console.error("ERROR SIGNUP:", err.message); // ← agrega esta línea
            return res.status(400).json({ error: err.message }); // ← muestra el error real
        }
        res.json({ id: this.lastID, nombre, rol });
    });
});
app.post('/api/login', (req, res) => {
    db.get(`SELECT * FROM usuarios WHERE correo = ?`, [req.body.correo], (err, row) => {
        if (row && bcrypt.compareSync(req.body.password, row.password)) {
            delete row.password;
            res.json({ success: true, usuario: row });
        } else {
            res.status(401).json({ success: false, error: "Credenciales incorrectas" });
        }
    });
});

app.put('/api/usuarios/actualizar', (req, res) => {
    // Asegúrate de que 'rol' esté incluido aquí:
    const { id, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;
    
    db.run(`UPDATE usuarios SET nombre = ?, turno = ?, semestre = ?, especialidad = ?, rol = ?, materias = ?, horario = ? WHERE id = ?`,
    [nombre, turno, semestre, especialidad, rol, materias, horario, id], function(err) {
        if (err) return res.status(400).json({ error: "Error al actualizar en DB" });
        
        db.get(`SELECT * FROM usuarios WHERE id = ?`, [id], (err, row) => {
            if (row) delete row.password;
            res.json({ success: true, usuario: row });
        });
    });
});

app.delete('/api/usuario/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM mensajes WHERE remitente_id = ? OR receptor_id = ?`, [id, id], () => {
        db.run(`DELETE FROM usuarios WHERE id = ?`, [id], function(err) {
            if (err) return res.status(400).json({ error: "Error al eliminar" });
            res.json({ success: true });
        });
    });
});

app.get('/api/asesores', (req, res) => {
    db.all(`SELECT id, nombre, turno, semestre, especialidad, materias FROM usuarios WHERE rol = 'Asesor'`, [], (err, rows) => res.json(rows));
});

app.get('/api/usuario/:id', (req, res) => {
    db.get(`SELECT id, nombre, turno, semestre, especialidad, materias, no_control, horario, rol FROM usuarios WHERE id = ?`, [req.params.id], (err, row) => res.json(row));
});

app.get('/api/mensajes/historial/:miId/:suId', (req, res) => {
    db.all(`SELECT * FROM mensajes WHERE (remitente_id = ? AND receptor_id = ?) OR (remitente_id = ? AND receptor_id = ?) ORDER BY id ASC`, 
    [req.params.miId, req.params.suId, req.params.suId, req.params.miId], (err, rows) => res.json(rows || []));
});

app.get('/api/mensajes/contactos/:miId', (req, res) => {
    db.all(`SELECT DISTINCT u.id, u.nombre, u.rol FROM usuarios u JOIN mensajes m ON (u.id = m.remitente_id OR u.id = m.receptor_id) WHERE (m.remitente_id = ? OR m.receptor_id = ?) AND u.id != ?`, 
    [req.params.miId, req.params.miId, req.params.miId], (err, rows) => res.json(rows || []));
});

app.post('/api/mensajes/marcar-leidos', (req, res) => {
    const { miId, suId } = req.body;
    db.run(`UPDATE mensajes SET leido = 1 WHERE receptor_id = ? AND remitente_id = ? AND leido = 0`, [miId, suId], function(err) {
        io.to(suId).emit('visto_confirmado', { por: miId });
        res.json({ success: true });
    });
});

app.get('/api/mensajes/no-leidos/:miId', (req, res) => {
    db.get(`SELECT COUNT(*) as total FROM mensajes WHERE receptor_id = ? AND leido = 0`, [req.params.miId], (err, row) => res.json({ total: row ? row.total : 0 }));
});

app.get('/api/recursos', (req, res) => {
    db.all(`SELECT * FROM recursos`, [], (err, rows) => {
        const r_obj = {};
        rows.forEach(r => {
            if(!r_obj[r.asignatura]) r_obj[r.asignatura] = {};
            if(!r_obj[r.asignatura][r.tema]) r_obj[r.asignatura][r.tema] = [];
            r_obj[r.asignatura][r.tema].push({ titulo: r.titulo, url: r.url, canal: r.canal });
        });
        res.json(r_obj);
    });
});

io.on('connection', (socket) => {
    socket.on('unirse', (userId) => socket.join(userId));
    socket.on('mensaje_privado', (data) => {
        db.run(`INSERT INTO mensajes (remitente_id, receptor_id, texto, hora) VALUES (?, ?, ?, ?)`, [data.remitente_id, data.receptor_id, data.texto, data.hora], function(err) {
            data.id = this.lastID;
            socket.to(data.receptor_id).emit('recibir_mensaje', data);
        });
    });
});

server.listen(3000, () => console.log("Servidor en puerto 3000"));