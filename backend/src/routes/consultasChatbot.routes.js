import { getConsultasChatbot, postConsultaschatbot, deleteConsultasChatbot, getConsultasChatbotPorId } from "../controllers/consultasChatbot.controllers.js";

import { Router } from "express";


const consultasChatbotRouter = Router();

consultasChatbotRouter.get('/', getConsultasChatbot)
consultasChatbotRouter.get('/:idConsulta', getConsultasChatbotPorId)
consultasChatbotRouter.post('/', postConsultaschatbot)

export default consultasChatbotRouter