// Sistema de LocalStorage para o gerenciamento de propostas
// Este é um wrapper para facilitar o acesso e manutenção dos dados

export interface User {
    id: string;
    email: string;
    nome: string;
    role: 'admin' | 'vendedor';
    senha: string;
    createdAt: string;
}

export interface Cliente {
    empresa: string;
    contato: string;
    email: string;
    telefone: string;
}

export interface Produto {
    nome: string;
    descricao: string;
    modulos: string[];
}

export interface Valores {
    investimentoInicial: number;
    descontoAvistaPercentual: number;
    descontoAvistaValor: number; // Calculado
    valorAvista: number; // Calculado
    parcelamento: {
        qtdParcelas: number;
        valorParcela: number;
        valorTotal: number;
    };
    mensalidade: number;
}

export interface DadosCadastrais {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    inscricaoEstadual: string;
    regimeTributario: string;
    endereco: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cep: string;
        cidade: string;
        uf: string;
    };
    responsavel: {
        nome: string;
        cargo: string;
        cpf: string;
        rg: string;
    };
    telefone: string;
    email: string;
    contabilidade: {
        nome: string;
        contato: string;
        telefone: string;
    };
}

export interface Comprovante {
    enviadoEm: string;
    arquivoBase64: string;
    nomeArquivo: string;
    aprovado: boolean | null;
    aprovadoPor: string | null;
    aprovadoEm: string | null;
    observacoes: string;
}

export interface Aceite {
    aceitoEm: string;
    formaPagamento: 'avista' | 'parcelado';
    valorPagoPix: number;
    pixPayload: string;
    dadosCadastrais: DadosCadastrais;
    comprovante: Comprovante | null;
}

export type StatusProposta =
    | 'rascunho'
    | 'enviada'
    | 'aguardando_pagamento'
    | 'comprovante_enviado'
    | 'paga'
    | 'aceita'
    | 'recusada'
    | 'expirada';

export interface Proposta {
    id: string;
    numero: string; // PROP001, PROP002, etc.
    createdAt: string;
    updatedAt: string;
    vendedorId: string;
    vendedorNome: string;
    status: StatusProposta;
    hashPublico: string; // Hash único para URL pública

    // Dados do Cliente
    cliente: Cliente;

    // Dados da Proposta
    produto: Produto;

    // Valores
    valores: Valores;

    // Condições
    condicoesPagamento: string;
    validadeDias: number;
    dataValidade: string; // ISO Date
    observacoes: string;

    // Aceite e Pagamento (null até cliente aceitar)
    aceite: Aceite | null;
}

export interface Template {
    id: string;
    nome: string;
    vendedorId: string | null; // null = template global
    produto: Produto;
    valores: Omit<Valores, 'descontoAvistaValor' | 'valorAvista'>;
    condicoesPagamento: string;
    createdAt: string;
}

export interface Configuracoes {
    empresa: {
        razaoSocial: string;
        nomeFantasia: string;
        cnpj: string;
        site: string;
        email: string;
        telefones: string[];
        enderecos: string[];
        pixCNPJ: string;
        dadosBancarios: {
            banco: string;
            agencia: string;
            conta: string;
            favorecido: string;
        };
        logo: string;
    };
    numeroPropostaAtual: number;
}

// Storage keys
const STORAGE_KEYS = {
    PROPOSTAS: 'extrema_propostas',
    TEMPLATES: 'extrema_templates',
    USERS: 'extrema_users',
    CURRENT_USER: 'extrema_current_user',
    CONFIGURACOES: 'extrema_configuracoes',
} as const;

