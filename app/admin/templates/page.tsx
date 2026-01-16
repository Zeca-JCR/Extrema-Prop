'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTemplates, saveTemplate, deleteTemplate } from '@/lib/storage';
import { gerarDescricaoCondicoes } from '@/lib/utils';
import type { Template } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export default function TemplatesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState<Template | null>(null);
    const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo: 'success' | 'error' } | null>(null);

    const mostrarNotificacao = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacao({ mensagem, tipo });
        setTimeout(() => setNotificacao(null), 3000);
    };

    // Form fields
    const [nome, setNome] = useState('');
    const [produtoNome, setProdutoNome] = useState('');
    const [produtoDescricao, setProdutoDescricao] = useState('');
    const [modulos, setModulos] = useState<string[]>([]);
    const [novoModulo, setNovoModulo] = useState('');
    const [editandoModulo, setEditandoModulo] = useState<number | null>(null);
    const [textoEditandoModulo, setTextoEditandoModulo] = useState('');
    const [moduloMovido, setModuloMovido] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [investimentoInicial, setInvestimentoInicial] = useState('');
    const [descontoPercentual, setDescontoPercentual] = useState('5');
    const [qtdParcelas, setQtdParcelas] = useState('3');
    const [valorParcela, setValorParcela] = useState('');
    const [mensalidade, setMensalidade] = useState('');
    const [condicoesPagamento, setCondicoesPagamento] = useState('');
    const [qtdCnpjs, setQtdCnpjs] = useState('1');
    const [qtdUsuarios, setQtdUsuarios] = useState('1');
    const [detalhesInvestimento, setDetalhesInvestimento] = useState('');
    const [detalhesMensalidade, setDetalhesMensalidade] = useState(`Obs.: Início da cobrança 30 dias após a assinatura da proposta.
* Concede direito as atualizações de versão do sistema (regras de negócio, alterações legais/legislação) e suporte técnico via telefone, e-mail e whatsapp. Este valor é reajustado anualmente pelo IGP-M ou por outro índice que venha a substituí-lo.`);
    const [isGlobal, setIsGlobal] = useState(false);

    const carregarTemplates = () => {
        setTemplates(getTemplates());
    };

    useEffect(() => {
        carregarTemplates();
    }, []);

    // Atualização automática do texto de condições
    useEffect(() => {
        if (!editando && investimentoInicial && qtdParcelas && mensalidade) {
            const inv = parseFloat(investimentoInicial);
            const parc = parseInt(qtdParcelas);
            const valParc = inv / (parc || 1);
            const mens = parseFloat(mensalidade);

            if (!isNaN(inv) && !isNaN(parc) && !isNaN(mens)) {
                setCondicoesPagamento(gerarDescricaoCondicoes(inv, parc, valParc, mens));
            }
        }
    }, [investimentoInicial, qtdParcelas, mensalidade, editando]);

    // Auto-cálculo do valor da parcela
    useEffect(() => {
        if (!editando && investimentoInicial && qtdParcelas) {
            const inv = parseFloat(investimentoInicial);
            const parc = parseInt(qtdParcelas);

            if (!isNaN(inv) && !isNaN(parc) && parc > 0) {
                const val = inv / parc;
                // Formata para 2 casas decimais para visualização no input
                setValorParcela(val.toFixed(2));
            }
        }
    }, [investimentoInicial, qtdParcelas, editando]);



    const limparForm = () => {
        setNome('');
        setProdutoNome('');
        setProdutoDescricao('');
        setModulos([]);
        setNovoModulo('');
        setEditandoModulo(null);
        setTextoEditandoModulo('');
        setInvestimentoInicial('');
        setDescontoPercentual('5');
        setQtdParcelas('3');
        setValorParcela('');
        setMensalidade('');
        setCondicoesPagamento('');
        setQtdCnpjs('1');
        setQtdUsuarios('1');
        setDetalhesInvestimento('Ref. implantação, configurações iniciais e treinamento (02 agendas).');
        setDetalhesMensalidade(`Obs.: Início da cobrança 30 dias após a assinatura da proposta.
* Concede direito as atualizações de versão do sistema (regras de negócio, alterações legais/legislação) e suporte técnico via telefone, e-mail e whatsapp. Este valor é reajustado anualmente pelo IGP-M ou por outro índice que venha a substituí-lo.`);
        setIsGlobal(false);
        setEditando(null);
        setMostrarForm(false);
    };

    const handleNovoTemplate = () => {
        limparForm();
        // Set defaults for new template
        setQtdCnpjs('1');
        setQtdUsuarios('1');
        setDetalhesInvestimento('Ref. implantação, configurações iniciais e treinamento (02 agendas).');
        setDetalhesMensalidade('');
        setIsGlobal(false);
        setMostrarForm(true);
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

    // Drag and Drop handlers
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const novosModulos = [...modulos];
        const [removed] = novosModulos.splice(draggedIndex, 1);
        novosModulos.splice(dropIndex, 0, removed);

        setModulos(novosModulos);
        setModuloMovido(dropIndex);
        setTimeout(() => setModuloMovido(null), 2000);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleSalvar = () => {
        if (!nome || !produtoNome || !investimentoInicial || !mensalidade) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        const template: Template = {
            id: editando?.id || uuidv4(),
            nome,
            vendedorId: isGlobal ? null : (user?.id || null),
            produto: {
                nome: produtoNome,
                descricao: produtoDescricao,
                modulos,
                limites: {
                    qtdCnpjs: parseInt(qtdCnpjs),
                    qtdUsuarios: parseInt(qtdUsuarios)
                }
            },
            valores: {
                investimentoInicial: parseFloat(investimentoInicial),
                descontoAvistaPercentual: parseFloat(descontoPercentual),
                parcelamento: {
                    qtdParcelas: parseInt(qtdParcelas),
                    valorParcela: parseFloat(valorParcela),
                    valorTotal: parseFloat(valorParcela) * parseInt(qtdParcelas),
                },
                mensalidade: parseFloat(mensalidade),
            },
            condicoesPagamento,
            detalhesInvestimento,
            detalhesMensalidade,
            createdAt: editando?.createdAt || new Date().toISOString(),
        };

        saveTemplate(template);
        carregarTemplates();
        limparForm();
        mostrarNotificacao(`Template "${template.nome}" ${editando ? 'atualizado' : 'criado'} com sucesso!`);
    };

    const handleEditar = (template: Template) => {
        setEditando(template);
        setNome(template.nome);
        setProdutoNome(template.produto.nome);
        setProdutoDescricao(template.produto.descricao);
        setModulos([...template.produto.modulos]);
        setInvestimentoInicial(template.valores.investimentoInicial.toString());
        setDescontoPercentual(template.valores.descontoAvistaPercentual.toString());
        setQtdParcelas(template.valores.parcelamento.qtdParcelas.toString());
        setValorParcela(template.valores.parcelamento.valorParcela.toString());
        setMensalidade(template.valores.mensalidade.toString());
        setMensalidade(template.valores.mensalidade.toString());
        setCondicoesPagamento(template.condicoesPagamento);
        // Default configs
        setQtdCnpjs(template.produto.limites?.qtdCnpjs?.toString() || '1');
        setQtdUsuarios(template.produto.limites?.qtdUsuarios?.toString() || '1');
        setDetalhesInvestimento(template.detalhesInvestimento || '');
        // Limpar redundância de detalhes da mensalidade ao editar (backward compatibility)
        let limpaDetalhes = template.detalhesMensalidade || '';
        if (limpaDetalhes.includes('Investimento em mensalidade para')) {
            limpaDetalhes = limpaDetalhes.split('\n').filter(line => !line.trim().startsWith('Investimento em mensalidade para')).join('\n').trim();
        }
        setDetalhesMensalidade(limpaDetalhes);
        setIsGlobal(template.vendedorId === null);
        setMostrarForm(true);
    };

    const handleExcluir = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este template?')) {
            deleteTemplate(id);
            carregarTemplates();
            mostrarNotificacao('Template excluído com sucesso!');
        }
    };

    const handleDuplicar = (template: Template) => {
        if (!confirm(`Deseja duplicar o template "${template.nome}"?`)) return;

        const novoTemplate: Template = {
            ...JSON.parse(JSON.stringify(template)),
            id: uuidv4(),
            nome: `${template.nome} (Cópia)`,
            vendedorId: user?.id || null,
            createdAt: new Date().toISOString(),
        };

        // Limpar redundância de detalhes da mensalidade ao duplicar
        if (novoTemplate.detalhesMensalidade && novoTemplate.detalhesMensalidade.includes('Investimento em mensalidade para')) {
            novoTemplate.detalhesMensalidade = novoTemplate.detalhesMensalidade.split('\n').filter(line => !line.trim().startsWith('Investimento em mensalidade para')).join('\n').trim();
        }

        // Garantir que não estamos copiando referências indesejadas se houver
        // No caso do JSON.parse/stringify já resolveu a deep copy dos objetos aninhados (produto, valores)

        saveTemplate(novoTemplate);
        carregarTemplates();
        mostrarNotificacao('Template duplicado com sucesso!');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Templates de Propostas</h1>
                    <p className="text-sm text-gray-600 mt-1">Crie modelos reutilizáveis para agilizar suas propostas</p>
                </div>
                <button
                    onClick={handleNovoTemplate}
                    className="btn btn-primary"
                >
                    + Novo Template
                </button>
            </div>

            {/* Notificação */}
            {notificacao && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] transition-all transform duration-300 ${notificacao.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    <span>{notificacao.mensagem}</span>
                    <button onClick={() => setNotificacao(null)} className="text-current hover:opacity-70">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Lista de Templates */}
            {!mostrarForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div key={template.id} className="card p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900">{template.nome}</h3>
                                {!template.vendedorId && (
                                    <span className="badge bg-blue-100 text-blue-800 text-xs">Global</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{template.produto.nome}</p>
                            <div className="text-sm text-gray-700 mb-3">
                                <p>Investimento: R$ {template.valores.investimentoInicial.toFixed(2)}</p>
                                <p>Mensalidade: R$ {template.valores.mensalidade.toFixed(2)}/mês</p>
                                <p>{template.produto.modulos.length} módulo(s)</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditar(template)}
                                    className="btn btn-secondary btn-sm flex-1"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDuplicar(template)}
                                    className="btn btn-ghost btn-sm text-blue-600"
                                    title="Duplicar Template"
                                >
                                    Duplicar
                                </button>
                                {template.vendedorId && (
                                    <button
                                        onClick={() => handleExcluir(template.id)}
                                        className="btn btn-ghost btn-sm text-red-600"
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <p>Nenhum template encontrado</p>
                            <p className="text-sm mt-2">Crie seu primeiro template para começar</p>
                        </div>
                    )}
                </div>
            )}

            {/* Formulário */}
            {mostrarForm && (
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {editando ? 'Editar Template' : 'Novo Template'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Template *</label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="input"
                                placeholder="Ex: Desktop Básico Padrão"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                                <input
                                    type="text"
                                    value={produtoNome}
                                    onChange={(e) => setProdutoNome(e.target.value)}
                                    className="input"
                                    placeholder="Ex: Uniplus Desktop Básico"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={produtoDescricao}
                                    onChange={(e) => setProdutoDescricao(e.target.value)}
                                    className="input"
                                    placeholder="Breve descrição"
                                />
                            </div>
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
                                                    onClick={salvarEdicaoModulo}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Salvar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button
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
                                                    onClick={() => iniciarEdicaoModulo(index)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
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
                                    <button onClick={adicionarModulo} className="btn btn-secondary">
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Inicial (R$) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={investimentoInicial}
                                    onChange={(e) => setInvestimentoInicial(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto à Vista (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={descontoPercentual}
                                    onChange={(e) => setDescontoPercentual(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd Parcelas</label>
                                <input
                                    type="number"
                                    value={qtdParcelas}
                                    onChange={(e) => setQtdParcelas(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Parcela (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorParcela}
                                    onChange={(e) => setValorParcela(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes do Investimento Inicial (O que está incluso?)</label>
                                <textarea
                                    value={detalhesInvestimento}
                                    onChange={(e) => setDetalhesInvestimento(e.target.value)}
                                    className="input"
                                    rows={2}
                                    placeholder="Ex: Instalação remota, Configuração inicial, Treinamento (4h)"
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
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes da Mensalidade (O que está incluso?)</label>
                                <textarea
                                    value={detalhesMensalidade}
                                    onChange={(e) => setDetalhesMensalidade(e.target.value)}
                                    className="input"
                                    rows={2}
                                    placeholder="Ex: Licença de uso, Suporte técnico, Backup em nuvem"
                                />
                            </div>
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condições de Pagamento</label>
                            <textarea
                                value={condicoesPagamento}
                                onChange={(e) => setCondicoesPagamento(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Ex: Entrada via PIX + boletos..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button onClick={limparForm} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button onClick={handleSalvar} className="btn btn-primary">
                            {editando ? 'Atualizar' : 'Criar'} Template
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
}
