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

// Função helper para converter string de data (YYYY-MM-DD) para Date local
const parseLocalDate = (dateString: string): Date => {
  // Se a string já tem timezone, usar diretamente
  if (dateString.includes('T') || dateString.includes('Z')) {
    return new Date(dateString)
  }
  
  // Se é apenas YYYY-MM-DD, criar data local (meia-noite no timezone local)
  const parts = dateString.split('-')
  if (parts.length !== 3) {
    // Fallback para Date padrão se formato inválido
    return new Date(dateString)
  }
  
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  
  // Validar se os valores são números válidos
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date(dateString)
  }
  
  return new Date(year, month - 1, day)
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
      data: parseLocalDate(data), 
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
      ...(data && { data: parseLocalDate(data) }),
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