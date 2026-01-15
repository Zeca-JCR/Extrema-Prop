'use client';

import { useState } from 'react';
import { Proposta, Aceite, updateProposta } from '@/lib/storage';
import { formatCurrency, formatDate, getStatusLabel } from '@/lib/utils';
import { QrCodePix } from 'qrcode-pix';

interface DetalhesPropostaModalProps {
    proposta: Proposta | null;
    onClose: () => void;
    onUpdate: (msg?: string) => void;
}

export default function DetalhesPropostaModal({ proposta, onClose, onUpdate }: DetalhesPropostaModalProps) {
    if (!proposta) return null;

    const [activeTab, setActiveTab] = useState<'geral' | 'aceite'>('geral');
    const [isLoading, setIsLoading] = useState(false);

    const isAceiteEnv = proposta.status === 'comprovante_enviado' || proposta.status === 'paga' || proposta.status === 'aceita';
    const aceite = proposta.aceite;

    const aprovarPagamento = () => {
        if (!confirm('Confirmar o recebimento do pagamento?')) return;

        const novaProposta = { ...proposta, status: 'paga' as const, updatedAt: new Date().toISOString() };
        if (novaProposta.aceite?.comprovante) {
            novaProposta.aceite.comprovante.aprovado = true;
            novaProposta.aceite.comprovante.aprovadoEm = new Date().toISOString();
            // TODO: Pegar usuário atual
            novaProposta.aceite.comprovante.aprovadoPor = 'Admin';
        }

        updateProposta(novaProposta);
        onUpdate('Pagamento aprovado com sucesso!');
        onClose();
    };

    const recusarPagamento = () => {
        const motivo = prompt('Motivo da recusa:');
        if (!motivo) return;

        const novaProposta = { ...proposta, status: 'aguardando_pagamento' as const, updatedAt: new Date().toISOString() };
        if (novaProposta.aceite?.comprovante) {
            novaProposta.aceite.comprovante.aprovado = false;
            novaProposta.aceite.comprovante.observacoes = `Recusado: ${motivo}`;
        }

        updateProposta(novaProposta);
        onUpdate('Comprovante recusado.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Detalhes da Proposta</h2>
                        <p className="text-sm text-gray-500">#{proposta.numero} - {proposta.cliente.empresa}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'geral'
                            ? 'border-extrema-purple text-extrema-purple'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('aceite')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'aceite'
                            ? 'border-extrema-purple text-extrema-purple'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Aceite e Pagamento
                        {proposta.status === 'comprovante_enviado' && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Novo</span>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'geral' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Cliente</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Empresa:</dt>
                                            <dd className="font-medium">{proposta.cliente.empresa}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Contato:</dt>
                                            <dd className="font-medium">{proposta.cliente.contato}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Email:</dt>
                                            <dd className="font-medium">{proposta.cliente.email}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Telefone:</dt>
                                            <dd className="font-medium">{proposta.cliente.telefone}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-3">Valores</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Valor Total:</dt>
                                            <dd className="font-medium">{formatCurrency(proposta.valores.investimentoInicial)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">À Vista:</dt>
                                            <dd className="font-medium text-green-600">{formatCurrency(proposta.valores.valorAvista)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Parcelado:</dt>
                                            <dd className="font-medium">
                                                {formatCurrency(proposta.valores.parcelamento.valorParcela)} x {proposta.valores.parcelamento.qtdParcelas}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200">
                                            <dt className="text-gray-500">Mensalidade:</dt>
                                            <dd className="font-medium">{formatCurrency(proposta.valores.mensalidade)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Produto</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium">{proposta.produto.nome}</p>
                                    <p className="text-sm text-gray-600 mt-1">{proposta.produto.descricao}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {proposta.produto.modulos.map(m => (
                                            <span key={m} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'aceite' && (
                        <div className="space-y-6">
                            {!aceite && !proposta.dadosCadastrais ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">Nenhum dado de aceite ou rascunho preenchido ainda.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Status do Aceite */}
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-800">Status atual:</p>
                                            <p className="font-bold text-blue-900">{getStatusLabel(proposta.status)}</p>
                                        </div>
                                        {aceite?.aceitoEm && (
                                            <div className="text-right">
                                                <p className="text-sm text-blue-800">Aceito em:</p>
                                                <p className="font-medium text-blue-900">{formatDate(aceite.aceitoEm)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Forma de Pagamento */}
                                    {aceite?.formaPagamento && (
                                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm text-purple-800">Forma de Pagamento:</p>
                                                <p className="font-bold text-purple-900">
                                                    {aceite.formaPagamento === 'avista' ? 'PIX à Vista' : 'Entrada + Parcelamento'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-purple-800">Valor Pago:</p>
                                                <p className="font-medium text-purple-900">{formatCurrency(aceite.valorPagoPix)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dados Cadastrais (Rascunho ou Final) */}
                                    {(aceite?.dadosCadastrais || proposta.dadosCadastrais) && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Dados Cadastrais da Empresa</h3>
                                            {(() => {
                                                const dados = aceite?.dadosCadastrais || proposta.dadosCadastrais!;
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="block text-gray-500">Razão Social</span>
                                                                <span className="font-medium">{dados.razaoSocial}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">CNPJ</span>
                                                                <span className="font-medium">{dados.cnpj}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Nome Fantasia</span>
                                                                <span className="font-medium">{dados.nomeFantasia}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Endereço</span>
                                                                <span className="font-medium">
                                                                    {dados.endereco.rua}, {dados.endereco.numero} {dados.endereco.complemento ? `- ${dados.endereco.complemento}` : ''} - {dados.endereco.bairro}
                                                                </span>
                                                                <span className="block text-xs text-gray-500">
                                                                    {dados.endereco.cidade}/{dados.endereco.uf} - {dados.endereco.cep}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Responsável</span>
                                                                <span className="font-medium">{dados.responsavel.nome} ({dados.responsavel.cargo})</span>
                                                                <span className="block text-xs text-gray-500">CPF: {dados.responsavel.cpf}</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Contato</span>
                                                                <span className="font-medium">{dados.email}</span>
                                                                <span className="block text-xs text-gray-500">{dados.telefone}</span>
                                                            </div>
                                                        </div>

                                                        {/* Contabilidade */}
                                                        {dados.contabilidade && (
                                                            <div className="bg-gray-50 p-4 rounded-lg text-sm border-l-4 border-gray-300">
                                                                <h4 className="font-semibold text-gray-700 mb-2">Contabilidade / Financeiro</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <span className="block text-gray-500">Nome</span>
                                                                        <span className="font-medium">{dados.contabilidade.nome || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-gray-500">Contato</span>
                                                                        <span className="font-medium">{dados.contabilidade.contato || '-'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-gray-500">Telefone</span>
                                                                        <span className="font-medium">{dados.contabilidade.telefone || '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Comprovante */}
                                    {aceite?.comprovante ? (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Comprovante de Pagamento</h3>
                                            <div className="border rounded-lg p-4">
                                                <div className="mb-4">
                                                    {aceite.comprovante.arquivoBase64.startsWith('data:image') ? (
                                                        <img
                                                            src={aceite.comprovante.arquivoBase64}
                                                            alt="Comprovante"
                                                            className="max-h-96 w-auto mx-auto rounded shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <p>Arquivo PDF ou formato não visualizável diretamente.</p>
                                                            <a
                                                                href={aceite.comprovante.arquivoBase64}
                                                                download={aceite.comprovante.nomeArquivo}
                                                                className="text-extrema-purple underline hover:text-purple-700"
                                                            >
                                                                Baixar arquivo ({aceite.comprovante.nomeArquivo})
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {aceite.comprovante.observacoes && (
                                                    <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-4">
                                                        <strong>Observações do Cliente:</strong> {aceite.comprovante.observacoes}
                                                    </div>
                                                )}

                                                {/* Ações de Aprovação */}
                                                {proposta.status === 'comprovante_enviado' && (
                                                    <div className="flex gap-4 justify-end border-t pt-4">
                                                        <button
                                                            onClick={recusarPagamento}
                                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded bg-white border border-red-200"
                                                        >
                                                            Recusar Comprovante
                                                        </button>
                                                        <button
                                                            onClick={aprovarPagamento}
                                                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded shadow-sm"
                                                        >
                                                            Aprovar e Finalizar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                                            <p className="text-gray-500">Comprovante ainda não foi enviado.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
