# 💼 Sistema de Propostas Comerciais - Extrema Tecnologia

Sistema web completo para automatizar o processo de criação, envio, aceite e pagamento de propostas comerciais da Extrema Software de Gestão Empresarial.

> **Status:** ✅ Em produção | Sistema interno da Extrema Tecnologia

---

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router e TypeScript
- **Tailwind CSS** - Estilização com design system customizado
- **LocalStorage** - Armazenamento de dados (migração para Supabase planejada)
- **React Hook Form + Zod** - Formulários com validação robusta
- **jsPDF** - Geração de PDFs profissionais com identidade visual
- **qrcode-pix** - Geração de QR Code PIX padrão EMV (Banco Central)
- **date-fns** - Manipulação e formatação de datas

---

## 🎨 Identidade Visual

Design moderno com as cores oficiais da Extrema:

- **Roxo Principal:** `#8B4FD3` (Extrema Purple)
- **Amarelo/Dourado:** `#FFD93D` (Acento e CTAs)
- **Roxo Azulado:** `#6C63FF` (Accent secundário)

**Elementos visuais:**
- Glassmorphism e gradientes sutis
- Tipografia premium (Google Fonts)
- Micro-animações e transições suaves
- Layout responsivo mobile-first

---

## 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/Zeca-JCR/Extrema-Prop.git

# Navegar para o diretório
cd Extrema-Prop/propostas

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

