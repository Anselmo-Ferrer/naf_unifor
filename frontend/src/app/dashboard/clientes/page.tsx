'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { listarUsuarios, listarAgendamentos, deletarUsuario, Usuario, Agendamento } from '@/lib/api'
import { getUser, isAuthenticated, isAdmin, removeUser } from '@/lib/auth'
import { Trash, Users, XCircle } from 'lucide-react'
import Modal from '@/components/Modal'
import Toaster from '@/components/Toaster'
import { toast } from 'sonner'

interface ClienteComContagem extends Usuario {
  agendamentos: number
}

export default function Clientes() {
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteComContagem[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteComContagem[]>([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteComContagem | null>(null)
  const [excluindoId, setExcluindoId] = useState<number | null>(null)
  const itensPorPagina = 5

  useEffect(() => {
    setMounted(true)
    
    // Verificar se está logado e é admin
    if (!isAuthenticated()) {
      router.push('/entrar')
      return
    }

    if (!isAdmin()) {
      toast.error('Acesso negado', {
        description: 'Apenas administradores podem acessar esta página.'
      })
      setTimeout(() => {
        router.push('/agendamentos')
      }, 1500)
      return
    }

    carregarDados()
  }, [router])

  useEffect(() => {
    // Filtrar clientes quando mudar o termo de pesquisa
    const filtrados = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      cliente.email.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      cliente.cpf.includes(termoPesquisa) ||
      cliente.telefone.includes(termoPesquisa)
    )
    setClientesFiltrados(filtrados)
    setPaginaAtual(1) // Resetar para primeira página ao pesquisar
  }, [termoPesquisa, clientes])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Buscar todos os usuários e agendamentos
      const [usuarios, agendamentos] = await Promise.all([
        listarUsuarios(),
        listarAgendamentos()
      ])

      // Filtrar apenas usuários com role 'user' (não incluir admins)
      const usuariosClientes = usuarios.filter(u => u.role === 'user')

      // Contar agendamentos por usuário
      const clientesComContagem: ClienteComContagem[] = usuariosClientes.map(usuario => {
        const contagemAgendamentos = agendamentos.filter(
          ag => ag.usuario.id === usuario.id
        ).length

        return {
          ...usuario,
          agendamentos: contagemAgendamentos
        }
      })

      setClientes(clientesComContagem)
      setClientesFiltrados(clientesComContagem)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar clientes. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const abrirModalExclusao = (cliente: ClienteComContagem) => {
    setClienteParaExcluir(cliente)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setClienteParaExcluir(null)
  }

  const excluirCliente = async () => {
    if (!clienteParaExcluir) return

    try {
      setExcluindoId(clienteParaExcluir.id)
      setError('')
      
      await deletarUsuario(clienteParaExcluir.id)
      
      fecharModal()
      
      toast.success('Cliente excluído com sucesso!', {
        description: `O cliente "${clienteParaExcluir.nome}" foi removido do sistema.`
      })
      
      // Recarregar dados
      await carregarDados()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao excluir cliente.'
      setError(mensagemErro)
      toast.error('Erro ao excluir cliente', {
        description: mensagemErro
      })
    } finally {
      setExcluindoId(null)
    }
  }

  // Paginação
  const inicio = (paginaAtual - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  const clientesPagina = clientesFiltrados.slice(inicio, fim)
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina)

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  // Prevenir hidratação SSR
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
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos."
        icon={<XCircle size={32} className="text-red-600" />}
        iconBgColor="bg-red-100"
        onConfirm={excluirCliente}
        confirmText="Excluir"
        confirmColor="red"
        isLoading={excluindoId !== null}
      >
        {clienteParaExcluir && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Nome:</span>
              <span className="text-sm font-medium text-gray-800">{clienteParaExcluir.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="text-sm font-medium text-gray-800">{clienteParaExcluir.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Agendamentos:</span>
              <span className="text-sm font-medium text-gray-800">{clienteParaExcluir.agendamentos}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header>
          <h1 className="text-3xl text-blue-600 m-0">Clientes</h1>
          <p className="text-gray-500 mt-1.5 mb-8">
            Clientes cadastrados e número de agendamentos
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="mb-5 flex justify-between items-center">
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            placeholder="Pesquisar por nome, email, CPF ou telefone..."
            className="w-full max-w-sm text-black p-2.5 px-3.5 border border-gray-300 rounded-lg outline-none focus:border-blue-600"
          />
          <div className="text-gray-600">
            Total: <strong>{clientesFiltrados.length}</strong> cliente(s)
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Carregando clientes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-4 text-left font-medium text-gray-700">Cliente</th>
                      <th className="p-4 text-left font-medium text-gray-700">Telefone</th>
                      <th className="p-4 text-left font-medium text-gray-700">CPF</th>
                      <th className="p-4 text-left font-medium text-gray-700">Agendamentos</th>
                      <th className="p-4 text-center font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesPagina.length > 0 ? (
                      clientesPagina.map((cliente, index) => (
                        <tr 
                          key={cliente.id} 
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{cliente.nome}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{cliente.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">{cliente.telefone}</td>
                          <td className="p-4 text-gray-700 font-mono text-sm">{cliente.cpf}</td>
                          <td className="p-4 text-gray-700 font-medium">
                            {cliente.agendamentos}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => abrirModalExclusao(cliente)}
                                disabled={excluindoId === cliente.id}
                                className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Excluir cliente"
                              >
                                <Trash size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Users className="w-8 h-8 text-gray-400"/>
                            </div>
                            <p className="text-gray-500 font-medium">
                              {termoPesquisa ? 'Nenhum cliente encontrado com este termo de pesquisa.' : 'Nenhum cliente cadastrado.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPaginas > 1 && (
              <div className="mt-6 flex justify-center items-center gap-3">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaAtual === 1}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-xl py-2.5 px-5 cursor-pointer disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold disabled:shadow-none"
                >
                  ◀ Anterior
                </button>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                  <span className="text-gray-700 font-medium">
                    Página <span className="text-blue-600 font-bold">{paginaAtual}</span> de <span className="text-blue-600 font-bold">{totalPaginas}</span>
                  </span>
                </div>
                <button
                  onClick={proximaPagina}
                  disabled={paginaAtual >= totalPaginas}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-xl py-2.5 px-5 cursor-pointer disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold disabled:shadow-none"
                >
                  Próxima ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}