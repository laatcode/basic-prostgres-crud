require('dotenv').config()
const express = require('express')
const app = express()
const pool = require('./libs/postgres')

const PORT = process.env.PORT || 5000

app.use(express.json())

app.get("/tasks", async (req, res) => {
    try {
        const dbClient = await pool.connect() //Obtiene una conexión del pool
        const {rows} = await dbClient.query('SELECT * FROM tasks')
        dbClient.release(); // Liberar la conexión después de usarla
        res.send(rows)
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        res.status(500).send("Error interno del servidor");
    }
})

app.post("/tasks", async (req, res) => {
    try {
        const dbClient = await pool.connect()
        const now = new Date()
        const { rows } = await dbClient.query('INSERT INTO tasks (name, created_at) VALUES($1, $2) RETURNING id', [req.body.name, now])
        dbClient.release();
        res.send(...rows)
    } catch (error) {
        console.error("Error al crear tarea:", error);
        res.status(500).send("Error interno del servidor");
    }
})

app.patch("/tasks/:id", async (req, res) => {
    try {
        const dbClient = await pool.connect()
        const now = new Date()
        await dbClient.query('UPDATE tasks SET name=$1, updated_at=$2 WHERE id = $3', [req.body.name, now, req.params.id])
        const {rows} = await dbClient.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])
        dbClient.release();
        res.send(rows)
    } catch (error) {
        console.error("Error al actualizar la tarea:", error);
        res.status(500).send("Error interno del servidor");
    }
})

app.delete("/tasks/:id", async (req, res) => {
    try {
        const dbClient = await pool.connect()
        const result = await dbClient.query('DELETE FROM tasks WHERE id = $1', [req.params.id])
        dbClient.release();
        if(result.rowCount) {
            res.send('Tarea eliminada con éxito')
        } else {
            res.status(404).send(`La tarea con id ${req.params.id} no ha sido encontrada`)
        }
    } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        res.status(500).send("Error interno del servidor");
    }
})

app.listen(PORT, () => console.log(`Server running at port ${PORT}`))