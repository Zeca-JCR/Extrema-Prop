import Image from 'next/image';
import { formatDate, diasRestantes } from '@/lib/utils';
import { Proposta, Configuracoes } from '@/lib/storage';

interface ProposalHeaderProps {
    proposta: Proposta;
    config: Configuracoes | null;
    expirada: boolean;
}

export default function ProposalHeader({ proposta, config, expirada }: ProposalHeaderProps) {
    const diasRest = diasRestantes(proposta.dataValidade);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 relative overflow-hidden">
                {/* Background Gradients decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                        <div className="relative w-48 h-16 shrink-0">
                            {config?.empresa?.logo ? (
                                <Image
                                    src="/images/logo_atual.png"
                                    alt="Extrema Tecnologia"
                                    fill
                                    className="object-contain object-center md:object-left"
                                    priority
                                />
                            ) : (
                                <span className="text-xl font-bold tracking-tight text-gray-900">EXTREMA</span>
                            )}
                        </div>

                        <div className="h-10 w-px bg-gray-200 hidden md:block"></div>

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                Proposta Comercial
                            </h1>
                            <div className="flex flex-col md:flex-row items-center gap-2 text-gray-500 mt-1">
                                <span className="font-medium">{proposta.produto.nome}</span>
                                <span className="hidden md:inline">•</span>
                                <span>Proposta #{proposta.numero}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Válida até
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${expirada ? 'text-red-500 line-through decoration-2' : 'text-gray-900'}`}>
                                {formatDate(proposta.dataValidade, 'long')}
                            </span>
                        </div>

                        {!expirada && diasRest <= 5 && (
                            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Expira em {diasRest} dia{diasRest > 1 ? 's' : ''}
                            </div>
                        )}

                        {expirada && (
                            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                                Expirada
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Introduction Card */}
            {config?.textosProposta?.introducao && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 animate-fade-in-up delay-100 overflow-hidden">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-brand-purple">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {proposta.cliente.saudacao || 'Olá'}, {proposta.cliente.contato}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium">
                                    {proposta.cliente.empresa}
                                </p>
                            </div>
                        </div>

                        <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                            {config.textosProposta.introducao}
                        </div>
                    </div>

                    {/* Divider & Trust Bar Integrated */}
                    <div className="border-t border-gray-100 bg-gray-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <TrustItem
                                icon={
                                    <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                title="+12 Anos de Mercado"
                                subtitle="Experiência consolidada"
                            />
                            <TrustItem
                                icon={
                                    <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                                title="Suporte Especializado"
                                subtitle="Administrativo, Contábil e Tributário"
                            />
                            <TrustItem
                                icon={
                                    <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                title="Software Homologado"
                                subtitle="Segurança Fiscal"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function TrustItem({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="p-6 flex flex-col items-center text-center md:flex-row md:text-left gap-4 hover:bg-purple-50/50 transition-colors duration-300 group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-gray-100 shadow-sm text-brand-purple">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}
