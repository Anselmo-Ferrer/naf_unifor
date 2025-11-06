import { Router } from "express"
import { criarUsuario, listarUsuarios, deletarUsuario } from "../controllers/usuarioController"

const router = Router()

router.post("/", criarUsuario)
router.get("/", listarUsuarios)
router.delete("/:id", deletarUsuario)

export default router