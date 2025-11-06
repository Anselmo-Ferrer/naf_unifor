'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function RecuperarSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (email === '') {
      alert('Por favor, insira seu email.');
      return;
    }

    alert('Um link de recuperação foi enviado para o seu email!');
    router.push('/entrar')
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-xl w-full max-w-md text-center shadow-lg">
        <Link href="/" className="text-3xl font-bold text-blue-600 mb-8 block">NAF Unifor</Link>
        <h1 className="text-blue-600 mb-2.5 text-2xl font-semibold">
          Esqueceu a senha?
        </h1>
        <p className="text-gray-400 mb-6">
          Bem vindo! Por favor, preencha as informações
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col text-left">
          <label htmlFor="email" className="text-sm text-blue-600 mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@gmail.com"
            required
            className="text-black p-2.5 border border-blue-600 rounded-lg mb-5 outline-none focus:border-blue-700 focus:shadow-[0_0_3px_#2563eb]"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg py-3 text-base cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-600"
          >
            Recuperar senha
          </button>
        </form>

        <p className="mt-5 text-gray-400">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => router.push('/entrar')}
            className="bg-transparent border-none text-blue-600 underline cursor-pointer font-medium p-0 text-base hover:text-blue-700 hover:no-underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}