'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { listarServicos, criarAgendamento, Servico } from '@/lib/api'
import { getUser, isAuthenticated, removeUser } from '@/lib/auth'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

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

  // Verificar autenticação e carregar serviços
  useEffect(() => {
    setMounted(true)

    if (!isAuthenticated()) {
      alert('Você precisa estar logado para agendar!')
      router.push('/entrar')
      return
    }

    const user = getUser()
    setUsuario(user)

    carregarServicos()
  }, [router])

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
      alert('Sessão expirada. Faça login novamente.')
      router.push('/entrar')
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
      alert('✅ Atendimento agendado com sucesso!')

      // Redirecionar para a lista de agendamentos
      router.push('/agendamentos')
    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err)
      setError(err.message || 'Erro ao criar agendamento. Tente novamente.')
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

  return (
    <div className="bg-white text-gray-900 min-h-screen">
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
            <label htmlFor="servicoId" className="text-blue-600 font-medium">
              Serviço*
            </label>
            <select
              id="servicoId"
              value={formData.servicoId}
              onChange={handleChange}
              required
              disabled={isLoadingServicos || isLoading}
              className="border border-gray-300 rounded-lg p-3 text-base outline-none transition-all focus:border-blue-600 focus:shadow-[0_0_4px_rgba(21,87,255,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingServicos ? 'Carregando serviços...' : 'Selecione um serviço'}
              </option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome} ({servico.duracao_minutos} min)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="data" className="text-blue-600 font-medium">
              Data*
            </label>
            <input
              type="date"
              id="data"
              value={formData.data}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Data mínima: hoje
              required
              disabled={isLoading}
              className="border border-gray-300 rounded-lg p-3 text-base outline-none transition-all focus:border-blue-600 focus:shadow-[0_0_4px_rgba(21,87,255,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="horario" className="text-blue-600 font-medium">
              Horário*
            </label>
            <select
              id="horario"
              value={formData.horario}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="border border-gray-300 rounded-lg p-3 text-base outline-none transition-all focus:border-blue-600 focus:shadow-[0_0_4px_rgba(21,87,255,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione um horário</option>
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
            </select>
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