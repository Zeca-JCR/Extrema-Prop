import { getConfiguracoes } from './storage';

// Interfaces baseadas na documentação PDF
interface AilosTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

interface CobrancaImediataInput {
    calendario: {
        expiracao: number; // segundos
    };
    devedor?: {
        cpf?: string;
        cnpj?: string;
        nome?: string;
    };
    valor: {
        original: string; // "100.00"
    };
    chave: string;
    solicitacaoPagador?: string;
}

export interface CobrancaResponse {
    txid: string;
    pixCopiaECola: string; // Campo simulado/adaptado pois a doc PDF mostra retorno completo com location, mas não explicita o campo "brcode" direto no response do POST /cob, geralmente se pega no /loc ou gera localmente. *CORREÇÃO*: O PDF menciona "location". Com o location, gera-se o QR Code.
    location: string;
    status: string;
    calendario: {
        criacao: string;
        expiracao: number;
    };
}

export class AilosService {
    private static instance: AilosService;
    private baseUrl: string = 'https://pixcobranca-h.ailos.coop.br/qa/ailos/pix-cobranca/api/v1'; // Homologação

    private constructor() { }

    public static getInstance(): AilosService {
        if (!AilosService.instance) {
            AilosService.instance = new AilosService();
        }
        return AilosService.instance;
    }

    /**
     * Simula a obtenção de um token OAuth2 usando mTLS.
     * Em produção (Node.js), isso leria os certificados do disco e usaria https.Agent.
     */
    private async authenticate(): Promise<string> {
        const config = getConfiguracoes();

        console.log('🔐 AilosService: Simulando autenticação com mTLS...');
        console.log(`📋 ClientID: ${config.integracoes.ailos.clientId}`);

        // Simulação de delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Retorna um token fake para testes locais
        return 'mock_access_token_' + Date.now();
    }

    /**
     * Cria uma cobrança imediata.
     */
    public async criarCobranca(valor: number, txid: string, devedor?: { nome: string, doc: string }): Promise<CobrancaResponse> {
        // 1. Autenticar
        const token = await this.authenticate();

        const config = getConfiguracoes();

        console.log(`💰 AilosService: Criando cobrança de R$ ${valor} com TxID ${txid}`);

        // Body conforme documentação
        const body: CobrancaImediataInput = {
            calendario: {
                expiracao: 3600 // 1 hora
            },
            valor: {
                original: valor.toFixed(2)
            },
            chave: 'chave_pix_teste@ailos.com.br', // Deveria vir da config, mas por enquanto hardcoded para teste structure
            solicitacaoPagador: `Proposta #${txid}`
        };

        if (devedor) {
            body.devedor = {
                nome: devedor.nome,
            };
            if (devedor.doc.length > 11) {
                body.devedor.cnpj = devedor.doc.replace(/\D/g, '');
            } else {
                body.devedor.cpf = devedor.doc.replace(/\D/g, '');
            }
        }

        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            txid: txid,
            location: 'pix.example.com/qr/v2/mocklocation123',
            pixCopiaECola: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Cicrano de Tal6008BRASILIA62070503***6304E2CA', // Exemplo estático
            status: 'ATIVA',
            calendario: {
                criacao: new Date().toISOString(),
                expiracao: 3600
            }
        };
    }
}
