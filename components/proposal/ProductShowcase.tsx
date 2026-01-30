import React from 'react';
import { Proposta } from '@/lib/storage';

interface ProductShowcaseProps {
    proposta: Proposta;
}

export default function ProductShowcase({ proposta }: ProductShowcaseProps) {
    const modulos = proposta.produto.modulos || [];
    const midPoint = Math.ceil(modulos.length / 2);
    const col1 = modulos.slice(0, midPoint);
    const col2 = modulos.slice(midPoint);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 animate-fade-in-up delay-200">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{proposta.produto.nome}</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{proposta.produto.descricao}</p>
            </div>

            <div className="p-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-3 bg-brand-purple rounded-full"></span>
                    O que está incluído
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <ModuleColumn items={col1} />
                    <ModuleColumn items={col2} />
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Escopo do Projeto
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                <Badge
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                                    label={`${String(proposta.produto.limites?.qtdCnpjs || '1').padStart(2, '0')} CNPJ${parseInt(String(proposta.produto.limites?.qtdCnpjs || '1')) > 1 ? 's' : ''}`}
                                />
                                <Badge
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                                    label={`${String(proposta.produto.limites?.qtdUsuarios || '1').padStart(2, '0')} Usuário${parseInt(String(proposta.produto.limites?.qtdUsuarios || '1')) > 1 ? 's' : ''}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModuleColumn({ items }: { items: string[] }) {
    if (!items.length) return null;
    return (
        <ul className="space-y-3">
            {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <span className="leading-snug">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 text-sm font-medium">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
            {label}
        </div>
    )
}
