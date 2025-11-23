import { Request, Response } from "express"
import {
  listar,
  buscarPorId,
  criar,
  atualizar,
  deletar,
} from "../services/agendamentoService"

export const listarAgendamentos = async (_req: Request, res: Response) => {
  try {
    const agendamentos = await listar()
    res.json(agendamentos)
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error)
    res.status(500).json({ message: "Erro ao listar agendamentos." })
  }
}

export const buscarAgendamentoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const agendamento = await buscarPorId(Number(id))

    if (!agendamento) {
      return res.status(404).json({ message: "Agendamento não encontrado." })
    }

    res.json(agendamento)
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error)
    res.status(500).json({ message: "Erro ao buscar agendamento." })
  }
}

export const criarAgendamento = async (req: Request, res: Response) => {
  try {
    const { data, horario, status, observacoes, servicoId, usuarioId } = req.body

    if (!data || !horario || !servicoId || !usuarioId) {
      return res.status(400).json({ 
        message: "Campos obrigatórios: data, horario, servicoId e usuarioId." 
      })
    }

    const novoAgendamento = await criar({ 
      data: new Date(data), 
      horario,
      status, 
      observacoes,
      servicoId, 
      usuarioId 
    })
    res.status(201).json(novoAgendamento)
  } catch (error: any) {
    console.error("Erro ao criar agendamento:", error)
    
    if (error.message?.includes("não encontrado")) {
      return res.status(404).json({ message: error.message })
    }
    
    if (error.message?.includes("Já existe um agendamento")) {
      return res.status(409).json({ message: error.message })
    }

    res.status(500).json({ message: "Erro ao criar agendamento." })
  }
}

export const atualizarAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { data, horario, status, observacoes, servicoId, usuarioId } = req.body

    const agendamentoAtualizado = await atualizar(Number(id), {
      ...(data && { data: new Date(data) }),
      ...(horario && { horario }),
      ...(status && { status }),
      ...(observacoes !== undefined && { observacoes }),
      ...(servicoId && { servicoId }),
      ...(usuarioId && { usuarioId }),
    })

    res.json(agendamentoAtualizado)
  } catch (error: any) {
    console.error("Erro ao atualizar agendamento:", error)
    
    if (error.message?.includes("não encontrado")) {
      return res.status(404).json({ message: error.message })
    }
    
    res.status(500).json({ message: "Erro ao atualizar agendamento." })
  }
}

export const deletarAgendamento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await deletar(Number(id))
    res.json({ message: "Agendamento deletado com sucesso!" })
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error)
    res.status(500).json({ message: "Erro ao deletar agendamento." })
  }
}