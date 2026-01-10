'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validarDadosCadastrais } from '@/lib/validators';
import { mascaraCNPJ, mascaraCPF, mascaraTelefone, mascaraCEP } from '@/lib/validators';
import type { DadosCadastrais } from '@/lib/storage';

interface AceiteFormProps {
    propostaId: string;
    hashPublico: string;
    onClose: () => void;
}

type Etapa = 'dados' | 'pagamento' | 'pix' | 'comprovante' | 'sucesso';

export default function AceiteForm({ propostaId, hashPublico, onClose }: AceiteFormProps) {
    const router = useRouter();
    const [etapa, setEtapa] = useState<Etapa>('dados');
    const [formaPagamento, setFormaPagamento] = useState<'avista' | 'parcelado' | null>(null);

    // Dados cadastrais
    const [tipoPessoa, setTipoPessoa] = useState<'juridica' | 'fisica'>('juridica');
    const [cnpj, setCnpj] = useState('');
    const [cpf, setCpf] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [aceitouTermos, setAceitouTermos] = useState(false);

    const [erros, setErros] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validarEContinuar = () => {
        const dados: DadosCadastrais = {
            tipoPessoa,
            cnpj: tipoPessoa === 'juridica' ? cnpj : '',
            cpf: tipoPessoa === 'fisica' ? cpf : '',
            razaoSocial: tipoPessoa === 'juridica' ? razaoSocial : '',
            nomeCompleto: tipoPessoa === 'fisica' ? nomeCompleto : '',
            email,
            telefone,
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            observacoes,
        };

        const errosValidacao = validarDadosCadastrais(dados);

        if (Object.keys(errosValidacao).length > 0) {
            setErros(errosValidacao);
            return;
        }

        if (!aceitouTermos) {
            setErros({ termos: 'Você precisa aceitar os termos para continuar' });
            return;
        }

        setErros({});
        setEtapa('pagamento');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
                {/* Header */}
                <div className="gradient-extrema p-6 rounded-t-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Aceitar Proposta</h2>
                            <p className="text-white/90 text-sm mt-1">
                                {etapa === 'dados' && 'Passo 1: Dados Cadastrais'}
                                {etapa === 'pagamento' && 'Passo 2: Forma de Pagamento'}
                                {etapa === 'pix' && 'Passo 3: Pagamento via PIX'}
                                {etapa === 'comprovante' && 'Passo 4: Envio de Comprovante'}
                                {etapa === 'sucesso' && 'Proposta Aceita!'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        {['dados', 'pagamento', 'pix', 'comprovante'].map((step, index) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${etapa === step ? 'bg-extrema-purple text-white' :
                                        ['dados', 'pagamento', 'pix', 'comprovante'].indexOf(etapa) > index ? 'bg-green-500 text-white' :
                                            'bg-gray-200 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                {index < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${['dados', 'pagamento', 'pix', 'comprovante'].indexOf(etapa) > index ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Etapa: Dados Cadastrais */}
                    {etapa === 'dados' && (
                        <div className="space-y-4">
                            {/* Tipo de Pessoa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pessoa</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={tipoPessoa === 'juridica'}
                                            onChange={() => setTipoPessoa('juridica')}
                                            className="mr-2"
                                        />
                                        <span>Pessoa Jurídica</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={tipoPessoa === 'fisica'}
                                            onChange={() => setTipoPessoa('fisica')}
                                            className="mr-2"
                                        />
                                        <span>Pessoa Física</span>
                                    </label>
                                </div>
                            </div>

                            {/* Campos dinâmicos baseados no tipo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tipoPessoa === 'juridica' ? (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                                            <input
                                                type="text"
                                                value={cnpj}
                                                onChange={(e) => setCnpj(mascaraCNPJ(e.target.value))}
                                                className={`input ${erros.cnpj ? 'border-red-500' : ''}`}
                                                placeholder="00.000.000/0000-00"
                                                maxLength={18}
                                            />
                                            {erros.cnpj && <p className="text-xs text-red-600 mt-1">{erros.cnpj}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                                            <input
                                                type="text"
                                                value={razaoSocial}
                                                onChange={(e) => setRazaoSocial(e.target.value)}
                                                className={`input ${erros.razaoSocial ? 'border-red-500' : ''}`}
                                                placeholder="Nome da empresa"
                                            />
                                            {erros.razaoSocial && <p className="text-xs text-red-600 mt-1">{erros.razaoSocial}</p>}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                                            <input
                                                type="text"
                                                value={cpf}
                                                onChange={(e) => setCpf(mascaraCPF(e.target.value))}
                                                className={`input ${erros.cpf ? 'border-red-500' : ''}`}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                            {erros.cpf && <p className="text-xs text-red-600 mt-1">{erros.cpf}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                            <input
                                                type="text"
                                                value={nomeCompleto}
                                                onChange={(e) => setNomeCompleto(e.target.value)}
                                                className={`input ${erros.nomeCompleto ? 'border-red-500' : ''}`}
                                                placeholder="Seu nome completo"
                                            />
                                            {erros.nomeCompleto && <p className="text-xs text-red-600 mt-1">{erros.nomeCompleto}</p>}
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`input ${erros.email ? 'border-red-500' : ''}`}
                                        placeholder="seu@email.com"
                                    />
                                    {erros.email && <p className="text-xs text-red-600 mt-1">{erros.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                                    <input
                                        type="tel"
                                        value={telefone}
                                        onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                                        className={`input ${erros.telefone ? 'border-red-500' : ''}`}
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                    />
                                    {erros.telefone && <p className="text-xs text-red-600 mt-1">{erros.telefone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                                    <input
                                        type="text"
                                        value={cep}
                                        onChange={(e) => setCep(mascaraCEP(e.target.value))}
                                        className={`input ${erros.cep ? 'border-red-500' : ''}`}
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    {erros.cep && <p className="text-xs text-red-600 mt-1">{erros.cep}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        className={`input ${erros.cidade ? 'border-red-500' : ''}`}
                                        placeholder="Nome da cidade"
                                    />
                                    {erros.cidade && <p className="text-xs text-red-600 mt-1">{erros.cidade}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                                    <input
                                        type="text"
                                        value={endereco}
                                        onChange={(e) => setEndereco(e.target.value)}
                                        className={`input ${erros.endereco ? 'border-red-500' : ''}`}
                                        placeholder="Rua, avenida..."
                                    />
                                    {erros.endereco && <p className="text-xs text-red-600 mt-1">{erros.endereco}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                                    <input
                                        type="text"
                                        value={numero}
                                        onChange={(e) => setNumero(e.target.value)}
                                        className={`input ${erros.numero ? 'border-red-500' : ''}`}
                                        placeholder="Nº"
                                    />
                                    {erros.numero && <p className="text-xs text-red-600 mt-1">{erros.numero}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                    <input
                                        type="text"
                                        value={complemento}
                                        onChange={(e) => setComplemento(e.target.value)}
                                        className="input"
                                        placeholder="Apto, sala..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                                    <input
                                        type="text"
                                        value={bairro}
                                        onChange={(e) => setBairro(e.target.value)}
                                        className={`input ${erros.bairro ? 'border-red-500' : ''}`}
                                        placeholder="Nome do bairro"
                                    />
                                    {erros.bairro && <p className="text-xs text-red-600 mt-1">{erros.bairro}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                                    <select
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value)}
                                        className={`input ${erros.estado ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="PR">Paraná</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        {/* Adicionar outros estados conforme necessário */}
                                    </select>
                                    {erros.estado && <p className="text-xs text-red-600 mt-1">{erros.estado}</p>}
                                </div>
                            </div>

                            {/* Termos */}
                            <div className="pt-4 border-t border-gray-200">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={aceitouTermos}
                                        onChange={(e) => setAceitouTermos(e.target.checked)}
                                        className="mt-1 mr-3"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Declaro que li e aceito os termos da proposta comercial e autorizo a Extrema Tecnologia a entrar em contato para finalização do processo.
                                    </span>
                                </label>
                                {erros.termos && <p className="text-xs text-red-600 mt-1">{erros.termos}</p>}
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-4">
                                <button onClick={onClose} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button onClick={validarEContinuar} className="btn btn-primary">
                                    Continuar para Pagamento →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Placeholder para outras etapas */}
                    {etapa !== 'dados' && (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Etapa "{etapa}" em desenvolvimento...</p>
                            <button
                                onClick={() => setEtapa('dados')}
                                className="btn btn-secondary mt-4"
                            >
                                Voltar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
