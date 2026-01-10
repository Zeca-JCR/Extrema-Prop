'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-extrema-purple"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            {/* Botão Voltar - só aparece fora do dashboard */}
                            {pathname !== '/admin' && (
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
                                    title="Voltar"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            {/* Logo e título - clicável para ir ao dashboard */}
                            <button
                                onClick={() => router.push('/admin')}
                                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                                title="Ir para o Dashboard"
                            >
                                <div className="gradient-extrema w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                    E
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        Sistema de Propostas
                                    </h1>
                                    <p className="text-xs text-gray-500">Extrema Tecnologia</p>
                                </div>
                            </button>
                        </div>

                        {/* User info e logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Deseja realmente sair?')) {
                                        router.push('/login');
                                        // Logout será feito pelo redirecionamento
                                    }
                                }}
                                className="btn btn-ghost btn-sm"
                                title="Sair"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
