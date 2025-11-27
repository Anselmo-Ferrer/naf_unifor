'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { listarServicos, criarAgendamento, listarAgendamentos, Servico, Agendamento } from '@/lib/api'
import { getUser, isAuthenticated, removeUser } from '@/lib/auth'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Toaster from '@/components/Toaster'

interface FormData {
  servicoId: string
  data: string
  horario: string
  observacoes: string
}

export default function NovoAgendamento() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  })
  const [servicos, setServicos] = useState<Servico[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingServicos, setIsLoadingServicos] = useState(true)
  const [error, setError] = useState('')
  const [usuario, setUsuario] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  
  // Estados do calendário
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  
  // Estados para agendamentos e horários ocupados
  const [agendamentosExistentes, setAgendamentosExistentes] = useState<Agendamento[]>([])
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  
  // Horários disponíveis
  const horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  // Verificar autenticação e carregar serviços
  useEffect(() => {
    setMounted(true)

    if (!isAuthenticated()) {
      toast.error('Acesso negado', {
        description: 'Você precisa estar logado para agendar!'
      })
      setTimeout(() => {
        router.push('/entrar')
      }, 1500)
      return
    }

    const user = getUser()
    setUsuario(user)

    carregarServicos()
    carregarAgendamentos()
  }, [router])

  // Carregar agendamentos existentes
  const carregarAgendamentos = async () => {
    try {
      const agendamentos = await listarAgendamentos()
      setAgendamentosExistentes(agendamentos)
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err)
    }
  }

  const carregarServicos = async () => {
    try {
      setIsLoadingServicos(true)
      const data = await listarServicos()
      const servicosAtivos = data.filter(s => s.ativo)
      setServicos(servicosAtivos)
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err)
      setError('Erro ao carregar serviços. Tente novamente.')
    } finally {
      setIsLoadingServicos(false)
    }
  }

  const marcarAtendimento = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validação: todos os campos obrigatórios devem estar preenchidos
    if (!formData.servicoId || !formData.data || !formData.horario) {
      setError('Você deve preencher todos os campos obrigatórios!')
      return
    }

    const usuario = getUser()
    if (!usuario) {
      toast.error('Sessão expirada', {
        description: 'Faça login novamente para continuar.'
      })
      setTimeout(() => {
        router.push('/entrar')
      }, 1500)
      return
    }

    setIsLoading(true)

    try {
      // Criar o agendamento
      const novoAgendamento = await criarAgendamento({
        data: formData.data, // ISO format: 2024-01-15
        horario: formData.horario,
        observacoes: formData.observacoes || '',
        servicoId: Number(formData.servicoId),
        usuarioId: usuario.id
      })

      console.log('Agendamento criado:', novoAgendamento)

      // Mensagem de sucesso
      toast.success('Atendimento agendado com sucesso!', {
        description: 'Você será redirecionado para seus agendamentos.'
      })

      // Redirecionar para a lista de agendamentos
      setTimeout(() => {
        router.push('/agendamentos')
      }, 1500)
    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err)
      const mensagemErro = err.message || 'Erro ao criar agendamento. Tente novamente.'
      setError(mensagemErro)
      toast.error('Erro ao criar agendamento', {
        description: mensagemErro
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      removeUser()
      router.push('/entrar')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  // Funções do calendário
  const diasDoMes = () => {
    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate()
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const dias: Array<{ dia: number; disponivel: boolean; data: Date }> = []
    
    // Preencher dias vazios do início
    for (let i = 0; i < primeiroDia; i++) {
      dias.push({ dia: 0, disponivel: false, data: new Date() })
    }
    
    // Adicionar dias do mês
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = new Date(anoAtual, mesAtual, dia)
      data.setHours(0, 0, 0, 0)
      const disponivel = data >= hoje
      dias.push({ dia, disponivel, data })
    }
    
    return dias
  }

  const selecionarData = (data: Date) => {
    // Formatar data como YYYY-MM-DD sem problemas de timezone
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    const dataStr = `${ano}-${mes}-${dia}`
    
    // Limpar horário selecionado ao trocar de data
    setFormData({
      ...formData,
      data: dataStr,
      horario: '' // Limpar horário ao trocar de data
    })
    
    // Verificar horários ocupados para a data selecionada
    verificarHorariosOcupados(dataStr)
  }

  const verificarHorariosOcupados = (data: string) => {
    setCarregandoHorarios(true)
    
    // Filtrar agendamentos da data selecionada que não estão cancelados
    const agendamentosNaData = agendamentosExistentes.filter(ag => {
      const dataAgendamento = new Date(ag.data).toISOString().split('T')[0]
      return dataAgendamento === data && 
             ag.status.toLowerCase() !== 'cancelado' &&
             ag.status.toLowerCase() !== 'concluido' &&
             ag.status.toLowerCase() !== 'concluído'
    })
    
    // Extrair horários ocupados
    const ocupados = agendamentosNaData.map(ag => ag.horario)
    setHorariosOcupados(ocupados)
    setCarregandoHorarios(false)
  }

  // Verificar horários ocupados quando a data ou agendamentos mudarem
  useEffect(() => {
    if (formData.data) {
      setCarregandoHorarios(true)
      
      // Filtrar agendamentos da data selecionada que não estão cancelados
      const agendamentosNaData = agendamentosExistentes.filter(ag => {
        const dataAgendamento = new Date(ag.data).toISOString().split('T')[0]
        return dataAgendamento === formData.data && 
               ag.status.toLowerCase() !== 'cancelado' &&
               ag.status.toLowerCase() !== 'concluido' &&
               ag.status.toLowerCase() !== 'concluído'
      })
      
      // Extrair horários ocupados
      const ocupados = agendamentosNaData.map(ag => ag.horario)
      setHorariosOcupados(ocupados)
      setCarregandoHorarios(false)
    } else {
      setHorariosOcupados([])
    }
  }, [formData.data, agendamentosExistentes])

  const selecionarServico = (servicoId: string) => {
    setFormData({
      ...formData,
      servicoId
    })
  }

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }

  const mesProximo = () => {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }

  const selecionarHorario = (horario: string) => {
    setFormData({
      ...formData,
      horario
    })
  }

  const nomesDosMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const nomesDosDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Toaster />
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

      {/* MAIN */}
      <main className="px-12 py-12 max-w-3xl mx-auto">
        <h1 className="text-4xl text-blue-600 mb-2 font-semibold">
          Novo Agendamento
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Agende seu atendimento no NAF
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={marcarAtendimento} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-blue-600 font-medium">
              Serviço*
            </label>
            
            {isLoadingServicos ? (
              <div className="border border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500">Carregando serviços...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicos.map((servico) => {
                  const selecionado = formData.servicoId === String(servico.id)
                  return (
                    <button
                      key={servico.id}
                      type="button"
                      onClick={() => selecionarServico(String(servico.id))}
                      disabled={isLoading}
                      className={`
                        p-4 rounded-xl text-left transition-all duration-200 border-2
                        ${selecionado
                          ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300 border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 border-gray-200'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div className="font-semibold text-base mb-1">{servico.nome}</div>
                      <div className={`text-sm ${selecionado ? 'text-blue-100' : 'text-gray-500'}`}>
                        {servico.descricao && (
                          <p className="line-clamp-2 mb-1">{servico.descricao}</p>
                        )}
                        <span className="font-medium">{servico.duracao_minutos} minutos</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            
            {/* Input hidden para validação do formulário */}
            <input
              type="hidden"
              id="servicoId"
              value={formData.servicoId}
              required
            />
            
            {formData.servicoId && (
              <p className="text-sm text-gray-600 mt-2">
                Serviço selecionado:{' '}
                <span className="font-semibold text-blue-600">
                  {servicos.find(s => String(s.id) === formData.servicoId)?.nome}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-blue-600 font-medium">
              Data*
            </label>
            
            {/* Calendário Visual */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              {/* Header do Calendário */}
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={mesAnterior}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {nomesDosMeses[mesAtual]} {anoAtual}
                </h3>
                <button
                  type="button"
                  onClick={mesProximo}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </div>

              {/* Grid do Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {/* Headers dos dias da semana */}
                {nomesDosDias.map((dia) => (
                  <div key={dia} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {dia}
                  </div>
                ))}
                
                {/* Dias do calendário */}
                {diasDoMes().map((item, index) => {
                  if (item.dia === 0) {
                    return <div key={index} className="h-10" />
                  }
                  
                  const dataStr = item.data.toISOString().split('T')[0]
                  const selecionado = formData.data === dataStr
                  const hoje = new Date()
                  hoje.setHours(0, 0, 0, 0)
                  const ehHoje = item.data.getTime() === hoje.getTime()
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => item.disponivel && selecionarData(item.data)}
                      disabled={!item.disponivel || isLoading}
                      className={`
                        h-10 rounded-lg font-medium transition-all
                        ${!item.disponivel 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : selecionado
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : ehHoje
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }
                        ${selecionado ? 'ring-2 ring-blue-300' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {item.dia}
                    </button>
                  )
                })}
              </div>
              
              {/* Data selecionada */}
              {formData.data && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Data selecionada:{' '}
                    <span className="font-semibold text-blue-600">
                      {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Input hidden para validação do formulário */}
            <input
              type="hidden"
              id="data"
              value={formData.data}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-blue-600 font-medium">
              Horário*
            </label>
            
            {/* Botões de Horário */}
            {!formData.data ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800 text-sm">
                  Selecione uma data primeiro para ver os horários disponíveis
                </p>
              </div>
            ) : carregandoHorarios ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Verificando disponibilidade...</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {horariosDisponiveis.map((horario) => {
                  const selecionado = formData.horario === horario
                  const ocupado = horariosOcupados.includes(horario)
                  
                  return (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => !ocupado && selecionarHorario(horario)}
                      disabled={isLoading || ocupado}
                      className={`
                        py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 relative
                        ${ocupado
                          ? 'bg-red-50 text-red-400 cursor-not-allowed line-through border-2 border-red-200'
                          : selecionado
                            ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border-2 border-transparent'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed
                      `}
                      title={ocupado ? 'Horário já agendado' : ''}
                    >
                      {horario}
                      {ocupado && (
                        <span className="absolute top-1 right-1 text-xs">✗</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            
            {/* Input hidden para validação do formulário */}
            <input
              type="hidden"
              id="horario"
              value={formData.horario}
              required
            />
            
            {formData.horario && (
              <p className="text-sm text-gray-600 mt-2">
                Horário selecionado:{' '}
                <span className="font-semibold text-blue-600">{formData.horario}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="observacoes" className="text-blue-600 font-medium">
              Observações (opcional)
            </label>
            <textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Adicione informações adicionais sobre seu atendimento..."
              disabled={isLoading}
              className="border border-gray-300 rounded-lg p-3 text-base outline-none transition-all min-h-[100px] resize-y focus:border-blue-600 focus:shadow-[0_0_4px_rgba(21,87,255,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-center mt-6 gap-4">
            <button
              type="button"
              onClick={() => router.push('agendamentos')}
              disabled={isLoading}
              className="bg-transparent border-[1.5px] w-[200px] border-gray-900 rounded-full py-3 px-6 text-base text-gray-900 cursor-pointer transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingServicos}
              className="bg-blue-600 border-none rounded-full w-[200px] py-3 px-6 text-base text-white cursor-pointer transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Agendando...' : 'Marcar atendimento'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}