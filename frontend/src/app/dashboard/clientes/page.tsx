'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { listarUsuarios, listarAgendamentos, deletarUsuario, Usuario, Agendamento } from '@/lib/api'
import { getUser, isAuthenticated, isAdmin, removeUser } from '@/lib/auth'
import { Trash } from 'lucide-react'

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
  const itensPorPagina = 5

  useEffect(() => {
    setMounted(true)
    
    // Verificar se está logado e é admin
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

  const excluirCliente = async (cliente: ClienteComContagem) => {
    if (!confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`)) {
      return
    }

    try {
      await deletarUsuario(cliente.id)
      alert('Cliente excluído com sucesso!')
      
      // Recarregar dados
      await carregarDados()
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cliente.')
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
      {/* SIDEBAR */}

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
              <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-3.5 text-left font-semibold text-gray-600">Nome</th>
                    <th className="p-3.5 text-left font-semibold text-gray-600">Telefone</th>
                    <th className="p-3.5 text-left font-semibold text-gray-600">CPF</th>
                    <th className="p-3.5 text-left font-semibold text-gray-600">Agendamentos</th>
                    <th className="p-3.5 text-left font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPagina.length > 0 ? (
                    clientesPagina.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3.5 text-gray-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                              {cliente.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{cliente.nome}</strong>
                              <br />
                              <small className="text-gray-500">{cliente.email}</small>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-800">{cliente.telefone}</td>
                        <td className="p-3.5 text-gray-800">{cliente.cpf}</td>
                        <td className="p-3.5 text-gray-800">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {cliente.agendamentos}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => excluirCliente(cliente)}
                              className="border-none bg-transparent cursor-pointer text-lg transition-transform hover:scale-110"
                              title="Excluir cliente"
                            >
                              <Trash color='#044CF4' size={20}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500">
                        {termoPesquisa ? 'Nenhum cliente encontrado com este termo de pesquisa.' : 'Nenhum cliente cadastrado.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className="mt-5 flex justify-center items-center gap-3">
                <button
                  onClick={paginaAnterior}
                  disabled={paginaAtual === 1}
                  className="bg-blue-600 text-white border-none rounded-md py-1.5 px-3 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  ◀
                </button>
                <span className="text-gray-700">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={proximaPagina}
                  disabled={paginaAtual >= totalPaginas}
                  className="bg-blue-600 text-white border-none rounded-md py-1.5 px-3 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}