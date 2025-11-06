'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Users, CheckCircle, Clock, XCircle } from 'lucide-react'
import { listarAgendamentos, listarUsuarios, Agendamento, Usuario } from '@/lib/api'
import { isAuthenticated, isAdmin, removeUser } from '@/lib/auth'

interface DashboardStats {
  totalAgendamentos: number
  pendentes: number
  confirmados: number
  concluidos: number
  cancelados: number
  totalClientes: number
  agendamentosHoje: number
}

interface AgendamentoPorMes {
  mes: string
  quantidade: number
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalAgendamentos: 0,
    pendentes: 0,
    confirmados: 0,
    concluidos: 0,
    cancelados: 0,
    totalClientes: 0,
    agendamentosHoje: 0
  })
  const [agendamentosPorMes, setAgendamentosPorMes] = useState<AgendamentoPorMes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (!isAuthenticated()) {
      router.push('/entrar')
      return
    }

    if (!isAdmin()) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.')
      router.push('/agendamentos')
      return
    }

    carregarDados()
  }, [router])

  const carregarDados = async () => {
    try {
      setIsLoading(true)

      const [agendamentos, usuarios] = await Promise.all([
        listarAgendamentos(),
        listarUsuarios()
      ])

      // Calcular estatísticas
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const pendentes = agendamentos.filter(ag => ag.status.toLowerCase() === 'pendente').length
      const confirmados = agendamentos.filter(ag => ag.status.toLowerCase() === 'confirmado').length
      const concluidos = agendamentos.filter(ag => ag.status.toLowerCase() === 'concluido' || ag.status.toLowerCase() === 'concluído').length
      const cancelados = agendamentos.filter(ag => ag.status.toLowerCase() === 'cancelado').length
      
      const agendamentosHoje = agendamentos.filter(ag => {
        const dataAg = new Date(ag.data)
        dataAg.setHours(0, 0, 0, 0)
        return dataAg.getTime() === hoje.getTime()
      }).length

      const clientesUsuarios = usuarios.filter(u => u.role === 'user').length

      setStats({
        totalAgendamentos: agendamentos.length,
        pendentes,
        confirmados,
        concluidos,
        cancelados,
        totalClientes: clientesUsuarios,
        agendamentosHoje
      })

      // Calcular agendamentos por mês (últimos 6 meses)
      const agrupadoPorMes = calcularAgendamentosPorMes(agendamentos)
      setAgendamentosPorMes(agrupadoPorMes)

    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const calcularAgendamentosPorMes = (agendamentos: Agendamento[]): AgendamentoPorMes[] => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const hoje = new Date()
    const resultado: AgendamentoPorMes[] = []

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mesNome = meses[data.getMonth()]
      
      const quantidade = agendamentos.filter(ag => {
        const dataAg = new Date(ag.data)
        return dataAg.getMonth() === data.getMonth() && 
               dataAg.getFullYear() === data.getFullYear()
      }).length

      resultado.push({ mes: mesNome, quantidade })
    }

    return resultado
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

  if (!mounted) {
    return null
  }

  const maxValue = Math.max(...agendamentosPorMes.map(m => m.quantidade), 1)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header>
          <h1 className="text-3xl text-blue-600 m-0 font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1.5 mb-10">
            Visão geral e estatísticas do NAF
          </p>
        </header>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Carregando estatísticas...</p>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Total de Agendamentos */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    Total
                  </div>
                </div>
                <h2 className="text-sm font-medium opacity-90 mb-2">Total de Agendamentos</h2>
                <p className="text-4xl font-bold mb-1">{stats.totalAgendamentos}</p>
                <span className="text-xs opacity-80">Todos os registros</span>
              </div>

              {/* Pendentes */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div className="bg-yellow-50 text-yellow-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {stats.pendentes}
                  </div>
                </div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Pendentes</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.pendentes}</p>
                <span className="text-xs text-gray-500">Aguardando confirmação</span>
              </div>

              {/* Confirmados */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-500" />
                  <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {stats.confirmados}
                  </div>
                </div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Confirmados</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.confirmados}</p>
                <span className="text-xs text-gray-500">Prontos para atender</span>
              </div>

              {/* Concluídos */}
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {stats.concluidos}
                  </div>
                </div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Concluídos</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.concluidos}</p>
                <span className="text-xs text-gray-500">Atendimentos finalizados</span>
              </div>
            </div>

            {/* Segunda linha de cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"> */}
              {/* Total de Clientes */}
              {/* <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Ativos
                  </div>
                </div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Total de Clientes</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.totalClientes}</p>
                <span className="text-xs text-gray-500">Usuários cadastrados</span>
              </div> */}

              {/* Agendamentos Hoje */}
              {/* <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    Hoje
                  </div>
                </div>
                <h2 className="text-sm font-medium opacity-90 mb-2">Agendamentos Hoje</h2>
                <p className="text-4xl font-bold mb-1">{stats.agendamentosHoje}</p>
                <span className="text-xs opacity-80">Atendimentos do dia</span>
              </div> */}

              {/* Cancelados */}
              {/* <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div className="bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs font-semibold">
                    {stats.cancelados}
                  </div>
                </div>
                <h2 className="text-sm font-medium text-gray-600 mb-2">Cancelados</h2>
                <p className="text-3xl font-bold text-gray-800">{stats.cancelados}</p>
                <span className="text-xs text-gray-500">Agendamentos cancelados</span>
              </div>
            </div> */}

            {/* Gráfico de Agendamentos por Mês */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Agendamentos por Mês</h2>
                  <p className="text-sm text-gray-500 mt-1">Últimos 6 meses</p>
                </div>
                <div className="bg-blue-50 text-blue-600 rounded-full px-4 py-2 text-sm font-semibold">
                  Tendência ↗
                </div>
              </div>

              <div className="h-80 flex items-end justify-around gap-4">
                {agendamentosPorMes.map((item, index) => {
                  const altura = (item.quantidade / maxValue) * 100
                  const isHighest = item.quantidade === maxValue && maxValue > 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                      {/* Valor */}
                      <div className={`text-sm font-bold transition-all ${
                        item.quantidade > 0 ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {item.quantidade}
                      </div>
                      
                      {/* Barra */}
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden group cursor-pointer" 
                           style={{ height: '240px' }}>
                        <div 
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                            isHighest 
                              ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                              : 'bg-gradient-to-t from-blue-500 to-blue-300'
                          } group-hover:from-blue-700 group-hover:to-blue-500`}
                          style={{ height: `${altura}%` }}
                        >
                          {/* Efeito de brilho */}
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </div>
                      </div>
                      
                      {/* Mês */}
                      <div className="text-sm font-medium text-gray-600">
                        {item.mes}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legenda */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-300"></div>
                  <span className="text-sm text-gray-600">Agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-600 to-blue-400"></div>
                  <span className="text-sm text-gray-600">Pico</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}