// Validações para CNPJ, CPF, telefone, CEP, etc.

// Remover caracteres não numéricos
export function removeNonNumeric(value: string): string {
    return value.replace(/\D/g, '');
}

// Validar CNPJ
export function validarCNPJ(cnpj: string): boolean {
    const cleanCNPJ = removeNonNumeric(cnpj);

    if (cleanCNPJ.length !== 14) return false;

    // Verificar CNPJs inválidos conhecidos (todos dígitos iguais)
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    // Validar primeiro dígito verificador
    let soma = 0;
    let pos = 5;

    for (let i = 0; i < 12; i++) {
        soma += parseInt(cleanCNPJ.charAt(i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(cleanCNPJ.charAt(12))) return false;

    // Validar segundo dígito verificador
    soma = 0;
    pos = 6;

    for (let i = 0; i < 13; i++) {
        soma += parseInt(cleanCNPJ.charAt(i)) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(cleanCNPJ.charAt(13))) return false;

    return true;
}

// Validar CPF
export function validarCPF(cpf: string): boolean {
    const cleanCPF = removeNonNumeric(cpf);

    if (cleanCPF.length !== 11) return false;

    // Verificar CPFs inválidos conhecidos (todos dígitos iguais)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validar primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }

    let resultado = (soma * 10) % 11;
    if (resultado === 10 || resultado === 11) resultado = 0;
    if (resultado !== parseInt(cleanCPF.charAt(9))) return false;

    // Validar segundo dígito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }

    resultado = (soma * 10) % 11;
    if (resultado === 10 || resultado === 11) resultado = 0;
    if (resultado !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
}

// Validar email
export function validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar telefone (formato brasileiro)
export function validarTelefone(telefone: string): boolean {
    const cleanTelefone = removeNonNumeric(telefone);
    // Aceita (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    return cleanTelefone.length === 10 || cleanTelefone.length === 11;
}

// Validar CEP
export function validarCEP(cep: string): boolean {
    const cleanCEP = removeNonNumeric(cep);
    return cleanCEP.length === 8;
}

// Máscaras

// Máscara de CNPJ (00.000.000/0000-00)
export function mascaraCNPJ(value: string): string {
    const clean = removeNonNumeric(value);

    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length <= 8)
        return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
    if (clean.length <= 12)
        return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;

    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

// Máscara de CPF (000.000.000-00)
export function mascaraCPF(value: string): string {
    const clean = removeNonNumeric(value);

    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length <= 9)
        return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;

    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

// Máscara de telefone ((00) 00000-0000 ou (00) 0000-0000)
export function mascaraTelefone(value: string): string {
    const clean = removeNonNumeric(value);

    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length <= 10)
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;

    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

// Máscara de CEP (00000-000)
export function mascaraCEP(value: string): string {
    const clean = removeNonNumeric(value);

    if (clean.length <= 5) return clean;

    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
}

// Máscara de moeda (R$ 0.000,00)
export function mascaraMoeda(value: string): string {
    const clean = removeNonNumeric(value);

    if (!clean) return 'R$ 0,00';

    const numero = parseInt(clean) / 100;

    return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

// Converter valor monetário para número
export function parseMoeda(value: string): number {
    const clean = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

// Schema de validação para dados cadastrais (pode ser usado com react-hook-form + zod)
export interface ErrosValidacao {
    field: string;
    message: string;
}

// Interface para os dados do formulário de aceite
export interface DadosCadastraisForm {
    tipoPessoa: 'juridica' | 'fisica';
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    inscricaoEstadual?: string;
    regimeTributario?: string;

    // Endereço
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    estado?: string;

    // Responsável
    responsavelNome?: string;
    responsavelCargo?: string;
    responsavelCpf?: string;

    // Contato da Empresa
    email?: string;
    telefone?: string;

    // Contabilidade
    contabilidadeNome?: string;
    contabilidadeContato?: string;
    contabilidadeTelefone?: string;

    observacoes?: string;
    aceitouTermos?: boolean;
}

// Validação para o formulário de aceite - retorna objeto com erros
export function validarDadosCadastrais(dados: DadosCadastraisForm): Record<string, string> {
    const erros: Record<string, string> = {};

    // Validações principais (Pessoa Jurídica)
    if (!dados.cnpj || dados.cnpj.trim() === '') {
        erros.cnpj = 'CNPJ é obrigatório';
    } else if (!validarCNPJ(dados.cnpj)) {
        erros.cnpj = 'CNPJ inválido';
    }

    if (!dados.razaoSocial || dados.razaoSocial.trim().length < 3) {
        erros.razaoSocial = 'Razão Social deve ter pelo menos 3 caracteres';
    }

    if (!dados.nomeFantasia || dados.nomeFantasia.trim().length < 2) {
        erros.nomeFantasia = 'Nome Fantasia é obrigatório';
    }

    // Validações de Endereço
    if (!dados.cep || dados.cep.trim() === '') {
        erros.cep = 'CEP é obrigatório';
    } else if (!validarCEP(dados.cep)) {
        erros.cep = 'CEP inválido';
    }

    if (!dados.endereco || dados.endereco.trim() === '') erros.endereco = 'Endereço é obrigatório';
    if (!dados.numero || dados.numero.trim() === '') erros.numero = 'Número é obrigatório';
    if (!dados.bairro || dados.bairro.trim() === '') erros.bairro = 'Bairro é obrigatório';
    if (!dados.cidade || dados.cidade.trim() === '') erros.cidade = 'Cidade é obrigatória';
    if (!dados.estado || dados.estado.trim() === '') erros.estado = 'Estado é obrigatório';

    // Responsável
    if (!dados.responsavelNome || dados.responsavelNome.trim() === '') erros.responsavelNome = 'Nome do responsável é obrigatório';
    if (!dados.responsavelCargo || dados.responsavelCargo.trim() === '') erros.responsavelCargo = 'Cargo do responsável é obrigatório';

    if (!dados.responsavelCpf || dados.responsavelCpf.trim() === '') {
        erros.responsavelCpf = 'CPF do responsável é obrigatório';
    } else if (!validarCPF(dados.responsavelCpf)) {
        erros.responsavelCpf = 'CPF inválido';
    }

    // Contato
    if (!dados.email || dados.email.trim() === '') {
        erros.email = 'Email é obrigatório';
    } else if (!validarEmail(dados.email)) {
        erros.email = 'Email inválido';
    }

    if (!dados.telefone || dados.telefone.trim() === '') {
        erros.telefone = 'Telefone é obrigatório';
    } else if (!validarTelefone(dados.telefone)) {
        erros.telefone = 'Telefone inválido';
    }

    // Contabilidade
    if (!dados.contabilidadeNome || dados.contabilidadeNome.trim() === '') erros.contabilidadeNome = 'Nome da contabilidade é obrigatório';
    if (!dados.contabilidadeContato || dados.contabilidadeContato.trim() === '') erros.contabilidadeContato = 'Pessoa de contato da contabilidade é obrigatória';
    if (!dados.contabilidadeTelefone || dados.contabilidadeTelefone.trim() === '') erros.contabilidadeTelefone = 'Telefone da contabilidade é obrigatório';

    // Termos
    if (dados.aceitouTermos === false) {
        erros.termos = 'Você deve aceitar os termos da proposta';
    }

    return erros;
}

// Função legada para manter compatibilidade
export function validarDadosCadastraisLegacy(dados: {
    razaoSocial?: string;
    cnpj?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    cep?: string;
}): ErrosValidacao[] {
    const erros: ErrosValidacao[] = [];

    if (dados.razaoSocial && dados.razaoSocial.trim().length < 3) {
        erros.push({
            field: 'razaoSocial',
            message: 'Razão Social deve ter pelo menos 3 caracteres',
        });
    }

    if (dados.cnpj && !validarCNPJ(dados.cnpj)) {
        erros.push({
            field: 'cnpj',
            message: 'CNPJ inválido',
        });
    }

    if (dados.cpf && !validarCPF(dados.cpf)) {
        erros.push({
            field: 'cpf',
            message: 'CPF inválido',
        });
    }

    if (dados.email && !validarEmail(dados.email)) {
        erros.push({
            field: 'email',
            message: 'Email inválido',
        });
    }

    if (dados.telefone && !validarTelefone(dados.telefone)) {
        erros.push({
            field: 'telefone',
            message: 'Telefone inválido',
        });
    }

    if (dados.cep && !validarCEP(dados.cep)) {
        erros.push({
            field: 'cep',
            message: 'CEP inválido',
        });
    }

    return erros;
}
