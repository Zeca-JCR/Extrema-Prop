'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPropostaByHash, updateProposta } from '@/lib/storage';
import { formatDate, formatCurrency, diasRestantes, isPropostaExpirada } from '@/lib/utils';
import { gerarPDFProposta } from '@/lib/pdf';
import type { Proposta } from '@/lib/storage';
import Image from 'next/image';
import AceiteForm from '@/components/public/AceiteForm';

export default function PropostaPublica() {
    const params = useParams();
    const hash = params.hash as string;
    const [proposta, setProposta] = useState<Proposta | null>(null);
    const [loading, setLoading] = useState(true);
    const [expirada, setExpirada] = useState(false);
    const [showAceiteModal, setShowAceiteModal] = useState(false);
    const [showPdfMenu, setShowPdfMenu] = useState(false);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    useEffect(() => {
        if (hash) {
            const fetchProposta = () => {
                const prop = getPropostaByHash(hash);
                if (prop) {
                    // Se o status mudou, atualiza
                    setProposta(current => {
                        if (current && current.status !== prop.status) {
                            return prop;
                        }
                        return current || prop;
                    });

                    setExpirada(isPropostaExpirada(prop.dataValidade));
                }
                setLoading(false);
            };

            fetchProposta();

            // Polling para atualização em tempo real (ex: pagamento em outra aba)
            const interval = setInterval(fetchProposta, 3000);

            return () => clearInterval(interval);
        }
    }, [hash]);

    const handleBaixarPDF = async (comAceite: boolean = false) => {
        if (!proposta) return;

        setGerandoPDF(true);
        try {
            await gerarPDFProposta(proposta, { comAceite });
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setGerandoPDF(false);
        }
    };

    const handleRecusar = () => {
        if (!proposta) return;

        const motivo = prompt('Por favor, informe o motivo da recusa (opcional):');

        if (confirm('Tem certeza que deseja recusar esta proposta?')) {
            const propostaAtualizada: Proposta = {
                ...proposta,
                status: 'recusada',
                updatedAt: new Date().toISOString(),
                observacoes: proposta.observacoes + `\n\nRecusada pelo cliente em ${new Date().toLocaleString('pt-BR')}${motivo ? `. Motivo: ${motivo}` : ''}`,
            };

            updateProposta(propostaAtualizada);
            setProposta(propostaAtualizada);
            alert('Proposta recusada com sucesso. Entraremos em contato em breve.');
        }
    };

    const handleAceiteSuccess = (propostaAtualizada: Proposta) => {
        setProposta(propostaAtualizada);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-extrema-purple"></div>
                    <p className="mt-4 text-gray-600">Carregando proposta...</p>
                </div>
            </div>
        );
    }

    if (!proposta) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
                    <p className="text-gray-600 mb-6">
                        O link que você acessou não corresponde a nenhuma proposta válida.
                    </p>
                    <p className="text-sm text-gray-500">
                        Verifique se o link está correto ou entre em contato com a Extrema Tecnologia.
                    </p>
                </div>
            </div>
        );
    }

    const diasRest = diasRestantes(proposta.dataValidade);
    const podeAceitar = !expirada && proposta.status !== 'recusada' && proposta.status !== 'aceita' && proposta.status !== 'comprovante_enviado' && proposta.status !== 'paga';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header com Logo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative w-32 h-16">
                                <Image
                                    src="/extrema-logo.jpg"
                                    alt="Extrema Tecnologia"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-sm text-gray-600">{proposta.numero}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Válida até</p>
                            <p className="text-lg font-semibold text-gray-900">{formatDate(proposta.dataValidade, 'long')}</p>
                            {!expirada && diasRest <= 3 && (
                                <p className="text-xs text-orange-600 mt-1">⏰ Expira em {diasRest} dia(s)</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alerta de Status Especial */}
                {proposta.status === 'comprovante_enviado' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-purple-900">Proposta Aceita - Aguardando Confirmação</h3>
                                <p className="text-sm text-purple-700 mt-1">
                                    Recebemos seu comprovante de pagamento. Nossa equipe está verificando e entrará em contato em breve.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {proposta.status === 'paga' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-green-900">Pagamento Confirmado! ✓</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Seu pagamento foi confirmado. Em breve você receberá o contrato para assinatura.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta de Expiração */}
                {expirada && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-red-900">Proposta Expirada</h3>
                                <p className="text-sm text-red-700 mt-1">
                                    Esta proposta expirou em {formatDate(proposta.dataValidade, 'long')}.
                                    Entre em contato conosco para solicitar uma nova proposta.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta de Recusada */}
                {proposta.status === 'recusada' && (
                    <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <svg className="w-6 h-6 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Proposta Recusada</h3>
                                <p className="text-sm text-gray-700 mt-1">
                                    Esta proposta foi recusada. Se mudar de ideia, entre em contato conosco.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dados do Cliente */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Para</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Empresa</p>
                            <p className="font-semibold text-gray-900">{proposta.cliente.empresa}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Contato</p>
                            <p className="font-semibold text-gray-900">{proposta.cliente.contato}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-900">{proposta.cliente.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Telefone</p>
                            <p className="font-semibold text-gray-900">{proposta.cliente.telefone}</p>
                        </div>
                    </div>
                </div>

                {/* Produto */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{proposta.produto.nome}</h2>
                    <p className="text-gray-600 mb-4">{proposta.produto.descricao}</p>

                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Módulos/Funcionalidades Incluídas:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {proposta.produto.modulos.map((modulo, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-700">{modulo}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* À Vista */}
                    <div className="card p-6 border-2 border-green-200 bg-green-50">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pagamento à Vista</h3>
                            <span className="badge bg-green-600 text-white">-{proposta.valores.descontoAvistaPercentual}%</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Valor original:</span>
                                <span className="line-through text-gray-500">{formatCurrency(proposta.valores.investimentoInicial)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Desconto:</span>
                                <span className="text-green-600">-{formatCurrency(proposta.valores.descontoAvistaValor)}</span>
                            </div>
                            <div className="border-t border-green-300 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Valor final:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatCurrency(proposta.valores.valorAvista)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parcelado */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamento Parcelado</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Número de parcelas:</span>
                                <span className="font-semibold text-gray-900">{proposta.valores.parcelamento.qtdParcelas}x sem juros</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Valor da parcela:</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(proposta.valores.parcelamento.valorParcela)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Valor total:</span>
                                    <span className="text-2xl font-bold text-extrema-purple">{formatCurrency(proposta.valores.parcelamento.valorTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensalidade */}
                <div className="card p-6 mb-6 bg-gradient-extrema text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm mb-1">Mensalidade Recorrente</p>
                            <p className="text-3xl font-bold">{formatCurrency(proposta.valores.mensalidade)}/mês</p>
                            <p className="text-white/80 text-xs mt-2">Cobrada após 30 dias da assinatura</p>
                        </div>
                        <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Condições de Pagamento */}
                <div className="card p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Condições de Pagamento</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{proposta.condicoesPagamento}</p>
                </div>

                {/* Ações */}
                {podeAceitar && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => setShowAceiteModal(true)}
                            className="btn btn-primary py-4 text-base"
                        >
                            ✓ Aceitar Proposta
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowPdfMenu(!showPdfMenu)}
                                className="btn btn-outline py-4 text-base disabled:opacity-50 w-full flex items-center justify-center space-x-2"
                                disabled={gerandoPDF}
                            >
                                <span>📄 Baixar PDF</span>
                                <svg className={`w-4 h-4 ml-1 transition-transform ${showPdfMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Backdrop para fechar ao clicar fora */}
                            {showPdfMenu && (
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowPdfMenu(false)}
                                />
                            )}

                            {/* Dropdown Menu */}
                            {showPdfMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100">
                                    <button
                                        onClick={() => {
                                            handleBaixarPDF(false);
                                            setShowPdfMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Proposta Original
                                    </button>
                                    {proposta.aceite && (
                                        <button
                                            onClick={() => {
                                                handleBaixarPDF(true);
                                                setShowPdfMenu(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Proposta com Aceite
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleRecusar}
                            className="btn btn-ghost py-4 text-base text-red-600 hover:bg-red-50"
                        >
                            ✗ Recusar
                        </button>
                    </div>
                )}

                {/* Botão PDF quando não pode aceitar */}
                {!podeAceitar && (
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => handleBaixarPDF(false)}
                            disabled={gerandoPDF}
                            className="btn btn-outline py-3 px-8 disabled:opacity-50"
                        >
                            {gerandoPDF ? '⏳ Gerando...' : '📄 Baixar PDF da Proposta'}
                        </button>
                        {proposta.aceite && (
                            <button
                                onClick={() => handleBaixarPDF(true)}
                                disabled={gerandoPDF}
                                className="btn btn-outline py-3 px-8 ml-4 disabled:opacity-50"
                            >
                                {gerandoPDF ? '⏳...' : '📄 Baixar Comprovante/Aceite'}
                            </button>
                        )}
                    </div>
                )}

                {/* Footer com Contato */}
                <div className="card p-6 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Dúvidas sobre esta proposta?</h3>
                    <p className="text-sm text-gray-600 mb-4">Entre em contato com {proposta.vendedorNome}</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <a href="mailto:comercial@extrematecnologia.com.br" className="text-extrema-purple hover:underline">
                            📧 comercial@extrematecnologia.com.br
                        </a>
                        <a href="https://api.whatsapp.com/send?phone=5547996818985" className="text-extrema-purple hover:underline">
                            📱 (47) 99681-8985
                        </a>
                    </div>
                </div>

                {/* Footer Extrema */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>© 2026 Extrema Software de Gestão Empresarial</p>
                    <p className="mt-1">São Bento do Sul-SC | Balneário Piçarras-SC</p>
                </div>
            </div>

            {/* Modal de Aceite */}
            {showAceiteModal && proposta && (
                <AceiteForm
                    proposta={proposta}
                    onClose={() => setShowAceiteModal(false)}
                    onSuccess={handleAceiteSuccess}
                />
            )}
        </div>
    );
}
