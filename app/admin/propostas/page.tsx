'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getPropostas, deleteProposta } from '@/lib/storage';
import type { Proposta } from '@/lib/storage';
import { formatDate, formatCurrency, getStatusLabel, diasRestantes } from '@/lib/utils';

export default function ListaPropostas() {
    const router = useRouter();
    const { user } = useAuth();
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [busca, setBusca] = useState('');

    useEffect(() => {
        carregarPropostas();
    }, [user]);

    const carregarPropostas = () => {
        let todasPropostas = getPropostas();

        // Filtrar por vendedor se não for admin
        if (user?.role === 'vendedor') {
            todasPropostas = todasPropostas.filter(p => p.vendedorId === user.id);
        }

        setPropostas(todasPropostas);
    };

    const propostasFiltradas = propostas.filter(p => {
        const matchStatus = filtroStatus === 'todas' || p.status === filtroStatus;

        // Se não há busca, retornar apenas por status
        if (!busca.trim()) {
            return matchStatus;
        }

        const buscaLower = busca.toLowerCase();
        const matchBusca =
            (typeof p.cliente?.empresa === 'string' && p.cliente.empresa.toLowerCase().includes(buscaLower)) ||
            (typeof p.numero === 'string' && p.numero.toLowerCase().includes(buscaLower));

        return matchStatus && matchBusca;
    });

    const handleExcluir = (id: string) => {
        if (confirm('Deseja realmente excluir esta proposta?')) {
            deleteProposta(id);
            carregarPropostas();
        }
    };

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
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {propostasFiltradas.length} proposta(s) encontrada(s)
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/propostas/nova')}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nova Proposta</span>
                </button>
            </div>

            {/* Filtros */}
            <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="input"
                            placeholder="Buscar por empresa ou número..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="input"
                        >
                            <option value="todas">Todas</option>
                            <option value="rascunho">Rascunho</option>
                            <option value="enviada">Enviada</option>
                            <option value="aguardando_pagamento">Aguardando Pagamento</option>
                            <option value="comprovante_enviado">Comprovante Enviado</option>
                            <option value="paga">Paga</option>
                            <option value="recusada">Recusada</option>
                            <option value="expirada">Expirada</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            {propostasFiltradas.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 mb-4">Nenhuma proposta encontrada</p>
                    <button
                        onClick={() => router.push('/admin/propostas/nova')}
                        className="btn btn-primary"
                    >
                        Criar primeira proposta
                    </button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Número
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Produto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Validade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {propostasFiltradas.map((proposta) => {
                                    const diasRest = diasRestantes(proposta.dataValidade);

                                    return (
                                        <tr key={proposta.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{proposta.numero || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{proposta.createdAt ? formatDate(proposta.createdAt) : 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{proposta.cliente?.empresa || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{proposta.cliente?.contato || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{proposta.produto?.nome || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {proposta.valores?.investimentoInicial ? formatCurrency(proposta.valores.investimentoInicial) : 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ou {proposta.valores?.valorAvista ? formatCurrency(proposta.valores.valorAvista) : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge ${getStatusBadgeClass(proposta.status)}`}>
                                                    {getStatusLabel(proposta.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{proposta.dataValidade ? formatDate(proposta.dataValidade) : 'N/A'}</div>
                                                <div className={`text-xs ${diasRest < 0 ? 'text-red-600' : diasRest <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                                                    {diasRest < 0 ? 'Expirada' : `${diasRest} dia(s)`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => window.open(`/proposta/${proposta.hashPublico}`, '_blank')}
                                                        className="text-extrema-purple hover:text-extrema-purple-600"
                                                        title="Ver detalhes"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const link = `${window.location.origin}/proposta/${proposta.hashPublico}`;
                                                            try {
                                                                await navigator.clipboard.writeText(link);
                                                                alert(`Link copiado!\n\n${link}\n\nAgora você pode enviar por WhatsApp, Email ou qualquer outro meio.`);
                                                            } catch (err) {
                                                                prompt('Link da proposta (Ctrl+C para copiar):', link);
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-700"
                                                        title="Copiar link para enviar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(proposta.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Excluir"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
