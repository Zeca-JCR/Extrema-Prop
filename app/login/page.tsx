'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { user, login, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Se já estiver logado, redirecionar
    useEffect(() => {
        if (user && !authLoading) {
            router.push('/admin');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setIsLoading(true);

        const sucesso = await login(email, senha);

        if (sucesso) {
            router.push('/admin');
        } else {
            setErro('Email ou senha incorretos');
            setIsLoading(false);
        }
    };

    // Quick login buttons para desenvolvimento
    const quickLogin = (userEmail: string, userSenha: string) => {
        setEmail(userEmail);
        setSenha(userSenha);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo e Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-24">
                            <Image
                                src="/extrema-logo.jpg"
                                alt="Extrema Tecnologia"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Sistema de Propostas
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Faça login para acessar o painel administrativo
                    </p>
                </div>

                {/* Formulário */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-none shadow-swiss border-2 border-black p-6 space-y-4 bg-white">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                                Senha
                            </label>
                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {erro && (
                        <div className="rounded-none bg-red-50 border-2 border-red-200 p-3 animate-fade-in shadow-sm">
                            <p className="text-sm text-red-700 text-center">{erro}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full py-3 text-base"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Entrando...
                            </span>
                        ) : (
                            'Entrar'
                        )}
                    </button>

                    {/* Development Quick Login */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center mb-3">
                            🔧 Acesso rápido (desenvolvimento)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => quickLogin('admin@extrematecnologia.com.br', 'admin123')}
                                className="btn btn-outline btn-sm py-2"
                            >
                                👤 Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('vendedor@extrematecnologia.com.br', 'vend123')}
                                className="btn btn-outline btn-sm py-2"
                            >
                                💼 Vendedor
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        © 2026 Extrema Software de Gestão Empresarial
                    </p>
                </div>
            </div>
        </div>
    );
}
