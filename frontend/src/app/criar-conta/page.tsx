'use client'

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { registrarUsuario } from '@/lib/api';
import { saveUser } from '@/lib/auth';
import Link from 'next/link';

export default function CriarConta() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem!');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    setIsLoading(true);

    try {
      const { usuario } = await registrarUsuario({
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
      });

      // Salvar usuário no localStorage
      saveUser(usuario);

      alert('Conta criada com sucesso!');
      router.push('/entrar'); // Redirecionar para página inicial ou dashboard
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl w-full max-w-md text-center shadow-lg">
        <Link href="/" className="text-3xl font-bold text-blue-600 mb-8 block">NAF Unifor</Link>
        <h1 className="text-blue-600 mb-2.5 text-2xl font-semibold">
          Crie sua conta
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
          <label htmlFor="nome" className="text-sm text-blue-600 mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Lucas Silva Pereira"
            required
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <label htmlFor="cpf" className="text-sm text-blue-600 mb-1.5">
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <label htmlFor="telefone" className="text-sm text-blue-600 mb-1.5">
            Telefone
          </label>
          <input
            type="text"
            id="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

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
            minLength={6}
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <label htmlFor="confirmarSenha" className="text-sm text-blue-600 mb-1.5">
            Confirmar senha
          </label>
          <input
            type="password"
            id="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            placeholder="********"
            required
            minLength={6}
            disabled={isLoading}
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-4 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg py-3 text-base cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-5 text-gray-400">
          Já tem uma conta?
          <button
            type="button"
            onClick={() => router.push('/entrar')}
            disabled={isLoading}
            className="bg-transparent border-none text-blue-600 underline cursor-pointer font-semibold p-0 ml-1.5 text-base hover:text-blue-700 hover:no-underline hover:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}