import { Router } from "express";
import { atualizarServico, buscarServicoPorId, criarServico, deletarServico, listarServicos } from "../controllers/servicoController";

const router = Router();

router.get("/", listarServicos);
router.get("/:id", buscarServicoPorId);
router.post("/", criarServico);
router.put("/:id", atualizarServico);
router.delete("/:id", deletarServico);

export default router;