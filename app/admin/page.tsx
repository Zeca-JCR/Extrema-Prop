'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPropostas, getTemplates } from '@/lib/storage';
import type { Proposta } from '@/lib/storage';
import { formatDate, formatCurrency, getStatusLabel } from '@/lib/utils';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        enviadas: 0,
        aceitas: 0,
        templates: 0,
    });
    const [propostasRecentes, setPropostasRecentes] = useState<Proposta[]>([]);

    useEffect(() => {
        // Carregar estatísticas
        const propostas = getPropostas();
        const templates = getTemplates();

        // Filtrar por vendedor se não for admin
        const propostasFiltradas = user?.role === 'vendedor'
            ? propostas.filter(p => p.vendedorId === user.id)
            : propostas;

        setStats({
            total: propostasFiltradas.length,
            enviadas: propostasFiltradas.filter(p => p.status === 'enviada').length,
            aceitas: propostasFiltradas.filter(p =>
                p.status === 'aceita' || p.status === 'paga' || p.status === 'comprovante_enviado'
            ).length,
            templates: templates.length,
        });

        // Ordenar por data de criação e pegar as 5 mais recentes
        const recentes = [...propostasFiltradas]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        setPropostasRecentes(recentes);
    }, [user]);

    const getStatusBadgeClass = (status: string) => {
        const classes: Record<string, string> = {
            rascunho: 'badge-rascunho',
            enviada: 'badge-enviada',
            aguardando_pagamento: 'badge-aguardando',
            comprovante_enviado: 'badge-comprovante',
            paga: 'badge-paga',
            aceita: 'badge-paga',
            recusada: 'badge-recusada',
            expirada: 'badge-expirada',
        };
        return classes[status] || 'badge-rascunho';
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">
                    Bem-vindo, {user?.nome}! 👋
                </h1>
                <p className="text-purple-100">
                    Sistema de Propostas Comerciais da Extrema Tecnologia
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Propostas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.enviadas}</p>
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
                            <p className="text-sm font-medium text-gray-600">Aceitas/Pagas</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.aceitas}</p>
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.templates}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link href="/admin/propostas/nova" className="btn btn-primary py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nova Proposta</span>
                    </Link>

                    <Link href="/admin/propostas" className="btn btn-outline py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Ver Propostas</span>
                    </Link>

                    <Link href="/admin/templates" className="btn btn-outline py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        <span>Templates</span>
                    </Link>

                    <Link href="/admin/configuracoes" className="btn btn-outline py-4 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Configurações</span>
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Propostas Recentes
                        </h3>
                        {propostasRecentes.length > 0 && (
                            <Link href="/admin/propostas" className="text-sm text-extrema-purple hover:underline">
                                Ver todas
                            </Link>
                        )}
                    </div>
                    {propostasRecentes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhuma proposta criada ainda</p>
                            <Link href="/admin/propostas/nova" className="btn btn-primary mt-4">
                                Criar primeira proposta
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {propostasRecentes.map((proposta) => (
                                <Link
                                    key={proposta.id}
                                    href="/admin/propostas"
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {proposta.cliente.empresa}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {proposta.numero} • {formatDate(proposta.createdAt)}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            {formatCurrency(proposta.valores.investimentoInicial)}
                                        </span>
                                        <span className={`badge ${getStatusBadgeClass(proposta.status)}`}>
                                            {getStatusLabel(proposta.status)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Resumo por Status
                    </h3>
                    {stats.total === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Nenhuma proposta para exibir</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Rascunho</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {getPropostas().filter(p => p.status === 'rascunho').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm text-blue-700">Enviadas</span>
                                <span className="text-sm font-semibold text-blue-900">
                                    {stats.enviadas}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <span className="text-sm text-orange-700">Aguardando Pagamento</span>
                                <span className="text-sm font-semibold text-orange-900">
                                    {getPropostas().filter(p => p.status === 'aguardando_pagamento').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <span className="text-sm text-purple-700">Comprovante Enviado</span>
                                <span className="text-sm font-semibold text-purple-900">
                                    {getPropostas().filter(p => p.status === 'comprovante_enviado').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-green-700">Pagas</span>
                                <span className="text-sm font-semibold text-green-900">
                                    {getPropostas().filter(p => p.status === 'paga').length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
