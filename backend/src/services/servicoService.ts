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
  // Atualizar o serviço
  const servicoAtualizado = await prisma.servico.update({
    where: { id },
    data,
  })

  // Se o serviço foi desativado, cancelar todos os agendamentos futuros
  if (data.ativo === false) {
    const agora = new Date()
    await prisma.agendamento.updateMany({
      where: {
        servicoId: id,
        data: {
          gte: agora
        },
        status: {
          not: 'cancelado'
        }
      },
      data: {
        status: 'cancelado'
      }
    })
  }

  return servicoAtualizado
}

export const deletar = async (id: number) => {
  // Primeiro, deletar todos os agendamentos relacionados
  await prisma.agendamento.deleteMany({
    where: { servicoId: id }
  })
  
  // Depois, deletar o serviço
  return await prisma.servico.delete({ where: { id } })
}