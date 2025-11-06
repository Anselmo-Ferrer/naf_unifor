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
      const agendamentosDoUsuario = todosAgendamentos.filter(
        ag => ag.usuario.id === usuarioId
      )
      
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
    if (statusLower === 'cancelado') return 'bg-red-50 text-red-600'
    return 'bg-blue-50 text-blue-600' // pendente
  }

  const getStatusLabel = (status: string): string => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'confirmado') return 'Confirmado'
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
      <header className="flex justify-between items-center px-12 py-4 border-b border-gray-200 bg-white">
        <Link href='/' className="text-xl font-bold text-blue-600">NAF Unifor</Link>
        <div className="flex items-center gap-4 text-[0.95rem]">
          <button
            onClick={() => router.push('/agendamentos')}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Meus agendamentos
          </button>
          {usuario && (
            <span className="text-gray-700">
              <span className="font-semibold">{usuario.nome.split(' ')[0]}</span>
            </span>
          )}
          {usuario && (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <span className="font-semibold">{usuario.nome.slice(0,1).toUpperCase()}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className='flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-300 cursor-pointer'
          >
            <LogOut color='#044CF4' size={16}/>
          </button>
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
            agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="bg-white rounded-xl p-6 mb-4 flex flex-col gap-2.5 relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`absolute top-5 right-5 ${getStatusColor(ag.status)} rounded-full py-1 px-3 text-sm font-medium`}>
                  {getStatusLabel(ag.status)}
                </div>
                
                <div className="font-semibold text-lg text-gray-900">
                  {ag.servico.nome}
                </div>
                
                <div className="text-gray-600 text-[0.95rem] mb-2.5">
                  {ag.servico.descricao}
                </div>

                {ag.observacoes && (
                  <div className="text-gray-500 text-sm italic mb-2 flex items-center gap-1">
                    <NotebookPenIcon size={18} color='#044CF4'/> {ag.observacoes}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-gray-800 text-sm">
                  <span className='flex items-center gap-1'><Calendar size={18} color='#044CF4'/> {formatarData(ag.data)}</span>
                  <span className='flex items-center gap-1'><Clock size={18} color='#044CF4'/> {ag.horario}</span>
                  <span className='flex items-center gap-1'><TimerIcon size={18} color='#044CF4'/>{ag.servico.duracao_minutos} min</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}