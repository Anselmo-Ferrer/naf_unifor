'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';
import Toaster from '@/components/Toaster';

export default function RecuperarSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (email === '') {
      toast.error('Email obrigatório', {
        description: 'Por favor, insira seu email para recuperar a senha.'
      });
      setIsLoading(false);
      return;
    }

    // Simular envio (aqui você integraria com a API real)
    setTimeout(() => {
      toast.success('Email enviado!', {
        description: 'Um link de recuperação foi enviado para o seu email.'
      });
      setIsLoading(false);
      
      setTimeout(() => {
        router.push('/entrar');
      }, 2000);
    }, 1000);
  };


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
            Esqueceu a senha?
          </h1>
          <p className="text-gray-500 mb-8">
            Digite seu email e enviaremos um link para recuperação
          </p>

        <form onSubmit={handleSubmit} className="flex flex-col text-left space-y-5">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                required
                disabled={isLoading}
                maxLength={100}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-xl py-3.5 text-base font-semibold cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push('/entrar')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <ArrowLeft size={16} />
              Voltar para o login
            </button>
          </div>
        </div>
      </div>

      {/* Banner - Direita */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-cyan-600 to-blue-600 relative overflow-hidden">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Recupere seu acesso
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Não se preocupe! Enviaremos um link seguro para você redefinir sua senha e voltar a acessar sua conta.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Processo rápido e seguro</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Link enviado por email</p>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-50">Suporte disponível 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}