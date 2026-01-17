'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPropostaByHash, updateProposta, getConfiguracoes } from '@/lib/storage';
import { formatDate, formatCurrency, diasRestantes, isPropostaExpirada } from '@/lib/utils';
import { gerarPDFProposta } from '@/lib/pdf';
import type { Proposta, Configuracoes } from '@/lib/storage';
import Image from 'next/image';
import AceiteForm from '@/components/public/AceiteForm';

export default function PropostaPublica() {
    const params = useParams();
    const hash = params.hash as string;
    const [proposta, setProposta] = useState<Proposta | null>(null);
    const [config, setConfig] = useState<Configuracoes | null>(null);
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

                // Carrega configurações (textos fixos)
                setConfig(getConfiguracoes());

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
    const podeAceitar = !expirada && proposta.status !== 'aceita' && proposta.status !== 'comprovante_enviado' && proposta.status !== 'paga';

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header com Logo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative w-56 h-20">
                                <Image
                                    src="/images/logo_atual.png"
                                    alt="Extrema Tecnologia"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Proposta Comercial</h1>
                                <p className="text-sm text-gray-600">{proposta.produto.nome} - {proposta.cliente.empresa} ({proposta.numero})</p>
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

                {/* Saudação e Introdução separadas */}
                {config?.textosProposta?.introducao && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">{proposta.cliente.saudacao || 'Prezado(a)'} {proposta.cliente.contato}</h2>
                        <p className="text-sm text-gray-600 mb-4">{proposta.cliente.empresa}</p>
                        <p className="text-gray-700 whitespace-pre-line">{config.textosProposta.introducao}</p>
                    </div>
                )}

                {/* Alerta de Status Especial */}
                {proposta.status === 'comprovante_enviado' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-3">
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
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
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
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
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



                {/* Produto */}
                <div className="card p-6 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{proposta.produto.nome}</h2>
                    <p className="text-gray-600 mb-4">{proposta.produto.descricao}</p>

                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Funcionalidades Incluídas:</h3>
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

                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <h3 className="text-sm font-semibold text-gray-900">Escopo do Projeto:</h3>
                        <div className="flex flex-wrap gap-8 text-sm text-gray-700">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>{String(proposta.produto.limites?.qtdCnpjs || '1').padStart(2, '0')} CNPJ{parseInt(String(proposta.produto.limites?.qtdCnpjs || '1')) > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{String(proposta.produto.limites?.qtdUsuarios || '1').padStart(2, '0')} usuário{parseInt(String(proposta.produto.limites?.qtdUsuarios || '1')) > 1 ? 's' : ''} simultâneo{parseInt(String(proposta.produto.limites?.qtdUsuarios || '1')) > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Valores e Condições Comerciais */}
                <div className="card overflow-hidden mb-3 border-l-4 border-l-blue-600">
                    <div className="p-6 bg-white border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Valores e Condições Comerciais</h2>
                    </div>

                    {/* Investimento Inicial (Adesão) */}
                    <div className="p-6 pb-2 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Investimento Inicial (Adesão)</p>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(proposta.valores.investimentoInicial)}</p>
                            </div>
                            <svg className="w-16 h-16 text-blue-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {proposta.detalhesInvestimento && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 mb-1">O que está incluso:</p>
                                <p className="text-xs text-gray-600 whitespace-pre-line">{proposta.detalhesInvestimento}</p>
                            </div>
                        )}
                    </div>

                    {/* Opções de Pagamento */}
                    <div className="p-6 pt-2 bg-white">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Condições de Pagamento:</h3>
                        <div className={`grid grid-cols-1 ${proposta.valores.parcelamento.qtdParcelas > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                            {/* À Vista */}
                            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="text-base font-semibold text-gray-900">Pagamento à Vista</h4>
                                    <span className="badge bg-green-600 text-white text-xs">-{proposta.valores.descontoAvistaPercentual}%</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Valor original:</span>
                                        <span className="line-through text-gray-500">{formatCurrency(proposta.valores.investimentoInicial)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Desconto:</span>
                                        <span className="text-green-600">-{formatCurrency(proposta.valores.descontoAvistaValor)}</span>
                                    </div>
                                    <div className="border-t border-green-300 pt-2 mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-gray-900">Valor final:</span>
                                            <span className="text-xl font-bold text-green-600">{formatCurrency(proposta.valores.valorAvista)}</span>
                                        </div>
                                        <p className="text-xs text-green-700 text-right">Pagamento via Pix.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Parcelado */}
                            {proposta.valores.parcelamento.qtdParcelas > 1 && (
                                <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                                    <h4 className="text-base font-semibold text-gray-900 mb-3">Pagamento Parcelado</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Número de parcelas:</span>
                                            <span className="font-semibold text-gray-900">{proposta.valores.parcelamento.qtdParcelas}x sem juros</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Valor da parcela:</span>
                                            <span className="font-semibold text-gray-900">{formatCurrency(proposta.valores.parcelamento.valorParcela)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-gray-900">Valor total:</span>
                                                <span className="text-xl font-bold text-extrema-purple">{formatCurrency(proposta.valores.parcelamento.valorTotal)}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 text-right">Primeira parcela via Pix.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Mensalidade */}
                    <div className="p-6 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Mensalidade Recorrente</p>
                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(proposta.valores.mensalidade)}/mês</p>
                            </div>
                            <svg className="w-16 h-16 text-purple-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {proposta.detalhesMensalidade && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Observações:</p>
                                <p className="text-xs text-gray-600 whitespace-pre-line">
                                    {proposta.detalhesMensalidade?.split('\n').filter(line => !line.trim().startsWith('Investimento em mensalidade para')).join('\n').trim()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ações */}
                {
                    podeAceitar && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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

                        </div>
                    )
                }

                {/* Botão PDF quando não pode aceitar */}
                {
                    !podeAceitar && (
                        <div className="flex justify-center mb-3">
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
                    )
                }

                {/* Footer com Contato */}
                <div className="card p-6 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Dúvidas sobre esta proposta?</h3>
                    <p className="text-sm text-gray-600 mb-4">Entre em contato conosco</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <a href="mailto:comercial@extrematecnologia.com.br" className="text-extrema-purple hover:underline">
                            📧 comercial@extrematecnologia.com.br
                        </a>
                        <a href="https://api.whatsapp.com/send?phone=5547996818985" target="_blank" className="flex items-center text-extrema-purple hover:underline">
                            <svg className="w-5 h-5 text-[#25D366] mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            (47) 99681-8985
                        </a>
                    </div>


                </div>



                {/* Footer Extrema */}
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                    <span>© 2026 Extrema Software de Gestão Empresarial</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-2 mr-1 text-gray-400">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                    </svg>
                    <span>São Bento do Sul-SC | Balneário Piçarras-SC</span>
                </div>
                {/* Modal de Aceite */}
                {
                    showAceiteModal && proposta && (
                        <AceiteForm
                            proposta={proposta}
                            onClose={() => setShowAceiteModal(false)}
                            onSuccess={handleAceiteSuccess}
                        />
                    )
                }

            </div >
        </div >
    );
}
