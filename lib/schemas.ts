import { z } from 'zod';
import { validarCNPJ, validarCPF, validarTelefone, validarCEP, validarEmail } from './validators';

export const dadosCadastraisSchema = z.object({
    // Dados da Empresa
    cnpj: z.string().min(1, 'CNPJ é obrigatório').refine(validarCNPJ, 'CNPJ inválido'),
    razaoSocial: z.string().min(3, 'Razão Social deve ter pelo menos 3 caracteres'),
    nomeFantasia: z.string().min(2, 'Nome Fantasia é obrigatório'),
    inscricaoEstadual: z.string().optional(),
    regimeTributario: z.string().min(1, 'Regime Tributário é obrigatório'),

    // Endereço
    endereco: z.object({
        rua: z.string().min(1, 'Endereço é obrigatório'),
        numero: z.string().min(1, 'Número é obrigatório'),
        complemento: z.string().optional(),
        bairro: z.string().min(1, 'Bairro é obrigatório'),
        cep: z.string().min(1, 'CEP é obrigatório').refine(validarCEP, 'CEP inválido'),
        cidade: z.string().min(1, 'Cidade é obrigatória'),
        uf: z.string().min(2, 'UF é obrigatória'),
    }),

    // Responsável Legal
    responsavel: z.object({
        nome: z.string().min(1, 'Nome do responsável é obrigatório'),
        cargo: z.string().min(1, 'Cargo do responsável é obrigatório'),
        cpf: z.string().min(1, 'CPF do responsável é obrigatório').refine(validarCPF, 'CPF inválido'),
        rg: z.string().optional(),
    }),

    // Contato
    telefone: z.string().min(1, 'Telefone é obrigatório').refine(validarTelefone, 'Telefone inválido'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),

    // Contabilidade
    contabilidade: z.object({
        nome: z.string().min(1, 'Nome da contabilidade é obrigatório'),
        contato: z.string().min(1, 'Pessoa de contato da contabilidade é obrigatória'),
        telefone: z.string().min(1, 'Telefone da contabilidade é obrigatório'),
    }),

    // Responsável pelo Aceite (se diferente)
    responsavelAceiteMesmoLegal: z.boolean(),
    responsavelAceiteNome: z.string().optional(),

    // Termos
    aceitouTermos: z.boolean().refine(val => val === true, {
        message: 'Você deve aceitar os termos da proposta',
    }),
}).superRefine((data, ctx) => {
    if (!data.responsavelAceiteMesmoLegal && (!data.responsavelAceiteNome || data.responsavelAceiteNome.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['responsavelAceiteNome'],
            message: 'Por favor, informe o nome do responsável pelo aceite',
        });
    }
});

export const aceiteSchema = z.object({
    dadosCadastrais: dadosCadastraisSchema,
    formaPagamento: z.enum(['avista', 'parcelado']).nullish(), // Pode ser null inicialmente
    pixPayload: z.string().optional(),
    pixQrCode: z.string().optional(),
    observacoes: z.string().optional(),
});

export type AceiteFormData = z.infer<typeof aceiteSchema>;
export type DadosCadastraisData = z.infer<typeof dadosCadastraisSchema>;
