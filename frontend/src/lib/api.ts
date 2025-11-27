// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface RegistroData {
  nome: string
  email: string
  cpf: string
  telefone: string
  senha: string
}

export interface LoginData {
  email: string
  senha: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  telefone: string
  role: 'admin' | 'user'
}

export interface Servico {
  id: number
  nome: string
  descricao: string
  duracao_minutos: number
  ativo: boolean
}

export interface CriarAgendamentoData {
  data: string
  horario: string
  observacoes?: string
  servicoId: number
  usuarioId: number
}

export interface Agendamento {
  id: number
  data: Date
  horario: string
  status: string
  observacoes: string
  servico: Servico
  usuario: Usuario
}

export interface ClienteComAgendamentos extends Usuario {
  _count?: {
    agendamentos: number
  }
}

// Registrar novo usuário
export async function registrarUsuario(data: RegistroData): Promise<{ usuario: Usuario }> {
  const response = await fetch(`${API_URL}/auth/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar conta')
  }

  return response.json()
}

// Login
export async function loginUsuario(data: LoginData): Promise<{ usuario: Usuario }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao fazer login')
  }

  return response.json()
}

// Listar serviços
export async function listarServicos(): Promise<Servico[]> {
  const response = await fetch(`${API_URL}/servicos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao buscar serviços')
  }

  return response.json()
}

// Criar agendamento
export async function criarAgendamento(data: CriarAgendamentoData): Promise<Agendamento> {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao criar agendamento')
  }

  return response.json()
}

// Listar agendamentos
export async function listarAgendamentos(): Promise<Agendamento[]> {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao buscar agendamentos')
  }

  return response.json()
}

// Listar usuários (clientes)
export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao buscar usuários')
  }

  return response.json()
}

// Deletar usuário
export async function deletarUsuario(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar usuário')
  }
}

export const atualizarAgendamento = async (id: number, dados: Partial<{
  data?: Date | string
  horario?: string
  status?: string
  observacoes?: string
  servicoId?: number
  usuarioId?: number
}>) => {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao atualizar agendamento')
  }

  return response.json()
}

// Cancelar agendamento
export const cancelarAgendamento = async (id: number): Promise<Agendamento> => {
  return atualizarAgendamento(id, { status: 'cancelado' })
}

// Deletar agendamento
export const deletarAgendamento = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao deletar agendamento')
  }
}

// Buscar agendamento por ID
export const buscarAgendamentoPorId = async (id: number): Promise<Agendamento> => {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Erro ao buscar agendamento')
  }

  return response.json()
}

// CRUD de Serviços
export const criarServico = async (data: {
  nome: string
  descricao: string
  duracao_minutos: number
  ativo?: boolean
}): Promise<Servico> => {
  const response = await fetch(`${API_URL}/servicos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao criar serviço')
  }

  return response.json()
}

export const atualizarServico = async (id: number, data: Partial<{
  nome: string
  descricao: string
  duracao_minutos: number
  ativo: boolean
}>): Promise<Servico> => {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao atualizar serviço')
  }

  return response.json()
}

export const deletarServico = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar serviço')
  }
}

export const buscarServicoPorId = async (id: number): Promise<Servico> => {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao buscar serviço')
  }

  return response.json()
}