import { NextResponse } from 'next/server';
import { AilosService } from '@/lib/ailos';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { valor, txid, devedor } = body;

        if (!valor || !txid) {
            return NextResponse.json({ error: 'Valor e TxID são obrigatórios' }, { status: 400 });
        }

        const service = AilosService.getInstance();
        const cobranca = await service.criarCobranca(valor, txid, devedor);

        return NextResponse.json(cobranca);
    } catch (error) {
        console.error('Erro ao criar cobrança Pix:', error);
        return NextResponse.json({ error: 'Erro interno ao processar Pix' }, { status: 500 });
    }
}
