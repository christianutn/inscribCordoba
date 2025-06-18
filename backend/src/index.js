

import express from "express";
import indexRoutes from "./routes/index.routes.js";
import inicializarPassport from "../src/config/passport.js"; // Asegúrate que esta ruta es correcta
import cors from "cors";
import sequelize from "./config/database.js";
import associateModels from "./models/asociateModelos.js";
import 'dotenv/config';
import enviarCorreoDiarioContolDeCursos from "./googleSheets/utils/enviarCorreoDiarioControlDeCursos.js";

const app = express();

// Inicialización de Sequelize
const initSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
        associateModels();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Llamada a la función para inicializar Sequelize
initSequelize();

app.use(cors());

const PORT = 4000 // para producción cambiar a 4000

// Middleware
app.use(express.json());
inicializarPassport();

app.use("/api", indexRoutes);

// Endpoint de prueba
app.get("/api/ping", (req, res) => {
    const responseData = {
        message: "El backend está escuchando.",
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
    };
    res.status(200).json(responseData);
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
    error.status = 404;
    next(error);
});

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.log("INFO ERROR: ", {
        message: err.message || err,
        url: req.originalUrl,
        method: req.method,
        status: err.statusCode || 500
    });
    res.status(err.statusCode || 500).json({ message: err.message || "Error Interno" });
});

enviarCorreoDiarioContolDeCursos(); // Llamada a la función para enviar el correo diario de control de cursos

// --- Programación de la Tarea Cron ---

// Expresión Cron: '0 * * * * *' -> Cada minuto (¡SOLO PARA PRUEBAS!)
// Cambiar a '0 24 17 * * *' (o lo deseado) para producción (Ej: 17:24 hs Argentina)
// Zona Horaria: America/Argentina/Buenos_Aires


// --- Fin Programación de la Tarea Cron ---

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
