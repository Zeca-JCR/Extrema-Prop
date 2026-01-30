import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAceiteForm } from '@/hooks/useAceiteForm';
import { Proposta } from '@/lib/storage';
import { AceiteFormData } from '@/lib/schemas';
import { formatCurrency, copyToClipboard } from '@/lib/utils';

type PagamentoStepProps = Pick<ReturnType<typeof useAceiteForm>,
    'setEtapa' | 'gerarPIX' | 'isLoading'
> & { proposta: Proposta };

export default function PagamentoStep({
    proposta, setEtapa, gerarPIX, isLoading
}: PagamentoStepProps) {
    const { watch, setValue } = useFormContext<AceiteFormData>();
    const formaPagamento = watch('formaPagamento');
    const [linkCopiado, setLinkCopiado] = useState(false);

    const selecionarFormaPagamento = (forma: 'avista' | 'parcelado') => {
        setValue('formaPagamento', forma);
    };

    return (
        <div className="space-y-6">
            <p className="text-gray-600 text-center">
                Escolha a forma de pagamento que preferir:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* À Vista */}
                <button
                    onClick={() => selecionarFormaPagamento('avista')}
                    className={`p-6 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${formaPagamento === 'avista'
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">À Vista</h3>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                            -{proposta.valores.descontoAvistaPercentual}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 line-through mb-1">
                        {formatCurrency(proposta.valores.investimentoInicial)}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(proposta.valores.valorAvista)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Economia de {formatCurrency(proposta.valores.descontoAvistaValor)}
                    </p>
                </button>

                {/* Parcelado */}
                <button
                    onClick={() => selecionarFormaPagamento('parcelado')}
                    className={`p-6 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${formaPagamento === 'parcelado'
                        ? 'border-extrema-purple bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-extrema-purple/50 hover:bg-purple-50/50'
                        }`}
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Parcelado</h3>
                    <p className="text-sm text-gray-600 mb-1">
                        {proposta.valores.parcelamento.qtdParcelas}x sem juros
                    </p>
                    <p className="text-2xl font-bold text-extrema-purple">
                        {formatCurrency(proposta.valores.parcelamento.valorParcela)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Total: {formatCurrency(proposta.valores.parcelamento.valorTotal)}
                    </p>
                </button>
            </div>

            {formaPagamento && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm text-blue-800">
                                {formaPagamento === 'avista'
                                    ? 'Pagamento único via PIX com desconto especial.'
                                    : `Entrada via PIX (${formatCurrency(proposta.valores.parcelamento.valorParcela)}) + ${proposta.valores.parcelamento.qtdParcelas - 1} boleto(s).`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Compartilhamento */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                    Não é você quem vai pagar? Envie para o financeiro:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            const text = `Olá! Segue a proposta *${proposta.numero}* da Extrema Sistema.\nValor à vista: *${formatCurrency(proposta.valores.valorAvista)}*\n\nLink para pagamento: ${window.location.href}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-white text-green-600 border border-green-200 hover:bg-green-50 flex items-center gap-2 px-3 py-3 md:py-2 rounded-lg text-sm transition-colors min-w-[44px]"
                        title="Enviar por WhatsApp"
                        aria-label="Enviar orçamento por WhatsApp"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </button>

                    <button
                        onClick={() => {
                            const subject = `Link para pagamento da Proposta ${proposta.numero}`;
                            const body = `Olá,\n\nSegue a proposta ${proposta.numero} da Extrema Sistema.\nValor à vista: ${formatCurrency(proposta.valores.valorAvista)}\n\nLink para pagamento: ${window.location.href}\n\nAtenciosamente,`;
                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                        className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center gap-2 px-3 py-3 md:py-2 rounded-lg text-sm transition-colors min-w-[44px]"
                        title="Enviar por Email"
                        aria-label="Enviar orçamento por Email"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                    </button>

                    <button
                        onClick={() => {
                            copyToClipboard(window.location.href);
                            setLinkCopiado(true);
                            setTimeout(() => setLinkCopiado(false), 3000);
                        }}
                        className={`flex items-center gap-2 px-3 py-3 md:py-2 rounded-lg text-sm border transition-colors min-w-[44px] ${linkCopiado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-extrema-purple hover:border-purple-200'}`}
                        title="Copiar Link"
                        aria-label="Copiar Link do orçamento"
                    >
                        {linkCopiado ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copiado!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copiar Link
                            </>
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Seus dados já estão salvos. O responsável financeiro continuará exatamente deste ponto.
                </p>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={() => setEtapa('dados')} className="btn btn-secondary">
                    ← Voltar
                </button>
                <button
                    onClick={gerarPIX}
                    disabled={!formaPagamento || isLoading}
                    className="btn btn-primary disabled:opacity-50"
                >
                    {isLoading ? 'Gerando PIX...' : 'Continuar para PIX →'}
                </button>
            </div>
        </div>
    );
}
