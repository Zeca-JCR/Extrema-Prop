# Sistema de Propostas Comerciais - Extrema Tecnologia

Sistema web completo para automatizar o processo de criação, envio, aceite e pagamento de propostas comerciais da Extrema Tecnologia.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária com cores customizadas da Extrema
- **LocalStorage** - Armazenamento temporário (migração para Supabase posteriormente)
- **jsPDF** - Geração de PDFs profissionais
- **qrcode-pix** - Geração de QR Code PIX padrão EMV
- **React Hook Form + Zod** - Formulários com validação
- **date-fns** - Manipulação de datas

## 🎨 Identidade Visual

O sistema utiliza as cores oficiais da Extrema:

- **Roxo Principal:** `#8B4FD3` (Extrema Purple)
- **Amarelo/Dourado:** `#FFD93D` (Acento)
- **Roxo Azulado:** `#6C63FF` (Accent)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🗂️ Estrutura do Projeto

```
propostas/
├── app/                          # App Router do Next.js
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Página inicial (redireciona)
│   ├── login/                   # Tela de login
│   ├── admin/                   # Painel administrativo
│   └── proposta/[hash]/         # Página pública da proposta
├── components/
│   ├── admin/                   # Componentes do admin
│   ├── public/                  # Componentes da página pública
│   └── ui/                      # Componentes UI base
├── lib/
│   ├── storage.ts               # Sistema de LocalStorage
│   ├── utils.ts                 # Utilitários gerais
│   ├── validators.ts            # Validações e máscaras
│   ├── pix.ts                   # Geração de PIX EMV
│   └── pdf.ts                   # Geração de PDFs
└── public/
    └── extrema-logo.jpg         # Logo da empresa
```

## 👥 Usuários de Teste

### Admin
- **Email:** admin@extrematecnologia.com.br
- **Senha:** admin123
- **Permissões:** Vê todas as propostas de todos os vendedores

### Vendedor
- **Email:** vendedor@extrematecnologia.com.br
- **Senha:** vend123
- **Permissões:** Vê apenas suas próprias propostas

## 🔄 Fluxo Completo

1. **Vendedor** faz login no painel
2. Cria nova proposta (ou usa template)
3. Sistema gera URL única e hash seguro
4. Vendedor compartilha link com cliente (WhatsApp, email, etc.)
5. **Cliente** acessa link e visualiza proposta profissional
6. Cliente aceita proposta e preenche dados cadastrais
7. Cliente escolhe forma de pagamento (à vista ou parcelado)
8. Sistema gera QR Code PIX automaticamente
9. Cliente realiza pagamento e faz upload do comprovante
10. Sistema atualiza status e exibe tela de sucesso
11. **Vendedor** recebe notificação e aprova comprovante no painel

## 📝 Templates de Produtos

O sistema vem com 1 template pré-configurado:

- **Uniplus Desktop Básico**
  - Investimento: R$ 1.170,00
  - À vista (5% desc): R$ 1.111,50
  - Parcelado: 1+2x R$ 390,00
  - Mensalidade: R$ 199,90/mês

Outros produtos do portfólio:
- Uniplus Web Básico
- Uniplus Web Avançado
- Uniplus Desktop Avançado
- Overall ERP Web

## 💳 PIX

O sistema implementa o padrão EMV do Banco Central do Brasil para geração de QR Codes PIX, garantindo compatibilidade com todos os bancos e apps de pagamento.

**Chave PIX (CNPJ):** 18.866.315/0001-81

## 🎯 Status das Propostas

- 🔵 **Rascunho** - Proposta em criação
- 🔵 **Enviada** - Link compartilhado com cliente
- 🟠 **Aguardando Pagamento** - Cliente aceitou, aguardando PIX
- 🟣 **Comprovante Enviado** - Cliente enviou comprovante
- 🟢 **Paga** - Pagamento aprovado pelo vendedor
- ✅ **Aceita** - Proposta aceita e finalizada
- 🔴 **Recusada** - Proposta recusada pelo cliente
- ⚫ **Expirada** - Prazo de validade vencido

## 🔧 Configurações da Empresa

As configurações da Extrema estão pré-cadastradas no sistema:

- **Razão Social:** Extrema Software de Gestão Empresarial
- **CNPJ:** 18.866.315/0001-81
- **Email:** comercial@extrematecnologia.com.br
- **Telefones:** (47) 99681-8985 | (47) 3633-4255
- **Endereços:** São Bento do Sul-SC | Balneário Piçarras-SC

**Dados Bancários:**
- Banco 085 - Cooperativa Central Ailos
- Agência: 0112-0
- Conta: 16916-1

## 📊 Dados de Desenvolvimento

Todos os dados são armazenados no LocalStorage do navegador com as seguintes chaves:

- `extrema_propostas` - Propostas comerciais
- `extrema_templates` - Templates de produtos
- `extrema_users` - Usuários do sistema
- `extrema_current_user` - Usuário logado
- `extrema_configuracoes` - Configurações da empresa

> **Nota:** Os dados são temporários e serão perdidos ao limpar o cache do navegador. Para dados persistentes, use a versão com Supabase.

## 🚀 Próximas Fases

### Sprint 1: Fundação ✅
- [x] Setup do projeto
- [x] Configuração Tailwind com cores da Extrema
- [x] Sistema de LocalStorage
- [x] Validadores e utilitários

### Sprint 2: Painel Admin (Em andamento)
- [ ] Autenticação mock
- [ ] CRUD de propostas
- [ ] Sistema de templates
- [ ] Dashboard de métricas

### Sprint 3: Página Pública
- [ ] Visualização da proposta
- [ ] Geração de PDF
- [ ] URL única com hash

### Sprint 4: Fluxo de Aceite
- [ ] Multi-step form
- [ ] Geração de PIX
- [ ] Upload de comprovante
- [ ] Tela de sucesso

### Sprint 5: Polimento
- [ ] Responsividade total
- [ ] Animações e micro-interações
- [ ] Testes de fluxo completo

## 📱 Roadmap Futuro

- [ ] Migração para Supabase (banco de dados + autenticação)
- [ ] Notificações por email (SendGrid/Resend)
- [ ] Integração com API de pagamento (confirmação automática)
- [ ] Geração automática de boletos (parcelas 2 e 3)
- [ ] Assinatura digital (Clicksign)
- [ ] Analytics e relatórios
- [ ] Multi-tenancy (múltiplas empresas)

## 📄 Licença

Propriedade da Extrema Software de Gestão Empresarial.

---

**Desenvolvido com ❤️ para automatizar e otimizar o processo comercial da Extrema Tecnologia** 🚀
