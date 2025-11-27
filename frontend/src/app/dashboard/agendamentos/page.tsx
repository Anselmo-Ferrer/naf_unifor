'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Calendar, Clock, Mail, BookOpen, Phone, Timer, User, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { listarAgendamentos, Agendamento, atualizarAgendamento } from '@/lib/api'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import Modal from '@/components/Modal'
import Toaster from '@/components/Toaster'

export default function AgendamentosAdmin() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [acaoModal, setAcaoModal] = useState<{ 
    id: number
    status: string
    tipo: 'concluir' | 'cancelar'
    nomeServico: string
    nomeCliente: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    
    if (!isAuthenticated()) {
      router.push('/entrar')
      return
    }

    if (!isAdmin()) {
      toast.error('Acesso negado', {
        description: 'Apenas administradores podem acessar esta página.'
      })
      router.push('/agendamentos')
      return
    }

    carregarAgendamentos()
  }, [router])

  useEffect(() => {
    let filtrados = [...agendamentos]

    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(ag => 
        ag.status.toLowerCase() === filtroStatus.toLowerCase()
      )
    }

    if (termoPesquisa) {
      filtrados = filtrados.filter(ag =>
        ag.usuario.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        ag.usuario.email.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        ag.servico.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
      )
    }

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
      toast.error('Erro ao carregar agendamentos', {
        description: 'Não foi possível carregar os dados.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const abrirModal = (
    id: number, 
    status: string, 
    tipo: 'concluir' | 'cancelar',
    nomeServico: string,
    nomeCliente: string
  ) => {
    setAcaoModal({ id, status, tipo, nomeServico, nomeCliente })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAcaoModal(null)
  }

  const confirmarAcao = async () => {
    if (!acaoModal) return

    try {
      setAtualizandoId(acaoModal.id)
      setError('')
      
      await atualizarAgendamento(acaoModal.id, { status: acaoModal.status })
      
      setAgendamentos(prev => 
        prev.map(ag => ag.id === acaoModal.id ? { ...ag, status: acaoModal.status } : ag)
      )
      
      fecharModal()
      
      if (acaoModal.tipo === 'concluir') {
        toast.success('Agendamento concluído!', {
          description: `O serviço "${acaoModal.nomeServico}" foi marcado como concluído.`
        })
      } else {
        toast.success('Agendamento cancelado!', {
          description: `O agendamento de "${acaoModal.nomeCliente}" foi cancelado.`
        })
      }
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err)
      toast.error('Erro ao atualizar agendamento', {
        description: err.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setAtualizandoId(null)
    }
  }

  const formatarData = (data: Date): string => {
    const dataStr = data.toString().split(' ')[0]
    const [ano, mes, dia] = dataStr.split('-')
    const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia))
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

  const podeAtualizar = (status: string) => {
    const statusLower = status.toLowerCase()
    return statusLower !== 'cancelado' && statusLower !== 'concluido' && statusLower !== 'concluído'
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster />
      
      {/* Modal de Confirmação */}
      <Modal
        isOpen={modalAberto}
        onClose={fecharModal}
        title={acaoModal?.tipo === 'concluir' ? 'Concluir Agendamento' : 'Cancelar Agendamento'}
        description={
          acaoModal?.tipo === 'concluir'
            ? 'Tem certeza que deseja marcar este agendamento como concluído? Esta ação não pode ser desfeita.'
            : 'Tem certeza que deseja cancelar este agendamento? O cliente poderá ser notificado sobre o cancelamento.'
        }
        icon={
          acaoModal?.tipo === 'concluir' ? (
            <CheckCircle size={32} className="text-green-600" />
          ) : (
            <XCircle size={32} className="text-red-600" />
          )
        }
        iconBgColor={acaoModal?.tipo === 'concluir' ? 'bg-green-100' : 'bg-red-100'}
        onConfirm={confirmarAcao}
        confirmText={acaoModal?.tipo === 'concluir' ? 'Concluir' : 'Cancelar'}
        confirmColor={acaoModal?.tipo === 'concluir' ? 'green' : 'red'}
        isLoading={atualizandoId !== null}
      >
        {acaoModal && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Serviço:</span>
              <span className="text-sm font-medium text-gray-800">{acaoModal.nomeServico}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Cliente:</span>
              <span className="text-sm font-medium text-gray-800">{acaoModal.nomeCliente}</span>
            </div>
          </div>
        )}
      </Modal>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agendamentosFiltrados.map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {agendamento.servico.nome}
                        </h2>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            agendamento.status
                          )}`}
                        >
                          {getStatusLabel(agendamento.status)}
                        </span>
                      </div>
                    </div>
                    
                    {agendamento.servico.descricao && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {agendamento.servico.descricao}
                      </p>
                    )}

                    {agendamento.observacoes && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 mb-4">
                        <p className="text-gray-700 text-sm flex items-start gap-2">
                          <BookOpen size={16} className="text-blue-500 mt-0.5 flex-shrink-0"/> 
                          <span>{agendamento.observacoes}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-blue-600"/>
                        </div>
                        <span className="font-medium text-sm">{agendamento.usuario.nome}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Calendar size={14} className="text-gray-600"/>
                          </div>
                          <span className="text-sm">{formatarData(agendamento.data)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Clock size={14} className="text-gray-600"/>
                          </div>
                          <span className="text-sm">{agendamento.horario}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Timer size={14} className="text-gray-600"/>
                          </div>
                          <span className="text-sm">{agendamento.servico.duracao_minutos} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={14} className="text-gray-400"/>
                        <span className="truncate">{agendamento.usuario.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={14} className="text-gray-400"/>
                        <span>{agendamento.usuario.telefone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {podeAtualizar(agendamento.status) && (
                  <div className="flex gap-2 mt-5 pt-5 border-t border-gray-100">
                    <button
                      onClick={() => abrirModal(
                        agendamento.id, 
                        'concluido', 
                        'concluir',
                        agendamento.servico.nome,
                        agendamento.usuario.nome
                      )}
                      disabled={atualizandoId === agendamento.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm hover:shadow-md"
                      title="Marcar como concluído"
                    >
                      <CheckCircle size={18} />
                      Concluir
                    </button>
                    <button
                      onClick={() => abrirModal(
                        agendamento.id, 
                        'cancelado', 
                        'cancelar',
                        agendamento.servico.nome,
                        agendamento.usuario.nome
                      )}
                      disabled={atualizandoId === agendamento.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm hover:shadow-md"
                      title="Cancelar agendamento"
                    >
                      <XCircle size={18} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}