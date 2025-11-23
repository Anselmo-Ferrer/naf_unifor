import prisma from "../prismaClient"

interface AgendamentoData {
  data: Date
  horario: string
  status?: string
  observacoes?: string
  servicoId: number
  usuarioId: number
}

export const listar = async () => {
  return await prisma.agendamento.findMany({
    include: {
      servico: true,
      usuario: true,
    },
  })
}

export const buscarPorId = async (id: number) => {
  return await prisma.agendamento.findUnique({
    where: { id },
    include: {
      servico: true,
      usuario: true,
    },
  })
}

export const criar = async (dados: AgendamentoData) => {
  const { data, horario, status, observacoes, servicoId, usuarioId } = dados

  // Verificar se o serviço existe
  const servico = await prisma.servico.findUnique({
    where: { id: servicoId },
  })
  if (!servico) {
    throw new Error("Serviço não encontrado")
  }

  // Verificar se o usuário existe
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  })
  if (!usuario) {
    throw new Error("Usuário não encontrado")
  }


  const agendamentoExistente = await prisma.agendamento.findFirst({
    where: {
      data,
      horario,
      status: {
        not: "cancelado", // Ignora agendamentos cancelados
      },
    },
    include: {
      usuario: {
        select: {
          nome: true,
        },
      },
    },
  })

  if (agendamentoExistente) {
    throw new Error(
      `Já existe um agendamento para ${data} às ${horario}`
    )
  }

  return await prisma.agendamento.create({
    data: {
      data,
      horario,
      status: status || "pendente",
      observacoes: observacoes || "",
      servico: {
        connect: { id: servicoId },
      },
      usuario: {
        connect: { id: usuarioId },
      },
    },
    include: {
      servico: true,
      usuario: true,
    },
  })
}

export const atualizar = async (id: number, dados: Partial<AgendamentoData>) => {
  const { data, horario, status, observacoes, servicoId, usuarioId } = dados

  // Verificar se o agendamento existe
  const agendamentoExiste = await prisma.agendamento.findUnique({
    where: { id },
  })
  if (!agendamentoExiste) {
    throw new Error("Agendamento não encontrado")
  }

  // Verificar se o serviço existe (se fornecido)
  if (servicoId) {
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    })
    if (!servico) {
      throw new Error("Serviço não encontrado")
    }
  }

  // Verificar se o usuário existe (se fornecido)
  if (usuarioId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    })
    if (!usuario) {
      throw new Error("Usuário não encontrado")
    }
  }

  return await prisma.agendamento.update({
    where: { id },
    data: {
      ...(data && { data }),
      ...(horario && { horario }),
      ...(status && { status }),
      ...(observacoes !== undefined && { observacoes }),
      ...(servicoId && {
        servico: {
          connect: { id: servicoId },
        },
      }),
      ...(usuarioId && {
        usuario: {
          connect: { id: usuarioId },
        },
      }),
    },
    include: {
      servico: true,
      usuario: true,
    },
  })
}

export const deletar = async (id: number) => {
  return await prisma.agendamento.delete({
    where: { id },
  })
}