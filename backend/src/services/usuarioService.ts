// src/services/usuarioService.ts
import prisma from "../prismaClient"

export const listar = async () => {
  return await prisma.usuario.findMany()
}

export const buscarPorId = async (id: number) => {
  return await prisma.usuario.findUnique({ where: { id } })
}

export const criar = async (data: {
  nome: string
  email: string
  cpf: string
  telefone: string
  senha: string
  role?: string
}) => {
  return await prisma.usuario.create({ data })
}

export const atualizar = async (
  id: number,
  data: Partial<{
    nome: string
    email: string
    telefone: string
    senha: string
    role: string
  }>
) => {
  return await prisma.usuario.update({ where: { id }, data })
}

export const deletar = async (id: number) => {
  return await prisma.usuario.delete({ where: { id } })
}