import { jsPDF } from 'jspdf';
import type { Proposta } from './storage';
import { formatCurrency, formatDate } from './utils';

// Cores da Extrema
const COLORS = {
    purple: [139, 79, 211] as [number, number, number],
    darkPurple: [108, 99, 255] as [number, number, number],
    yellow: [255, 217, 61] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    lightGray: [249, 250, 251] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    black: [17, 24, 39] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
};

export async function gerarPDFProposta(proposta: Proposta, options?: { comAceite?: boolean }): Promise<void> {
    console.log('🏁 Iniciando geração do PDF...', { numero: proposta.numero, options });

    try {
        const doc = new jsPDF();
        console.log('✅ jsPDF inicializado com sucesso');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = 20;

        // Determinar quais dados usar (Original vs Aceite/Rascunho)
        const dadosCadastrais = options?.comAceite
            ? (proposta.aceite?.dadosCadastrais || proposta.dadosCadastrais)
            : null;


        // ==================== HEADER ====================
        // Fundo do header
        doc.setFillColor(...COLORS.purple);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Título
        doc.setTextColor(...COLORS.white);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('PROPOSTA COMERCIAL', margin, 25);

        // Número da proposta
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(proposta.numero, margin, 35);

        // Data de validade (direita)
        doc.setFontSize(10);
        const validadeText = `Válida até: ${formatDate(proposta.dataValidade, 'long')}`;
        const validadeWidth = doc.getTextWidth(validadeText);
        doc.text(validadeText, pageWidth - margin - validadeWidth, 35);

        yPos = 55;

        // ==================== DADOS DA EMPRESA (EXTREMA) ====================
        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(9);
        doc.text('Extrema Software de Gestão Empresarial', margin, yPos);
        doc.text('CNPJ: 18.866.315/0001-81', margin, yPos + 5);
        doc.text('comercial@extrematecnologia.com.br | (47) 99681-8985', margin, yPos + 10);

        yPos += 25;

        // ==================== DADOS DO CLIENTE ====================
        doc.setFillColor(...COLORS.lightGray);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');

        doc.setTextColor(...COLORS.black);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE', margin + 5, yPos + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (dadosCadastrais) {
            // Usar dados completos do cadastro
            doc.text(`Razão Social: ${dadosCadastrais.razaoSocial}`, margin + 5, yPos + 16);
            doc.text(`CNPJ: ${dadosCadastrais.cnpj}`, margin + 5, yPos + 23);
            doc.text(`Responsável: ${dadosCadastrais.responsavel.nome} (${dadosCadastrais.responsavel.cargo})`, margin + 5, yPos + 30);

            // Email e Telefone (Direita)
            const contatoX = pageWidth / 2 + 10;
            doc.text(`Email: ${dadosCadastrais.email}`, contatoX, yPos + 16);
            doc.text(`Telefone: ${dadosCadastrais.telefone}`, contatoX, yPos + 23);

            // Endereço (Abaixo)
            const end = dadosCadastrais.endereco;
            const endStr = `${end.rua}, ${end.numero}${end.complemento ? ' - ' + end.complemento : ''} - ${end.bairro}, ${end.cidade}/${end.uf}`;
            doc.text(`End: ${endStr}`, margin + 5, yPos + 37);

        } else {
            // Usar dados simplificados da proposta original
            doc.text(`Empresa: ${proposta.cliente.empresa}`, margin + 5, yPos + 16);
            doc.text(`Contato: ${proposta.cliente.contato}`, margin + 5, yPos + 23);
            doc.text(`Email: ${proposta.cliente.email}`, margin + 5, yPos + 30);

            // Telefone (direita)
            const telefoneText = `Telefone: ${proposta.cliente.telefone}`;
            doc.text(telefoneText, pageWidth / 2 + 10, yPos + 23);
        }

        yPos += 45;

        // ==================== PRODUTO/SERVIÇO ====================
        doc.setFillColor(...COLORS.purple);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUTO/SERVIÇO', margin + 5, yPos + 6);

        yPos += 12;

        doc.setTextColor(...COLORS.black);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(proposta.produto.nome, margin, yPos + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.gray);

        // Descrição com quebra de linha
        const descricaoLines = doc.splitTextToSize(proposta.produto.descricao, pageWidth - 2 * margin);
        doc.text(descricaoLines, margin, yPos + 13);

        yPos += 13 + descricaoLines.length * 5 + 5;

        // Módulos incluídos
        doc.setTextColor(...COLORS.black);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Módulos/Funcionalidades Incluídas:', margin, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.gray);

        proposta.produto.modulos.forEach((modulo, index) => {
            doc.setFillColor(...COLORS.green);
            doc.circle(margin + 3, yPos + 1, 1.5, 'F');
            doc.text(modulo, margin + 8, yPos + 3);
            yPos += 6;
        });

        yPos += 10;


        // ==================== VALORES ====================
        doc.setFillColor(...COLORS.purple);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('INVESTIMENTO', margin + 5, yPos + 6);

        yPos += 15;

        // Tabela de valores
        const colWidth = (pageWidth - 2 * margin) / 2 - 5;

        // Coluna À Vista
        doc.setFillColor(236, 253, 245); // green-50
        doc.rect(margin, yPos, colWidth, 45, 'F');

        doc.setTextColor(...COLORS.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Pagamento à Vista', margin + 5, yPos + 8);

        doc.setFillColor(...COLORS.green);
        doc.roundedRect(margin + colWidth - 25, yPos + 3, 20, 7, 1, 1, 'F');
        doc.setTextColor(...COLORS.white);
        doc.setFontSize(8);
        doc.text(`-${proposta.valores.descontoAvistaPercentual}%`, margin + colWidth - 22, yPos + 8);

        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Valor original: ${formatCurrency(proposta.valores.investimentoInicial)}`, margin + 5, yPos + 18);
        doc.text(`Desconto: -${formatCurrency(proposta.valores.descontoAvistaValor)}`, margin + 5, yPos + 25);

        doc.setTextColor(...COLORS.green);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatCurrency(proposta.valores.valorAvista)}`, margin + 5, yPos + 38);

        // Coluna Parcelado
        const col2X = margin + colWidth + 10;
        doc.setFillColor(...COLORS.lightGray);
        doc.rect(col2X, yPos, colWidth, 45, 'F');

        doc.setTextColor(...COLORS.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Pagamento Parcelado', col2X + 5, yPos + 8);

        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${proposta.valores.parcelamento.qtdParcelas}x sem juros`, col2X + 5, yPos + 18);
        doc.text(`Valor da parcela: ${formatCurrency(proposta.valores.parcelamento.valorParcela)}`, col2X + 5, yPos + 25);

        doc.setTextColor(...COLORS.purple);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatCurrency(proposta.valores.parcelamento.valorTotal)}`, col2X + 5, yPos + 38);

        yPos += 55;

        // ==================== MENSALIDADE ====================
        doc.setFillColor(...COLORS.purple);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Mensalidade Recorrente', margin + 5, yPos + 8);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatCurrency(proposta.valores.mensalidade)}/mês`, margin + 5, yPos + 20);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const mensalidadeInfo = 'Cobrada após 30 dias da assinatura';
        doc.text(mensalidadeInfo, pageWidth - margin - doc.getTextWidth(mensalidadeInfo) - 5, yPos + 15);

        yPos += 35;

        // ==================== CONDIÇÕES DE PAGAMENTO ====================
        doc.setTextColor(...COLORS.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Condições de Pagamento:', margin, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.gray);

        const condicoesLines = doc.splitTextToSize(proposta.condicoesPagamento, pageWidth - 2 * margin);
        doc.text(condicoesLines, margin, yPos);

        yPos += condicoesLines.length * 5 + 15;

        // ==================== DADOS DO ACEITE & COMPROVANTE ====================
        if (options?.comAceite && proposta.aceite) {
            doc.addPage();
            yPos = 20;

            // Título Aceite
            doc.setFillColor(...COLORS.purple);
            doc.rect(0, 0, pageWidth, 30, 'F');
            doc.setTextColor(...COLORS.white);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('REGISTRO DE ACEITE', margin, 20);

            yPos = 50;

            doc.setTextColor(...COLORS.black);
            doc.setFontSize(12);
            doc.text('Dados do Pagamento', margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            // Forma pagamento
            const forma = proposta.aceite.formaPagamento === 'avista' ? 'PIX à Vista' : 'Entrada + Parcelamento';
            doc.text(`Forma de Pagamento: ${forma}`, margin, yPos);
            yPos += 7;

            doc.text(`Valor Pago: ${formatCurrency(proposta.aceite.valorPagoPix)}`, margin, yPos);
            yPos += 7;

            doc.text(`Data do Aceite: ${formatDate(proposta.aceite.aceitoEm)}`, margin, yPos);
            yPos += 15;

            // Comprovante
            if (proposta.aceite.comprovante?.arquivoBase64) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Comprovante em Anexo', margin, yPos);
                yPos += 10;

                const imgData = proposta.aceite.comprovante.arquivoBase64;
                if (imgData.startsWith('data:image')) {
                    try {
                        // Ajustar imagem para caber na página
                        const maxWidth = pageWidth - 2 * margin;
                        const maxHeight = pageHeight - yPos - margin;

                        // Adiciona imagem (assumindo que cabe, o ideal seria calcular ratio)
                        // Para simplicidade, vamos fixar largura e deixar altura automática (se jsPDF suportar) ou quadrada
                        doc.addImage(imgData, 'JPEG', margin, yPos, maxWidth, 0);
                    } catch (e) {
                        doc.setFontSize(10);
                        doc.setTextColor(...COLORS.red);
                        doc.text('Não foi possível renderizar a imagem do comprovante.', margin, yPos + 10);
                    }
                } else {
                    doc.setFontSize(10);
                    doc.setTextColor(...COLORS.gray);
                    doc.text('O comprovante está em formato PDF e não pode ser exibido aqui.', margin, yPos + 10);
                }
            }
        }

        // ==================== FOOTER ====================
        const footerY = doc.internal.pageSize.getHeight() - 25;

        doc.setDrawColor(...COLORS.purple);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY, pageWidth - margin, footerY);

        doc.setTextColor(...COLORS.gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const footerText1 = 'Extrema Software de Gestão Empresarial | São Bento do Sul-SC | Balneário Piçarras-SC';
        const footerText2 = 'comercial@extrematecnologia.com.br | (47) 99681-8985 | (47) 3633-4255';

        doc.text(footerText1, pageWidth / 2, footerY + 8, { align: 'center' });
        doc.text(footerText2, pageWidth / 2, footerY + 14, { align: 'center' });

        // ==================== DOWNLOAD ====================
        const suffix = options?.comAceite ? '_ACEITA' : '';
        const fileName = `Proposta_${proposta.numero}_${proposta.cliente.empresa.replace(/\s+/g, '_')}${suffix}.pdf`;

        console.log('✅ Salvando PDF:', fileName);
        doc.save(fileName);
        console.log('🏁 PDF gerado e salvo com sucesso');

    } catch (error) {
        console.error('❌ Erro fatal ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Consulte o console para mais detalhes.');
        throw error;
    }
}
