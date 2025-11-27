'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import { listarAgendamentos, listarUsuarios, Agendamento } from '@/lib/api'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

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
        // Normalizar data do agendamento para comparação local
        const dataAg = typeof ag.data === 'string' ? new Date(ag.data) : ag.data
        const dataAgNormalizada = new Date(dataAg.getFullYear(), dataAg.getMonth(), dataAg.getDate())
        dataAgNormalizada.setHours(0, 0, 0, 0)
        return dataAgNormalizada.getTime() === hoje.getTime()
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
        // Normalizar data do agendamento para comparação local
        const dataAg = typeof ag.data === 'string' ? new Date(ag.data) : ag.data
        const dataAgNormalizada = new Date(dataAg.getFullYear(), dataAg.getMonth(), dataAg.getDate())
        return dataAgNormalizada.getMonth() === data.getMonth() && 
               dataAgNormalizada.getFullYear() === data.getFullYear()
      }).length

      resultado.push({ mes: mesNome, quantidade })
    }

    return resultado
  }

  if (!mounted) {
    return null
  }

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
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-sm font-medium opacity-90 mb-1">Total de Agendamentos</h2>
                  <p className="text-4xl font-bold mb-2">{stats.totalAgendamentos}</p>
                  <span className="text-xs opacity-75 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Todos os registros
                  </span>
                </div>
              </div>

              {/* Pendentes */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-sm font-medium opacity-90 mb-1">Pendentes</h2>
                  <p className="text-4xl font-bold mb-2">{stats.pendentes}</p>
                  <span className="text-xs opacity-75">Aguardando confirmação</span>
                </div>
              </div>

              {/* Confirmados */}
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-28 h-28 bg-white/10 rounded-full -ml-14 -mt-14"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-sm font-medium opacity-90 mb-1">Confirmados</h2>
                  <p className="text-4xl font-bold mb-2">{stats.confirmados}</p>
                  <span className="text-xs opacity-75">Prontos para atender</span>
                </div>
              </div>

              {/* Concluídos */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-18 -mt-18"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <h2 className="text-sm font-medium opacity-90 mb-1">Concluídos</h2>
                  <p className="text-4xl font-bold mb-2">{stats.concluidos}</p>
                  <span className="text-xs opacity-75">Atendimentos finalizados</span>
                </div>
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
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Agendamentos por Mês</h2>
                  <p className="text-sm text-gray-500 mt-1">Evolução dos últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full px-4 py-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Análise Mensal</span>
                </div>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={agendamentosPorMes} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAgendamentos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 600 }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 500 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="quantidade" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAgendamentos)"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Estatísticas adicionais */}
              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAgendamentos}</div>
                  <div className="text-xs text-gray-500 mt-1">Total geral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.agendamentosHoje}</div>
                  <div className="text-xs text-gray-500 mt-1">Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-500">{stats.totalClientes}</div>
                  <div className="text-xs text-gray-500 mt-1">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.cancelados}</div>
                  <div className="text-xs text-gray-500 mt-1">Cancelados</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}