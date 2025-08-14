import {getCursos, postCurso, updateCurso, deleteCurso} from "../controllers/curso.controllers.js";
import {Router} from "express";
import autorizar from "../utils/autorizar.js"
import passport from "passport";

const cursoRouter = Router();


cursoRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getCursos)

cursoRouter.post("/",passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), postCurso)

cursoRouter.put("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']),updateCurso)


cursoRouter.delete("/:cod", passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteCurso)


export default cursoRouter
