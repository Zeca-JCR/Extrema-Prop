'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { QrCodePix } from 'qrcode-pix';
import { validarDadosCadastrais, validarCNPJ, validarCPF } from '@/lib/validators';
import { mascaraCNPJ, mascaraTelefone, mascaraCEP, mascaraCPF } from '@/lib/validators';
import { updateProposta, getConfiguracoes } from '@/lib/storage';
import { formatCurrency, copyToClipboard, readFileAsBase64 } from '@/lib/utils';
import type { Proposta, DadosCadastrais, Aceite } from '@/lib/storage';

interface AceiteFormProps {
    proposta: Proposta;
    onClose: () => void;
    onSuccess: (propostaAtualizada: Proposta) => void;
}

type Etapa = 'dados' | 'pagamento' | 'pix' | 'comprovante' | 'sucesso';

const MOCK_DATA = {
    cnpj: '33.649.575/0001-99',
    razaoSocial: 'Empresa de Teste Automatizado Ltda',
    nomeFantasia: 'Teste Auto',
    endereco: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    complemento: 'Andar 10',
    cep: '01310-100',
    cidade: 'São Paulo',
    estado: 'SP',
    inscricaoEstadual: 'Isento',
    regimeTributario: 'Simples Nacional',
    responsavelNome: 'João da Silva Teste',
    responsavelCargo: 'Diretor Financeiro',
    responsavelCpf: '003.364.979-03',
    telefone: '(11) 98888-8888',
    email: 'teste@exemplo.com.br',
    contabilidadeNome: 'Contabilidade Modelo',
    contabilidadeContato: 'Maria Contadora',
    contabilidadeTelefone: '(11) 3333-3333',
};

