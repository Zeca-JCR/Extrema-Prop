'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

import Image from 'next/image';

// Links de navegação principal
const navLinks = [
    { href: '/admin/propostas', label: 'Propostas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/admin/templates', label: 'Templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { href: '/admin/configuracoes', label: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();

    // Verificar qual link está ativo
    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

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
                        <div className="flex items-center space-x-6">
                            {/* Logo e título - clicável para ir ao dashboard */}
                            <Link
                                href="/admin"
                                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                                title="Ir para o Dashboard"
                            >
                                <div className=" relative w-10 h-10 rounded-lg overflow-hidden">
                                    <Image
                                        src="/logo-small.png"
                                        alt="Logo Extrema"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        Sistema de Propostas
                                    </h1>
                                    <p className="text-xs text-gray-500">Extrema Tecnologia</p>
                                </div>
                            </Link>

                            {/* Menu de Navegação */}
                            <nav className="hidden md:flex items-center space-x-1 ml-4 pl-4 border-l border-gray-200">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                        </svg>
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* User info e logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.nome}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Deseja realmente sair?')) {
                                        logout();
                                        router.push('/login');
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

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-100">
                    <div className="flex justify-around py-2 px-4">
                        <Link
                            href="/admin"
                            className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-colors ${pathname === '/admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-500'
                                }`}
                        >
                            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Início</span>
                        </Link>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-colors ${isActive(link.href)
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-gray-500'
                                    }`}
                            >
                                <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                </svg>
                                <span>{link.label}</span>
                            </Link>
                        ))}
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
