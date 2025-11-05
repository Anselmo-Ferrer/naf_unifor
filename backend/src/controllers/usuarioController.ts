import { Request, Response } from "express"
import * as usuarioService from "../services/usuarioService"

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.criar(req.body)
    return res.status(201).json(usuario)
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioService.listar()
    return res.json(usuarios)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}