Acesse: **[http://localhost:3000](http://localhost:3000)**

### Build para Produção

```bash
npm run build
npm start
```

---

## 🗂️ Estrutura do Projeto

```
propostas/
├── app/                          # App Router (Next.js 14)
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Redirecionamento inicial
│   ├── login/                   # Autenticação
│   ├── admin/                   # Painel administrativo
│   │   ├── propostas/          # CRUD de propostas
│   │   └── templates/          # Gestão de templates
│   └── proposta/[hash]/         # Página pública (cliente)
├── components/
│   ├── admin/                   # Componentes do painel admin
│   │   ├── ListaPropostas.tsx  # Tabela com ações
│   │   ├── FormProposta.tsx    # Formulário de criação/edição
│   │   └── ...
│   ├── public/                  # Componentes da página pública
│   │   ├── AceiteForm.tsx      # Multi-step aceite
│   │   ├── PixPayment.tsx      # Geração e exibição do PIX
│   │   └── ...
│   └── ui/                      # Componentes base reutilizáveis
├── lib/
│   ├── storage.ts               # Sistema de LocalStorage
│   ├── utils.ts                 # Utilitários gerais
│   ├── validators.ts            # Validações, máscaras e sanitização
│   ├── pix.ts                   # Geração de PIX EMV
│   └── pdf.ts                   # Geração de PDFs profissionais
└── public/
    └── extrema-logo.jpg         # Logo da empresa
```

---

## 👥 Usuários de Teste

### 👨‍💼 Admin
- **Email:** admin@extrematecnologia.com.br
- **Senha:** admin123
- **Permissões:** Visualiza todas as propostas de todos os vendedores

### 💼 Vendedor
- **Email:** vendedor@extrematecnologia.com.br
- **Senha:** vend123
- **Permissões:** Visualiza e gerencia apenas suas próprias propostas

---

## 🔄 Fluxo Completo do Sistema

### 1️⃣ **Criação da Proposta (Vendedor)**
- Login no painel administrativo
- Criação de nova proposta (manual ou a partir de template)
- Preenchimento de dados: cliente, produto, valores, condições
- Geração automática de URL única e hash seguro
- Compartilhamento do link (WhatsApp, email, etc.)

### 2️⃣ **Visualização (Cliente)**
- Acesso via link compartilhado
- Visualização profissional da proposta
- Download em PDF (opcional)
- Botão de aceite disponível

### 3️⃣ **Aceite e Pagamento (Cliente)**
Multi-step form guiado:
1. **Dados Cadastrais** - CPF/CNPJ, nome, contato
2. **Condições de Pagamento** - À vista (com desconto) ou parcelado
3. **PIX** - Geração automática de QR Code e código copia-e-cola
4. **Comprovante** - Upload do comprovante de pagamento
5. **Sucesso** - Confirmação visual e instruções

### 4️⃣ **Aprovação (Vendedor)**
- Notificação de proposta aceita
- Visualização do comprovante enviado
- Aprovação final no painel
- Atualização automática de status

---

## 📝 Templates de Produtos

Sistema de templates pré-configurados para agilizar criação:

**Exemplo: Uniplus Desktop Básico**
- Investimento: R$ 1.170,00
- À vista (5% desconto): R$ 1.111,50
- Parcelado: 1+2x R$ 390,00
- Mensalidade: R$ 199,90/mês

**Outros produtos do portfólio:**
- Uniplus Web Básico
- Uniplus Web Avançado
- Uniplus Desktop Avançado
- Overall ERP Web

---

## 💳 Pagamento via PIX

Implementação completa do padrão **EMV** do Banco Central:
- ✅ QR Code compatível com todos os bancos
- ✅ Código copia-e-cola
- ✅ Geração automática com dados dinâmicos

**Chave PIX (CNPJ):** 18.866.315/0001-81

---

## 🎯 Status das Propostas

- 🔵 **Rascunho** - Em criação (não enviada)
- 🔵 **Enviada** - Link compartilhado, aguardando cliente
- 🟠 **Aguardando Pagamento** - Cliente aceitou, aguardando PIX
- 🟣 **Comprovante Enviado** - Cliente enviou comprovante
- 🟢 **Paga** - Pagamento aprovado pelo vendedor
- ✅ **Aceita** - Proposta finalizada com sucesso
- 🔴 **Recusada** - Cliente recusou a proposta
- ⚫ **Expirada** - Prazo de validade vencido

---

## 🔧 Configurações da Empresa

Dados pré-cadastrados da Extrema Tecnologia:

**Empresa:**
- Razão Social: Extrema Software de Gestão Empresarial
- CNPJ: 18.866.315/0001-81
- Email: comercial@extrematecnologia.com.br
- Telefones: (47) 99681-8985 | (47) 3633-4255

**Endereços:**
- São Bento do Sul - SC
- Balneário Piçarras - SC

**Dados Bancários:**
- Banco: 085 - Cooperativa Central Ailos
- Agência: 0112-0
- Conta Corrente: 16916-1

---

## 📊 Armazenamento de Dados

Sistema baseado em **LocalStorage** durante fase inicial:

**Chaves utilizadas:**
- `extrema_propostas` - Propostas comerciais
- `extrema_templates` - Templates de produtos
- `extrema_users` - Usuários do sistema
- `extrema_current_user` - Sessão do usuário logado
- `extrema_configuracoes` - Configurações da empresa

> ⚠️ **Importante:** Dados no LocalStorage são temporários e serão perdidos ao limpar cache do navegador. Migração para banco de dados persistente (Supabase) planejada.

---

## ✅ Funcionalidades Implementadas

- [x] Sistema de autenticação mock
- [x] CRUD completo de propostas
- [x] Sistema de templates reutilizáveis
- [x] Geração de URL única e segura (hash)
- [x] Página pública responsiva para clientes
- [x] Multi-step form de aceite
- [x] Geração de PIX EMV automático
- [x] Upload de comprovante
- [x] Geração de PDF profissional
- [x] Cálculo automático de parcelas
- [x] Aplicação de desconto à vista
- [x] Gestão de status
- [x] Compartilhamento via WhatsApp
- [x] Design moderno com glassmorphism

---

## � Roadmap Futuro

### 📌 Próximas Melhorias
- [ ] Migração para **Supabase** (banco de dados + auth real)
- [ ] Notificações automáticas por **email** (SendGrid/Resend)
- [ ] Notificações via **WhatsApp** (API oficial)
- [ ] Integração com **API de pagamento** (confirmação automática)
- [ ] Geração automática de **boletos** (parcelas 2 e 3)
- [ ] **Assinatura digital** (Clicksign/D4Sign)
- [ ] **Dashboard de analytics** - Métricas de conversão
- [ ] Relatórios e exportação de dados
- [ ] Sistema de lembretes (propostas expiradas)
- [ ] Multi-tenancy (múltiplas empresas/filiais)

---

## 🔒 Segurança

- ✅ URLs únicas com hash seguro (SHA-256)
- ✅ Validação de formulários (Zod)
- ✅ Sanitização de inputs
- ✅ Proteção de rotas administrativas
- ✅ Dados isolados por empresa (preparado para multi-tenant)

---

## 📱 Responsividade

Sistema totalmente responsivo:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (320px - 768px)

---

## 🤝 Contribuição

Sistema de uso interno da Extrema Tecnologia.

Para sugestões ou melhorias, entre em contato:
- **Email:** comercial@extrematecnologia.com.br
- **WhatsApp:** (47) 99681-8985

---

## 📄 Licença

**Propriedade exclusiva da Extrema Software de Gestão Empresarial.**

Todos os direitos reservados © 2026.

---

**Desenvolvido com ❤️ pela equipe Extrema para otimizar nosso processo comercial** 🚀💼
