'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { loginUsuario } from '@/lib/api'
import { saveUser } from '@/lib/auth'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Toaster from '@/components/Toaster'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (formData.email === '' || formData.senha === '') {
      setError('Preencha todos os campos!')
      return
    }

    setIsLoading(true)

    try {
      // Fazer login na API
      const { usuario } = await loginUsuario({
        email: formData.email,
        senha: formData.senha
      })

      // Salvar dados do usuário no localStorage
      saveUser(usuario)

      // Exibir mensagem de sucesso
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo, ${usuario.nome.split(' ')[0]}!`
      })

      // Redirecionar baseado no role
      setTimeout(() => {
        if (usuario.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/agendamentos')
        }
      }, 1000)
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao fazer login. Tente novamente.'
      setError(mensagemErro)
      toast.error('Erro ao fazer login', {
        description: mensagemErro
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleCriarConta = () => {
    router.push('/criar-conta')
  }

  const handleEsqueceuSenha = () => {
    router.push('/esqueceu-senha')
  }

  return (
    <div className="flex min-h-screen">
      <Toaster />
      {/* Formulário - Esquerda */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 md:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-8 block hover:from-blue-700 hover:to-blue-800 transition-all">
            NAF Unifor
          </Link>
          <h1 className="text-gray-900 mb-2 text-3xl font-bold">
            Entre na sua conta
          </h1>
          <p className="text-gray-500 mb-8">
            Bem-vindo de volta! Preencha seus dados para continuar
          </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col text-left space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@gmail.com"
                required
                disabled={isLoading}
                maxLength={100}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="senha" className="text-sm font-semibold text-gray-700">
                Senha
              </label>
              <button
                type="button"
                onClick={handleEsqueceuSenha}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
                maxLength={50}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-xl py-3.5 text-base font-semibold cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

          <p className="mt-6 text-gray-500 text-sm text-center">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={handleCriarConta}
              disabled={isLoading}
              className="bg-transparent border-none text-blue-600 font-semibold p-0 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>

      {/* Banner - Direita */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-white">
          <div className="max-w-md text-center space-y-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Gestão de Atendimentos Simplificada
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Gerencie seus agendamentos de forma eficiente e organize seus atendimentos no Núcleo de Atendimento ao Estudante.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Agendamento rápido e intuitivo</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Acompanhamento em tempo real</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Interface moderna e responsiva</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}