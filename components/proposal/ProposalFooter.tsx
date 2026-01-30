import React from 'react';

export default function ProposalFooter() {
    return (
        <footer className="mt-16 pt-12 pb-8 border-t border-gray-200 animate-fade-in-up delay-500 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-center md:justify-start gap-2">
                        <span className="w-2 h-2 rounded-none bg-green-500"></span>
                        Precisa de ajuda?
                    </h4>
                    <div className="space-y-3">
                        <a href="https://api.whatsapp.com/send?phone=5547996818985" target="_blank" className="block text-gray-600 hover:text-green-600 transition-colors">
                            <span className="font-medium">WhatsApp:</span> (47) 99681-8985
                        </a>
                        <a href="mailto:comercial@extrematecnologia.com.br" className="block text-gray-600 hover:text-brand-purple transition-colors">
                            <span className="font-medium">Email:</span> comercial@extrematecnologia.com.br
                        </a>
                    </div>
                </div>

                <div className="md:text-right">
                    <div className="inline-block">
                        {/* Logo Small or Text */}
                        <span className="text-xl font-bold tracking-tight text-gray-300">EXTREMA</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        © 2026 Extrema Tecnologia. Todos os direitos reservados.
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Santa Catarina, Brasil
                    </p>
                </div>
            </div>
        </footer>
    );
}
