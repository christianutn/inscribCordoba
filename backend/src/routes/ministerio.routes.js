import {getMinisterios, putMinisterio, deleteMinisterio, postMinisterio} from "../controllers/ministerio.controllers.js"
import {Router} from "express"
import passport from "passport";
import autorizar from "../utils/autorizar.js"

const ministerioRouter = Router();


ministerioRouter.get("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), getMinisterios)
ministerioRouter.put("/",  passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), putMinisterio)
ministerioRouter.delete("/:cod",  passport.authenticate('jwt', {session: false}), autorizar(['ADM']), deleteMinisterio)
ministerioRouter.post("/", passport.authenticate('jwt', {session: false}), autorizar(['ADM', 'REF', 'GA']), postMinisterio)

export default ministerioRouter

