import { Router } from "express"
import { loginUsuario, registrarUsuario, esqueceuSenha, redefinirSenha } from "../controllers/authController"

const router = Router()

router.post("/login", loginUsuario)
router.post("/registrar", registrarUsuario)
router.post("/esqueceu-senha", esqueceuSenha)
router.post("/redefinir-senha", redefinirSenha)

export default router