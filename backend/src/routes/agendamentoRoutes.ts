import { Router } from "express"
import {
  listarAgendamentos,
  buscarAgendamentoPorId,
  criarAgendamento,
  atualizarAgendamento,
  deletarAgendamento,
} from "../controllers/agendamentoController"

const router = Router()

router.get("/", listarAgendamentos)
router.get("/:id", buscarAgendamentoPorId)
router.post("/", criarAgendamento)
router.put("/:id", atualizarAgendamento)
router.delete("/:id", deletarAgendamento)

export default router