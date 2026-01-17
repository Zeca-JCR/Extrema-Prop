import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combinar classes Tailwind
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Formatar moeda
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

// Formatar data
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(d);
    }

    return new Intl.DateTimeFormat('pt-BR').format(d);
}

// Formatar data/hora
export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

// Gerar hash único para URL pública
export function generateHash(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Gerar número de proposta
export function generatePropostaNumero(numero: number): string {
    return `PROP${String(numero).padStart(3, '0')}`;
}

// Calcular desconto à vista
export function calcularDescontoAvista(
    valorTotal: number,
    percentualDesconto: number
): { valorDesconto: number; valorFinal: number } {
    const valorDesconto = (valorTotal * percentualDesconto) / 100;
    const valorFinal = valorTotal - valorDesconto;

    return {
        valorDesconto: Number(valorDesconto.toFixed(2)),
        valorFinal: Number(valorFinal.toFixed(2)),
    };
}

// Calcular data de validade
export function calcularDataValidade(dias: number): string {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data.toISOString().split('T')[0];
}

// Verificar se proposta está expirada
export function isPropostaExpirada(dataValidade: string): boolean {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    return validade < hoje;
}

// Calcular dias restantes até validade
export function diasRestantes(dataValidade: string): number {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diff = validade.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Obter cor do status
export function getStatusColor(
    status: string
): { bg: string; text: string; badge: string } {
    const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
        rascunho: {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            badge: 'badge-rascunho',
        },
        enviada: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            badge: 'badge-enviada',
        },
        aguardando_pagamento: {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            badge: 'badge-aguardando',
        },
        comprovante_enviado: {
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            badge: 'badge-comprovante',
        },
        paga: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            badge: 'badge-paga',
        },
        aceita: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            badge: 'badge-paga',
        },
        recusada: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            badge: 'badge-recusada',
        },
        expirada: {
            bg: 'bg-gray-200',
            text: 'text-gray-600',
            badge: 'badge-expirada',
        },
    };

    return statusColors[status] || statusColors.rascunho;
}

// Obter label do status
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        rascunho: 'Rascunho',
        enviada: 'Enviada',
        aguardando_pagamento: 'Aguardando Pagamento',
        comprovante_enviado: 'Comprovante Enviado',
        paga: 'Paga',
        aceita: 'Aceita',
        recusada: 'Recusada',
        expirada: 'Expirada',
    };

    return labels[status] || status;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copiar para clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Erro ao copiar para clipboard:', error);
        return false;
    }
}

// Download de arquivo
export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Converter base64 para Blob
export function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeType });
}

// Ler arquivo como base64
export function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Validar tamanho de arquivo (em MB)
export function validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

// Validar tipo de arquivo
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
}

// Gerar descrição automática de condições de pagamento
export function gerarDescricaoCondicoes(
    investimentoInicial: number,
    qtdParcelas: number,
    valorParcela: number,
    mensalidade: number
): string {
    const valorInvestimentoFormatado = formatCurrency(investimentoInicial);

    // Caso 1: Pagamento à vista (0 ou 1 parcela)
    if (qtdParcelas <= 1) {
        return `Pagamento à vista de ${valorInvestimentoFormatado} via PIX na assinatura do contrato.\n\nMensalidade de ${formatCurrency(mensalidade)} iniciada após 30 dias.`;
    }

    // Caso 2: Parcelado
    const valorParcelaFormatado = formatCurrency(valorParcela);
    const qtdBoletos = qtdParcelas - 1;
    const diasDesc = qtdBoletos === 1 ? '30 dias' : `30, 60${qtdBoletos > 2 ? '...' : ''} dias`;
    const labelBoletos = qtdBoletos === 1 ? 'boleto' : 'boletos';

    return `Entrada via PIX + ${qtdBoletos} ${labelBoletos} de ${valorParcelaFormatado} (${diasDesc}).\nTotalizando ${valorInvestimentoFormatado}.\n\nMensalidade de ${formatCurrency(mensalidade)} iniciada após 30 dias da assinatura.`;
}
