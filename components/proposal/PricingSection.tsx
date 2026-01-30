import React from 'react';
import { Proposta, Valores } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

interface PricingSectionProps {
    proposta: Proposta;
}

export default function PricingSection({ proposta }: PricingSectionProps) {
    const { valores } = proposta;

    return (
        <div className="space-y-6 mb-12 animate-fade-in-up delay-300">
            {/* Main Card Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Valores e Condições Comerciais</h2>

                    {/* Investimento Inicial Header */}
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">INVESTIMENTO INICIAL (ADESÃO)</p>
                            <div className="text-3xl font-extrabold text-gray-900">{formatCurrency(valores.investimentoInicial)}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Descrição Incluso */}
                    {proposta.detalhesInvestimento && (
                        <div className="mb-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">O QUE ESTÁ INCLUSO</p>
                            <p className="text-sm text-gray-600">{proposta.detalhesInvestimento}</p>
                        </div>
                    )}

                    <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4">CONDIÇÕES DE PAGAMENTO</p>

                    {/* Grid de Cards de Pagamento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

                        {/* Card À Vista (Destaque) */}
                        <div className="border border-green-200 bg-green-50/30 rounded-xl p-6 relative">
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                                MELHOR OPÇÃO
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-6">Pagamento à Vista</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Valor original</span>
                                    <span className="text-gray-400 line-through decoration-red-400">{formatCurrency(valores.investimentoInicial)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-900 font-medium">Desconto aplicado</span>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded">-{valores.descontoAvistaPercentual}% OFF</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Economia de</span>
                                    <span className="text-green-600 font-bold">-{formatCurrency(valores.descontoAvistaValor)}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-green-200">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-gray-900 font-bold text-sm">Valor Final</span>
                                    <span className="text-2xl font-extrabold text-green-600">{formatCurrency(valores.valorAvista)}</span>
                                </div>
                                <p className="text-right text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Pagamento via Pix
                                </p>
                            </div>
                        </div>

                        {/* Card Parcelado */}
                        <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-6">Pagamento Parcelado</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500">Parcelamento</span>
                                        <span className="bg-white border border-gray-200 px-2 py-1 rounded text-gray-700 text-xs font-bold">
                                            {valores.parcelamento.qtdParcelas}x sem juros
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-500">Valor da parcela</span>
                                        <span className="text-gray-900 font-bold">{formatCurrency(valores.parcelamento.valorParcela)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-gray-900 font-bold text-sm">Valor total</span>
                                    <span className="text-2xl font-extrabold text-gray-800">{formatCurrency(valores.parcelamento.valorTotal)}</span>
                                </div>
                                <p className="text-right text-xs text-gray-500">
                                    Primeira parcela via Pix
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensalidade Section */}
                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">MENSALIDADE RECORRENTE</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(valores.mensalidade)}</span>
                                    <span className="text-gray-500 font-medium text-sm">/mês</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-brand-purple">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {proposta.detalhesMensalidade && (
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">OBSERVAÇÕES</p>
                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {proposta.detalhesMensalidade}
                                </div>
                            </div>
                        )}


                    </div>

                </div>
            </div>
        </div>
    );
}
