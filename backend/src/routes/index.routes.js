import areaRouter from "./area.routes.js";
import ministerioRouter from "./ministerio.routes.js";
import medioInscripcionRouter from "./medioInscripcion.routes.js";
import plataformaDictadoRouter from "./plataformaDictado.routes.js";
import estadoRouter from "./estado.routes.js";
import tipoCapacitacionRouter from "./tipoCapacitacion.routes.js";
import personaRouter from "./persona.routes.js";
import rolRouter from "./rol.routes.js";
import cursoRouter from "./curso.routes.js";
import usuarioRouter from "./usuario.routes.js";
import autorizadorRouter from "./autorizador.routes.js";
import instanciaRouter from "./instancia.routes.js";
import tutorXInstanciaRouter from "./tutorXInstancia.routes.js";
import loginRouter from "./login.routes.js";
import tutorRouter from "./tutor.routes.js";
import tipoRolTutor from "./tipoRolTutor.routes.js";
import googleSheetsRouter from "./googeSheets.routes.js";
import restriccionesFechasInicioCursada from "./restriccionesFechasInicioCursada.routes.js";
import categoriaChatbotRouter from "./categoriaChatbot.routes.js";
import diccionarioChatbotRouter from "./diccionarioChatbot.routes.js"
import diccionarioChatbotnrRouter from "./diccionarioChatbotnr.routes.js"
import areasAsignadasUsuarioRouter from "./areasAsignadasUsuario.routes.js";
import perfilRouter from "./perfil.routes.js";
import AreaTematica from "./areaTematica.routes.js";
import tipoCertificacionRouter from "./tipoCertificacion.routes.js";
import eventoRouter from "./evento.routes.js";
import { Router } from "express";
import AvisoRouter from "./aviso.routes.js"
import ApiArgentinaFeriadosRouter from "./api.routes.js";
import consultasChatbotRouter from "./consultasChatbot.routes.js"

const router = Router();

router.use("/areas", areaRouter);
router.use("/ministerios", ministerioRouter)
router.use("/mediosInscripcion", medioInscripcionRouter)
router.use("/plataformasDictado", plataformaDictadoRouter)
router.use("/estados", estadoRouter)
router.use("/tiposCapacitacion", tipoCapacitacionRouter)
router.use("/personas", personaRouter)
router.use("/roles", rolRouter)
router.use("/cursos", cursoRouter)
router.use("/usuarios", usuarioRouter)
router.use("/autorizadores", autorizadorRouter)
router.use("/instancias", instanciaRouter)
router.use("/tutoresXInstancias", tutorXInstanciaRouter)

router.use("/login", loginRouter)

router.use("/tutores", tutorRouter)
router.use("/tiposRolTutor", tipoRolTutor)
router.use("/googleSheets", googleSheetsRouter)

router.use("/restricciones", restriccionesFechasInicioCursada)

router.use("/categoriaChatbot", categoriaChatbotRouter)

router.use("/diccionarioChatbot", diccionarioChatbotRouter)
router.use("/diccionarioChatbotnr", diccionarioChatbotnrRouter)
router.use("/areasAsignadasUsuario", areasAsignadasUsuarioRouter)
router.use("/perfiles", perfilRouter)
router.use("/areasTematicas", AreaTematica)
router.use("/tiposCertificaciones", tipoCertificacionRouter)
router.use("/eventos", eventoRouter)
router.use("/avisos", AvisoRouter)
router.use("/argentina/feriados", ApiArgentinaFeriadosRouter)
router.use("/consultasChatbot", consultasChatbotRouter)

export default router