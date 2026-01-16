'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getPropostas, deleteProposta } from '@/lib/storage';
import type { Proposta } from '@/lib/storage';
import { formatDate, formatCurrency, getStatusLabel, diasRestantes } from '@/lib/utils';
import DetalhesPropostaModal from '@/components/admin/DetalhesPropostaModal';

export default function ListaPropostas() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [busca, setBusca] = useState('');
    const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'numero', direction: 'desc' });

    // Notificação de mudança de status
    const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: 'info' | 'success' } | null>(null);
    const statusAnteriorRef = useRef<Record<string, string>>({});

    useEffect(() => {
        carregarPropostas();

        // Polling para detectar mudanças de status
        const interval = setInterval(() => {
            const novasPropostas = getPropostas();
            let mudancas: string[] = [];

            novasPropostas.forEach(p => {
                const statusAnterior = statusAnteriorRef.current[p.id];
                if (statusAnterior && statusAnterior !== p.status) {
                    const label = getStatusLabel(p.status);
                    mudancas.push(`${p.numero}: ${label}`);
                }
                statusAnteriorRef.current[p.id] = p.status;
            });

            if (mudancas.length > 0) {
                setNotificacao({
                    mensagem: `Status atualizado: ${mudancas.join(', ')}`,
                    tipo: 'success'
                });
                carregarPropostas();

                // Auto-fechar após 5 segundos
                setTimeout(() => setNotificacao(null), 5000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const success = searchParams.get('success');
        if (success === 'created') {
            setNotificacao({ mensagem: 'Proposta criada com sucesso!', tipo: 'success' });
            router.replace('/admin/propostas');
            setTimeout(() => setNotificacao(null), 5000);
        } else if (success === 'updated') {
            setNotificacao({ mensagem: 'Proposta atualizada com sucesso!', tipo: 'success' });
            router.replace('/admin/propostas');
            setTimeout(() => setNotificacao(null), 5000);
        }
    }, [searchParams]);

    const carregarPropostas = () => {
        let todasPropostas = getPropostas();

        // Filtrar por vendedor se não for admin
        if (user?.role === 'vendedor') {
            todasPropostas = todasPropostas.filter(p => p.vendedorId === user.id);
        }

        // Atualizar referência de status
        todasPropostas.forEach(p => {
            statusAnteriorRef.current[p.id] = p.status;
        });

        setPropostas(todasPropostas);
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const propostasFiltradas = propostas
        .filter(p => {
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
        })
        .sort((a, b) => {
            const { key, direction } = sortConfig;
            let valueA: any = '';
            let valueB: any = '';

            switch (key) {
                case 'numero':
                    valueA = a.numero;
                    valueB = b.numero;
                    break;
                case 'cliente':
                    valueA = a.cliente?.empresa || '';
                    valueB = b.cliente?.empresa || '';
                    break;
                case 'produto':
                    valueA = a.produto?.nome || '';
                    valueB = b.produto?.nome || '';
                    break;
                case 'valor':
                    valueA = a.valores?.valorAvista || 0;
                    valueB = b.valores?.valorAvista || 0;
                    break;
                case 'status':
                    valueA = a.status;
                    valueB = b.status;
                    break;
                case 'validade':
                    valueA = new Date(a.dataValidade).getTime();
                    valueB = new Date(b.dataValidade).getTime();
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) {
                return direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
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

    const renderSortIcon = (key: string) => {
        if (sortConfig.key !== key) {
            return (
                <svg className="w-3 h-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortConfig.direction === 'asc' ? (
            <svg className="w-3 h-3 ml-1 text-extrema-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-3 h-3 ml-1 text-extrema-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
        <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition-colors select-none"
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center">
                {label}
                {renderSortIcon(sortKey)}
            </div>
        </th>
    );

    return (
        <div>
            {/* Banner de Notificação */}
            {notificacao && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] transition-all transform duration-300 ${notificacao.tipo === 'success' ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-blue-100 border border-blue-200 text-blue-800'}`}>
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{notificacao.mensagem}</span>
                    </div>
                    <button onClick={() => setNotificacao(null)} className="text-current hover:opacity-70">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

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
                                    <SortableHeader label="Número" sortKey="numero" />
                                    <SortableHeader label="Cliente" sortKey="cliente" />
                                    <SortableHeader label="Produto" sortKey="produto" />
                                    <SortableHeader label="Valor" sortKey="valor" />
                                    <SortableHeader label="Status" sortKey="status" />
                                    <SortableHeader label="Validade" sortKey="validade" />
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
                                                        onClick={() => setPropostaSelecionada(proposta)}
                                                        className="text-extrema-purple hover:text-extrema-purple-600"
                                                        title="Ver detalhes e comprovante"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const link = `${window.location.origin}/proposta/${proposta.hashPublico}`;
                                                            window.open(link, '_blank');
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700"
                                                        title="Abrir link público"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                                                        onClick={() => router.push(`/admin/propostas/editar/${proposta.id}`)}
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
            {propostaSelecionada && (
                <DetalhesPropostaModal
                    proposta={propostaSelecionada}
                    onClose={() => setPropostaSelecionada(null)}
                    onUpdate={(msg) => {
                        carregarPropostas();
                        if (msg && typeof msg === 'string') {
                            setNotificacao({ mensagem: msg, tipo: 'success' });
                            setTimeout(() => setNotificacao(null), 5000);
                        }
                    }}
                />
            )}
        </div>
    );
}