export default function AceiteForm({ proposta, onClose, onSuccess }: AceiteFormProps) {
    const [etapa, setEtapa] = useState<Etapa>('dados');
    const [formaPagamento, setFormaPagamento] = useState<'avista' | 'parcelado' | null>(null);

    // Dados cadastrais (apenas Pessoa Jurídica)
    const [cnpj, setCnpj] = useState('');
    const [cnpjValido, setCnpjValido] = useState<boolean | null>(null);  // null = não verificado ainda
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [inscricaoEstadual, setInscricaoEstadual] = useState('');
    const [regimeTributario, setRegimeTributario] = useState('');

    // Endereço
    const [endereco, setEndereco] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [complemento, setComplemento] = useState('');
    const [cep, setCep] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');

    // Responsável
    const [responsavelNome, setResponsavelNome] = useState('');
    const [responsavelCargo, setResponsavelCargo] = useState('');
    const [responsavelCpf, setResponsavelCpf] = useState('');
    const [cpfValido, setCpfValido] = useState<boolean | null>(null);

    // Contato
    const [telefone, setTelefone] = useState(proposta.cliente.telefone || '');
    const [email, setEmail] = useState(proposta.cliente.email || '');

    // Contabilidade
    const [contabilidadeNome, setContabilidadeNome] = useState('');
    const [contabilidadeContato, setContabilidadeContato] = useState('');
    const [contabilidadeTelefone, setContabilidadeTelefone] = useState('');

    // Responsável pelo Aceite (Novo)
    const [responsavelAceiteMesmoLegal, setResponsavelAceiteMesmoLegal] = useState(true);
    const [responsavelAceiteNome, setResponsavelAceiteNome] = useState('');

    const [observacoes, setObservacoes] = useState('');
    const [aceitouTermos, setAceitouTermos] = useState(false);


    // Persistência de Estado
    const storageKey = `proposta_aceite_temp_${proposta.id}`;

    // Carregar estado salvo
    useEffect(() => {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);

                // Só restaura se a proposta não tiver mudado de status crítico externamente
                if (!['comprovante_enviado', 'paga', 'aceita'].includes(proposta.status)) {
                    if (parsedState.cnpj) {
                        setCnpj(parsedState.cnpj);
                        if (parsedState.cnpj.length === 18) {
                            setCnpjValido(validarCNPJ(parsedState.cnpj));
                        }
                    }
                    if (parsedState.razaoSocial) setRazaoSocial(parsedState.razaoSocial);
                    if (parsedState.nomeFantasia) setNomeFantasia(parsedState.nomeFantasia);
                    if (parsedState.inscricaoEstadual) setInscricaoEstadual(parsedState.inscricaoEstadual);
                    if (parsedState.regimeTributario) setRegimeTributario(parsedState.regimeTributario);

                    if (parsedState.endereco) setEndereco(parsedState.endereco);
                    if (parsedState.numero) setNumero(parsedState.numero);
                    if (parsedState.bairro) setBairro(parsedState.bairro);
                    if (parsedState.complemento) setComplemento(parsedState.complemento);
                    if (parsedState.cep) setCep(parsedState.cep);
                    if (parsedState.cidade) setCidade(parsedState.cidade);
                    if (parsedState.estado) setEstado(parsedState.estado);

                    if (parsedState.responsavelNome) setResponsavelNome(parsedState.responsavelNome);
                    if (parsedState.responsavelCargo) setResponsavelCargo(parsedState.responsavelCargo);
                    if (parsedState.responsavelCpf) {
                        setResponsavelCpf(parsedState.responsavelCpf);
                        if (parsedState.responsavelCpf.length === 14) {
                            setCpfValido(validarCPF(parsedState.responsavelCpf));
                        }
                    }

                    if (parsedState.telefone) setTelefone(parsedState.telefone);
                    if (parsedState.email) setEmail(parsedState.email);

                    if (parsedState.contabilidadeNome) setContabilidadeNome(parsedState.contabilidadeNome);
                    if (parsedState.contabilidadeContato) setContabilidadeContato(parsedState.contabilidadeContato);
                    if (parsedState.contabilidadeTelefone) setContabilidadeTelefone(parsedState.contabilidadeTelefone);

                    if (parsedState.responsavelAceiteMesmoLegal !== undefined) setResponsavelAceiteMesmoLegal(parsedState.responsavelAceiteMesmoLegal);
                    if (parsedState.responsavelAceiteNome) setResponsavelAceiteNome(parsedState.responsavelAceiteNome);

                    if (parsedState.etapa && parsedState.etapa !== 'sucesso') setEtapa(parsedState.etapa);
                }
            } catch (e) {
                console.error("Erro ao restaurar estado", e);
            }
        }
    }, [proposta.id]);

    // Salvar estado a cada mudança relevante
    useEffect(() => {
        // Não salvar se já finalizou
        if (etapa === 'sucesso' || ['comprovante_enviado', 'paga', 'aceita'].includes(proposta.status)) {
            localStorage.removeItem(storageKey);
            return;
        }

        const stateToSave = {
            etapa,
            cnpj, razaoSocial, nomeFantasia, inscricaoEstadual, regimeTributario,
            endereco, numero, bairro, complemento, cep, cidade, estado,
            responsavelNome, responsavelCargo, responsavelCpf,
            telefone, email,
            contabilidadeNome, contabilidadeContato, contabilidadeTelefone,
            responsavelAceiteMesmoLegal, responsavelAceiteNome
        };

        const timeoutId = setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        }, 1000); // Debounce de 1s

        return () => clearTimeout(timeoutId);
    }, [
        etapa, proposta.status,
        cnpj, razaoSocial, nomeFantasia, inscricaoEstadual, regimeTributario,
        endereco, numero, bairro, complemento, cep, cidade, estado,
        responsavelNome, responsavelCargo, responsavelCpf,
        telefone, email,
        contabilidadeNome, contabilidadeContato, contabilidadeTelefone,
        responsavelAceiteMesmoLegal, responsavelAceiteNome
    ]);

    // Inicialização segura dos dados cadastrais (caso já existam na proposta)
    useEffect(() => {
        if (proposta.dadosCadastrais) {
            const d = proposta.dadosCadastrais;


            // Empresa
            setRazaoSocial(d.razaoSocial || '');
            setNomeFantasia(d.nomeFantasia || '');
            setCnpj(d.cnpj || '');
            setInscricaoEstadual(d.inscricaoEstadual || '');
            setRegimeTributario(d.regimeTributario || '');

            // Endereço
            if (d.endereco) {
                setEndereco(d.endereco.rua || '');
                setNumero(d.endereco.numero || '');
                setComplemento(d.endereco.complemento || '');
                setBairro(d.endereco.bairro || '');
                setCep(d.endereco.cep || '');
                setCidade(d.endereco.cidade || '');
                setEstado(d.endereco.uf || '');
            }

            // Responsável
            if (d.responsavel) {
                setResponsavelNome(d.responsavel.nome || '');
                setResponsavelCargo(d.responsavel.cargo || '');
                setResponsavelCpf(d.responsavel.cpf || '');
            }

            // Contato
            setTelefone(d.telefone || '');
            setEmail(d.email || '');

            // Contabilidade
            if (d.contabilidade) {
                setContabilidadeNome(d.contabilidade.nome || '');
                setContabilidadeContato(d.contabilidade.contato || '');
                setContabilidadeTelefone(d.contabilidade.telefone || '');
            }

            // Responsável pelo Aceite - Recuperação (se existir)
            // Como não temos esse campo no type DadosCadastrais ainda, vamos assumir que pode vir
            // ou deixar padrão. Se já houve aceite, estaria no objeto Aceite.
            if (proposta.aceite?.responsavelAceite) {
                setResponsavelAceiteMesmoLegal(false);
                setResponsavelAceiteNome(proposta.aceite.responsavelAceite);
            }


            // Sincronização de Status em Tempo Real
            // Se a proposta foi concluída (por outra pessoa), vai para sucesso
            if (['comprovante_enviado', 'paga', 'aceita'].includes(proposta.status)) {
                setEtapa('sucesso');
            } else if (proposta.status === 'aguardando_pagamento') {
                // Se já tem dados e status é aguardando_pagamento, pula etapa 1
                setEtapa(prev => prev === 'dados' ? 'pagamento' : prev);
            }
        }
    }, [proposta]);

    // PIX
    const [pixPayload, setPixPayload] = useState('');
    const [pixQrCode, setPixQrCode] = useState('');
    const [copiado, setCopiado] = useState(false);

    // Comprovante
    const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
    const [comprovantePreview, setComprovantePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Função para simular progresso
    const simulateUpload = () => {
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
    };

    // Permitir colar (CTRL+V) o comprovante
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (etapa !== 'comprovante') return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') === 0 || item.type === 'application/pdf') {
                    const file = item.getAsFile();
                    if (file) {
                        setIsLoading(true);
                        const interval = simulateUpload();

                        // Pequeno delay para mostrar o progresso
                        await new Promise(resolve => setTimeout(resolve, 800));

                        setComprovanteFile(file);
                        const preview = await readFileAsBase64(file);
                        setComprovantePreview(preview);

                        clearInterval(interval);
                        setUploadProgress(100);
                        setTimeout(() => setIsLoading(false), 300);

                        // Feedback visual (opcional)
                        const dropzone = document.querySelector('.dropzone-area');
                        if (dropzone) {
                            dropzone.classList.add('ring-4', 'ring-green-400');
                            setTimeout(() => dropzone.classList.remove('ring-4', 'ring-green-400'), 500);
                        }
                    }
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [etapa]);

    const [erros, setErros] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [linkCopiado, setLinkCopiado] = useState(false);

    const handleAutofill = () => {
        setCnpj(MOCK_DATA.cnpj);
        setRazaoSocial(MOCK_DATA.razaoSocial);
        setNomeFantasia(MOCK_DATA.nomeFantasia);
        setEndereco(MOCK_DATA.endereco);
        setNumero(MOCK_DATA.numero);
        setBairro(MOCK_DATA.bairro);
        setComplemento(MOCK_DATA.complemento);
        setCep(MOCK_DATA.cep);
        setCidade(MOCK_DATA.cidade);
        setEstado(MOCK_DATA.estado);
        setInscricaoEstadual(MOCK_DATA.inscricaoEstadual);
        setRegimeTributario(MOCK_DATA.regimeTributario);

        setResponsavelNome(MOCK_DATA.responsavelNome);
        setResponsavelCargo(MOCK_DATA.responsavelCargo);
        setResponsavelCpf(MOCK_DATA.responsavelCpf);

        setTelefone(MOCK_DATA.telefone);
        setEmail(MOCK_DATA.email);

        setContabilidadeNome(MOCK_DATA.contabilidadeNome);
        setContabilidadeContato(MOCK_DATA.contabilidadeContato);
        setContabilidadeTelefone(MOCK_DATA.contabilidadeTelefone);

        setAceitouTermos(true);

        // Forçar validação visual
        setCnpjValido(true);
        setCpfValido(true);
        setErros({});
    };

    const fetchCnpjData = async (cnpjNumeros: string) => {
        setIsFetchingCnpj(true);
        try {
            const response = await fetch(`https://api.opencnpj.org/${cnpjNumeros}`);
            if (response.ok) {
                const data = await response.json();

                // Preencher campos
                if (data.razao_social) setRazaoSocial(data.razao_social);
                if (data.nome_fantasia) setNomeFantasia(data.nome_fantasia);

                // Endereço
                if (data.logradouro) setEndereco(data.logradouro);
                if (data.numero) setNumero(data.numero);
                if (data.complemento) setComplemento(data.complemento);
                if (data.bairro) setBairro(data.bairro);
                if (data.cep) {
                    setCep(mascaraCEP(data.cep.replace(/\D/g, '')));
                }
                if (data.municipio) setCidade(data.municipio);
                if (data.uf) setEstado(data.uf);

                // Contato
                if (data.email) setEmail(data.email.toLowerCase());
                if (data.telefones && data.telefones.length > 0) {
                    const tel = data.telefones[0];
                    const ddd = tel.ddd || '';
                    const numero = tel.numero || '';
                    setTelefone(mascaraTelefone(`${ddd}${numero}`));
                }
            }
        } catch (error) {
            console.error('Erro ao buscar CNPJ:', error);
            // Falha silenciosa ou toast, permitindo digitação manual
        } finally {
            setIsFetchingCnpj(false);
        }
    };

    // Função para validar CNPJ em tempo real
    const handleCnpjChange = (value: string) => {
        const cnpjFormatado = mascaraCNPJ(value);
        setCnpj(cnpjFormatado);

        // Limpa o erro quando começa a digitar
        if (erros.cnpj) {
            setErros(prev => ({ ...prev, cnpj: '' }));
        }

        // Valida quando o CNPJ está completo (18 caracteres com máscara)
        if (cnpjFormatado.length === 18) {
            const isValid = validarCNPJ(cnpjFormatado);
            setCnpjValido(isValid);
            if (!isValid) {
                setErros(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
            } else {
                // Se válido, buscar dados
                fetchCnpjData(cnpjFormatado.replace(/\D/g, ''));
            }
        } else {
            setCnpjValido(null);
        }
    };

    // Função para validar CPF em tempo real
    const handleCpfChange = (value: string) => {
        const cpfFormatado = mascaraCPF(value);
        setResponsavelCpf(cpfFormatado);

        // Limpa o erro quando começa a digitar
        if (erros.responsavelCpf) {
            setErros(prev => ({ ...prev, responsavelCpf: '' }));
        }

        // Valida quando o CPF está completo (14 caracteres com máscara)
        if (cpfFormatado.length === 14) {
            const isValid = validarCPF(cpfFormatado);
            setCpfValido(isValid);
            if (!isValid) {
                setErros(prev => ({ ...prev, responsavelCpf: 'CPF inválido' }));
            }
        } else {
            setCpfValido(null);
        }
    };

    const config = getConfiguracoes();

    // Valores baseados na forma de pagamento
    const valorPix = formaPagamento === 'avista'
        ? proposta.valores.valorAvista
        : proposta.valores.parcelamento.valorParcela;

    // Dropzone para upload de comprovante
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setIsLoading(true);
            const interval = simulateUpload();

            const file = acceptedFiles[0];

            // Simular tempo de upload
            await new Promise(resolve => setTimeout(resolve, 800));

            setComprovanteFile(file);
            const preview = await readFileAsBase64(file);
            setComprovantePreview(preview);

            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => setIsLoading(false), 300);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const salvarProgresso = async () => {
        const dadosCadastrais: DadosCadastrais = {
            razaoSocial,
            nomeFantasia,
            cnpj,
            inscricaoEstadual,
            regimeTributario,
            endereco: {
                rua: endereco,
                numero,
                complemento,
                bairro,
                cep,
                cidade,
                uf: estado,
            },
            responsavel: {
                nome: responsavelNome,
                cargo: responsavelCargo,
                cpf: responsavelCpf,
                rg: '',
            },
            telefone,
            email,
            contabilidade: {
                nome: contabilidadeNome,
                contato: contabilidadeContato,
                telefone: contabilidadeTelefone,
            },
        };

        // Define o nome do aceitante
        const aceitante = responsavelAceiteMesmoLegal ? responsavelNome : responsavelAceiteNome;

        const propostaAtualizada: Proposta = {
            ...proposta,
            dadosCadastrais: dadosCadastrais,
            // Se já tiver aceite, atualiza também
            aceite: proposta.aceite ? { ...proposta.aceite, responsavelAceite: aceitante } : null,
            // Se ainda é rascunho/enviada, muda para aguardando pagamento
            status: (proposta.status === 'rascunho' || proposta.status === 'enviada') ? 'aguardando_pagamento' : proposta.status,
            updatedAt: new Date().toISOString(),
        };

        updateProposta(propostaAtualizada);
        onSuccess(propostaAtualizada); // Atualiza estado pai
    };

    const validarEContinuar = () => {
        const dados = {
            tipoPessoa: 'juridica' as const,
            cnpj,
            razaoSocial,
            nomeFantasia,
            inscricaoEstadual,
            regimeTributario,
            endereco,
            numero,
            complemento,
            bairro,
            cep,
            cidade,
            estado,
            responsavelNome,
            responsavelCargo,
            responsavelCpf,
            email,
            telefone,
            contabilidadeNome,
            contabilidadeContato,
            contabilidadeTelefone,
            observacoes,
            aceitouTermos
        };

        const errosValidacao = validarDadosCadastrais(dados);

        // Validação adicional do responsável pelo aceite
        if (!responsavelAceiteMesmoLegal && !responsavelAceiteNome.trim()) {
            errosValidacao.responsavelAceite = 'Por favor, informe o nome do responsável pelo aceite';
        }

        // Se houver erros, atualiza o estado e para
        if (Object.keys(errosValidacao).length > 0) {
            setErros(errosValidacao);
            // Scroll para o primeiro erro (opcional)
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // SALVAR PROGRESSO ANTES DE IR PARA PAGAMENTO
        salvarProgresso();

        // Se não houver erros, limpa erros e vai para pagamento
        setErros({});
        setEtapa('pagamento');
    };

    const selecionarFormaPagamento = (forma: 'avista' | 'parcelado') => {
        setFormaPagamento(forma);
    };

    const gerarPIX = async () => {
        if (!formaPagamento) return;

        setIsLoading(true);

        try {
            if (config.integracoes?.modoPix === 'api') {
                // Modo API Ailos
                const response = await fetch('/api/pix/criar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        valor: valorPix,
                        txid: proposta.numero.replace('PROP', '') + Date.now().toString().slice(-6), // TxID único
                        devedor: {
                            nome: razaoSocial,
                            doc: cnpj
                        }
                    })
                });

                if (!response.ok) throw new Error('Falha ao criar Pix na API');

                const data = await response.json();

                // O backend retorna location, que deve ser renderizado em QR Code ou o Copia e Cola se disponível
                // Para mockup, o service retorna pixCopiaECola simulado
                setPixPayload(data.pixCopiaECola || data.location);

                // Em um cenário real, precisaríamos gerar o QR Code a partir do location se o banco não retornar o base64 direto
                // Como QrCodePix é estático, aqui apenas simulamos ou usamos a string retornada
                setPixQrCode('TODO: Gerar QR Code via biblioteca a partir da URL location');

                // Solução temporária: Usar o mesmo gerador visual para o payload retornado
                const qrCodePix = QrCodePix({
                    version: '01',
                    key: 'DUMMY', // Não importa, vamos sobrescrever o payload
                    name: 'DUMMY',
                    city: 'DUMMY',
                    message: 'DUMMY',
                    value: 0
                });

                // Hack para exibir o QR Code do payload retornado pela API
                // Na prática, usaríamos uma lib de QR Code genérica (ex: qrcode.react) passando a string 'data.location'
                // e não QrCodePix que serve para gerar payloads estáticos.
                // Vou manter o fluxo simples: se for API, setamos o payload.
                // A visualização do QR Code no componente provavelmente usa `pixQrCode` base64 image.
                // O correto seria ter um componente <QRCode value={location} />.

                // Para não adicionar nova dependência agora, vou manter o payload para copiar
                // e avisar que o QR Code visual é gerado via API (mock).
                setPixPayload(data.pixCopiaECola);

                // Se a API retornar imagem Base64 (ideal), usamos ela.
                // Se não, teríamos que gerar. O mock service eu fiz retornar pixCopiaECola.
                // Vou deixar um placeholder visual se não tiver imagem.
                setPixQrCode(data.imagemQrCodeInBase64 || '');

            } else {
                // Modo Estático (Original)
                const pixCNPJ = config.empresa.pixCNPJ.replace(/\D/g, '');

                const qrCodePix = QrCodePix({
                    version: '01',
                    key: pixCNPJ,
                    name: 'EXTREMA SOFTWARE',
                    city: 'SAO BENTO DO SUL',
                    transactionId: proposta.numero.replace('PROP', ''),
                    message: `Proposta ${proposta.numero}`,
                    value: valorPix,
                });

                const payload = qrCodePix.payload();
                const qrCode = await qrCodePix.base64();

                setPixPayload(payload);
                setPixQrCode(qrCode);
            }

            setEtapa('pix');
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            alert('Erro ao gerar QR Code PIX. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const copiarCodigoPix = async () => {
        const success = await copyToClipboard(pixPayload);
        if (success) {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 3000);
        }
    };

    const irParaComprovante = () => {
        // Atualizar proposta para status aguardando_pagamento
        const propostaAtualizada: Proposta = {
            ...proposta,
            status: 'aguardando_pagamento',
            updatedAt: new Date().toISOString(),
        };
        updateProposta(propostaAtualizada);
        setEtapa('comprovante');
    };

    const enviarComprovante = async () => {
        if (!comprovanteFile || !comprovantePreview) {
            setErros({ comprovante: 'Por favor, envie o comprovante de pagamento' });
            return;
        }

        setIsLoading(true);

        try {
            const dadosCadastrais: DadosCadastrais = {
                razaoSocial,
                nomeFantasia,
                cnpj,
                inscricaoEstadual,
                regimeTributario,
                endereco: {
                    rua: endereco,
                    numero,
                    complemento,
                    bairro,
                    cep,
                    cidade,
                    uf: estado,
                },
                responsavel: {
                    nome: responsavelNome,
                    cargo: responsavelCargo,
                    cpf: responsavelCpf,
                    rg: '',
                },
                telefone,
                email,
                contabilidade: {
                    nome: contabilidadeNome,
                    contato: contabilidadeContato,
                    telefone: contabilidadeTelefone,
                },
            };

            const aceitante = responsavelAceiteMesmoLegal ? responsavelNome : responsavelAceiteNome;

            const aceite: Aceite = {
                aceitoEm: new Date().toISOString(),
                formaPagamento: formaPagamento!,
                valorPagoPix: valorPix,
                pixPayload: pixPayload,
                dadosCadastrais: dadosCadastrais,
                comprovante: {
                    enviadoEm: new Date().toISOString(),
                    arquivoBase64: comprovantePreview,
                    nomeArquivo: comprovanteFile.name,
                    aprovado: null,
                    aprovadoPor: null,
                    aprovadoEm: null,
                    observacoes: observacoes,
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
        } catch (error) {
            console.error('Erro ao enviar comprovante:', error);
            alert('Erro ao enviar comprovante. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const etapaIndex = ['dados', 'pagamento', 'pix', 'comprovante', 'sucesso'].indexOf(etapa);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-extrema p-6 rounded-t-xl text-white sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {etapa === 'dados' ? 'Aceitar Proposta' : etapa === 'sucesso' ? 'Proposta Aceita' : 'Realizar Pagamento'}
                                {etapa === 'dados' && (
                                    <button
                                        onClick={handleAutofill}
                                        className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs transition-colors"
                                        title="Preencher com dados fictícios"
                                    >
                                        🪄
                                    </button>
                                )}
                            </h2>
                            <p className="text-white/90 text-sm mt-1">
                                {etapa === 'dados' && 'Passo 1: Dados Cadastrais'}
                                {etapa === 'pagamento' && 'Passo 2: Forma de Pagamento'}
                                {etapa === 'pix' && 'Passo 3: Pagamento via PIX'}
                                {etapa === 'comprovante' && 'Passo 4: Envio de Comprovante'}
                                {etapa === 'sucesso' && '✓ Proposta Aceita!'}
                            </p>
                        </div>
                        {etapa !== 'sucesso' && (
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {etapa !== 'sucesso' && (
                    <div className="px-6 pt-6 pb-8">
                        <div className="flex items-center justify-between">
                            {['dados', 'pagamento', 'pix', 'comprovante'].map((step, index) => {
                                const labels = {
                                    dados: 'Dados',
                                    pagamento: 'Pagamento',
                                    pix: 'PIX',
                                    comprovante: 'Comprovante'
                                };
                                const label = labels[step as keyof typeof labels];
                                const isActive = etapa === step;
                                const isCompleted = etapaIndex > index;

                                return (
                                    <div key={step} className="flex items-center flex-1 relative">
                                        <div className="relative flex flex-col items-center z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isActive ? 'bg-[#8B4FD3] text-white ring-4 ring-purple-100 scale-110 shadow-lg' :
                                                isCompleted ? 'bg-green-500 text-white' :
                                                    'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                                }`}>
                                                {isCompleted ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : index + 1}
                                            </div>
                                            <span className={`absolute top-10 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-extrema-purple' :
                                                isCompleted ? 'text-green-600' : 'text-gray-400'
                                                }`}>
                                                {label}
                                            </span>
                                        </div>
                                        {index < 3 && (
                                            <div className="flex-1 mx-4 relative">
                                                <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded"></div>
                                                <div className={`absolute inset-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'
                                                    }`}></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* ==================== ETAPA 1: DADOS CADASTRAIS ==================== */}
                    {etapa === 'dados' && (
                        <div className="space-y-6">
                            {/* Título da seção */}
                            <div className="border-b border-gray-200 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Dados da Empresa</h3>
                                <p className="text-sm text-gray-500">Preencha os dados cadastrais da Pessoa Jurídica</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* CNPJ */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cnpj}
                                            onChange={(e) => handleCnpjChange(e.target.value)}
                                            className={`input pr-10 ${erros.cnpj ? 'border-red-500 focus:ring-red-500' : cnpjValido === true ? 'border-green-500 focus:ring-green-500' : ''}`}
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            {isFetchingCnpj ? (
                                                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : cnpj.length === 18 && (
                                                cnpjValido === true ? <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>
                                            )}
                                        </div>
                                    </div>
                                    {erros.cnpj && <p className="text-xs text-red-600 mt-1">{erros.cnpj}</p>}
                                    {cnpjValido === true && !erros.cnpj && <p className="text-xs text-green-600 mt-1">✓ CNPJ válido</p>}
                                    {isFetchingCnpj && <p className="text-xs text-blue-600 mt-1">Buscando dados da empresa...</p>}
                                </div>

                                {/* Razão Social */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                                    <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className={`input ${erros.razaoSocial ? 'border-red-500' : ''}`} placeholder="Razão Social" />
                                    {erros.razaoSocial && <p className="text-xs text-red-600 mt-1">{erros.razaoSocial}</p>}
                                </div>

                                {/* Nome Fantasia */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                                    <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className={`input ${erros.nomeFantasia ? 'border-red-500' : ''}`} placeholder="Nome Fantasia" />
                                    {erros.nomeFantasia && <p className="text-xs text-red-600 mt-1">{erros.nomeFantasia}</p>}
                                </div>

                                {/* Endereço Completo */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                                    <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className={`input ${erros.endereco ? 'border-red-500' : ''}`} placeholder="Rua, Avenida, etc." />
                                    {erros.endereco && <p className="text-xs text-red-600 mt-1">{erros.endereco}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className={`input ${erros.numero ? 'border-red-500' : ''}`} placeholder="Nº" />
                                    {erros.numero && <p className="text-xs text-red-600 mt-1">{erros.numero}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                                    <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} className={`input ${erros.bairro ? 'border-red-500' : ''}`} placeholder="Bairro" />
                                    {erros.bairro && <p className="text-xs text-red-600 mt-1">{erros.bairro}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                    <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} className="input" placeholder="Sala, Apto..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                                    <input type="text" value={cep} onChange={(e) => setCep(mascaraCEP(e.target.value))} className={`input ${erros.cep ? 'border-red-500' : ''}`} placeholder="00000-000" maxLength={9} />
                                    {erros.cep && <p className="text-xs text-red-600 mt-1">{erros.cep}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                                    <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className={`input ${erros.cidade ? 'border-red-500' : ''}`} placeholder="Cidade" />
                                    {erros.cidade && <p className="text-xs text-red-600 mt-1">{erros.cidade}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UF *</label>
                                    <select value={estado} onChange={(e) => setEstado(e.target.value)} className={`input ${erros.estado ? 'border-red-500' : ''}`}>
                                        <option value="">Selecione...</option>
                                        <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option><option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option><option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                                    </select>
                                    {erros.estado && <p className="text-xs text-red-600 mt-1">{erros.estado}</p>}
                                </div>



                                {/* Inscrição Estadual */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                                    <input type="text" value={inscricaoEstadual} onChange={(e) => setInscricaoEstadual(e.target.value)} className="input" placeholder="Isento se não houver" />
                                </div>

                                {/* Regime Tributário */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Regime Tributário</label>
                                    <div className="flex flex-wrap gap-4">
                                        {['MEI', 'Simples Nacional', 'Lucro Presumido', 'Lucro Real'].map((regime) => (
                                            <label key={regime} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="regimeTributario"
                                                    checked={regimeTributario === regime}
                                                    onChange={() => setRegimeTributario(regime)}
                                                    className="mr-2 text-extrema-purple"
                                                />
                                                <span className="text-sm text-gray-700">{regime}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Seção Responsável */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-md font-semibold text-gray-900 mb-3">Responsável Legal</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                                        <input type="text" value={responsavelNome} onChange={(e) => setResponsavelNome(e.target.value)} className={`input ${erros.responsavelNome ? 'border-red-500' : ''}`} placeholder="Nome completo" />
                                        {erros.responsavelNome && <p className="text-xs text-red-600 mt-1">{erros.responsavelNome}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                                        <input type="text" value={responsavelCargo} onChange={(e) => setResponsavelCargo(e.target.value)} className={`input ${erros.responsavelCargo ? 'border-red-500' : ''}`} placeholder="Sócio, Diretor, etc." />
                                        {erros.responsavelCargo && <p className="text-xs text-red-600 mt-1">{erros.responsavelCargo}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF do Responsável *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={responsavelCpf}
                                                onChange={(e) => handleCpfChange(e.target.value)}
                                                className={`input pr-10 ${erros.responsavelCpf ? 'border-red-500 focus:ring-red-500' :
                                                    cpfValido === true ? 'border-green-500 focus:ring-green-500' : ''
                                                    }`}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                            {responsavelCpf.length === 14 && (
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    {cpfValido === true ? (
                                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : cpfValido === false ? (
                                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        {erros.responsavelCpf && <p className="text-xs text-red-600 mt-1">{erros.responsavelCpf}</p>}
                                        {cpfValido === true && <p className="text-xs text-green-600 mt-1">✓ CPF válido</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Seção Contato */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-md font-semibold text-gray-900 mb-3">Contato da Empresa</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/Celular *</label>
                                        <input type="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} className={`input ${erros.telefone ? 'border-red-500' : ''}`} placeholder="(00) 00000-0000" maxLength={15} />
                                        {erros.telefone && <p className="text-xs text-red-600 mt-1">{erros.telefone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`input ${erros.email ? 'border-red-500' : ''}`} placeholder="email@empresa.com.br" />
                                        {erros.email && <p className="text-xs text-red-600 mt-1">{erros.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Seção Contabilidade */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-md font-semibold text-gray-900 mb-3">Contabilidade</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome/Escritório de Contabilidade *</label>
                                        <input type="text" value={contabilidadeNome} onChange={(e) => setContabilidadeNome(e.target.value)} className={`input ${erros.contabilidadeNome ? 'border-red-500' : ''}`} placeholder="Nome da contabilidade" />
                                        {erros.contabilidadeNome && <p className="text-xs text-red-600 mt-1">{erros.contabilidadeNome}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa de Contato *</label>
                                        <input type="text" value={contabilidadeContato} onChange={(e) => setContabilidadeContato(e.target.value)} className={`input ${erros.contabilidadeContato ? 'border-red-500' : ''}`} placeholder="Nome do contato" />
                                        {erros.contabilidadeContato && <p className="text-xs text-red-600 mt-1">{erros.contabilidadeContato}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Contabilidade *</label>
                                        <input type="tel" value={contabilidadeTelefone} onChange={(e) => setContabilidadeTelefone(mascaraTelefone(e.target.value))} className={`input ${erros.contabilidadeTelefone ? 'border-red-500' : ''}`} placeholder="(00) 00000-0000" maxLength={15} />
                                        {erros.contabilidadeTelefone && <p className="text-xs text-red-600 mt-1">{erros.contabilidadeTelefone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Responsável pelo Aceite */}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-md font-semibold text-gray-900 mb-3">Pessoa que está confirmando a proposta</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={responsavelAceiteMesmoLegal}
                                            onChange={(e) => {
                                                setResponsavelAceiteMesmoLegal(e.target.checked);
                                                if (e.target.checked) setResponsavelAceiteNome('');
                                            }}
                                            className="w-4 h-4 text-extrema-purple border-gray-300 rounded focus:ring-extrema-purple"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            A confirmação está sendo feita pelo responsável legal da empresa.
                                        </span>
                                    </label>

                                    {!responsavelAceiteMesmoLegal && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                                            <input
                                                type="text"
                                                value={responsavelAceiteNome}
                                                onChange={(e) => setResponsavelAceiteNome(e.target.value)}
                                                className={`input ${erros.responsavelAceite && !responsavelAceiteNome ? 'border-red-500' : ''}`}
                                                placeholder="Nome de quem confirmou a proposta"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Informação registrada apenas para controle interno.</p>
                                            {erros.responsavelAceite && !responsavelAceiteNome && <p className="text-xs text-red-600 mt-1">{erros.responsavelAceite}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Termos */}
                            <div className="pt-4 border-t border-gray-200">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={aceitouTermos}
                                        onChange={(e) => setAceitouTermos(e.target.checked)}
                                        className="mt-1 mr-3 w-4 h-4 text-extrema-purple border-gray-300 rounded focus:ring-extrema-purple"
                                    />
                                    <span className="text-sm text-gray-700">Declaro que li e aceito os termos da proposta comercial e confirmo que os dados cadastrais acima são verdadeiros.</span>
                                </label>
                                {erros.termos && <p className="text-xs text-red-600 mt-1">{erros.termos}</p>}
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-4">
                                <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
                                <button onClick={validarEContinuar} className="btn btn-primary">Continuar para Pagamento →</button>
                            </div>
                        </div>
                    )}

                    {/* ==================== ETAPA 2: FORMA DE PAGAMENTO ==================== */}
                    {etapa === 'pagamento' && (
                        <div className="space-y-6">

                            <p className="text-gray-600 text-center">
                                Escolha a forma de pagamento que preferir:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* À Vista */}
                                <button
                                    onClick={() => selecionarFormaPagamento('avista')}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${formaPagamento === 'avista'
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">À Vista</h3>
                                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                                            -{proposta.valores.descontoAvistaPercentual}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-through mb-1">
                                        {formatCurrency(proposta.valores.investimentoInicial)}
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(proposta.valores.valorAvista)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Economia de {formatCurrency(proposta.valores.descontoAvistaValor)}
                                    </p>
                                </button>

                                {/* Parcelado */}
                                <button
                                    onClick={() => selecionarFormaPagamento('parcelado')}
                                    className={`p-6 rounded-xl border-2 text-left transition-all ${formaPagamento === 'parcelado'
                                        ? 'border-extrema-purple bg-purple-50 ring-2 ring-purple-200'
                                        : 'border-gray-200 hover:border-extrema-purple/50 hover:bg-purple-50/50'
                                        }`}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Parcelado</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {proposta.valores.parcelamento.qtdParcelas}x sem juros
                                    </p>
                                    <p className="text-2xl font-bold text-extrema-purple">
                                        {formatCurrency(proposta.valores.parcelamento.valorParcela)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Total: {formatCurrency(proposta.valores.parcelamento.valorTotal)}
                                    </p>
                                </button>
                            </div>

                            {formaPagamento && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-blue-800">
                                                {formaPagamento === 'avista'
                                                    ? 'Pagamento único via PIX com desconto especial.'
                                                    : `Entrada via PIX (${formatCurrency(proposta.valores.parcelamento.valorParcela)}) + ${proposta.valores.parcelamento.qtdParcelas - 1} boleto(s).`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Compartilhamento - Fase 2 Refinada */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <span className="block text-sm font-medium text-gray-700 mb-2">
                                    Não é você quem vai pagar? Envie para o financeiro:
                                </span>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => {
                                            const text = `Olá! Segue a proposta *${proposta.numero}* da Extrema Sistema.\nValor à vista: *${formatCurrency(proposta.valores.valorAvista)}*\n\nLink para pagamento: ${window.location.href}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="bg-white text-green-600 border border-green-200 hover:bg-green-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Enviar por WhatsApp"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp
                                    </button>

                                    <button
                                        onClick={() => {
                                            const subject = `Link para pagamento da Proposta ${proposta.numero}`;
                                            const body = `Olá,\n\nSegue a proposta ${proposta.numero} da Extrema Sistema.\nValor à vista: ${formatCurrency(proposta.valores.valorAvista)}\n\nLink para pagamento: ${window.location.href}\n\nAtenciosamente,`;
                                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        }}
                                        className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Enviar por Email"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email
                                    </button>

                                    <button
                                        onClick={() => {
                                            copyToClipboard(window.location.href);
                                            setLinkCopiado(true);
                                            setTimeout(() => setLinkCopiado(false), 3000);
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${linkCopiado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-extrema-purple hover:border-purple-200'}`}
                                        title="Copiar Link"
                                    >
                                        {linkCopiado ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copiar Link
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 flex items-center">
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Seus dados já estão salvos. O responsável financeiro continuará exatamente deste ponto.
                                </p>
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-4">
                                <button onClick={() => setEtapa('dados')} className="btn btn-secondary">
                                    ← Voltar
                                </button>
                                <button
                                    onClick={gerarPIX}
                                    disabled={!formaPagamento || isLoading}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    {isLoading ? 'Gerando PIX...' : 'Continuar para PIX →'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== ETAPA 3: PIX ==================== */}
                    {etapa === 'pix' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600 mb-2">Valor a pagar via PIX:</p>
                                <p className="text-3xl font-bold text-extrema-purple">
                                    {formatCurrency(valorPix)}
                                </p>
                                {formaPagamento === 'parcelado' && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        (Entrada - 1ª parcela)
                                    </p>
                                )}
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                                    {pixQrCode && (
                                        <img
                                            src={pixQrCode}
                                            alt="QR Code PIX"
                                            className="w-56 h-56"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Código Copia e Cola */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Código PIX (Copia e Cola):</p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={pixPayload}
                                        readOnly
                                        className="input flex-1 text-xs bg-white"
                                    />
                                    <button
                                        onClick={copiarCodigoPix}
                                        className={`btn ${copiado ? 'bg-green-500 text-white' : 'btn-primary'} whitespace-nowrap`}
                                    >
                                        {copiado ? '✓ Copiado!' : '📋 Copiar'}
                                    </button>
                                </div>
                            </div>

                            {/* Instruções */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800 mb-1">Como pagar:</p>
                                        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                                            <li>Abra o app do seu banco</li>
                                            <li>Escolha pagar via PIX com QR Code ou Copia e Cola</li>
                                            <li>Escaneie o QR Code ou cole o código acima</li>
                                            <li>Confirme o pagamento</li>
                                            <li>Salve o comprovante e envie no próximo passo</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-4">
                                <button onClick={() => setEtapa('pagamento')} className="btn btn-secondary">
                                    ← Voltar
                                </button>
                                <button onClick={irParaComprovante} className="btn btn-primary">
                                    Já paguei, enviar comprovante →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== ETAPA 4: COMPROVANTE ==================== */}
                    {etapa === 'comprovante' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Envie o comprovante de pagamento
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Anexe o comprovante do PIX no valor de {formatCurrency(valorPix)}
                                </p>
                            </div>

                            {/* Dropzone */}
                            <div
                                {...getRootProps()}
                                className={`dropzone-area border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                                    ${isDragActive ? 'border-extrema-purple bg-purple-50 scale-[1.02]' : 'border-gray-300 hover:border-extrema-purple hover:bg-gray-50'}`}
                            >
                                <input {...getInputProps()} />

                                {!comprovantePreview && !isLoading && (
                                    <>
                                        <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">
                                            Clique para enviar ou arraste o arquivo aqui
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            (PDF, JPG ou PNG de até 5MB)
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-1 px-3 rounded-full mx-auto w-fit">
                                            <span className="font-bold">Dica:</span>
                                            Você também pode pressionar <kbd className="font-mono bg-white border border-gray-200 rounded px-1">Ctrl+V</kbd> para colar
                                        </div>
                                    </>
                                )}

                                {isLoading && (
                                    <div className="py-4">
                                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-extrema-purple transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium animate-pulse">
                                            Processando arquivo... {uploadProgress}%
                                        </p>
                                    </div>
                                )}

                                {comprovantePreview && !isLoading && (
                                    <div className="relative group">
                                        {comprovanteFile?.type.includes('image') ? (
                                            <img src={comprovantePreview} alt="Comprovante" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
                                                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">{comprovanteFile?.name}</span>
                                                <span className="text-xs text-gray-500 mt-1">PDF Document</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <p className="text-white font-medium">Clique para alterar</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {erros.comprovante && (
                                <p className="text-sm text-red-600 text-center">{erros.comprovante}</p>
                            )}

                            {/* Observações */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações (opcional)
                                </label>
                                <textarea
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    className="input min-h-[80px]"
                                    placeholder="Alguma informação adicional sobre o pagamento..."
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-4">
                                <button onClick={() => setEtapa('pix')} className="btn btn-secondary">
                                    ← Voltar
                                </button>
                                <button
                                    onClick={enviarComprovante}
                                    disabled={!comprovanteFile || isLoading}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar e Finalizar ✓'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================== ETAPA 5: SUCESSO ==================== */}
                    {etapa === 'sucesso' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Proposta Aceita com Sucesso! 🎉
                            </h3>

                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Recebemos seu comprovante de pagamento. Nossa equipe irá verificar e entrar em contato em breve para dar continuidade ao processo.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                                <p className="text-sm text-gray-600">Número da Proposta:</p>
                                <p className="text-lg font-bold text-extrema-purple">{proposta.numero}</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                                <h4 className="font-medium text-blue-900 mb-2">📋 Próximos passos:</h4>
                                <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                                    <li>Verificação do comprovante (até 24h úteis)</li>
                                    <li>Envio do contrato por email</li>
                                    <li>Assinatura digital</li>
                                    <li>Agendamento da implantação</li>
                                </ol>
                            </div>

                            <button onClick={onClose} className="btn btn-primary w-full max-w-xs">
                                Fechar
                            </button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                                <span>Dúvidas? Entre em contato:</span>
                                <a
                                    href="https://api.whatsapp.com/send?phone=5547996818985"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-extrema-purple hover:underline font-medium"
                                >
                                    <svg className="w-4 h-4 text-[#25D366] mr-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    (47) 99681-8985
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
