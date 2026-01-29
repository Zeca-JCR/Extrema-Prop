'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { saveProposta, getTemplates, getProposta } from '@/lib/storage';
import { calcularDescontoAvista, calcularDataValidade } from '@/lib/utils';
import type { Proposta, Template } from '@/lib/storage';

export default function EditarProposta({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const templates = getTemplates();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [propostaOriginal, setPropostaOriginal] = useState<Proposta | null>(null);

    const [etapa, setEtapa] = useState<'template' | 'cliente' | 'produto' | 'valores' | 'condicoes'>('cliente');

    // Dados do cliente
    const [clienteEmpresa, setClienteEmpresa] = useState('');
    const [clienteSaudacao, setClienteSaudacao] = useState('Prezado(a)');
    const [clienteContato, setClienteContato] = useState('');
    const [clienteEmail, setClienteEmail] = useState('');
    const [clienteTelefone, setClienteTelefone] = useState('');

    // Dados do produto
    const [produtoNome, setProdutoNome] = useState('');
    const [produtoDescricao, setProdutoDescricao] = useState('');
    const [modulos, setModulos] = useState<string[]>([]);
    const [novoModulo, setNovoModulo] = useState('');
    const [qtdCnpjs, setQtdCnpjs] = useState('1');
    const [qtdUsuarios, setQtdUsuarios] = useState('1');
    const [qtdAgendasPresenciais, setQtdAgendasPresenciais] = useState('2'); // Padrão: 2

    // Estados para edição/movimentação de módulos
    const [editandoModulo, setEditandoModulo] = useState<number | null>(null);
    const [textoEditandoModulo, setTextoEditandoModulo] = useState('');
    const [moduloMovido, setModuloMovido] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Valores
    const [investimentoInicial, setInvestimentoInicial] = useState('0.00');
    const [descontoPercentual, setDescontoPercentual] = useState('5');
    const [qtdParcelas, setQtdParcelas] = useState('3');
    const [valorParcela, setValorParcela] = useState('0.00');
    const [mensalidade, setMensalidade] = useState('0.00');
    const [detalhesInvestimento, setDetalhesInvestimento] = useState('');
    const [detalhesMensalidade, setDetalhesMensalidade] = useState('');

    // Condições

    const [validadeDias, setValidadeDias] = useState('15');
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        if (id) {
            const proposta = getProposta(id);
            if (proposta) {
                // Bloquear edição de propostas finalizadas
                if (['paga', 'aceita', 'comprovante_enviado', 'recusada', 'expirada'].includes(proposta.status)) {
                    alert('Propostas finalizadas ou recusadas não podem ser editadas.');
                    router.push('/admin/propostas');
                    return;
                }

                setPropostaOriginal(proposta);

                // Populate fields
                setClienteEmpresa(proposta.cliente.empresa);
                setClienteSaudacao(proposta.cliente.saudacao || 'Prezado(a)');
                setClienteContato(proposta.cliente.contato);
                setClienteEmail(proposta.cliente.email);
                setClienteTelefone(proposta.cliente.telefone);

                setProdutoNome(proposta.produto.nome);
                setProdutoDescricao(proposta.produto.descricao);
                setModulos(proposta.produto.modulos);
                setQtdCnpjs(proposta.produto.limites?.qtdCnpjs?.toString() || '1');
                setQtdUsuarios(proposta.produto.limites?.qtdUsuarios?.toString() || '1');
                setQtdAgendasPresenciais(proposta.produto.qtdAgendasPresenciais?.toString() || '2');

                setInvestimentoInicial(proposta.valores.investimentoInicial.toString());
                setDescontoPercentual(proposta.valores.descontoAvistaPercentual.toString());
                setQtdParcelas(proposta.valores.parcelamento.qtdParcelas.toString());
                setValorParcela(proposta.valores.parcelamento.valorParcela.toString());
                setMensalidade(proposta.valores.mensalidade.toString());
                setDetalhesInvestimento(proposta.detalhesInvestimento || '');
                setDetalhesMensalidade(proposta.detalhesMensalidade || '');


                setValidadeDias(proposta.validadeDias.toString());
                setObservacoes(proposta.observacoes);
            } else {
                alert('Proposta não encontrada');
                router.push('/admin/propostas');
            }
            setLoading(false);
        }
    }, [id]);

    // Alertar sobre mudanças não salvas ao fechar/recarregar
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Cálculo automático do valor da parcela (mesma lógica da criação)
    useEffect(() => {
        if (!loading && investimentoInicial && qtdParcelas) {
            const qtd = parseInt(qtdParcelas);
            if (qtd > 0) {
                // Apenas atualizar se não for a carga inicial (loading false)
                // Na verdade, queremos recalcular se o usuário mudar os valores.
                // Mas na carga inicial, os valores setados já estão corretos.
                // O problema é que o useEffect roda na montagem e recalcula, podendo dar dízimas diferentes se não cuidarmos.
                // Para edição simples, vamos deixar recalcular.
                const valorCalculado = (parseFloat(investimentoInicial) / qtd).toFixed(2);
                setValorParcela(valorCalculado);
            }
        }
    }, [investimentoInicial, qtdParcelas]);



    const aplicarTemplate = (template: Template) => {
        if (!confirm('Aplicar um template substituirá os dados atuais. Continuar?')) return;

        setProdutoNome(template.produto.nome);
        setProdutoDescricao(template.produto.descricao);
        setModulos([...template.produto.modulos]);
        setInvestimentoInicial(template.valores.investimentoInicial.toString());
        setDescontoPercentual(template.valores.descontoAvistaPercentual.toString());
        setQtdParcelas(template.valores.parcelamento.qtdParcelas.toString());
        setValorParcela(template.valores.parcelamento.valorParcela.toString());
        setMensalidade(template.valores.mensalidade.toString());

        setDetalhesInvestimento(template.detalhesInvestimento || '');
        let limpaDetalhes = template.detalhesMensalidade || '';
        if (limpaDetalhes.includes('Investimento em mensalidade para')) {
            limpaDetalhes = limpaDetalhes.split('\n').filter(line => !line.trim().startsWith('Investimento em mensalidade para')).join('\n').trim();
        }
        setDetalhesMensalidade(limpaDetalhes);
        setQtdCnpjs(template.produto.limites?.qtdCnpjs?.toString() || '1');
        setQtdUsuarios(template.produto.limites?.qtdUsuarios?.toString() || '1');
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

    const iniciarEdicaoModulo = (index: number) => {
        setEditandoModulo(index);
        setTextoEditandoModulo(modulos[index]);
    };

    const salvarEdicaoModulo = () => {
        if (editandoModulo !== null && textoEditandoModulo.trim()) {
            const novosModulos = [...modulos];
            novosModulos[editandoModulo] = textoEditandoModulo.trim();
            setModulos(novosModulos);
            setEditandoModulo(null);
            setTextoEditandoModulo('');
        }
    };

    const cancelarEdicaoModulo = () => {
        setEditandoModulo(null);
        setTextoEditandoModulo('');
    };

    const moverModuloCima = (index: number) => {
        if (index > 0) {
            const novosModulos = [...modulos];
            [novosModulos[index - 1], novosModulos[index]] = [novosModulos[index], novosModulos[index - 1]];
            setModulos(novosModulos);
            setModuloMovido(index - 1);
            setTimeout(() => setModuloMovido(null), 2000);
        }
    };

    const moverModuloBaixo = (index: number) => {
        if (index < modulos.length - 1) {
            const novosModulos = [...modulos];
            [novosModulos[index], novosModulos[index + 1]] = [novosModulos[index + 1], novosModulos[index]];
            setModulos(novosModulos);
            setModuloMovido(index + 1);
            setTimeout(() => setModuloMovido(null), 2000);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            const novosModulos = [...modulos];
            const [removed] = novosModulos.splice(draggedIndex, 1);
            novosModulos.splice(index, 0, removed);
            setModulos(novosModulos);
            setModuloMovido(index);
            setTimeout(() => setModuloMovido(null), 2000);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const atualizarProposta = () => {
        if (!user || !propostaOriginal) return;

        const investimento = parseFloat(investimentoInicial);
        const desconto = parseFloat(descontoPercentual);
        const { valorDesconto, valorFinal } = calcularDescontoAvista(investimento, desconto);
        const dataValidade = calcularDataValidade(parseInt(validadeDias));

        const propostaAtualizada: Proposta = {
            ...propostaOriginal,
            updatedAt: new Date().toISOString(),
            status: propostaOriginal.status, // Mantém status original
            cliente: {
                empresa: clienteEmpresa,
                contato: clienteContato,
                email: clienteEmail,
                telefone: clienteTelefone,
                saudacao: clienteSaudacao,
            },
            produto: {
                ...propostaOriginal.produto,
                nome: produtoNome,
                descricao: produtoDescricao,
                modulos: modulos,
                limites: {
                    qtdCnpjs: parseInt(qtdCnpjs),
                    qtdUsuarios: parseInt(qtdUsuarios)
                },
                qtdAgendasPresenciais: parseInt(qtdAgendasPresenciais)
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

            detalhesInvestimento,
            detalhesMensalidade,
            validadeDias: parseInt(validadeDias),
            dataValidade,
            observacoes,
        };

        saveProposta(propostaAtualizada);
        router.push('/admin/propostas?success=updated');
    };

    if (loading) return <div className="p-8 text-center">Carregando proposta...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Editar Proposta</h1>
                    <p className="text-sm text-gray-600 mt-1">#{propostaOriginal?.numero} - {propostaOriginal?.cliente.empresa}</p>
                </div>
                <button onClick={() => router.push('/admin/propostas')} className="btn btn-ghost text-gray-600">
                    Cancelar
                </button>
            </div>

            {/* Progress Steps */}
            <div className="card p-4 mb-6">
                <div className="flex items-center justify-between">
                    {['template', 'cliente', 'produto', 'valores', 'condicoes'].map((step, index) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${etapa === step ? 'bg-extrema-purple text-white' :
                                ['template', 'cliente', 'produto', 'valores', 'condicoes'].indexOf(etapa) > index ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-600'
                                } cursor-pointer`}
                                onClick={() => setEtapa(step as any)} // Permitir navegação livre na edição
                            >
                                {index + 1}
                            </div>
                            {index < 4 && <div className={`w-12 h-1 mx-2 ${['template', 'cliente', 'produto', 'valores', 'condicoes'].indexOf(etapa) > index ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-600">Template</span>
                    <span className="text-gray-600">Cliente</span>
                    <span className="text-gray-600">Produto</span>
                    <span className="text-gray-600">Valores</span>
                    <span className="text-gray-600">Condições</span>
                </div>
            </div>

            {/* Reuse same Step UIs as Create Page (Simplified for brevity, assuming copying mostly) */}

            {/* Etapa: Escolher Template (Opcional na edição) */}
            {etapa === 'template' && (
                <div className="space-y-4">
                    <div className="card p-6 border-l-4 border-yellow-400">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mudar Template?</h2>
                        <p className="mb-4 text-sm text-gray-600">Cuidado: Selecionar um template substituirá os dados de produto e valores atuais.</p>
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-extrema-purple cursor-pointer transition-all"
                                    onClick={() => aplicarTemplate(template)}
                                >
                                    <h3 className="font-semibold text-gray-900">{template.nome}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{template.produto.nome}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <button onClick={() => setEtapa('cliente')} className="btn btn-secondary w-full">Manter dados atuais e avançar</button>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Saudação</label>
                            <select
                                value={clienteSaudacao}
                                onChange={(e) => setClienteSaudacao(e.target.value)}
                                className="input"
                            >
                                <option value="Prezado(a)">Prezado(a)</option>
                                <option value="Prezado">Prezado</option>
                                <option value="Prezada">Prezada</option>
                                <option value="Prezado Sr.">Prezado Sr.</option>
                                <option value="Prezada Sra.">Prezada Sra.</option>
                                <option value="Aos cuidados de">Aos cuidados de</option>
                            </select>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. CNPJs</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qtdCnpjs}
                                    onChange={(e) => setQtdCnpjs(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Usuários</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qtdUsuarios}
                                    onChange={(e) => setQtdUsuarios(e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Módulos/Funcionalidades</label>
                            <div className="space-y-2">
                                {modulos.map((modulo, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-2 ${editandoModulo !== index ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                        draggable={editandoModulo !== index}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {editandoModulo === index ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={textoEditandoModulo}
                                                    onChange={(e) => setTextoEditandoModulo(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && salvarEdicaoModulo()}
                                                    className="input flex-1"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={salvarEdicaoModulo}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Salvar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelarEdicaoModulo}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Cancelar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Drag Handle */}
                                                <div
                                                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-1"
                                                    title="Arraste para reordenar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                    </svg>
                                                </div>
                                                <div className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${moduloMovido === index
                                                    ? 'bg-yellow-100 border-2 border-yellow-400 shadow-md'
                                                    : dragOverIndex === index
                                                        ? 'bg-blue-100 border-2 border-blue-400'
                                                        : draggedIndex === index
                                                            ? 'opacity-50 bg-gray-100'
                                                            : 'bg-gray-50'
                                                    }`}>
                                                    {modulo}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => moverModuloCima(index)}
                                                    disabled={index === 0}
                                                    className={`${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                                                    title="Mover para cima"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moverModuloBaixo(index)}
                                                    disabled={index === modulos.length - 1}
                                                    className={`${index === modulos.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                                                    title="Mover para baixo"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => iniciarEdicaoModulo(index)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removerModulo(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Remover"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes do Investimento Inicial (O que está incluso?)</label>
                            <textarea
                                value={detalhesInvestimento}
                                onChange={(e) => setDetalhesInvestimento(e.target.value)}
                                className="input"
                                rows={2}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes da Mensalidade (O que está incluso?)</label>
                            <textarea
                                value={detalhesMensalidade}
                                onChange={(e) => setDetalhesMensalidade(e.target.value)}
                                className="input"
                                rows={2}
                            />
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Observações internas"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={() => setEtapa('valores')} className="btn btn-secondary">Voltar</button>
                        <button
                            onClick={atualizarProposta}
                            className="btn btn-primary"
                            disabled={false}
                        >
                            ✓ Salvar Alterações
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
