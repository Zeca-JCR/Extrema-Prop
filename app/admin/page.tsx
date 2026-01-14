'use client';

import { useAuth } from '@/lib/auth-context';

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="gradient-extrema rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Bem-vindo, {user?.nome}! 👋
                </h1>
                <p className="text-white/90">
                    Sistema de Propostas Comerciais da Extrema Tecnologia
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Propostas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Enviadas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Aceitas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Templates</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => window.location.href = '/admin/propostas/nova'} className="btn btn-primary py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nova Proposta</span>
                    </button>

                    <button onClick={() => window.location.href = '/admin/propostas'} className="btn btn-outline py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Ver Propostas</span>
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/templates'}
                        className="btn btn-outline py-4 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span>Templates</span>
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/configuracoes'}
                        className="btn btn-outline py-4 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Configurações</span>
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Propostas Recentes
                    </h3>
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma proposta criada ainda</p>
                        <button onClick={() => window.location.href = '/admin/propostas/nova'} className="btn btn-primary mt-4">Criar primeira proposta</button>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Atividades
                    </h3>
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma atividade recente</p>
                    </div>
                </div>
            </div>

            {/* Development Info */}
            <div className="card p-6 border-2 border-dashed border-gray-300">
                <div className="flex items-start space-x-3">
                    <div className="text-2xl">🚧</div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Sistema em Desenvolvimento
                        </h3>
                        <p className="text-sm text-gray-600">
                            <strong>Status Atual:</strong> Autenticação e estrutura base implementadas
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Próximas funcionalidades:</strong>
                        </p>
                        <ul className="text-sm text-gray-600 list-disc list-inside mt-1 space-y-1">
                            <li>CRUD completo de propostas</li>
                            <li>Sistema de templates</li>
                            <li>Página pública de visualização</li>
                            <li>Fluxo de aceite com PIX</li>
                            <li>Upload de comprovantes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
