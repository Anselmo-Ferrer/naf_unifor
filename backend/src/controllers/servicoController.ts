import { Request, Response } from "express"
import * as servicoService from "../services/servicoService"

export const criarServico = async (req: Request, res: Response) => {
  try {
    const servico = await servicoService.criar(req.body)
    return res.status(201).json(servico)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const listarServicos = async (_req: Request, res: Response) => {
  try {
    const servicos = await servicoService.listar()
    return res.json(servicos)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}

export const buscarServicoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const servico = await servicoService.buscarPorId(id)

    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado" })
    }

    return res.json(servico)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const atualizarServico = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const servico = await servicoService.atualizar(id, req.body)
    return res.json(servico)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const deletarServico = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    await servicoService.deletar(id)
    return res.status(204).send()
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}