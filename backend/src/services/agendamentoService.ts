import prisma from "../prismaClient"

export const listar = async () => {
  return await prisma.agendamento.findMany({
    include: {
      usuario: true,
      servico: true,
    },
  })
}

export const buscarPorId = async (id: number) => {
  return await prisma.agendamento.findUnique({
    where: { id },
    include: {
      usuario: true,
      servico: true,
    },
  })
}

export const criar = async (data: {
  data: string | Date
  status?: string
  servicoId: number
  usuarioId: number
}) => {
  // Validar se o usuário existe
  const usuarioExiste = await prisma.usuario.findUnique({
    where: { id: data.usuarioId },
  })

  if (!usuarioExiste) {
    throw new Error(`Usuário com ID ${data.usuarioId} não encontrado`)
  }

  // Validar se o serviço existe
  const servicoExiste = await prisma.servico.findUnique({
    where: { id: data.servicoId },
  })

  if (!servicoExiste) {
    throw new Error(`Serviço com ID ${data.servicoId} não encontrado`)
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      data: new Date(data.data),
      status: data.status ?? "pendente",
      servico: { connect: { id: data.servicoId } },
      usuario: { connect: { id: data.usuarioId } },
    },
    include: {
      usuario: true,
      servico: true,
    },
  })

  return agendamento
}

export const atualizar = async (
  id: number,
  data: Partial<{
    data: string | Date
    status: string
    servicoId: number
    usuarioId: number
  }>
) => {
  // Validar se o usuário existe (se fornecido)
  if (data.usuarioId) {
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    })
    if (!usuarioExiste) {
      throw new Error(`Usuário com ID ${data.usuarioId} não encontrado`)
    }
  }

  // Validar se o serviço existe (se fornecido)
  if (data.servicoId) {
    const servicoExiste = await prisma.servico.findUnique({
      where: { id: data.servicoId },
    })
    if (!servicoExiste) {
      throw new Error(`Serviço com ID ${data.servicoId} não encontrado`)
    }
  }

  const updateData: any = {}

  if (data.data) updateData.data = new Date(data.data)
  if (data.status) updateData.status = data.status
  if (data.servicoId) updateData.servico = { connect: { id: data.servicoId } }
  if (data.usuarioId) updateData.usuario = { connect: { id: data.usuarioId } }

  return await prisma.agendamento.update({
    where: { id },
    data: updateData,
    include: {
      usuario: true,
      servico: true,
    },
  })
}

export const deletar = async (id: number) => {
  return await prisma.agendamento.delete({ where: { id } })
}