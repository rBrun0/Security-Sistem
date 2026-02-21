# 🦺 Sistema de Gestão SST

Sistema web para gestão de Segurança do Trabalho, permitindo controle de:

- Ambientes
- Funcionários
- Inspeções
- Treinamentos
- Instrutores
- (em desenvolvimento) Estoque de EPIs

---

## 🚀 Tecnologias Utilizadas

- **React + TypeScript**
- **Next.js**
- **Firebase (Firestore)**
- **React Hook Form**
- **Zod**
- **TanStack Query**
- **ShadCN UI**
- **Tailwind CSS**

---

## 📦 Módulos do Sistema

### 🏗 Ambientes
- Cadastro e gerenciamento de ambientes/obras
- Status (ativo, concluído, pausado)
- Visualização de colaboradores vinculados

### 👷 Funcionários
- Cadastro completo de colaboradores
- Vínculo com empresa e ambiente
- Controle de status

### 🔍 Inspeções
- Criação de inspeções por ambiente
- Itens de inspeção (conforme / não conforme)
- Cálculo automático de conformidade
- Relatório com exportação CSV
- Impressão de relatório

### 🎓 Treinamentos
- Modelos de treinamento (NRs)
- Conteúdo programático automático
- Carga horária
- Instrutor vinculado

### 👨‍🏫 Instrutores
- Cadastro completo
- Registros profissionais (CREA, CRM, MTE etc.)
- Qualificações

### 📦 Estoque (Em desenvolvimento)
- Controle de produtos/EPI
- Movimentações
- Histórico

---

## 🧠 Arquitetura

O projeto segue uma organização modular:

- modules/
- environments/
- employees/
- inspections/
- trainings/
- instructors/

- 
Cada módulo possui:

- types
- services
- hooks
- components

Separação clara entre:
- Camada de UI
- Regras de negócio
- Acesso a dados

---

## 🔐 Autenticação

Em desenvolvimento.
Será implementada utilizando Firebase Authentication.

---

## ⚙️ Instalação e Execução

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repo.git

# Acesse a pasta
cd nome-do-projeto

# Instale as dependências
npm install

# Rode o projeto
npm run dev

