import prisma from "../prismaClient"

export const listar = async () => {
  return await prisma.servico.findMany()
}

export const buscarPorId = async (id: number) => {
  return await prisma.servico.findUnique({ where: { id } })
}

export const criar = async (data: {
  nome: string
  descricao: string
  duracao_minutos: number
  ativo?: boolean
}) => {
  const servico = await prisma.servico.create({
    data: {
      ...data,
      ativo: data.ativo ?? true,
    },
  })
  return servico
}

export const atualizar = async (
  id: number,
  data: Partial<{
    nome: string
    descricao: string
    duracao_minutos: number
    ativo: boolean
  }>
) => {
  return await prisma.servico.update({
    where: { id },
    data,
  })
}

export const deletar = async (id: number) => {
  return await prisma.servico.delete({ where: { id } })
}