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

    const [showStickyFooter, setShowStickyFooter] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const actionsSection = document.getElementById('acoes-principais');
            if (actionsSection) {
                const rect = actionsSection.getBoundingClientRect();
                // Mostrar footer quando a seção de ações principais sair da tela (rolando para cima ou ainda não chegou)
                // Na verdade, queremos mostrar quando NÃO estamos vendo os botões principais.
                // Mas, por simplicidade e conversão, vamos mostrar SEMPRE que houver rolagem suficiente,
                // ou ocultar quando os botões principais estiverem visíveis na viewport.
                const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                setShowStickyFooter(!isVisible);
            } else {
                // Se não achou a seção (ex: carregando), não mostra
                setShowStickyFooter(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Check inicial
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [proposta, loading]);

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
                <div className="card-modern p-8 mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative w-56 h-20">
                                <Image
                                    src="/images/logo_atual.png"
                                    alt="Extrema Tecnologia"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Proposta Comercial</h1>
                                <p className="text-gray-500 font-medium">{proposta.produto.nome} - {proposta.cliente.empresa} ({proposta.numero})</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Válida até</p>
                            <p className="text-xl font-bold text-gray-900">{formatDate(proposta.dataValidade, 'long')}</p>
                            {!expirada && diasRest <= 3 && (
                                <p className="text-sm font-semibold text-orange-600 mt-1 flex items-center justify-end">
                                    <span className="mr-1">⏰</span> Expira em {diasRest} dia(s)
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Saudação e Introdução separadas */}
                {config?.textosProposta?.introducao && (
                    <div className="card-modern p-8 mb-6 animate-fade-in-up delay-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{proposta.cliente.saudacao || 'Prezado(a)'} {proposta.cliente.contato}</h2>
                        <p className="text-base font-medium text-gray-500 mb-6">{proposta.cliente.empresa}</p>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                            {config.textosProposta.introducao}
                        </div>
                    </div>
                )}

                {/* Trust Bar (Prova Social) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up delay-200">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center space-x-3 shadow-sm">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <svg className="w-5 h-5 text-extrema-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm leading-tight">+12 Anos</p>
                            <p className="text-xs text-gray-500">de experiência no mercado</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center space-x-3 shadow-sm">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm leading-tight">Suporte Especializado</p>
                            <p className="text-xs text-gray-500">Administrativo, Contábil e Tributário</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-center space-x-3 shadow-sm">
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 text-sm leading-tight">Software Homologado</p>
                            <p className="text-xs text-gray-500">Segurança e Confiabilidade</p>
                        </div>
                    </div>
                </div>

                {/* Alerta de Status Especial */}
                {proposta.status === 'comprovante_enviado' && (
                    <div className="card-modern p-6 mb-6 bg-purple-50 border-l-4 border-l-purple-500 animate-fade-in-up delay-100">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-purple-900">Proposta Aceita - Aguardando Confirmação</h3>
                                <p className="text-purple-700 mt-1 leading-relaxed">
                                    Recebemos seu comprovante de pagamento. Nossa equipe está verificando e entrará em contato em breve.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {proposta.status === 'paga' && (
                    <div className="card-modern p-6 mb-6 bg-green-50 border-l-4 border-l-green-500 animate-fade-in-up delay-100">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-green-900">Pagamento Confirmado! ✓</h3>
                                <p className="text-green-700 mt-1 leading-relaxed">
                                    Seu pagamento foi confirmado. Em breve você receberá o contrato para assinatura.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta de Expiração */}
                {expirada && (
                    <div className="card-modern p-6 mb-6 bg-red-50 border-l-4 border-l-red-500 animate-fade-in-up delay-100">
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Proposta Expirada</h3>
                                <p className="text-red-700 mt-1 leading-relaxed">
                                    Esta proposta expirou em {formatDate(proposta.dataValidade, 'long')}.
                                    Entre em contato conosco para solicitar uma nova proposta.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Produto */}
                <div className="card-modern p-8 mb-6 animate-fade-in-up delay-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{proposta.produto.nome}</h2>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">{proposta.produto.descricao}</p>

                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Funcionalidades Incluídas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposta.produto.modulos.map((modulo, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-700 font-medium">{modulo}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Escopo do Projeto</h3>
                        <div className="flex flex-wrap gap-6 text-gray-700">
                            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">{String(proposta.produto.limites?.qtdCnpjs || '1').padStart(2, '0')} CNPJ{parseInt(String(proposta.produto.limites?.qtdCnpjs || '1')) > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="font-medium">{String(proposta.produto.limites?.qtdUsuarios || '1').padStart(2, '0')} usuário{parseInt(String(proposta.produto.limites?.qtdUsuarios || '1')) > 1 ? 's' : ''} simultâneo{parseInt(String(proposta.produto.limites?.qtdUsuarios || '1')) > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Valores e Condições Comerciais */}
                <div className="card-modern overflow-hidden mb-6 border-l-4 border-l-blue-600 animate-fade-in-up delay-300 shadow-soft-lg">
                    <div className="p-8 bg-white border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Valores e Condições Comerciais</h2>
                    </div>

                    {/* Investimento Inicial (Adesão) */}
                    <div className="p-8 pb-4 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Investimento Inicial (Adesão)</p>
                                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(proposta.valores.investimentoInicial)}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        {proposta.detalhesInvestimento && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-900 mb-2 uppercase">O que está incluso</p>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{proposta.detalhesInvestimento}</p>
                            </div>
                        )}
                    </div>

                    {/* Opções de Pagamento */}
                    <div className="p-8 pt-4 bg-white">
                        <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Condições de Pagamento</h3>
                        <div className={`grid grid-cols-1 ${proposta.valores.parcelamento.qtdParcelas > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                            {/* À Vista */}
                            <div className="p-6 border-2 border-green-200 bg-green-50/50 rounded-xl relative overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] duration-300">
                                <div className="absolute top-0 right-0 p-2">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Melhor Opção</span>
                                </div>
                                <div className="flex items-start justify-between mb-4 mt-2">
                                    <h4 className="text-lg font-bold text-gray-900">Pagamento à Vista</h4>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center text-gray-500">
                                        <span>Valor original</span>
                                        <span className="line-through decoration-red-400">{formatCurrency(proposta.valores.investimentoInicial)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Desconto aplicado</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold text-xs">-{proposta.valores.descontoAvistaPercentual}% OFF</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>Economia de</span>
                                        <span className="font-bold">-{formatCurrency(proposta.valores.descontoAvistaValor)}</span>
                                    </div>
                                    <div className="border-t border-green-200 pt-3 mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-gray-900">Valor Final</span>
                                            <span className="text-2xl font-extrabold text-green-600 tracking-tight">{formatCurrency(proposta.valores.valorAvista)}</span>
                                        </div>
                                        <p className="text-xs text-green-700 text-right font-medium flex items-center justify-end gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                                            Pagamento via Pix
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Parcelado */}
                            {proposta.valores.parcelamento.qtdParcelas > 1 && (
                                <div className="p-6 border border-gray-200 bg-gray-50/50 rounded-xl hover:shadow-md transition-all duration-300">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 mt-2">Pagamento Parcelado</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Parcelamento</span>
                                            <span className="font-bold text-gray-900 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">{proposta.valores.parcelamento.qtdParcelas}x sem juros</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Valor da parcela</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(proposta.valores.parcelamento.valorParcela)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-gray-900">Valor total</span>
                                                <span className="text-2xl font-extrabold text-extrema-purple tracking-tight">{formatCurrency(proposta.valores.parcelamento.valorTotal)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 text-right font-medium">Primeira parcela via Pix</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Mensalidade */}
                    <div className="p-8 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Mensalidade Recorrente</p>
                                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{formatCurrency(proposta.valores.mensalidade)}<span className="text-lg text-gray-400 font-normal">/mês</span></p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        {proposta.detalhesMensalidade && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-900 mb-2 uppercase">Observações</p>
                                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                                    {proposta.detalhesMensalidade?.split('\n').filter(line => !line.trim().startsWith('Investimento em mensalidade para')).join('\n').trim()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ações */}
                {
                    podeAceitar && (
                        <div id="acoes-principais" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-400">
                            <button
                                onClick={() => setShowAceiteModal(true)}
                                className="btn-modern bg-[#8B4FD3] text-white py-5 text-lg hover:bg-[#7640B8] shadow-lg shadow-purple-500/30 w-full transition-all"
                            >
                                {proposta.status === 'aguardando_pagamento' ? '💳 Realizar Pagamento' : '✓ Aceitar Proposta'}
                            </button>
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-medium">Empresa Referência em Tecnologia</span>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowPdfMenu(!showPdfMenu)}
                                    className="btn-modern bg-white text-gray-700 border border-gray-200 py-5 text-lg hover:bg-gray-50 hover:border-gray-300 w-full flex items-center justify-center space-x-2 shadow-sm"
                                    disabled={gerandoPDF}
                                >
                                    <span>📄 Baixar PDF</span>
                                    <svg className={`w-5 h-5 ml-2 transition-transform duration-200 ${showPdfMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    <div className="absolute right-0 bottom-full mb-2 w-full bg-white rounded-xl shadow-xl z-20 border border-gray-100 overflow-hidden animate-slide-up">
                                        <button
                                            onClick={() => {
                                                handleBaixarPDF(false);
                                                setShowPdfMenu(false);
                                            }}
                                            className="block w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-50"
                                        >
                                            Proposta Original
                                        </button>
                                        {proposta.aceite && (
                                            <button
                                                onClick={() => {
                                                    handleBaixarPDF(true);
                                                    setShowPdfMenu(false);
                                                }}
                                                className="block w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
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
                        <div className="flex justify-center mb-8 animate-fade-in-up delay-400">
                            <button
                                onClick={() => handleBaixarPDF(false)}
                                disabled={gerandoPDF}
                                className="btn-modern bg-white text-gray-700 border border-gray-200 py-4 px-10 hover:bg-gray-50 hover:border-gray-300 shadow-sm disabled:opacity-50"
                            >
                                {gerandoPDF ? '⏳ Gerando...' : '📄 Baixar PDF da Proposta'}
                            </button>
                            {proposta.aceite && (
                                <button
                                    onClick={() => handleBaixarPDF(true)}
                                    disabled={gerandoPDF}
                                    className="btn-modern bg-white text-gray-700 border border-gray-200 py-4 px-10 ml-4 hover:bg-gray-50 hover:border-gray-300 shadow-sm disabled:opacity-50"
                                >
                                    {gerandoPDF ? '⏳...' : '📄 Baixar Comprovante/Aceite'}
                                </button>
                            )}
                        </div>
                    )
                }

                {/* Footer Refinado e Ancorado */}
                <footer className="mt-12 pt-8 border-t border-gray-200 animate-fade-in-up delay-500">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">

                        {/* Lado Esquerdo: Contato */}
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center justify-center md:justify-start gap-2">
                                <span>💬</span> Ficou com alguma dúvida?
                            </h3>
                            <div className="space-y-2">
                                <a href="mailto:comercial@extrematecnologia.com.br" className="group flex items-center justify-center md:justify-start text-sm text-gray-600 hover:text-purple-600 transition-colors">
                                    <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    comercial@extrematecnologia.com.br
                                </a>
                                <a href="https://api.whatsapp.com/send?phone=5547996818985" target="_blank" className="group flex items-center justify-center md:justify-start text-sm text-gray-600 hover:text-green-600 transition-colors">
                                    <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
                                    (47) 99681-8985
                                </a>
                            </div>
                        </div>

                        {/* Lado Direito: Info Empresa */}
                        <div className="text-center md:text-right">
                            <div className="flex items-center justify-center md:justify-end gap-2 mb-2 opacity-80">
                                <span className="font-bold text-gray-900 tracking-tight">EXTREMA</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500 text-sm">Software de Gestão</span>
                            </div>
                            <p className="text-xs text-gray-400">© 2026 Todos os direitos reservados</p>
                            <div className="flex items-center justify-center md:justify-end gap-1 mt-1 text-xs text-gray-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>Santa Catarina, Brasil</span>
                            </div>

                            {/* Redes Sociais */}
                            <div className="flex items-center justify-center md:justify-end gap-4 mt-4">
                                <a href="https://extrematecnologia.com.br/" target="_blank" className="text-gray-400 hover:text-blue-500 transition-colors" title="Site Oficial">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                </a>
                                <a href="https://www.instagram.com/extremasoftware" target="_blank" className="text-gray-400 hover:text-pink-600 transition-colors" title="Instagram">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="https://www.facebook.com/extremasoftware" target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors" title="Facebook">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                                </a>
                            </div>
                        </div>

                    </div>
                </footer>

                {/* Sticky Footer CTA */}
                {podeAceitar && showStickyFooter && (
                    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 p-4 animate-slide-up">
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                            <div className="hidden md:block">
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Valor de Adesão</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-extrabold text-extrema-purple">{formatCurrency(proposta.valores.valorAvista)}</span>
                                    <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">à vista</span>
                                </div>
                            </div>
                            <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleBaixarPDF(false)}
                                    className="btn-modern bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-4 flex-1 md:flex-none text-sm font-bold"
                                    disabled={gerandoPDF}
                                >
                                    {gerandoPDF ? '⏳' : '📥 PDF'}
                                </button>
                                <button
                                    onClick={() => setShowAceiteModal(true)}
                                    className="btn-modern bg-[#8B4FD3] text-white hover:bg-[#7640B8] py-3 px-6 shadow-lg shadow-purple-500/30 flex-1 md:w-64 font-bold text-sm md:text-base"
                                >
                                    {proposta.status === 'aguardando_pagamento' ? '💳 Pagar Agora' : '✓ Aceitar Proposta'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modal de Aceite */}
                {
                    showAceiteModal && proposta && (
                        <AceiteForm
                            proposta={proposta}
                            isOpen={showAceiteModal}
                            onClose={() => setShowAceiteModal(false)}
                            onPropostaChange={handleAceiteSuccess}
                        />
                    )
                }

            </div >
        </div >
    );
}
