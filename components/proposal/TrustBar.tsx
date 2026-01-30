import React from 'react';

export default function TrustBar() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden mb-8 animate-fade-in-up delay-200">
            <TrustItem
                icon={
                    <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                title="+12 Anos de Mercado"
                subtitle="Experiência consolidada"
            />
            <TrustItem
                icon={
                    <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                }
                title="Suporte Especializado"
                subtitle="Contábil e Tributário"
            />
            <TrustItem
                icon={
                    <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                title="Software Homologado"
                subtitle="Segurança Fiscal"
            />
        </div>
    );
}

function TrustItem({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="bg-white p-6 flex flex-col items-center text-center md:flex-row md:text-left gap-4 hover:bg-purple-50/30 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">{title}</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}
