import Ministerio from "../models/ministerio.models.js";
import Area from "../models/area.models.js";
import Curso from "../models/curso.models.js";
import {actualizarDatosColumna} from "../googleSheets/services/actualizarDatosColumna.js";
import sequelize from "../config/database.js";

export const getMinisterios = async (req, res, next) => {
    try {
        // Obtener los valores del token
        const { rol, area } = req.user.user;

        let ministerios;

        if (rol === "ADM") {
            ministerios = await Ministerio.findAll({
                include: [
                    {
                        model: Area,
                        as: 'detalle_areas',
                        include: [
                            {
                                model: Curso,
                                as: 'detalle_cursos'
                            }
                        ]
                    }
                ]
            });
        } else {
            ministerios = await Ministerio.findAll({
                include: [
                    {
                        model: Area,
                        as: 'detalle_areas',
                        where: { cod: area }, // Filtrar por área específica del usuario
                        include: [
                            {
                                model: Curso,
                                as: 'detalle_cursos'
                            }
                        ]
                    }
                ]
            });
        }

        if (ministerios.length === 0) {
            const error = new Error("No existen ministerios");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(ministerios);
    } catch (error) {
        next(error);
    }
};

export const getMinisterioByCod = async (req, res, next) => {
    try {
        const { cod } = req.params;
        const ministerio = await Ministerio.findOne({
            where: { cod: cod },
            include: [
                {
                    model: Area,
                    as: 'detalle_areas'
                }
            ]
        });

        if (!ministerio) {
            const error = new Error("No existe el ministerio");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(ministerio);
    } catch (error) {
        throw error;

    }
}



export const putMinisterio = async (req, res, next) => {
    const t = await sequelize.transaction(); // Comienza una transacción
    try {
        let { cod, nombre, newCod, esVigente } = req.body;

        // Validaciones básicas
        if (!cod || cod.trim() === "") {
            throw new Error("El código no es válido");
        }
        if (!nombre || nombre.trim() === "") {
            throw new Error("El nombre no es válido");
        }

        cod = cod.trim();
        nombre = nombre.trim();
        newCod = newCod ? newCod.trim() : null;

        // Buscar el ministerio antes de actualizar
        const ministerioAntes = await Ministerio.findOne({
            where: { cod },
        });

        if (!ministerioAntes) {
            throw new Error(`No se encontró un ministerio con el código ${cod}`);
        }

        const ministerioAntesJSON = ministerioAntes.toJSON();

        // Realiza la actualización en la base de datos
        const [affectedRows] = await Ministerio.update(
            { cod: newCod || cod, nombre: nombre, esVigente: esVigente === "Si" ? 1 : 0 },
            {
                where: { cod },
                transaction: t,
            }
        );

        if (affectedRows === 0) {
            throw new Error("No existen datos para actualizar");
        }

        // Si se actualizó correctamente en la base de datos, actualiza Google Sheets
        const resultadoGoogleSheets = await actualizarDatosColumna("Ministerio", ministerioAntesJSON.nombre, nombre);

        if (!resultadoGoogleSheets.success) {
            throw new Error(`Error al actualizar en Google Sheets: ${resultadoGoogleSheets.error}`);
        }

        // Confirma la transacción
        await t.commit();

        // Respuesta exitosa
        res.status(200).json({ message: "Ministerio actualizado correctamente", ministerio: { cod: newCod || cod, nombre } });
    } catch (error) {
        // Revertir la transacción en caso de error
        await t.rollback();
        next(error);
    }
};

export const deleteMinisterio = async (req, res, next) => {
    try {
        const {cod} = req.params

        if (cod == "" || cod == null || cod == undefined) {
            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }
        const ministerio = await Ministerio.destroy({
            where: {
                cod: cod
            }
        });

        if(ministerio == 0){
            const error = new Error("No existen datos para eliminar");
            error.statusCode = 400;
            throw error;
        }
        res.status(200).json(ministerio);
    } catch (error) {
        next(error);
    }
}


export const postMinisterio = async (req, res, next) => {
    try {
        
        let {cod, nombre} = req.body

        if (cod == "" || cod == null || cod == undefined) {
            const error = new Error("El código no es valido");
            error.statusCode = 400;
            throw error;
        }
        if (nombre == "" || nombre == null || nombre == undefined) {
            const error = new Error("El nombre no es valido");
            error.statusCode = 400;
            throw error;
        }

        nombre = nombre.trim()
        cod = cod.trim()
        


        const area = await Ministerio.create({cod: cod, nombre: nombre});

        if(!area){
            const error = new Error("No se pudo crear el Ministerio");
            error.statusCode = 400;
            throw error;
        }

        res.status(200).json(area);
    } catch (error) {
        next(error);
    }
}