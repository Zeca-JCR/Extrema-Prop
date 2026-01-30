import React, { useRef, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Proposta } from '@/lib/storage';
import { useAceiteForm, Etapa } from '@/hooks/useAceiteForm';

// Sub-components
import DadosStep from './aceite-form/DadosStep';
import PagamentoStep from './aceite-form/PagamentoStep';
import PixStep from './aceite-form/PixStep';
import ComprovanteStep from './aceite-form/ComprovanteStep';
import SucessoStep from './aceite-form/SucessoStep';

interface AceiteFormProps {
    proposta: Proposta;
    isOpen: boolean;
    onClose: () => void;
    onPropostaChange: (proposta: Proposta) => void;
}

export default function AceiteForm({ proposta, isOpen, onClose, onPropostaChange }: AceiteFormProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Hook que gerencia toda a lógica
    const form = useAceiteForm(proposta, onPropostaChange);
    const { etapa, methods } = form;

    // Scroll para o topo ao abrir
    useEffect(() => {
        if (isOpen) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isOpen]);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                // Não fecha se estiver processando algo
                if (!form.isLoading && etapa !== 'sucesso') {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, form.isLoading, etapa]);

    if (!isOpen) return null;

    // STEPS Configuration
    const steps: { id: Etapa; label: string; number: number }[] = [
        { id: 'dados', label: 'Dados', number: 1 },
        { id: 'pagamento', label: 'Pagamento', number: 2 },
        { id: 'pix', label: 'PIX', number: 3 },
        { id: 'comprovante', label: 'Comprovante', number: 4 }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === etapa);
    // Ajuste para etapa 'sucesso' (fictícia 5)
    const progressLimit = etapa === 'sucesso' ? 5 : steps[currentStepIndex]?.number || 1;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center pt-4 md:items-center md:pt-0">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 relative flex flex-col md:max-h-[90vh] h-auto my-auto ring-1 ring-gray-900/5 transition-all"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#8B4FD3] to-[#6b3aa8] px-6 py-4 rounded-t-xl flex justify-between items-center text-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">Aceite de Proposta</h2>
                        <p className="text-purple-100 text-sm opacity-90">
                            Proposta #{proposta.numero} • {proposta.cliente.empresa}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors min-w-[44px]"
                        aria-label="Fechar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar (Stepper) */}
                {etapa !== 'sucesso' && (
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-[#8B4FD3] -translate-y-1/2 rounded-full transition-all duration-500"
                                style={{ width: `${((progressLimit - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>

                            <div className="relative flex justify-between">
                                {steps.map((step) => {
                                    const stepIndex = steps.findIndex(s => s.id === step.id);
                                    const isActive = step.id === etapa;
                                    const isCompleted = stepIndex < currentStepIndex;

                                    return (
                                        <div key={step.id} className="flex flex-col items-center group cursor-default">
                                            <div className={`
                                                relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold border-2 transition-all duration-300
                                                ${isActive ? 'bg-[#8B4FD3] border-[#8B4FD3] text-white scale-110 shadow-lg' :
                                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                                        'bg-white border-gray-300 text-gray-400'}
                                            `}>
                                                {isCompleted ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : step.number}

                                                {/* Label Mobile: Only active */}
                                                <span className={`
                                                    absolute top-10 whitespace-nowrap text-xs font-medium md:hidden
                                                    ${isActive ? 'text-[#8B4FD3] opacity-100' : 'opacity-0'}
                                                `}>
                                                    {step.label}
                                                </span>
                                            </div>

                                            {/* Label Desktop */}
                                            <span className={`
                                                mt-2 text-xs font-medium hidden md:block transition-colors duration-300
                                                ${isActive ? 'text-[#8B4FD3]' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                                            `}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    <FormProvider {...methods}>
                        {etapa === 'dados' && (
                            <DadosStep
                                isFetchingCnpj={form.isFetchingCnpj}
                                handleCnpjBlur={form.handleCnpjBlur}
                                validarEContinuar={form.validarEContinuar}
                                onClose={onClose}
                                erros={form.erros}
                            />
                        )}

                        {etapa === 'pagamento' && (
                            <PagamentoStep
                                proposta={proposta}
                                setEtapa={form.setEtapa}
                                gerarPIX={form.gerarPIX}
                                isLoading={form.isLoading}
                            />
                        )}

                        {etapa === 'pix' && (
                            <PixStep
                                valorPix={form.valorPix}
                                formaPagamento={form.formValues.formaPagamento}
                                pixQrCode={form.pixQrCode}
                                pixPayload={form.pixPayload}
                                copiarCodigoPix={form.copiarCodigoPix}
                                copiado={form.copiado}
                                setEtapa={form.setEtapa}
                                irParaComprovante={form.irParaComprovante}
                            />
                        )}

                        {etapa === 'comprovante' && (
                            <ComprovanteStep
                                valorPix={form.valorPix}
                                comprovanteFile={form.comprovanteFile}
                                setComprovanteFile={form.setComprovanteFile}
                                comprovantePreview={form.comprovantePreview}
                                setComprovantePreview={form.setComprovantePreview}
                                uploadProgress={form.uploadProgress}
                                setUploadProgress={form.setUploadProgress}
                                erros={form.erros}
                                isLoading={form.isLoading}
                                setEtapa={form.setEtapa}
                                enviarComprovante={form.enviarComprovante}
                                simulateUpload={form.simulateUpload}
                            />
                        )}

                        {etapa === 'sucesso' && (
                            <SucessoStep proposta={proposta} />
                        )}
                    </FormProvider>
                </div>
            </div>
        </div>
    );
}
