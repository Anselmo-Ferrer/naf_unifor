'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { listarAgendamentos, Agendamento, cancelarAgendamento, atualizarAgendamento, listarServicos, Servico } from '@/lib/api'
import { getUser, isAuthenticated, removeUser } from '@/lib/auth'
import { Calendar, Clock, LogOut, NotebookPenIcon, Plus, TimerIcon, XCircle, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Toaster from '@/components/Toaster'
import Modal from '@/components/Modal'

export default function Agendamentos() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [modalCancelar, setModalCancelar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [formEdicao, setFormEdicao] = useState({
    data: '',
    horario: '',
    servicoId: '',
    observacoes: ''
  })
  const [processando, setProcessando] = useState(false)

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
      carregarServicos()
    }
  }, [router])

  const carregarServicos = async () => {
    try {
      const data = await listarServicos()
      setServicos(data.filter(s => s.ativo))
    } catch (err) {
      console.error('Erro ao carregar serviços:', err)
    }
  }

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

  const podeCancelar = (status: string) => {
    const statusLower = status.toLowerCase()
    return statusLower !== 'cancelado' && statusLower !== 'concluido' && statusLower !== 'concluído'
  }

  const podeEditar = (status: string) => {
    const statusLower = status.toLowerCase()
    return statusLower !== 'cancelado' && statusLower !== 'concluido' && statusLower !== 'concluído'
  }

  const abrirModalCancelar = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento)
    setModalCancelar(true)
  }

  const abrirModalEditar = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento)
    setFormEdicao({
      data: new Date(agendamento.data).toISOString().split('T')[0],
      horario: agendamento.horario,
      servicoId: agendamento.servico.id.toString(),
      observacoes: agendamento.observacoes || ''
    })
    setModalEditar(true)
  }

  const fecharModais = () => {
    setModalCancelar(false)
    setModalEditar(false)
    setAgendamentoSelecionado(null)
  }

  const confirmarCancelar = async () => {
    if (!agendamentoSelecionado) return

    try {
      setProcessando(true)
      await cancelarAgendamento(agendamentoSelecionado.id)
      
      setAgendamentos(prev => 
        prev.map(ag => 
          ag.id === agendamentoSelecionado.id 
            ? { ...ag, status: 'cancelado' } 
            : ag
        )
      )
      
      toast.success('Agendamento cancelado!', {
        description: 'Seu agendamento foi cancelado com sucesso.'
      })
      
      fecharModais()
    } catch (err: any) {
      toast.error('Erro ao cancelar agendamento', {
        description: err.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setProcessando(false)
    }
  }

  const confirmarEditar = async () => {
    if (!agendamentoSelecionado) return

    try {
      setProcessando(true)
      
      await atualizarAgendamento(agendamentoSelecionado.id, {
        data: formEdicao.data,
        horario: formEdicao.horario,
        servicoId: parseInt(formEdicao.servicoId),
        observacoes: formEdicao.observacoes
      })
      
      // Recarregar agendamentos
      if (usuario) {
        await carregarAgendamentos(usuario.id)
      }
      
      toast.success('Agendamento atualizado!', {
        description: 'Seu agendamento foi atualizado com sucesso.'
      })
      
      fecharModais()
    } catch (err: any) {
      toast.error('Erro ao atualizar agendamento', {
        description: err.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setProcessando(false)
    }
  }

  // Prevenir hidratação SSR até o componente montar
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Modal Cancelar */}
      <Modal
        isOpen={modalCancelar}
        onClose={fecharModais}
        title="Cancelar Agendamento"
        description="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        icon={<XCircle size={32} className="text-red-600" />}
        iconBgColor="bg-red-100"
        onConfirm={confirmarCancelar}
        confirmText="Cancelar Agendamento"
        confirmColor="red"
        isLoading={processando}
      >
        {agendamentoSelecionado && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Serviço:</span>
              <span className="text-sm font-medium text-gray-800">{agendamentoSelecionado.servico.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Data:</span>
              <span className="text-sm font-medium text-gray-800">{formatarData(agendamentoSelecionado.data)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Horário:</span>
              <span className="text-sm font-medium text-gray-800">{agendamentoSelecionado.horario}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={modalEditar}
        onClose={fecharModais}
        title="Editar Agendamento"
        description="Altere os dados do seu agendamento."
        showActions={false}
      >
        {agendamentoSelecionado && (
          <form onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
              <select
                value={formEdicao.servicoId}
                onChange={(e) => setFormEdicao({ ...formEdicao, servicoId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">Selecione um serviço</option>
                {servicos.map(servico => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} ({servico.duracao_minutos} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={formEdicao.data}
                onChange={(e) => setFormEdicao({ ...formEdicao, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <select
                value={formEdicao.horario}
                onChange={(e) => setFormEdicao({ ...formEdicao, horario: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                required
              >
                <option value="">Selecione um horário</option>
                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(horario => (
                  <option key={horario} value={horario}>{horario}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
              <textarea
                value={formEdicao.observacoes}
                onChange={(e) => setFormEdicao({ ...formEdicao, observacoes: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                placeholder="Adicione observações sobre seu agendamento..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={fecharModais}
                disabled={processando}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={processando}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
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

                  {(podeCancelar(ag.status) || podeEditar(ag.status)) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {podeCancelar(ag.status) && (
                        <button
                          onClick={() => abrirModalCancelar(ag)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <XCircle size={18} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}