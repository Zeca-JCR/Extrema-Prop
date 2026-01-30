import { useState, useEffect, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrCodePix } from 'qrcode-pix';
import { AceiteFormData, aceiteSchema, DadosCadastraisData } from '@/lib/schemas';
import { validarCNPJ, mascaraCNPJ, mascaraTelefone, mascaraCEP, mascaraCPF } from '@/lib/validators';
import { updateProposta, getConfiguracoes } from '@/lib/storage';
import { copyToClipboard, readFileAsBase64 } from '@/lib/utils';
import type { Proposta, DadosCadastrais, Aceite } from '@/lib/storage';

export type Etapa = 'dados' | 'pagamento' | 'pix' | 'comprovante' | 'sucesso';

const MOCK_DATA = {
    dadosCadastrais: {
        cnpj: '33.649.575/0001-99',
        razaoSocial: 'Empresa de Teste Automatizado Ltda',
        nomeFantasia: 'Teste Auto',
        inscricaoEstadual: 'Isento',
        regimeTributario: 'Simples Nacional',
        endereco: {
            rua: 'Av. Paulista',
            numero: '1000',
            bairro: 'Bela Vista',
            complemento: 'Andar 10',
            cep: '01310-100',
            cidade: 'São Paulo',
            uf: 'SP',
        },
        responsavel: {
            nome: 'João da Silva Teste',
            cargo: 'Diretor Financeiro',
            cpf: '003.364.979-03',
            rg: '',
        },
        telefone: '(11) 98888-8888',
        email: 'teste@exemplo.com.br',
        contabilidade: {
            nome: 'Contabilidade Modelo',
            contato: 'Maria Contadora',
            telefone: '(11) 3333-3333',
        },
        responsavelAceiteMesmoLegal: true,
        responsavelAceiteNome: '',
        aceitouTermos: true,
    }
};

