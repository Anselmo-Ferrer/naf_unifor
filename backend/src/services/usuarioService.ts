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
  try {
    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({ 
      where: { id },
      include: {
        agendamentos: {
          select: { id: true }
        }
      }
    })
    
    if (!usuario) {
      throw new Error('Usuário não encontrado')
    }

    // Usar transação para deletar agendamentos primeiro e depois o usuário
    return await prisma.$transaction(async (tx) => {
      // Primeiro, deletar todos os agendamentos do usuário
      const agendamentosDeletados = await tx.agendamento.deleteMany({
        where: { usuarioId: id }
      })

      console.log(`Deletados ${agendamentosDeletados.count} agendamentos do usuário ${id}`)

      // Depois, deletar o usuário
      return await tx.usuario.delete({ 
        where: { id } 
      })
    })
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error)
    if (error.code === 'P2003') {
      throw new Error('Não é possível excluir o usuário pois existem agendamentos relacionados. Tente novamente.')
    }
    throw error
  }
}