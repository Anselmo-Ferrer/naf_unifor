'use client'

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { registrarUsuario } from '@/lib/api';
import { saveUser } from '@/lib/auth';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, Phone, CreditCard } from 'lucide-react';
import Toaster from '@/components/Toaster';

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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

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
      // Remover máscaras antes de enviar
      const cpfSemMascara = formData.cpf.replace(/\D/g, '');
      const telefoneSemMascara = formData.telefone.replace(/\D/g, '');

      const { usuario } = await registrarUsuario({
        nome: formData.nome,
        cpf: cpfSemMascara,
        telefone: telefoneSemMascara,
        email: formData.email,
        senha: formData.senha,
      });

      // Salvar usuário no localStorage
      saveUser(usuario);

      toast.success('Conta criada com sucesso!', {
        description: 'Você será redirecionado para a página de login.'
      });

      setTimeout(() => {
        router.push('/entrar');
      }, 1500);
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao criar conta. Tente novamente.';
      setError(mensagemErro);
      toast.error('Erro ao criar conta', {
        description: mensagemErro
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de máscara
  const aplicarMascaraCPF = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpfLimitado = apenasNumeros.slice(0, 11);
    
    // Aplica a máscara
    if (cpfLimitado.length <= 3) {
      return cpfLimitado;
    } else if (cpfLimitado.length <= 6) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3)}`;
    } else if (cpfLimitado.length <= 9) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6)}`;
    } else {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6, 9)}-${cpfLimitado.slice(9, 11)}`;
    }
  };

  const aplicarMascaraTelefone = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const telefoneLimitado = apenasNumeros.slice(0, 11);
    
    // Aplica a máscara
    if (telefoneLimitado.length <= 2) {
      return telefoneLimitado.length > 0 ? `(${telefoneLimitado}` : telefoneLimitado;
    } else if (telefoneLimitado.length <= 7) {
      return `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2)}`;
    } else {
      return `(${telefoneLimitado.slice(0, 2)}) ${telefoneLimitado.slice(2, 7)}-${telefoneLimitado.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === 'cpf') {
      const cpfFormatado = aplicarMascaraCPF(value);
      setFormData({
        ...formData,
        cpf: cpfFormatado
      });
    } else if (id === 'telefone') {
      const telefoneFormatado = aplicarMascaraTelefone(value);
      setFormData({
        ...formData,
        telefone: telefoneFormatado
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toaster />
      {/* Formulário - Esquerda */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4 block hover:from-blue-700 hover:to-blue-800 transition-all">
            NAF Unifor
          </Link>
          <h1 className="text-gray-900 mb-1 text-2xl font-bold">
            Crie sua conta
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Preencha os dados abaixo para começar
          </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col text-left space-y-3">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Lucas Silva Pereira"
                required
                disabled={isLoading}
                maxLength={100}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          {/* CPF */}
          <div>
            <label htmlFor="cpf" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              CPF
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
                disabled={isLoading}
                maxLength={14}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
                disabled={isLoading}
                maxLength={15}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@gmail.com"
                required
                disabled={isLoading}
                maxLength={100}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={mostrarSenha ? "text" : "password"}
                id="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                disabled={isLoading}
                maxLength={50}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmarSenha" className="text-xs font-semibold text-gray-700 mb-1.5 block">
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                id="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Repita a senha"
                required
                minLength={6}
                disabled={isLoading}
                maxLength={50}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg py-2.5 text-sm font-semibold cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

          <p className="mt-4 text-gray-500 text-xs text-center">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/entrar')}
              disabled={isLoading}
              className="bg-transparent border-none text-blue-600 font-semibold p-0 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>

      {/* Banner - Direita */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700 relative overflow-hidden">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Junte-se ao NAF Unifor
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Crie sua conta agora e tenha acesso a todos os serviços do Núcleo de Atendimento ao Estudante de forma simples e rápida.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Cadastro rápido e seguro</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Acesso a todos os serviços</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Suporte dedicado aos estudantes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}