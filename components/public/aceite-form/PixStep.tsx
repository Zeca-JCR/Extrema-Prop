import React from 'react';
import { useAceiteForm } from '@/hooks/useAceiteForm';
import { formatCurrency } from '@/lib/utils';
import { AceiteFormData } from '@/lib/schemas';

type PixStepProps = Pick<ReturnType<typeof useAceiteForm>,
    'valorPix' | 'pixQrCode' | 'pixPayload' |
    'copiarCodigoPix' | 'copiado' | 'setEtapa' | 'irParaComprovante'
> & {
    formaPagamento: AceiteFormData['formaPagamento'];
};

export default function PixStep({
    valorPix, formaPagamento, pixQrCode, pixPayload,
    copiarCodigoPix, copiado, setEtapa, irParaComprovante
}: PixStepProps) {
    return (
        <div className="space-y-6 pb-8">
            <div className="text-center">
                <p className="text-gray-600 mb-2">Valor a pagar via PIX:</p>
                <p className="text-3xl font-bold text-brand-purple">
                    {formatCurrency(valorPix)}
                </p>
                {formaPagamento === 'parcelado' && (
                    <p className="text-sm text-gray-500 mt-1">
                        (Entrada - 1ª parcela)
                    </p>
                )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                    {pixQrCode && (
                        <img
                            src={pixQrCode}
                            alt="QR Code PIX"
                            className="w-56 h-56"
                        />
                    )}
                </div>
            </div>

            {/* Código Copia e Cola */}
            <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Código PIX (Copia e Cola):</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={pixPayload}
                        readOnly
                        className="input flex-1 text-xs bg-white border border-gray-300 rounded p-2"
                    />
                    <button
                        onClick={copiarCodigoPix}
                        className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${copiado ? 'bg-green-500 text-white' : 'bg-brand-purple text-white hover:bg-brand-purple-dark'} whitespace-nowrap`}
                    >
                        {copiado ? '✓ Copiado!' : '📋 Copiar'}
                    </button>
                </div>
            </div>

            {/* Instruções */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">Como pagar:</p>
                        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                            <li>Abra o app do seu banco</li>
                            <li>Escolha pagar via PIX com QR Code ou Copia e Cola</li>
                            <li>Escaneie o QR Code ou cole o código acima</li>
                            <li>Confirme o pagamento</li>
                            <li>Salve o comprovante e envie no próximo passo</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6 md:static sticky bottom-0 bg-white md:bg-transparent p-4 md:p-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none -mx-6 md:mx-0 z-10">
                <button onClick={() => setEtapa('pagamento')} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                    ← Voltar
                </button>
                <button onClick={irParaComprovante} className="px-6 py-3 bg-brand-purple text-white font-bold rounded-lg shadow-lg hover:bg-brand-purple-dark transition-all transform hover:-translate-y-0.5">
                    Já paguei, enviar comprovante →
                </button>
            </div>
        </div>
    );
}
