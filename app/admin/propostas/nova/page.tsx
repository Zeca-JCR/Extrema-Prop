'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveProposta, incrementarNumeroProposta, getTemplates } from '@/lib/storage';
import { generateHash, generatePropostaNumero, calcularDescontoAvista, calcularDataValidade } from '@/lib/utils';
import type { Proposta, Template } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export default function NovaProposta() {
    const router = useRouter();
    const { user } = useAuth();
    const templates = getTemplates();

    const [etapa, setEtapa] = useState<'template' | 'cliente' | 'produto' | 'valores' | 'condicoes'>('template');
    const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null);

    // Dados do cliente
    const [clienteEmpresa, setClienteEmpresa] = useState('');
    const [clienteContato, setClienteContato] = useState('');
    const [clienteEmail, setClienteEmail] = useState('');
    const [clienteTelefone, setClienteTelefone] = useState('');

    // Dados do produto
    const [produtoNome, setProdutoNome] = useState('');
    const [produtoDescricao, setProdutoDescricao] = useState('');
    const [modulos, setModulos] = useState<string[]>([]);
    const [novoModulo, setNovoModulo] = useState('');

    // Valores
    const [investimentoInicial, setInvestimentoInicial] = useState('1170.00');
    const [descontoPercentual, setDescontoPercentual] = useState('5');
    const [qtdParcelas, setQtdParcelas] = useState('3');
    const [valorParcela, setValorParcela] = useState('390.00');
    const [mensalidade, setMensalidade] = useState('199.90');

    // Condições
    const [condicoesPagamento, setCondicoesPagamento] = useState('Entrada via PIX + 2 boletos (30 e 60 dias). Mensalidade cobrada após 30 dias da assinatura.');
    const [validadeDias, setValidadeDias] = useState('15');
    const [observacoes, setObservacoes] = useState('');

    // Cálculo automático do valor da parcela
    useEffect(() => {
        if (investimentoInicial && qtdParcelas) {
            const valorCalculado = (parseFloat(investimentoInicial) / parseInt(qtdParcelas)).toFixed(2);
            setValorParcela(valorCalculado);
        }
    }, [investimentoInicial, qtdParcelas]);

    const aplicarTemplate = (template: Template) => {
        setTemplateSelecionado(template);
        setProdutoNome(template.produto.nome);
        setProdutoDescricao(template.produto.descricao);
        setModulos([...template.produto.modulos]);
        setInvestimentoInicial(template.valores.investimentoInicial.toString());
        setDescontoPercentual(template.valores.descontoAvistaPercentual.toString());
        setQtdParcelas(template.valores.parcelamento.qtdParcelas.toString());
        setValorParcela(template.valores.parcelamento.valorParcela.toString());
        setMensalidade(template.valores.mensalidade.toString());
        setCondicoesPagamento(template.condicoesPagamento);
        setEtapa('cliente');
    };

    const adicionarModulo = () => {
        if (novoModulo.trim()) {
            setModulos([...modulos, novoModulo.trim()]);
            setNovoModulo('');
        }
    };

    const removerModulo = (index: number) => {
        setModulos(modulos.filter((_, i) => i !== index));
    };

    const criarProposta = () => {
        if (!user) return;

        const investimento = parseFloat(investimentoInicial);
        const desconto = parseFloat(descontoPercentual);
        const { valorDesconto, valorFinal } = calcularDescontoAvista(investimento, desconto);

        const numeroProposta = incrementarNumeroProposta();
        const dataValidade = calcularDataValidade(parseInt(validadeDias));

        const proposta: Proposta = {
            id: uuidv4(),
            numero: generatePropostaNumero(numeroProposta),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vendedorId: user.id,
            vendedorNome: user.nome,
            status: 'rascunho',
            hashPublico: generateHash(),
            cliente: {
                empresa: clienteEmpresa,
                contato: clienteContato,
                email: clienteEmail,
                telefone: clienteTelefone,
            },
            produto: {
                nome: produtoNome,
                descricao: produtoDescricao,
                modulos: modulos,
            },
            valores: {
                investimentoInicial: investimento,
                descontoAvistaPercentual: desconto,
                descontoAvistaValor: valorDesconto,
                valorAvista: valorFinal,
                parcelamento: {
                    qtdParcelas: parseInt(qtdParcelas),
                    valorParcela: parseFloat(valorParcela),
                    valorTotal: parseFloat(valorParcela) * parseInt(qtdParcelas),
                },
                mensalidade: parseFloat(mensalidade),
            },
            condicoesPagamento,
            validadeDias: parseInt(validadeDias),
            dataValidade,
            observacoes,
            aceite: null,
        };

        saveProposta(proposta);
        router.push('/admin/propostas');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Nova Proposta</h1>
                <p className="text-sm text-gray-600 mt-1">Crie uma nova proposta comercial</p>
            </div>

            {/* Progress Steps */}
            <div className="card p-4 mb-6">
                <div className="flex items-center justify-between">
                    {['template', 'cliente', 'produto', 'valores', 'condicoes'].map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${etapa === step ? 'bg-extrema-purple text-white' :
                                ['template', 'cliente', 'produto', 'valores', 'condicoes'].indexOf(etapa) > index ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-600'
                                }`}>
                                {index + 1}
                            </div>
                            {index < 4 && <div className={`w-12 h-1 mx-2 ${['template', 'cliente', 'produto', 'valores', 'condicoes'].indexOf(etapa) > index ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                    <span className={etapa === 'template' ? 'text-extrema-purple font-medium' : 'text-gray-600'}>Template</span>
                    <span className={etapa === 'cliente' ? 'text-extrema-purple font-medium' : 'text-gray-600'}>Cliente</span>
                    <span className={etapa === 'produto' ? 'text-extrema-purple font-medium' : 'text-gray-600'}>Produto</span>
                    <span className={etapa === 'valores' ? 'text-extrema-purple font-medium' : 'text-gray-600'}>Valores</span>
                    <span className={etapa === 'condicoes' ? 'text-extrema-purple font-medium' : 'text-gray-600'}>Condições</span>
                </div>
            </div>

            {/* Etapa: Escolher Template */}
            {etapa === 'template' && (
                <div className="space-y-4">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Escolha um Template</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-extrema-purple cursor-pointer transition-all"
                                    onClick={() => aplicarTemplate(template)}
                                >
                                    <h3 className="font-semibold text-gray-900">{template.nome}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{template.produto.nome}</p>
                                    <div className="mt-3 flex items-center space-x-4 text-sm">
                                        <span className="text-gray-700">R$ {template.valores.investimentoInicial.toFixed(2)}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-700">{template.valores.parcelamento.qtdParcelas}x sem juros</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-700">Mensalidade: R$ {template.valores.mensalidade.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-extrema-purple cursor-pointer transition-all text-center"
                                onClick={() => setEtapa('cliente')}
                            >
                                <p className="text-gray-600">+ Criar do zero (sem template)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Etapa: Dados do Cliente */}
            {etapa === 'cliente' && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                            <input
                                type="text"
                                value={clienteEmpresa}
                                onChange={(e) => setClienteEmpresa(e.target.value)}
                                className="input"
                                placeholder="Nome da empresa"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contato *</label>
                            <input
                                type="text"
                                value={clienteContato}
                                onChange={(e) => setClienteContato(e.target.value)}
                                className="input"
                                placeholder="Nome do contato"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={clienteEmail}
                                onChange={(e) => setClienteEmail(e.target.value)}
                                className="input"
                                placeholder="email@empresa.com"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                            <input
                                type="tel"
                                value={clienteTelefone}
                                onChange={(e) => setClienteTelefone(e.target.value)}
                                className="input"
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button onClick={() => setEtapa('template')} className="btn btn-secondary">Voltar</button>
                        <button
                            onClick={() => setEtapa('produto')}
                            className="btn btn-primary"
                            disabled={!clienteEmpresa || !clienteContato || !clienteEmail || !clienteTelefone}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* Etapa: Produto */}
            {etapa === 'produto' && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Produto/Serviço</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                            <input
                                type="text"
                                value={produtoNome}
                                onChange={(e) => setProdutoNome(e.target.value)}
                                className="input"
                                placeholder="Ex: Uniplus Desktop Básico"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                value={produtoDescricao}
                                onChange={(e) => setProdutoDescricao(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Descrição do produto ou serviço"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Módulos/Funcionalidades</label>
                            <div className="space-y-2">
                                {modulos.map((modulo, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                                            {modulo}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removerModulo(index)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={novoModulo}
                                        onChange={(e) => setNovoModulo(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarModulo())}
                                        className="input flex-1"
                                        placeholder="Digite um módulo e pressione Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={adicionarModulo}
                                        className="btn btn-secondary"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-6">
                        <button onClick={() => setEtapa('cliente')} className="btn btn-secondary">Voltar</button>
                        <button
                            onClick={() => setEtapa('valores')}
                            className="btn btn-primary"
                            disabled={!produtoNome}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* Etapa: Valores */}
            {etapa === 'valores' && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Valores e Parcelamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Inicial (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={investimentoInicial}
                                onChange={(e) => setInvestimentoInicial(e.target.value)}
                                className="input"
                                placeholder="1170.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desconto à Vista (%) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={descontoPercentual}
                                onChange={(e) => setDescontoPercentual(e.target.value)}
                                className="input"
                                placeholder="5"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas *</label>
                            <input
                                type="number"
                                value={qtdParcelas}
                                onChange={(e) => setQtdParcelas(e.target.value)}
                                className="input"
                                placeholder="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Parcela (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={valorParcela}
                                onChange={(e) => setValorParcela(e.target.value)}
                                className="input"
                                placeholder="390.00"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mensalidade (R$) *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mensalidade}
                                onChange={(e) => setMensalidade(e.target.value)}
                                className="input"
                                placeholder="199.90"
                                required
                            />
                        </div>
                    </div>

                    {/* Preview de valores calculados */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview dos Valores:</p>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>• Investimento: R$ {parseFloat(investimentoInicial || '0').toFixed(2)}</p>
                            <p>• À vista ({descontoPercentual}% desc): R$ {(parseFloat(investimentoInicial || '0') * (1 - parseFloat(descontoPercentual || '0') / 100)).toFixed(2)}</p>
                            <p>• Parcelado: {qtdParcelas}x de R$ {parseFloat(valorParcela || '0').toFixed(2)} = R$ {(parseFloat(valorParcela || '0') * parseInt(qtdParcelas || '0')).toFixed(2)}</p>
                            <p>• Mensalidade: R$ {parseFloat(mensalidade || '0').toFixed(2)}/mês</p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setEtapa('produto')} className="btn btn-secondary">Voltar</button>
                        <button
                            onClick={() => setEtapa('condicoes')}
                            className="btn btn-primary"
                            disabled={!investimentoInicial || !descontoPercentual || !qtdParcelas || !valorParcela || !mensalidade}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* Etapa: Condições */}
            {etapa === 'condicoes' && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Condições e Finalização</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condições de Pagamento *</label>
                            <textarea
                                value={condicoesPagamento}
                                onChange={(e) => setCondicoesPagamento(e.target.value)}
                                className="input"
                                rows={4}
                                placeholder="Ex: Entrada via PIX + 2 boletos (30 e 60 dias). Mensalidade cobrada após 30 dias da assinatura."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias) *</label>
                            <select
                                value={validadeDias}
                                onChange={(e) => setValidadeDias(e.target.value)}
                                className="input"
                            >
                                <option value="7">7 dias</option>
                                <option value="15">15 dias</option>
                                <option value="30">30 dias</option>
                                <option value="45">45 dias</option>
                                <option value="60">60 dias</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Data de validade: {new Date(Date.now() + parseInt(validadeDias) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Observações internas (não serão exibidas para o cliente)"
                            />
                        </div>
                    </div>

                    {/* Resumo Final */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">📋 Resumo da Proposta</h3>
                        <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>Cliente:</strong> {clienteEmpresa} ({clienteContato})</p>
                            <p><strong>Produto:</strong> {produtoNome}</p>
                            <p><strong>Módulos:</strong> {modulos.length} funcionalidade(s)</p>
                            <p><strong>Investimento:</strong> R$ {parseFloat(investimentoInicial || '0').toFixed(2)}</p>
                            <p><strong>À vista:</strong> R$ {(parseFloat(investimentoInicial || '0') * (1 - parseFloat(descontoPercentual || '0') / 100)).toFixed(2)}</p>
                            <p><strong>Mensalidade:</strong> R$ {parseFloat(mensalidade || '0').toFixed(2)}</p>
                            <p><strong>Validade:</strong> {validadeDias} dias</p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setEtapa('valores')} className="btn btn-secondary">Voltar</button>
                        <button
                            onClick={criarProposta}
                            className="btn btn-primary"
                            disabled={!condicoesPagamento}
                        >
                            ✓ Criar Proposta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
