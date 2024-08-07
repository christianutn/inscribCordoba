import cursoModel from "../models/curso.models.js";
import medioInscripcionModel from "../models/medioInscripcion.models.js";
import tipoCapacitacionModel from "../models/tipoCapacitacion.models.js";
import plataformaDictadoModel from "../models/plataformaDictado.models.js";
import area from "../models/area.models.js";
import ministerio from "../models/ministerio.models.js";
export const getCursos = async (req, res, next) => {
    try {
        const cursos = await cursoModel.findAll({
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
                    model: area,
                    as: 'detalle_area',
                    include: [
                        { model: ministerio, as: 'detalle_ministerio' }
                    ]
                }
            ]
        });

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