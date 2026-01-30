import React from 'react';
import { Proposta } from '@/lib/storage';

interface SucessoStepProps {
    proposta: Proposta;
}

export default function SucessoStep({ proposta }: SucessoStepProps) {
    return (
        <div className="text-center py-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-6 animate-in zoom-in duration-500">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tudo certo! Recebemos seu aceite.</h3>

            <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto mb-8 text-left border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span className="text-xl">📋</span> Próximos passos:
                </h4>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <span>Verificação do comprovante <br /><span className="text-gray-400 text-xs">(até 24h úteis)</span></span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <span>Envio do contrato por email</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <span>Assinatura digital</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <span>Agendamento da implantação - Contato Técnico</span>
                    </li>
                </ul>
            </div>
            <button
                onClick={() => {
                    localStorage.removeItem(`proposta_aceite_temp_${proposta.id}`);
                    window.location.reload();
                }}
                className="btn btn-primary px-8"
            >
                Fechar e Atualizar
            </button>
        </div>
    );
}