export function useAceiteForm(proposta: Proposta, onSuccess: (p: Proposta) => void) {
    const [etapa, setEtapa] = useState<Etapa>('dados');
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
    const [pixPayload, setPixPayload] = useState('');
    const [pixQrCode, setPixQrCode] = useState('');
    const [copiado, setCopiado] = useState(false);
    const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
    const [comprovantePreview, setComprovantePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({}); // Erros extras (não do form)

    const config = getConfiguracoes();
    const storageKey = `proposta_aceite_temp_${proposta.id}`;

    // Inicializar React Hook Form
    const methods = useForm<AceiteFormData>({
        resolver: zodResolver(aceiteSchema),
        mode: 'onChange',
        defaultValues: {
            dadosCadastrais: {
                cnpj: '',
                razaoSocial: '',
                nomeFantasia: '',
                inscricaoEstadual: '',
                regimeTributario: '',
                endereco: { rua: '', numero: '', complemento: '', bairro: '', cep: '', cidade: '', uf: '' },
                responsavel: { nome: '', cargo: '', cpf: '', rg: '' },
                telefone: '',
                email: '',
                contabilidade: { nome: '', contato: '', telefone: '' },
                responsavelAceiteMesmoLegal: true,
                responsavelAceiteNome: '',
                aceitouTermos: false,
            },
            formaPagamento: undefined,
            pixPayload: '',
            pixQrCode: '',
        }
    });

    const { watch, setValue, trigger, reset, getValues, formState: { errors } } = methods;
    const formValues = watch();

    // Valores calculados
    const valorPix = formValues.formaPagamento === 'avista'
        ? proposta.valores.valorAvista
        : proposta.valores.parcelamento.valorParcela;

    // Carregar dados iniciais e persistidos
    useEffect(() => {
        // Se já finalizado, limpar storage
        if (['comprovante_enviado', 'paga', 'aceita'].includes(proposta.status)) {
            setEtapa('sucesso');
            localStorage.removeItem(storageKey);
            return;
        }

        const savedState = localStorage.getItem(storageKey);
        let initialData: Partial<AceiteFormData> = {};
        let initialEtapa: Etapa = 'dados';
        let initialExtras: any = {};

        // 1. Dados da Proposta (Base)
        if (proposta.dadosCadastrais) {
            initialData.dadosCadastrais = {
                cnpj: proposta.dadosCadastrais.cnpj || '',
                razaoSocial: proposta.dadosCadastrais.razaoSocial || '',
                nomeFantasia: proposta.dadosCadastrais.nomeFantasia || '',
                inscricaoEstadual: proposta.dadosCadastrais.inscricaoEstadual || '',
                regimeTributario: proposta.dadosCadastrais.regimeTributario || '',
                endereco: {
                    rua: proposta.dadosCadastrais.endereco?.rua || '',
                    numero: proposta.dadosCadastrais.endereco?.numero || '',
                    complemento: proposta.dadosCadastrais.endereco?.complemento || '',
                    bairro: proposta.dadosCadastrais.endereco?.bairro || '',
                    cep: proposta.dadosCadastrais.endereco?.cep || '',
                    cidade: proposta.dadosCadastrais.endereco?.cidade || '',
                    uf: proposta.dadosCadastrais.endereco?.uf || '',
                },
                responsavel: {
                    nome: proposta.dadosCadastrais.responsavel?.nome || '',
                    cargo: proposta.dadosCadastrais.responsavel?.cargo || '',
                    cpf: proposta.dadosCadastrais.responsavel?.cpf || '',
                    rg: proposta.dadosCadastrais.responsavel?.rg || '',
                },
                telefone: proposta.dadosCadastrais.telefone || '',
                email: proposta.dadosCadastrais.email || '',
                contabilidade: {
                    nome: proposta.dadosCadastrais.contabilidade?.nome || '',
                    contato: proposta.dadosCadastrais.contabilidade?.contato || '',
                    telefone: proposta.dadosCadastrais.contabilidade?.telefone || '',
                },
                responsavelAceiteMesmoLegal: true, // Default
                responsavelAceiteNome: '',
                aceitouTermos: false,
            };
            if (proposta.aceite?.responsavelAceite) {
                initialData.dadosCadastrais.responsavelAceiteMesmoLegal = false;
                initialData.dadosCadastrais.responsavelAceiteNome = proposta.aceite.responsavelAceite;
            }
            if (proposta.status === 'aguardando_pagamento') {
                initialEtapa = 'pagamento';
            }
        }

        // 2. Dados Persistidos (Overwrite)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.formValues) {
                    // Deep merge simplificado ou overwrite
                    initialData = { ...initialData, ...parsed.formValues };
                    // Merge profundo manual para dadosCadastrais
                    if (parsed.formValues.dadosCadastrais) {
                        initialData.dadosCadastrais = {
                            ...(initialData.dadosCadastrais as any),
                            ...parsed.formValues.dadosCadastrais
                        };
                    }
                }
                if (parsed.etapa) {
                    if (parsed.etapa === 'pix' && (!parsed.formValues?.pixQrCode || !parsed.formValues?.formaPagamento)) {
                        initialEtapa = 'pagamento';
                    } else {
                        initialEtapa = parsed.etapa;
                    }
                }
                if (parsed.extras) {
                    initialExtras = parsed.extras;
                    if (initialExtras.pixPayload) setPixPayload(initialExtras.pixPayload);
                    if (initialExtras.pixQrCode) setPixQrCode(initialExtras.pixQrCode);
                }
            } catch (e) {
                console.error("Erro ao restaurar storage", e);
            }
        }

        // Aplicar valores
        reset(initialData as AceiteFormData);
        setEtapa(initialEtapa);

        // Disparar validação inicial silenciosa se já estiver avançado (opcional)

    }, [proposta.id]);

    // Persistência Automática
    useEffect(() => {
        if (etapa === 'sucesso') return;

        const timer = setTimeout(() => {
            const stateToSave = {
                formValues,
                etapa,
                extras: { pixPayload, pixQrCode }
            };
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        }, 800);

        return () => clearTimeout(timer);
    }, [formValues, etapa, pixPayload, pixQrCode]);

    // Actions
    const handleAutofill = useCallback(() => {
        // reset(MOCK_DATA as AceiteFormData); // Isso resetaria tudo. Melhor usar setValue um a um ou reset com merge.
        // Vamos usar loop para preencher
        const mock = MOCK_DATA.dadosCadastrais;
        setValue('dadosCadastrais', mock as any, { shouldValidate: true });
    }, [setValue]);

    const fetchCnpjData = async (cnpjNumeros: string) => {
        setIsFetchingCnpj(true);
        try {
            const response = await fetch(`https://api.opencnpj.org/${cnpjNumeros}`);
            if (response.ok) {
                const data = await response.json();
                if (data.razao_social) setValue('dadosCadastrais.razaoSocial', data.razao_social, { shouldValidate: true });
                if (data.nome_fantasia) setValue('dadosCadastrais.nomeFantasia', data.nome_fantasia, { shouldValidate: true });
                if (data.logradouro) setValue('dadosCadastrais.endereco.rua', data.logradouro, { shouldValidate: true });
                if (data.numero) setValue('dadosCadastrais.endereco.numero', data.numero, { shouldValidate: true });
                if (data.complemento) setValue('dadosCadastrais.endereco.complemento', data.complemento, { shouldValidate: true });
                if (data.bairro) setValue('dadosCadastrais.endereco.bairro', data.bairro, { shouldValidate: true });
                if (data.cep) setValue('dadosCadastrais.endereco.cep', mascaraCEP(data.cep.replace(/\D/g, '')), { shouldValidate: true });
                if (data.municipio) setValue('dadosCadastrais.endereco.cidade', data.municipio, { shouldValidate: true });
                if (data.uf) setValue('dadosCadastrais.endereco.uf', data.uf, { shouldValidate: true });
                if (data.email) setValue('dadosCadastrais.email', data.email.toLowerCase(), { shouldValidate: true });
                if (data.telefones && data.telefones.length > 0) {
                    const tel = data.telefones[0];
                    setValue('dadosCadastrais.telefone', mascaraTelefone(`${tel.ddd || ''}${tel.numero || ''}`), { shouldValidate: true });
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
        } finally {
            setIsFetchingCnpj(false);
        }
    };

    const handleCnpjBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length === 14 && validarCNPJ(val)) {
            fetchCnpjData(val);
        }
    };

    const validarEContinuar = async () => {
        const isValid = await trigger('dadosCadastrais');
        if (isValid) {
            // Salvar no storage da proposta (backend like)
            const values = getValues();
            const dadosToSave: DadosCadastrais = {
                // ... Mapear AceiteFormData -> DadosCadastrais interface
                razaoSocial: values.dadosCadastrais.razaoSocial,
                nomeFantasia: values.dadosCadastrais.nomeFantasia,
                cnpj: values.dadosCadastrais.cnpj,
                inscricaoEstadual: values.dadosCadastrais.inscricaoEstadual || '',
                regimeTributario: values.dadosCadastrais.regimeTributario,
                endereco: {
                    ...values.dadosCadastrais.endereco,
                    complemento: values.dadosCadastrais.endereco.complemento || '',
                },
                responsavel: {
                    nome: values.dadosCadastrais.responsavel.nome,
                    cargo: values.dadosCadastrais.responsavel.cargo,
                    cpf: values.dadosCadastrais.responsavel.cpf,
                    rg: values.dadosCadastrais.responsavel.rg || ''
                },
                telefone: values.dadosCadastrais.telefone,
                email: values.dadosCadastrais.email,
                contabilidade: values.dadosCadastrais.contabilidade,
            };

            const aceitante = values.dadosCadastrais.responsavelAceiteMesmoLegal
                ? values.dadosCadastrais.responsavel.nome
                : values.dadosCadastrais.responsavelAceiteNome || '';

            const propostaAtualizada: Proposta = {
                ...proposta,
                dadosCadastrais: dadosToSave,
                aceite: proposta.aceite ? { ...proposta.aceite, responsavelAceite: aceitante } : null,
                status: (proposta.status === 'rascunho' || proposta.status === 'enviada') ? 'aguardando_pagamento' : proposta.status,
                updatedAt: new Date().toISOString(),
            };
            updateProposta(propostaAtualizada);
            onSuccess(propostaAtualizada);

            setEtapa('pagamento');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const gerarPIX = async () => {
        const formaPagamento = getValues('formaPagamento');
        if (!formaPagamento) {
            setErros({ submit: 'Selecione uma forma de pagamento' });
            return;
        }

        setIsLoading(true);
        try {
            const values = getValues();
            if (config.integracoes?.modoPix === 'api') {
                // API Logic (mantida igual)
                const response = await fetch('/api/pix/criar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        valor: valorPix,
                        txid: proposta.numero.replace('PROP', '') + Date.now().toString().slice(-6),
                        devedor: { nome: values.dadosCadastrais.razaoSocial, doc: values.dadosCadastrais.cnpj }
                    })
                });
                if (!response.ok) throw new Error('Falha ao criar Pix na API');
                const data = await response.json();
                setPixPayload(data.pixCopiaECola || data.location);
                setPixQrCode(data.imagemQrCodeInBase64 || '');
            } else {
                const pixCNPJ = config.empresa.pixCNPJ.replace(/\D/g, '');
                const qrCodePix = QrCodePix({
                    version: '01', key: pixCNPJ, name: 'EXTREMA SOFTWARE', city: 'SAO BENTO DO SUL',
                    transactionId: proposta.numero.replace('PROP', ''),
                    message: `Proposta ${proposta.numero}`, value: valorPix,
                });
                setPixPayload(qrCodePix.payload());
                setPixQrCode(await qrCodePix.base64());
            }
            setEtapa('pix');
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            setErros(prev => ({ ...prev, submit: 'Erro ao gerar QR Code PIX. Tente novamente.' }));
        } finally {
            setIsLoading(false);
        }
    };

    const copiarCodigoPix = async () => {
        const success = await copyToClipboard(pixPayload);
        if (success) {
            setCopiado(true);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
            setTimeout(() => setCopiado(false), 3000);
        }
    };

    const irParaComprovante = () => {
        setEtapa('comprovante');
    };

    const enviarComprovante = async () => {
        if (!comprovanteFile || !comprovantePreview) {
            setErros({ comprovante: 'Por favor, envie o comprovante de pagamento' });
            return;
        }
        setIsLoading(true);
        try {
            const values = getValues();
            // Reconstroi objetos (similar ao validarEContinuar, mas para Aceite final)
            const dadosCadastrais: DadosCadastrais = {
                razaoSocial: values.dadosCadastrais.razaoSocial,
                nomeFantasia: values.dadosCadastrais.nomeFantasia,
                cnpj: values.dadosCadastrais.cnpj,
                inscricaoEstadual: values.dadosCadastrais.inscricaoEstadual || '',
                regimeTributario: values.dadosCadastrais.regimeTributario,
                endereco: {
                    ...values.dadosCadastrais.endereco,
                    complemento: values.dadosCadastrais.endereco.complemento || '',
                },
                responsavel: {
                    nome: values.dadosCadastrais.responsavel.nome,
                    cargo: values.dadosCadastrais.responsavel.cargo,
                    cpf: values.dadosCadastrais.responsavel.cpf,
                    rg: values.dadosCadastrais.responsavel.rg || ''
                },
                telefone: values.dadosCadastrais.telefone,
                email: values.dadosCadastrais.email,
                contabilidade: values.dadosCadastrais.contabilidade,
            };

            const aceitante = values.dadosCadastrais.responsavelAceiteMesmoLegal
                ? values.dadosCadastrais.responsavel.nome
                : values.dadosCadastrais.responsavelAceiteNome || '';

            const aceite: Aceite = {
                aceitoEm: new Date().toISOString(),
                formaPagamento: values.formaPagamento!,
                valorPagoPix: valorPix,
                pixPayload: pixPayload,
                dadosCadastrais: dadosCadastrais,
                comprovante: {
                    enviadoEm: new Date().toISOString(),
                    arquivoBase64: comprovantePreview,
                    nomeArquivo: comprovanteFile.name,
                    aprovado: null, aprovadoPor: null, aprovadoEm: null, observacoes: values.observacoes || '',
                },
                responsavelAceite: aceitante,
            };

            const propostaAtualizada: Proposta = {
                ...proposta,
                status: 'comprovante_enviado',
                aceite: aceite,
                updatedAt: new Date().toISOString(),
            };
            updateProposta(propostaAtualizada);
            onSuccess(propostaAtualizada);
            setEtapa('sucesso');
        } catch (e) {
            console.error('Erro ao enviar comprovante', e);
            setErros({ submit: 'Erro ao enviar comprovante' });
        } finally {
            setIsLoading(false);
        }
    };

    const simulateUpload = useCallback(() => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);
        return interval;
    }, []);

    return {
        methods, // Expor métodos do RHF
        formValues,
        etapa, setEtapa,
        isFetchingCnpj,
        pixPayload, pixQrCode, copiado,
        comprovanteFile, setComprovanteFile,
        comprovantePreview, setComprovantePreview,
        uploadProgress, setUploadProgress,
        isLoading,
        erros, setErros,
        valorPix,

        // Actions
        handleAutofill,
        handleCnpjBlur,
        validarEContinuar,
        gerarPIX,
        copiarCodigoPix,
        irParaComprovante,
        enviarComprovante,
        simulateUpload
    };
}
