require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
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
const db = new Database('./database.sqlite');

// ===== CREAR TABLAS =====
db.prepare(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT UNIQUE,
    password TEXT,
    no_control TEXT,
    curp TEXT,
    nombre TEXT,
    turno TEXT,
    semestre INTEGER,
    especialidad TEXT,
    rol TEXT,
    materias TEXT,
    horario TEXT
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remitente_id INTEGER,
    receptor_id INTEGER,
    texto TEXT,
    hora TEXT,
    leido INTEGER DEFAULT 0
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS recursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asignatura TEXT,
    tema TEXT,
    titulo TEXT,
    url TEXT,
    canal TEXT
)`).run();

// ===== SIGNUP =====
app.post('/api/signup', (req, res) => {
    try {
        const { correo, password, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;
        const pass = bcrypt.hashSync(password, 10);

        const result = db.prepare(`
            INSERT INTO usuarios (correo, password, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(correo, pass, no_control, curp, nombre, turno, semestre, especialidad, rol, materias, horario);

        res.json({ id: result.lastInsertRowid, nombre, rol });

    } catch (err) {
        console.error("ERROR SIGNUP:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// ===== LOGIN =====
app.post('/api/login', (req, res) => {
    try {
        const row = db.prepare(`SELECT * FROM usuarios WHERE correo = ?`).get(req.body.correo);

        if (row && bcrypt.compareSync(req.body.password, row.password)) {
            delete row.password;
            res.json({ success: true, usuario: row });
        } else {
            res.status(401).json({ success: false, error: "Credenciales incorrectas" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== ACTUALIZAR USUARIO =====
app.put('/api/usuarios/actualizar', (req, res) => {
    try {
        const { id, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;

        db.prepare(`
            UPDATE usuarios 
            SET nombre = ?, turno = ?, semestre = ?, especialidad = ?, rol = ?, materias = ?, horario = ?
            WHERE id = ?
        `).run(nombre, turno, semestre, especialidad, rol, materias, horario, id);

        const row = db.prepare(`SELECT * FROM usuarios WHERE id = ?`).get(id);
        delete row.password;

        res.json({ success: true, usuario: row });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== ELIMINAR USUARIO =====
app.delete('/api/usuario/:id', (req, res) => {
    try {
        const id = req.params.id;

        db.prepare(`DELETE FROM mensajes WHERE remitente_id = ? OR receptor_id = ?`).run(id, id);
        db.prepare(`DELETE FROM usuarios WHERE id = ?`).run(id);

        res.json({ success: true });

    } catch (err) {
        res.status(400).json({ error: "Error al eliminar" });
    }
});

// ===== ASESORES =====
app.get('/api/asesores', (req, res) => {
    const rows = db.prepare(`
        SELECT id, nombre, turno, semestre, especialidad, materias 
        FROM usuarios WHERE rol = 'Asesor'
    `).all();

    res.json(rows);
});

// ===== OBTENER USUARIO =====
app.get('/api/usuario/:id', (req, res) => {
    const row = db.prepare(`
        SELECT id, nombre, turno, semestre, especialidad, materias, no_control, horario, rol 
        FROM usuarios WHERE id = ?
    `).get(req.params.id);

    res.json(row);
});

// ===== HISTORIAL MENSAJES =====
app.get('/api/mensajes/historial/:miId/:suId', (req, res) => {
    const rows = db.prepare(`
        SELECT * FROM mensajes 
        WHERE (remitente_id = ? AND receptor_id = ?) 
        OR (remitente_id = ? AND receptor_id = ?) 
        ORDER BY id ASC
    `).all(req.params.miId, req.params.suId, req.params.suId, req.params.miId);

    res.json(rows || []);
});

// ===== CONTACTOS =====
app.get('/api/mensajes/contactos/:miId', (req, res) => {
    const rows = db.prepare(`
        SELECT DISTINCT u.id, u.nombre, u.rol 
        FROM usuarios u 
        JOIN mensajes m 
        ON (u.id = m.remitente_id OR u.id = m.receptor_id) 
        WHERE (m.remitente_id = ? OR m.receptor_id = ?) 
        AND u.id != ?
    `).all(req.params.miId, req.params.miId, req.params.miId);

    res.json(rows || []);
});

// ===== MARCAR LEIDOS =====
app.post('/api/mensajes/marcar-leidos', (req, res) => {
    const { miId, suId } = req.body;

    db.prepare(`
        UPDATE mensajes 
        SET leido = 1 
        WHERE receptor_id = ? AND remitente_id = ? AND leido = 0
    `).run(miId, suId);

    io.to(suId).emit('visto_confirmado', { por: miId });

    res.json({ success: true });
});

// ===== NO LEIDOS =====
app.get('/api/mensajes/no-leidos/:miId', (req, res) => {
    const row = db.prepare(`
        SELECT COUNT(*) as total 
        FROM mensajes 
        WHERE receptor_id = ? AND leido = 0
    `).get(req.params.miId);

    res.json({ total: row ? row.total : 0 });
});

// ===== RECURSOS =====
app.get('/api/recursos', (req, res) => {
    const rows = db.prepare(`SELECT * FROM recursos`).all();

    const r_obj = {};
    rows.forEach(r => {
        if (!r_obj[r.asignatura]) r_obj[r.asignatura] = {};
        if (!r_obj[r.asignatura][r.tema]) r_obj[r.asignatura][r.tema] = [];

        r_obj[r.asignatura][r.tema].push({
            titulo: r.titulo,
            url: r.url,
            canal: r.canal
        });
    });

    res.json(r_obj);
});

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
    socket.on('unirse', (userId) => socket.join(userId));

    socket.on('mensaje_privado', (data) => {
        const result = db.prepare(`
            INSERT INTO mensajes (remitente_id, receptor_id, texto, hora)
            VALUES (?, ?, ?, ?)
        `).run(data.remitente_id, data.receptor_id, data.texto, data.hora);

        data.id = result.lastInsertRowid;

        socket.to(data.receptor_id).emit('recibir_mensaje', data);
    });
});

// ===== SERVER =====
server.listen(3000, () => console.log("Servidor en puerto 3000"));