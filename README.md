<div align="center">
  <img src="https://raw.githubusercontent.com/Kaique-CDS/90-mais-store/main/public/logo.png" alt="90+ Store Logo" width="120" />
  <h1>90+ Store | Catálogo Inteligente ⚽️👕</h1>
  <p><em>Plataforma de e-commerce de alta performance focada em conversão via WhatsApp para camisas de futebol e streetwear.</em></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

<br />

## 🚀 Visão Geral

O **90+ Store** foi arquitetado para resolver a fricção de vendas encontrada em marketplaces tradicionais e no atendimento manual. Em vez de trocas intermináveis de mensagens para apresentar produtos, o sistema oferece uma **vitrine profissional, fluida e mobile-first** onde o cliente explora o catálogo, seleciona múltiplos produtos com suas personalizações, e a plataforma gera um pedido estruturado para fechamento rápido e humanizado via WhatsApp.

---

## ✨ Funcionalidades em Destaque

- 🛒 **Carrinho Inteligente & Persistente:** Seleção de múltiplos itens com soma automática, regras de negócio dinâmicas (+R$20 G1/G2, +R$70 Personalização) e memória local (carrinho não é perdido ao atualizar a página).
- ⚡ **Performance Extrema:** Otimização agressiva de imagens (`next/image` + WebP), carregamento paralelo (`Promise.all`), e paginação com Scroll Infinito (Intersection Observer).
- 📲 **Checkout via WhatsApp:** Geração automática de deep-links formatados com o resumo completo do pedido.
- 🎨 **Design Imersivo:** Efeitos de glassmorphism, micro-interações, hover-states avançados e zoom dinâmico na galeria de produtos.
- ☁️ **Integração Backend:** Conexão robusta e em tempo real com o banco de dados PostgreSQL via Supabase.

---

## 🛠️ Stack Tecnológica

O projeto foi construído com as tecnologias mais modernas do ecossistema front-end:

| Categoria | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15+](https://nextjs.org/) | App Router, Server/Client Components |
| **Linguagem** | [TypeScript](https://www.typescript.org/) | Tipagem estática rigorosa para escalabilidade |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first, responsividade e animações |
| **Backend/DB**| [Supabase](https://supabase.com/) | PostgreSQL Cloud & Storage de Mídia |
| **Ícones** | [Lucide React](https://lucide.dev/) | Ícones vetoriais leves e customizáveis |
| **Deploy** | [Vercel](https://vercel.com/) | Hospedagem serverless de alto desempenho |

---

## ⚙️ Como Rodar o Projeto Localmente

Siga as instruções abaixo para executar o projeto no seu ambiente de desenvolvimento.

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM, Yarn ou pnpm
- Uma conta no [Supabase](https://supabase.com/) com um projeto criado.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Kaique-CDS/90-mais-store.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd 90-mais-store
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Configuração de Variáveis de Ambiente:**
   - Crie um arquivo `.env.local` na raiz do projeto.
   - Adicione as chaves do seu Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000) e teste a aplicação!

---

## 📜 Licença

Desenvolvido para **90+ Store** por [Kaique-CDS](https://github.com/Kaique-CDS). Todos os direitos reservados.
