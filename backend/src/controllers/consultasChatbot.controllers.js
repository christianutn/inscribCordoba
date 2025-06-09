import ConsultasChatbot from "../models/consultasChatbot.models.js";
import sequelize from "../config/database.js";
import { where } from "sequelize";

export const getConsultasChatbot = async (req, res, next) => {
    try {

        const consultasChatbot = await ConsultasChatbot.findAll();

        if (consultasChatbot.length === 0) {
            const error = new Error("No existen consultas chatbot");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(consultasChatbot);
    } catch (error) {
        next(error);
    }
}

export const getConsultasChatbotPorId = async (req, res, next) => {
    try {
        const idConsulta = parseInt(req.params.idConsulta);

        // Validación de tipo
        if (isNaN(idConsulta)) {
            const error = new Error("El id debe ser un número válido");
            error.statusCode = 400;
            throw error;
        }

        // Consulta por clave primaria (búsqueda exacta)
        const consulta = await ConsultasChatbot.findByPk(idConsulta);

        if (!consulta) {
            const error = new Error("No existe la consulta chatbot");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(consulta);
    } catch (error) {
        next(error);
    }
};








export const postConsultaschatbot = async (req, res, next) => {
    try {

        let { consulta, extra } = req.body;

        if (!consulta) {

            const error = new Error("El campo consulta no puede estar vacío");
            error.statusCode = 400;
            throw error;
        }

        const fecha = new Date();


        consulta = consulta.trim()

        const nuevaConsulta = await ConsultasChatbot.create({ consulta: consulta, extra: extra !== undefined ? extra.trim() : "" });
        res.status(201).json(nuevaConsulta);

    } catch (error) {
        next(error);
    }
}

export const deleteConsultasChatbot = async (req, res, next) => {
    try {
        const { id } = req.params

        if (id === undefined) {
            const error = new Error("El id no está definido");
            error.statusCode = 400;
            throw error;
        }

        const consultaEliminada = await ConsultasChatbot.destroy({ where: { cod: cod } });

        if (consultaEliminada == 0) {
            const error = new Error(`El area ${cod} no existe`);
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json(consultaEliminada);
    } catch (error) {
        next(error);
    }
}