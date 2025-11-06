'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, NotebookPenIcon, Phone, Timer, User } from 'lucide-react'
import { listarAgendamentos, Agendamento } from '@/lib/api'
import { isAuthenticated, isAdmin, removeUser } from '@/lib/auth'

export default function AgendamentosAdmin() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Verificar se está logado e é admin
    if (!isAuthenticated()) {
      router.push('/entrar')
      return
    }

    if (!isAdmin()) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.')
      router.push('/agendamentos')
      return
    }

    carregarAgendamentos()
  }, [router])

  useEffect(() => {
    // Aplicar filtros
    let filtrados = [...agendamentos]

    // Filtro por status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(ag => 
        ag.status.toLowerCase() === filtroStatus.toLowerCase()
      )
    }

    // Filtro por pesquisa
    if (termoPesquisa) {
      filtrados = filtrados.filter(ag =>
        ag.usuario.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        ag.usuario.email.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        ag.servico.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
      )
    }

    // Ordenar por data e horário (mais recentes primeiro)
    filtrados.sort((a, b) => {
      const dataA = new Date(a.data).getTime()
      const dataB = new Date(b.data).getTime()
      if (dataA !== dataB) return dataB - dataA
      return b.horario.localeCompare(a.horario)
    })

    setAgendamentosFiltrados(filtrados)
  }, [filtroStatus, termoPesquisa, agendamentos])

  const carregarAgendamentos = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const data = await listarAgendamentos()
      setAgendamentos(data)
      setAgendamentosFiltrados(data)
    } catch (err: any) {
      console.error('Erro ao carregar agendamentos:', err)
      setError('Erro ao carregar agendamentos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const navegarPara = (rota: string) => {
    router.push(rota)
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      removeUser()
      router.push('/entrar')
    }
  }

  const formatarData = (data: Date): string => {
    const dataObj = new Date(data)
    const opcoes: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
    return dataObj.toLocaleDateString('pt-BR', opcoes)
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'pendente':
        return 'bg-blue-100 text-blue-700'
      case 'confirmado':
        return 'bg-yellow-100 text-yellow-700'
      case 'concluido':
      case 'concluído':
        return 'bg-green-100 text-green-700'
      case 'cancelado':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string): string => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'confirmado') return 'Confirmado'
    if (statusLower === 'concluido' || statusLower === 'concluído') return 'Concluído'
    if (statusLower === 'cancelado') return 'Cancelado'
    return 'Pendente'
  }

  const contarPorStatus = (status: string) => {
    if (status === 'todos') return agendamentos.length
    return agendamentos.filter(ag => ag.status.toLowerCase() === status).length
  }

  // Prevenir hidratação SSR
  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl text-blue-600 m-0 font-bold">Agendamentos</h1>
          <p className="text-gray-500 mt-1.5">
            Gerencie todos os agendamentos do NAF
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            placeholder="Pesquisar por cliente ou serviço..."
            className="flex-1 p-2.5 text-black px-3.5 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
          />
          
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="p-2.5 px-3.5 text-black border border-gray-300 rounded-lg outline-none focus:border-blue-600 bg-white"
          >
            <option value="todos">Todos ({contarPorStatus('todos')})</option>
            <option value="pendente">Pendente ({contarPorStatus('pendente')})</option>
            <option value="confirmado">Confirmado ({contarPorStatus('confirmado')})</option>
            <option value="concluido">Concluído ({contarPorStatus('concluido')})</option>
            <option value="cancelado">Cancelado ({contarPorStatus('cancelado')})</option>
          </select>
        </div>

        {/* Cards de estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm">Total</div>
            <div className="text-2xl font-bold text-gray-800">{contarPorStatus('todos')}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
            <div className="text-blue-600 text-sm">Pendentes</div>
            <div className="text-2xl font-bold text-blue-700">{contarPorStatus('pendente')}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-100">
            <div className="text-yellow-600 text-sm">Confirmados</div>
            <div className="text-2xl font-bold text-yellow-700">{contarPorStatus('confirmado')}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
            <div className="text-green-600 text-sm">Concluídos</div>
            <div className="text-2xl font-bold text-green-700">{contarPorStatus('concluido')}</div>
          </div>
        </div>

        {/* Lista de agendamentos */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Carregando agendamentos...</p>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-lg">
              {termoPesquisa || filtroStatus !== 'todos' 
                ? 'Nenhum agendamento encontrado com os filtros aplicados.' 
                : 'Nenhum agendamento cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {agendamentosFiltrados.map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-800">
                        {agendamento.servico.nome}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          agendamento.status
                        )}`}
                      >
                        {getStatusLabel(agendamento.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {agendamento.servico.descricao}
                    </p>

                    {agendamento.observacoes && (
                      <p className="text-gray-500 text-sm italic mb-3 flex items-center gap-1">
                        <NotebookPenIcon size={18} color='#044CF4'/> {agendamento.observacoes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-5 text-gray-600 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={18} color='#044CF4'/>
                        <span className="font-medium">{agendamento.usuario.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} color='#044CF4'/>
                        <span>{formatarData(agendamento.data)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={18} color='#044CF4'/>
                        <span>{agendamento.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer size={18} color='#044CF4'/>
                        <span>{agendamento.servico.duracao_minutos} min</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={18} color='#044CF4'/> {agendamento.usuario.email}  <Phone size={18} color='#044CF4'/> {agendamento.usuario.telefone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}