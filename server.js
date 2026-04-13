require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', req.body.correo)
            .single();

        if (error || !data) {
            return res.status(401).json({ success: false });
        }

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

// ===== ACTUALIZAR =====
app.put('/api/usuarios/actualizar', async (req, res) => {
    try {
        const { id, nombre, turno, semestre, especialidad, rol, materias, horario } = req.body;

        const { error } = await supabase
            .from('usuarios')
            .update({ nombre, turno, semestre, especialidad, rol, materias, horario })
            .eq('id', id);

        if (error) throw error;

        const { data } = await supabase.from('usuarios').select('*').eq('id', id).single();
        delete data.password;

        res.json({ success: true, usuario: data });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== ELIMINAR =====
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
    const { data } = await supabase
        .from('usuarios')
        .select('id, nombre, turno, semestre, especialidad, materias')
        .eq('rol', 'Asesor');

    res.json(data);
});

// ===== USUARIO =====
app.get('/api/usuario/:id', async (req, res) => {
    const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', req.params.id)
        .single();

    res.json(data);
});

// ===== MENSAJES =====
app.get('/api/mensajes/historial/:miId/:suId', async (req, res) => {
    const { data } = await supabase
        .from('mensajes')
        .select('*')
        .or(`and(remitente_id.eq.${req.params.miId},receptor_id.eq.${req.params.suId}),and(remitente_id.eq.${req.params.suId},receptor_id.eq.${req.params.miId})`)
        .order('id', { ascending: true });

    res.json(data || []);
});

// ===== SOCKET =====
io.on('connection', (socket) => {
    socket.on('unirse', (userId) => socket.join(userId));

    socket.on('mensaje_privado', async (data) => {
        const { data: inserted } = await supabase
            .from('mensajes')
            .insert([data])
            .select();

        data.id = inserted[0].id;

        socket.to(data.receptor_id).emit('recibir_mensaje', data);
    });
});

server.listen(3000, () => console.log("Servidor listo"));