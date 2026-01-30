import React, { useState } from 'react';
import { Proposta } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

interface StickyActionsProps {
    proposta: Proposta;
    showSticky: boolean;
    onAccept: () => void;
    onDownload: (comAceite?: boolean) => void;
    gerandoPDF: boolean;
    canAccept: boolean;
}

export default function StickyActions({ proposta, showSticky, onAccept, onDownload, gerandoPDF, canAccept }: StickyActionsProps) {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    // if (!canAccept && showSticky) return null; // Removed to prevent unmounting inline actions

    return (
        <>
            {/* Inline Actions (Main Body) */}
            <div id="main-actions" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 animate-fade-in-up delay-400">
                {canAccept && (
                    <button
                        onClick={onAccept}
                        className="group relative flex items-center justify-center gap-3 bg-brand-purple text-white py-5 px-8 rounded-xl text-lg font-bold shadow-xl shadow-purple-500/20 hover:bg-brand-purple-dark hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative">{proposta.status === 'aguardando_pagamento' ? 'Realizar Pagamento' : 'Aceitar Proposta'}</span>
                        <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                )}

                <div className={`flex flex-col md:flex-row gap-4 ${!canAccept ? 'col-span-2' : ''}`}>
                    {/* Botão Versão Original */}
                    <button
                        onClick={() => onDownload(false)}
                        disabled={gerandoPDF}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-5 px-8 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                    >
                        {gerandoPDF ? (
                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        <span>Baixar Proposta</span>
                    </button>

                    {/* Botão Versão com Aceite (se existir) */}
                    {proposta.aceite && (
                        <button
                            onClick={() => onDownload(true)}
                            disabled={gerandoPDF}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 py-5 px-8 rounded-xl text-lg font-bold hover:bg-purple-100 transition-all shadow-sm hover:shadow-md"
                        >
                            {gerandoPDF ? (
                                <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <span>Comprovante de Aceite</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Sticky Footer (Mobile/Desktop) */}
            {canAccept && showSticky && (
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 p-4 animate-slide-up">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden md:block">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Valor Final</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-brand-purple">{formatCurrency(proposta.valores.valorAvista)}</span>
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">À VISTA</span>
                            </div>
                        </div>

                        <div className="flex-1 md:flex-none flex gap-3">
                            <button
                                onClick={() => onDownload(false)}
                                disabled={gerandoPDF}
                                className="flex-1 md:flex-none py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors text-sm"
                            >
                                PDF
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex-[2] md:w-64 py-3 px-6 rounded-lg bg-brand-purple text-white font-bold shadow-lg hover:bg-brand-purple-dark transition-colors text-sm md:text-base flex items-center justify-center gap-2"
                            >
                                {proposta.status === 'aguardando_pagamento' ? 'Pagar' : 'Aceitar Proposta'}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
