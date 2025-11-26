'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { listarAgendamentos, Agendamento } from '@/lib/api'
import { getUser, isAuthenticated, removeUser } from '@/lib/auth'
import { Calendar, Clock, LogOut, NotebookPenIcon, Plus, TimerIcon } from 'lucide-react'
import Link from 'next/link'

export default function Agendamentos() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Verificar se está logado
    if (!isAuthenticated()) {
      router.push('/entrar')
      return
    }

    const user = getUser()
    setUsuario(user)
    
    if (user) {
      carregarAgendamentos(user.id)
    }
  }, [router])

  const carregarAgendamentos = async (usuarioId: number) => {
    try {
      setIsLoading(true)
      setError('')
      
      const todosAgendamentos = await listarAgendamentos()
      
      // Filtrar apenas os agendamentos do usuário logado
      const agendamentosDoUsuario = todosAgendamentos
        .filter(ag => ag.usuario.id === usuarioId)
        .sort((a, b) => {
          const dataA = new Date(a.data).getTime()
          const dataB = new Date(b.data).getTime()
          if (dataA !== dataB) return dataB - dataA
          return b.horario.localeCompare(a.horario)
        })
      
      setAgendamentos(agendamentosDoUsuario)
    } catch (err: any) {
      console.error('Erro ao carregar agendamentos:', err)
      setError('Erro ao carregar agendamentos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const agendarAtendimento = () => {
    router.push('/novo-agendamento')
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

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'confirmado') return 'bg-green-50 text-green-600'
    if (statusLower === 'concluido' || statusLower === 'concluído') return 'bg-emerald-50 text-emerald-600'
    if (statusLower === 'cancelado') return 'bg-red-50 text-red-600'
    return 'bg-blue-50 text-blue-600' // pendente
  }

  const getStatusLabel = (status: string): string => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'confirmado') return 'Confirmado'
    if (statusLower === 'concluido' || statusLower === 'concluído') return 'Concluído'
    if (statusLower === 'cancelado') return 'Cancelado'
    return 'Pendente'
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      removeUser()
      router.push('/entrar')
    }
  }

  // Prevenir hidratação SSR até o componente montar
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <Link href='/' className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-800 transition-all">
              NAF Unifor
            </Link>
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/agendamentos')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                Meus agendamentos
              </button>
              
              {usuario && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-800">{usuario.nome.split(' ')[0]}</div>
                    <div className="text-xs text-gray-500">{usuario.email}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <span>{usuario.nome.slice(0,1).toUpperCase()}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className='flex items-center justify-center w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all hover:scale-110 shadow-sm hover:shadow-md'
                    title="Sair"
                  >
                    <LogOut size={18}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-5xl mx-auto p-10">
        <header className="mb-8">
          <h1 className="text-3xl text-blue-600 m-0">Meus agendamentos</h1>
          <p className="text-gray-500 mt-1.5">
            Gerencie seus atendimentos agendados
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            onClick={agendarAtendimento}
            disabled={isLoading}
            className="bg-blue-600 text-white border-none rounded-full py-3 px-6 text-base flex items-center gap-2 cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={24} color='#fff'/> Agendar atendimento
          </button>
        </div>

        <div>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Carregando agendamentos...</p>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm">
              <p className="text-gray-500 text-lg mb-4">
                Você ainda não tem agendamentos.
              </p>
              <button
                onClick={agendarAtendimento}
                className="bg-blue-600 text-white border-none rounded-full py-3 px-6 text-base cursor-pointer transition-colors hover:bg-blue-700"
              >
                Criar primeiro agendamento
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {agendamentos.map((ag) => (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl p-6 flex flex-col gap-4 relative shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group w-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {ag.servico.nome}
                      </h3>
                      {ag.servico.descricao && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {ag.servico.descricao}
                        </p>
                      )}
                    </div>
                    <span className={`${getStatusColor(ag.status)} rounded-full py-1.5 px-4 text-xs font-semibold whitespace-nowrap ml-3`}>
                      {getStatusLabel(ag.status)}
                    </span>
                  </div>

                  {ag.observacoes && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3">
                      <p className="text-gray-700 text-sm flex items-start gap-2">
                        <NotebookPenIcon size={16} className="text-blue-500 mt-0.5 flex-shrink-0"/> 
                        <span>{ag.observacoes}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-blue-600"/>
                      </div>
                      <span className="text-sm font-medium">{formatarData(ag.data)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-gray-600"/>
                      </div>
                      <span className="text-sm font-medium">{ag.horario}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <TimerIcon size={16} className="text-gray-600"/>
                      </div>
                      <span className="text-sm font-medium">{ag.servico.duracao_minutos} minutos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}