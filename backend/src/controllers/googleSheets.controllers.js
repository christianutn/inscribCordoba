import {getCronograma} from "../googleSheets/services/getCronograma.js";
import Area from "../models/area.models.js";
import {getMatrizFechas} from "../googleSheets/services/getMatrizFechas.js";
export const getDatosCronograma = async (req, res, next) => {

    try {
        
        const {rol, area} = req.user.user;
        let dataCronograma;

        if(rol === "ADM"){
            dataCronograma = await getCronograma("todos");
        }else{
            const response = await Area.findOne({ where: { cod: area } });
            if(!response) throw new Error("Area no encontrada")
            dataCronograma = await getCronograma(response.nombre);
        }

        res.status(200).json(dataCronograma)
    } catch (error) {
        throw error
    }
}

export const getFechasParaValidar = async (req, res, next) => {
    try {
        const aplicaRestricciones = req.user.user.esExcepcionParaFechas == 0;
        const matrizFecha = await getMatrizFechas(aplicaRestricciones);
        res.status(200).json(matrizFecha)
        
    } catch (error) {
        next(error)
    }
}