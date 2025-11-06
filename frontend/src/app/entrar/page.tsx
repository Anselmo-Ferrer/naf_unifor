'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { loginUsuario } from '@/lib/api'
import { saveUser } from '@/lib/auth'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      alert('Login realizado com sucesso!')

      // Redirecionar baseado no role
      if (usuario.role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/agendamentos')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.')
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl w-full max-w-md text-center shadow-lg">
        <Link href="/" className="text-3xl font-bold text-blue-600 mb-8 block">NAF Unifor</Link>
        <h1 className="text-blue-600 mb-2.5 text-2xl font-semibold">
          Entre na sua conta
        </h1>
        <p className="text-gray-400 mb-6">
          Bem vindo! Por favor, preencha as informações
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col text-left">
          <label htmlFor="email" className="text-sm text-blue-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemplo@gmail.com"
            required
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <label htmlFor="senha" className="text-sm text-blue-600 mb-1.5">
            Senha
          </label>
          <input
            type="password"
            id="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="********"
            required
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <div className="text-right mb-4">
            <button
              type="button"
              onClick={handleEsqueceuSenha}
              disabled={isLoading}
              className="bg-transparent border-none text-blue-600 underline cursor-pointer text-sm font-medium p-0 hover:text-blue-700 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg py-3 text-base cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-5 text-gray-400">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={handleCriarConta}
            disabled={isLoading}
            className="bg-transparent border-none text-blue-600 underline cursor-pointer font-medium p-0 text-base hover:text-blue-700 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  )
}