// Helper para acessar localStorage de forma segura
const getStorageItem = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erro ao ler ${key} do localStorage:`, error);
        return defaultValue;
    }
};

const setStorageItem = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
};

// ==================== PROPOSTAS ====================

export const getPropostas = (): Proposta[] => {
    return getStorageItem<Proposta[]>(STORAGE_KEYS.PROPOSTAS, []);
};

export const getProposta = (id: string): Proposta | null => {
    const propostas = getPropostas();
    return propostas.find((p) => p.id === id) || null;
};

export const getPropostaByHash = (hash: string): Proposta | null => {
    const propostas = getPropostas();
    return propostas.find((p) => p.hashPublico === hash) || null;
};

export const saveProposta = (proposta: Proposta): void => {
    const propostas = getPropostas();
    const index = propostas.findIndex((p) => p.id === proposta.id);

    if (index >= 0) {
        propostas[index] = { ...proposta, updatedAt: new Date().toISOString() };
    } else {
        propostas.push(proposta);
    }

    setStorageItem(STORAGE_KEYS.PROPOSTAS, propostas);
};

export const deleteProposta = (id: string): void => {
    const propostas = getPropostas();
    const filtered = propostas.filter((p) => p.id !== id);
    setStorageItem(STORAGE_KEYS.PROPOSTAS, filtered);
};

// Alias para saveProposta (para clareza no código)
export const updateProposta = saveProposta;

// ==================== TEMPLATES ====================

export const getTemplates = (): Template[] => {
    return getStorageItem<Template[]>(STORAGE_KEYS.TEMPLATES, []);
};

export const getTemplate = (id: string): Template | null => {
    const templates = getTemplates();
    return templates.find((t) => t.id === id) || null;
};

export const saveTemplate = (template: Template): void => {
    const templates = getTemplates();
    const index = templates.findIndex((t) => t.id === template.id);

    if (index >= 0) {
        templates[index] = template;
    } else {
        templates.push(template);
    }

    setStorageItem(STORAGE_KEYS.TEMPLATES, templates);
};

export const deleteTemplate = (id: string): void => {
    const templates = getTemplates();
    const filtered = templates.filter((t) => t.id !== id);
    setStorageItem(STORAGE_KEYS.TEMPLATES, filtered);
};

// ==================== USERS ====================

export const getUsers = (): User[] => {
    return getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
};

export const getUser = (id: string): User | null => {
    const users = getUsers();
    return users.find((u) => u.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
    const users = getUsers();
    return users.find((u) => u.email === email) || null;
};

export const getCurrentUser = (): User | null => {
    return getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): void => {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const logout = (): void => {
    setCurrentUser(null);
};

// ==================== CONFIGURAÇÕES ====================

export const getConfiguracoes = (): Configuracoes => {
    return getStorageItem<Configuracoes>(STORAGE_KEYS.CONFIGURACOES, {
        empresa: {
            razaoSocial: 'Extrema Software de Gestão Empresarial',
            nomeFantasia: 'Extrema Tecnologia',
            cnpj: '18.866.315/0001-81',
            site: 'www.extrematecnologia.com.br',
            email: 'comercial@extrematecnologia.com.br',
            telefones: ['(47) 99681-8985', '(47) 3633-4255'],
            enderecos: ['São Bento do Sul-SC', 'Balneário Piçarras-SC'],
            pixCNPJ: '18.866.315/0001-81',
            dadosBancarios: {
                banco: '085 - Cooperativa Central Ailos',
                agencia: '0112-0',
                conta: '16916-1',
                favorecido: 'Extrema Software de Gestão Empresarial',
            },
            logo: '/extrema-logo.jpg',
        },
        numeroPropostaAtual: 1,
    });
};

export const saveConfiguracoes = (config: Configuracoes): void => {
    setStorageItem(STORAGE_KEYS.CONFIGURACOES, config);
};

export const incrementarNumeroProposta = (): number => {
    const config = getConfiguracoes();
    const novoNumero = config.numeroPropostaAtual + 1;
    config.numeroPropostaAtual = novoNumero;
    saveConfiguracoes(config);
    return novoNumero;
};

// ==================== SEED DE DADOS INICIAIS ====================

export const seedInitialData = (): void => {
    // Verificar se já existe dados
    const users = getUsers();
    if (users.length > 0) return;

    // Criar usuários de teste
    const mockUsers: User[] = [
        {
            id: 'user-1',
            email: 'admin@extrematecnologia.com.br',
            nome: 'Admin Extrema',
            role: 'admin',
            senha: 'admin123',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'user-2',
            email: 'vendedor@extrematecnologia.com.br',
            nome: 'João Silva',
            role: 'vendedor',
            senha: 'vend123',
            createdAt: new Date().toISOString(),
        },
    ];

    setStorageItem(STORAGE_KEYS.USERS, mockUsers);

    // Criar templates de exemplo
    const mockTemplates: Template[] = [
        {
            id: 'template-1',
            nome: 'Desktop Básico Padrão',
            vendedorId: null, // template global
            produto: {
                nome: 'Uniplus Desktop Básico',
                descricao: 'Sistema de gestão completo para desktop',
                modulos: [
                    'Controle de Estoque',
                    'PDV (Frente de Caixa)',
                    'Contas a Pagar e Receber',
                    'Nota Fiscal Eletrônica (NF-e/NFC-e)',
                    'Relatórios Gerenciais',
                ],
            },
            valores: {
                investimentoInicial: 1170.0,
                descontoAvistaPercentual: 5,
                parcelamento: {
                    qtdParcelas: 3,
                    valorParcela: 390.0,
                    valorTotal: 1170.0,
                },
                mensalidade: 199.9,
            },
            condicoesPagamento:
                'Entrada via PIX + 2 boletos (30 e 60 dias). Mensalidade cobrada após 30 dias da assinatura.',
            createdAt: new Date().toISOString(),
        },
    ];

    setStorageItem(STORAGE_KEYS.TEMPLATES, mockTemplates);

    console.log('✅ Dados iniciais criados com sucesso!');
};
