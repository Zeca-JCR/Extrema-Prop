'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getConfiguracoes, saveConfiguracoes } from '@/lib/storage';
import type { Configuracoes } from '@/lib/storage';

export default function ConfiguracoesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<Configuracoes | null>(null);
    const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const dados = getConfiguracoes();
        setConfig(dados);
        setLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (!config) return;

        const { name, value } = e.target;

        if (name.startsWith('ailos.')) {
            const field = name.split('.')[1];
            setConfig({
                ...config,
                integracoes: {
                    ...config.integracoes,
                    ailos: {
                        ...config.integracoes.ailos,
                        [field]: value
                    }
                }
            });
        } else if (name === 'modoPix') {
            setConfig({
                ...config,
                integracoes: {
                    ...config.integracoes,
                    modoPix: value as 'estatico' | 'api'
                }
            });
        } else if (name.startsWith('empresa.dadosBancarios.')) {
            const field = name.split('.')[2];
            setConfig({
                ...config,
                empresa: {
                    ...config.empresa,
                    dadosBancarios: {
                        ...config.empresa.dadosBancarios,
                        [field]: value
                    }
                }
            });
        } else if (name.startsWith('empresa.')) {
            const field = name.split('.')[1];
            // Handle array fields (simples string split por virgula para telefones)
            if (field === 'telefones') {
                setConfig({
                    ...config,
                    empresa: {
                        ...config.empresa,
                        telefones: value.split(',').map(t => t.trim())
                    }
                });
            } else {
                setConfig({
                    ...config,
                    empresa: {
                        ...config.empresa,
                        // @ts-ignore
                        [field]: value
                    }
                });
            }
        } else if (name.startsWith('textosProposta.')) {
            const field = name.split('.')[1];
            setConfig({
                ...config,
                textosProposta: {
                    ...config.textosProposta,
                    [field]: value
                }
            });
        }
    };

    const handleSave = () => {
        if (config) {
            saveConfiguracoes(config);
            setMensagem({ tipo: 'success', text: 'Configurações salvas com sucesso!' });
            setTimeout(() => setMensagem(null), 3000);
        }
    };

    if (loading || !config) return <div className="p-8">Carregando...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações do Sistema</h1>

            {mensagem && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all transform duration-300 ${mensagem.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    <span>{mensagem.text}</span>
                    <button onClick={() => setMensagem(null)} className="text-current hover:opacity-75">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dados da Empresa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                        <input
                            type="text"
                            name="empresa.razaoSocial"
                            value={config.empresa.razaoSocial}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                        <input
                            type="text"
                            name="empresa.nomeFantasia"
                            value={config.empresa.nomeFantasia}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                        <input
                            type="text"
                            name="empresa.cnpj"
                            value={config.empresa.cnpj}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="text"
                            name="empresa.email"
                            value={config.empresa.email}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefones (separar por vírgula)</label>
                        <input
                            type="text"
                            name="empresa.telefones"
                            value={config.empresa.telefones.join(', ')}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chave Pix (CNPJ/CPF)</label>
                        <input
                            type="text"
                            name="empresa.pixCNPJ"
                            value={config.empresa.pixCNPJ}
                            onChange={handleChange}
                            className="input w-full"
                            placeholder="Chave Pix para QR Code estático"
                        />
                    </div>
                </div>

                <h3 className="text-md font-medium text-gray-800 mb-3 border-t pt-4">Dados Bancários (Para Comprovantes)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                        <input
                            type="text"
                            name="empresa.dadosBancarios.banco"
                            value={config.empresa.dadosBancarios.banco}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                        <input
                            type="text"
                            name="empresa.dadosBancarios.agencia"
                            value={config.empresa.dadosBancarios.agencia}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                        <input
                            type="text"
                            name="empresa.dadosBancarios.conta"
                            value={config.empresa.dadosBancarios.conta}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Favorecido</label>
                        <input
                            type="text"
                            name="empresa.dadosBancarios.favorecido"
                            value={config.empresa.dadosBancarios.favorecido}
                            onChange={handleChange}
                            className="input w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Textos da Proposta</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Introdução</label>
                        <p className="text-xs text-gray-500 mb-2">Texto que aparece no início da proposta, logo após o cabeçalho</p>
                        <textarea
                            name="textosProposta.introducao"
                            value={config.textosProposta?.introducao || ''}
                            onChange={handleChange}
                            className="input w-full"
                            rows={4}
                            placeholder="Ex: É com grande satisfação que apresentamos..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Integração Pix</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Modo de Operação</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="modoPix"
                                    value="estatico"
                                    checked={config.integracoes?.modoPix === 'estatico'}
                                    onChange={handleChange}
                                    className="form-radio text-extrema-purple"
                                />
                                <span className="ml-2">Pix Estático (Upload de Comprovante)</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="modoPix"
                                    value="api"
                                    checked={config.integracoes?.modoPix === 'api'}
                                    onChange={handleChange}
                                    className="form-radio text-extrema-purple"
                                />
                                <span className="ml-2">API Dinâmica (Ailos)</span>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            No modo Estático, o cliente vê a chave Pix e precisa enviar o comprovante. No modo API, o QR Code é gerado automaticamente e a confirmação é via Webhook.
                        </p>
                    </div>

                    {config.integracoes?.modoPix === 'api' && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-md font-medium text-gray-800 mb-3">Credenciais API Ailos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                                    <input
                                        type="text"
                                        name="ailos.clientId"
                                        value={config.integracoes?.ailos?.clientId || ''}
                                        onChange={handleChange}
                                        className="input w-full"
                                        placeholder="Insira o Client ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                                    <input
                                        type="password"
                                        name="ailos.clientSecret"
                                        value={config.integracoes?.ailos?.clientSecret || ''}
                                        onChange={handleChange}
                                        className="input w-full"
                                        placeholder="Insira o Client Secret"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Caminho do Certificado (.pem ou .p12)</label>
                                    <input
                                        type="text"
                                        name="ailos.certPath"
                                        value={config.integracoes?.ailos?.certPath || ''}
                                        onChange={handleChange}
                                        className="input w-full"
                                        placeholder="Ex: ./certs/certificado.pem"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Caminho relativo à raiz do projeto no servidor.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Caminho da Chave Privada (.key)</label>
                                    <input
                                        type="text"
                                        name="ailos.keyPath"
                                        value={config.integracoes?.ailos?.keyPath || ''}
                                        onChange={handleChange}
                                        className="input w-full"
                                        placeholder="Ex: ./certs/chave.key"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}
