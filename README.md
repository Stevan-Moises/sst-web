# SST - Segurança e Saúde do Trabalho

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue?style=for-the-badge)
![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)

## 🎯 Sobre o Projeto

O **SST** é uma solução web construída para centralizar e otimizar a gestão de processos administrativos e de Segurança do Trabalho. O sistema foi projetado para funcionar de forma rápida e independente, salvando os dados diretamente no navegador do usuário. Isso garante alta velocidade de uso e evita lentidão na hora de registrar operações de rotina.

O foco central deste projeto foi criar uma interface limpa, acessível e suportada por um código muito bem organizado, sem depender de ferramentas pesadas ou desnecessárias.

## 🚀 Decisões Técnicas e Benefícios

Para este projeto, escolhi tecnologias modernas focadas em entregar a melhor experiência para o usuário e facilidade de manutenção para a equipe:

- **Estilo e Design (Tailwind CSS v4)**: Utilizado para construir a interface visual. A vantagem dessa versão é que ela gera arquivos finais extremamente pequenos, fazendo o site carregar quase instantaneamente para o usuário.
- **Código Organizado (JavaScript Modular)**: O projeto foi construído dividindo cada responsabilidade em arquivos separados. Isso mantém o código limpo, facilitando o trabalho em equipe e a correção de eventuais erros.
- **Armazenamento e Segurança (Local-First)**: Utiliza a memória do próprio navegador para salvar o andamento do trabalho. Para garantir a segurança contra perdas acidentais (como a limpeza de histórico), implementei uma trava de segurança: um sistema que alerta o usuário para realizar o backup dos dados a cada 7 dias.
- **Atualização Automática (Deploy Contínuo)**: O projeto está integrado à plataforma Vercel. Isso significa que qualquer melhoria no código aprovada pela equipe é publicada e atualizada no site oficial em questão de segundos, de forma 100% automática.

## 🏗️ Estrutura do Projeto

O código está organizado para facilitar a leitura e manutenção:

    /
    ├── src/
    │   ├── js/
    │   │   ├── main.js       # Arquivo principal que inicia o sistema
    │   │   ├── ui.js         # Controla tudo o que aparece na tela para o usuário
    │   │   ├── storage.js    # Gerencia o salvamento e a leitura dos dados
    │   │   └── utils.js      # Funções de apoio e regras de funcionamento
    │   └── css/              # Arquivos de estilo visual otimizados
    ├── public/               # Imagens e ícones utilizados no site
    ├── index.html            # Estrutura principal da página web
    └── package.json          # Lista de configurações e ferramentas do projeto

## ✨ Funcionalidades

- [x] **Painel Administrativo**: Tela de controle adaptável a qualquer tamanho de tela para visualização e gestão de chamados.
- [x] **Busca em Tempo Real**: Filtro de alta velocidade para encontrar colaboradores e processos instantaneamente.
- [x] **Prevenção de Perda de Dados**: Sistema inteligente que notifica o usuário para exportar e salvar um backup das informações a cada 7 dias.
- [x] **Operação Contínua**: O sistema continua funcionando de forma fluida sem depender de internet constante, com dados salvos no dispositivo.
- [x] **Design Acessível**: Layout que se adapta perfeitamente a celulares, tablets e computadores de mesa.

## 🔧 Como Rodar o Projeto no seu Computador

Para desenvolvedores ou avaliadores que desejam testar o código em sua própria máquina:

1. **Baixe (clone) o repositório:**
   git clone https://github.com/Stevan-Moises/sst-web.git

2. **Instale as ferramentas necessárias:**
   npm install

3. **Inicie o projeto com atualização visual em tempo real:**
   npm run dev

4. **Visualização:** Abra o arquivo `index.html` no seu navegador.

## 🌍 Produção

A versão estável e final da aplicação já está disponível online para uso.

**Acesse aqui:** [https://sst-web-zeta.vercel.app](https://sst-web-zeta.vercel.app)

---

## 👨‍💻 Sobre o Autor

**Stevan Moises**
*Desenvolvedor Front-End | Estudante de Ciência da Computação*

Sou um desenvolvedor apaixonado por construir interfaces eficientes, responsivas e fundamentadas em boas práticas de engenharia de software. Desenvolvi o **SST** com o objetivo de resolver um problema real de processos corporativos, priorizando código limpo e tecnologias modernas para entregar uma experiência de usuário impecável.

📫 **Conecte-se comigo:**
- **LinkedIn:** https://www.linkedin.com/in/stevan-moises/
- **E-mail:** stevanmoises67@gmail.com
