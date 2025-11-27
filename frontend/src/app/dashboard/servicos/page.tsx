'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { listarServicos, criarServico, atualizarServico, deletarServico, Servico } from '@/lib/api'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/Modal'
import Toaster from '@/components/Toaster'

export default function ServicosAdmin() {
  const router = useRouter()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalDeletar, setModalDeletar] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao_minutos: '',
    ativo: true
  })

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

    carregarServicos()
  }, [router])

  const carregarServicos = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const data = await listarServicos()
      setServicos(data)
    } catch (err: any) {
      console.error('Erro ao carregar serviços:', err)
      setError('Erro ao carregar serviços. Tente novamente.')
      toast.error('Erro ao carregar serviços', {
        description: 'Não foi possível carregar os dados.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const abrirModalCriar = () => {
    setModoEdicao(false)
    setServicoSelecionado(null)
    setFormData({
      nome: '',
      descricao: '',
      duracao_minutos: '',
      ativo: true
    })
    setModalAberto(true)
  }

  const abrirModalEditar = (servico: Servico) => {
    setModoEdicao(true)
    setServicoSelecionado(servico)
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao,
      duracao_minutos: servico.duracao_minutos.toString(),
      ativo: servico.ativo
    })
    setModalAberto(true)
  }

  const abrirModalDeletar = (servico: Servico) => {
    setServicoSelecionado(servico)
    setModalDeletar(true)
  }

  const fecharModais = () => {
    setModalAberto(false)
    setModalDeletar(false)
    setServicoSelecionado(null)
    setModoEdicao(false)
  }

  const salvarServico = async () => {
    if (!formData.nome || !formData.descricao || !formData.duracao_minutos) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha todos os campos obrigatórios.'
      })
      return
    }

    try {
      setProcessando(true)
      
      if (modoEdicao && servicoSelecionado) {
        await atualizarServico(servicoSelecionado.id, {
          nome: formData.nome,
          descricao: formData.descricao,
          duracao_minutos: parseInt(formData.duracao_minutos),
          ativo: formData.ativo
        })
        toast.success('Serviço atualizado!', {
          description: 'O serviço foi atualizado com sucesso.'
        })
      } else {
        await criarServico({
          nome: formData.nome,
          descricao: formData.descricao,
          duracao_minutos: parseInt(formData.duracao_minutos),
          ativo: formData.ativo
        })
        toast.success('Serviço criado!', {
          description: 'O novo serviço foi criado com sucesso.'
        })
      }
      
      await carregarServicos()
      fecharModais()
    } catch (err: any) {
      toast.error('Erro ao salvar serviço', {
        description: err.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setProcessando(false)
    }
  }

  const confirmarDeletar = async () => {
    if (!servicoSelecionado) return

    try {
      setProcessando(true)
      await deletarServico(servicoSelecionado.id)
      
      toast.success('Serviço excluído!', {
        description: 'O serviço e todos os agendamentos relacionados foram excluídos.'
      })
      
      await carregarServicos()
      fecharModais()
    } catch (err: any) {
      toast.error('Erro ao excluir serviço', {
        description: err.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setProcessando(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster />
      
      {/* Modal Criar/Editar */}
      <Modal
        isOpen={modalAberto}
        onClose={fecharModais}
        title={modoEdicao ? 'Editar Serviço' : 'Novo Serviço'}
        description={modoEdicao ? 'Altere os dados do serviço.' : 'Preencha os dados para criar um novo serviço.'}
        showActions={false}
      >
        <form onSubmit={(e) => { e.preventDefault(); salvarServico(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="text-black w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="Ex: Declaração de IRPF"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="text-black w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="Descreva o serviço oferecido..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos) *</label>
            <input
              type="number"
              value={formData.duracao_minutos}
              onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
              className="text-black w-full p-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              placeholder="30"
              min="1"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
              Serviço ativo (disponível para agendamento)
            </label>
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
                modoEdicao ? 'Salvar Alterações' : 'Criar Serviço'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Deletar */}
      <Modal
        isOpen={modalDeletar}
        onClose={fecharModais}
        title="Excluir Serviço"
        description="Tem certeza que deseja excluir este serviço? Todos os agendamentos relacionados serão excluídos permanentemente. Esta ação não pode ser desfeita."
        icon={<Trash2 size={32} className="text-red-600" />}
        iconBgColor="bg-red-100"
        onConfirm={confirmarDeletar}
        confirmText="Excluir"
        confirmColor="red"
        isLoading={processando}
      >
        {servicoSelecionado && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Serviço:</span>
              <span className="text-sm font-medium text-gray-800">{servicoSelecionado.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Duração:</span>
              <span className="text-sm font-medium text-gray-800">{servicoSelecionado.duracao_minutos} minutos</span>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-blue-600 m-0 font-bold">Serviços</h1>
              <p className="text-gray-500 mt-1.5">
                Gerencie os serviços oferecidos pelo NAF
              </p>
            </div>
            <button
              onClick={abrirModalCriar}
              className="bg-blue-600 text-white border-none rounded-xl py-3 px-6 text-base flex items-center gap-2 cursor-pointer transition-colors hover:bg-blue-700 shadow-sm hover:shadow-md"
            >
              <Plus size={20} /> Novo Serviço
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-lg mb-4">
              Nenhum serviço cadastrado.
            </p>
            <button
              onClick={abrirModalCriar}
              className="bg-blue-600 text-white border-none rounded-full py-3 px-6 text-base cursor-pointer transition-colors hover:bg-blue-700"
            >
              Criar primeiro serviço
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico) => (
              <div
                key={servico.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {servico.nome}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {servico.descricao}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {servico.duracao_minutos} min
                      </span>
                      <span className={`flex items-center gap-1 ${servico.ativo ? 'text-green-600' : 'text-red-600'}`}>
                        {servico.ativo ? (
                          <>
                            <CheckCircle size={16} />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            Inativo
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => abrirModalEditar(servico)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    <Edit size={18} />
                    Editar
                  </button>
                  <button
                    onClick={() => abrirModalDeletar(servico)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

