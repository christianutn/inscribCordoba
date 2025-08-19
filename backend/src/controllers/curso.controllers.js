import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import areaModel from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
import { Op } from "sequelize";
import { actualizarDatosColumna } from "../googleSheets/services/actualizarDatosColumna.js";
import sequelize from "../config/database.js";
import AreasAsignadasUsuario from "../models/areasAsignadasUsuario.models.js";
import parseEsVigente from "../utils/parseEsVigente.js"

export const getCursos = async (req, res, next) => {
    try {
        // Obtener los valores del token
        const { rol, area, cuil } = req.user.user;
        // Validar datos del usuario
        if (!cuil || !rol) {
            const error = new Error("No se encontraron los datos del usuario (rol o cuil)");
            error.statusCode = 404;
            throw error;
        }

        // Obtener áreas asignadas al usuario
        const areasAsignadas = await AreasAsignadasUsuario.findAll({
            where: { usuario: cuil }

        });
        let cursos;

        if (rol === "ADM" || rol === "GA") {
            cursos = await cursoModel.findAll({
                include: [
                    {
                        model: medioInscripcionModel, as: 'detalle_medioInscripcion'
                    },
                    {
                        model: tipoCapacitacionModel, as: 'detalle_tipoCapacitacion'
                    },
                    {
                        model: plataformaDictadoModel, as: 'detalle_plataformaDictado'
                    },
                    {
                        model: areaModel,
                        as: 'detalle_area',
                        include: [
                            { model: ministerio, as: 'detalle_ministerio' }
                        ]
                    }
                ]
            });
        } else {
            // Validar área para roles no administradores
            if (!area) {
                const error = new Error("No se encontraron los datos del usuario (area)");
                error.statusCode = 404;
                throw error;
            }
            // Crear lista de códigos de área
            const codigosArea = [area];
            if (areasAsignadas.length > 0) {
                areasAsignadas.forEach(areaAsignada => {
                    codigosArea.push(areaAsignada.area);
                });
            }

            cursos = await cursoModel.findAll({
                where: {
                    area: {
                        [Op.in]: codigosArea // Filtrar áreas que coincidan con alguno de los códigos en la lista
                    }
                },
                include: [
                    {
                        model: medioInscripcionModel, as: 'detalle_medioInscripcion'
                    },
                    {
                        model: tipoCapacitacionModel, as: 'detalle_tipoCapacitacion'
                    },
                    {
                        model: plataformaDictadoModel, as: 'detalle_plataformaDictado'
                    },
                    {
                        model: areaModel,
                        as: 'detalle_area',
                        include: [
                            { model: ministerio, as: 'detalle_ministerio' }
                        ]
                    }
                ]
            });
        }

        if (cursos.length === 0) {
            const error = new Error("No existen cursos");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(cursos)
    } catch (error) {
        next(error)
    }
}

export const postCurso = async (req, res, next) => {
    try {

        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area, tiene_evento_creado } = req.body;


        const existe = await cursoModel.findOne({ where: { cod: cod } });
        if (existe) throw new Error("El Código ya existe");
        if (cod.length > 15) throw new Error("El Código no es valido debe ser menor a 15 caracteres");
        if (cupo < 1 || isNaN(cupo)) throw new Error("El cupo debe ser mayor a 0");
        if (cantidad_horas < 1 || isNaN(cantidad_horas)) throw new Error("La cantidad de horas debe ser mayor a 0");
        if (medio_inscripcion.length > 15) throw new Error("El medio de inscripción no es valido debe ser menor a 15 caracteres");
        if (plataforma_dictado.length > 15) throw new Error("La plataforma de dictado no es valido debe ser menor a 15 caracteres");
        if (tipo_capacitacion.length > 15) throw new Error("El tipo de capacitación no es valido debe ser menor a 15 caracteres");
        if (area.length > 15) throw new Error("El area no es valido debe ser menor a 15 caracteres");
        if (nombre.length > 250) throw new Error("El nombre no es valido debe ser menor a 250 caracteres");
        if (nombre.length === 0) throw new Error("El nombre no puede ser vacío");


        const response = await cursoModel.create(req.body);

        res.status(200).json(response)

    } catch (error) {
        next(error)
    }
}

export const updateCurso = async (req, res, next) => {
    // Declaramos la variable de transacción para usarla en el catch si es necesario
    let t;

    try {
        const { cod, nombre, cupo, cantidad_horas, medio_inscripcion, plataforma_dictado, tipo_capacitacion, area, esVigente, tiene_evento_creado } = req.body;

        // --- Validaciones de entrada (Sin cambios en lógica, solo se eliminan logs) ---
        // Lanzamos el error directamente, confiando en que el catch lo capture y pase a next(error)
        if (!cod || !nombre || !cupo || !cantidad_horas || !medio_inscripcion || !plataforma_dictado || !tipo_capacitacion || !area) {
            throw new Error("Hay campos vacios");
        }

        // Convertimos a número y validamos que sean enteros positivos
        const parsedCupo = Number(cupo);
        const parsedCantidadHoras = Number(cantidad_horas);



        if (parsedCupo < 1 || isNaN(parsedCupo) || !Number.isInteger(parsedCupo)) {
            throw new Error("El cupo debe ser un entero mayor a 0");
        }
        if (parsedCantidadHoras < 1 || isNaN(parsedCantidadHoras) || !Number.isInteger(parsedCantidadHoras)) {
            throw new Error("La cantidad de horas debe ser un entero mayor a 0");
        }
        // --- Fin Validaciones de entrada ---

        // --- Búsqueda del curso (Sin cambios en lógica, AÑADIDA transacción) ---
        const cursoAntes = await cursoModel.findOne({
            where: { cod: cod },
        });

        if (!cursoAntes) {
            // Lanzamos el error. El catch lo capturará y hará rollback.
            throw new Error(`No se encontró un curso con el código ${cod}`);
        }

        // --- Actualización en base de datos (Sin cambios en lógica, AÑADIDA transacción) ---
         await cursoModel.update(
            {
                cod,
                nombre,
                cupo: parsedCupo, // Usar valores parseados y validados
                cantidad_horas: parsedCantidadHoras, // Usar valores parseados y validados
                medio_inscripcion,
                plataforma_dictado,
                tipo_capacitacion,
                area,
                esVigente: parseEsVigente(esVigente),
                tiene_evento_creado: (tiene_evento_creado === "Si" || tiene_evento_creado) ? 1 : 0
            },
            {
                where: {
                    cod: cod,
                },
            },
        );

        // Si todo fue exitoso, respondemos al cliente
        res.status(200).json({ message: "Se actualizo correctamente el curso" });


    } catch (error) {
        // --- Manejo de Errores y Rollback ---
        next(error);
    }
};


export const deleteCurso = async (req, res, next) => {
    try {
        const { cod } = req.params;



        if (!cod) {
            throw new Error("El ID del curso es requerido");
        }
        const response = await cursoModel.destroy({
            where: {
                cod
            }
        });
        if (response === 0) {
            throw new Error("No se pudo borrar el curso");
        }
        res.status(200).json({ message: "Se borro correctamente el curso" })
    } catch (error) {
        next(error)
    }
}