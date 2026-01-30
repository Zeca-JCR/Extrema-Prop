'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPropostaByHash, getConfiguracoes, Proposta, Configuracoes } from '@/lib/storage';
import { isPropostaExpirada } from '@/lib/utils';
import { gerarPDFProposta } from '@/lib/pdf';

// Componentes
import ProposalHeader from '@/components/proposal/ProposalHeader';
import ProductShowcase from '@/components/proposal/ProductShowcase';
import PricingSection from '@/components/proposal/PricingSection';
import StickyActions from '@/components/proposal/StickyActions';
import ProposalFooter from '@/components/proposal/ProposalFooter';
import AceiteForm from '@/components/public/AceiteForm';

export default function PropostaPublica() {
    const params = useParams();
    const hash = params.hash as string;
    const [proposta, setProposta] = useState<Proposta | null>(null);
    const [config, setConfig] = useState<Configuracoes | null>(null);
    const [loading, setLoading] = useState(true);
    const [expirada, setExpirada] = useState(false);

    // UI States
    const [showStickyFooter, setShowStickyFooter] = useState(false);
    const [showAceiteModal, setShowAceiteModal] = useState(false);
    const [gerandoPDF, setGerandoPDF] = useState(false);

    // Initial Load & Polling
    useEffect(() => {
        if (!hash) return;

        const fetchData = () => {
            const prop = getPropostaByHash(hash);
            if (prop) {
                setProposta(current => {
                    // Always update to ensure we have the latest data (e.g. aceite details)
                    return prop;
                });
                setExpirada(isPropostaExpirada(prop.dataValidade));
            }
            setConfig(getConfiguracoes());
            setLoading(false);
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [hash]);

    // Sticky Footer Logic (Intersection Observer alternative based on scroll position)
    useEffect(() => {
        const handleScroll = () => {
            const mainActions = document.getElementById('main-actions');
            if (mainActions) {
                const rect = mainActions.getBoundingClientRect();
                // Show sticky if main buttons are NOT visible (scrolled past or above)
                // Logic: If bottom of buttons is < 0 (scrolled past) OR top > viewportHeight (not reached)
                // But for this use case, usually show sticky when scrolled PAST buttons
                const isPast = rect.bottom < 0;
                const isNotReached = rect.top > window.innerHeight;

                setShowStickyFooter(isPast || isNotReached);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading]); // Re-bind if loading changes structure

    // Actions
    const handleBaixarPDF = async (comAceite: boolean = false) => {
        if (!proposta) return;
        setGerandoPDF(true);
        try {
            await gerarPDFProposta(proposta, { comAceite });
        } catch (error) {
            console.error(error);
            alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setGerandoPDF(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-extrema-purple border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium animate-pulse">Carregando proposta...</span>
                </div>
            </div>
        );
    }

    if (!proposta) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
                    <p className="text-gray-500">Verifique o link ou entre em contato com a equipe comercial.</p>
                </div>
            </div>
        );
    }

    const podeAceitar = !expirada && ['rascunho', 'enviada', 'aguardando_pagamento'].includes(proposta.status);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-purple-100 selection:text-extrema-purple">
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">

                <ProposalHeader
                    proposta={proposta}
                    config={config}
                    expirada={expirada}
                />

                {/* Status Alerts (Success/Warning) */}
                {['comprovante_enviado', 'paga', 'aceita'].includes(proposta.status) && (
                    <div className="mb-8 p-6 bg-green-50 border-2 border-green-800 rounded-none shadow-swiss flex gap-4 items-start animate-fade-in-up">
                        <div className="w-8 h-8 bg-green-100 rounded-none border border-green-800 flex items-center justify-center shrink-0 text-green-800">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-green-900 text-lg uppercase tracking-tight">
                                {proposta.status === 'comprovante_enviado' ? 'Proposta em Análise' : 'Proposta Aprovada'}
                            </h3>
                            <p className="text-green-800 mt-1 font-medium">
                                {proposta.status === 'comprovante_enviado'
                                    ? 'Recebemos seu comprovante. Nossa equipe validará em breve.'
                                    : 'Tudo pronto! Seu processo de adesão foi concluído com sucesso.'}
                            </p>
                        </div>
                    </div>
                )}

                <ProductShowcase proposta={proposta} />

                <PricingSection proposta={proposta} />

                <StickyActions
                    proposta={proposta}
                    showSticky={showStickyFooter}
                    onAccept={() => setShowAceiteModal(true)}
                    onDownload={handleBaixarPDF}
                    gerandoPDF={gerandoPDF}
                    canAccept={podeAceitar}
                />

                <ProposalFooter />
            </main>

            {/* Modals */}
            {showAceiteModal && (
                <AceiteForm
                    proposta={proposta}
                    isOpen={showAceiteModal}
                    onClose={() => setShowAceiteModal(false)}
                    onPropostaChange={(updated) => setProposta(updated)}
                />
            )}
        </div>
    );
}
