# Migration: Adicionar Campos de Documento e Endereço ao Customer

## 📋 Resumo

Esta migration adiciona novos campos obrigatórios à tabela `customers` para melhorar o cadastro de clientes.

## 🆕 Novos Campos

### Documento
- **Campo**: `document`
- **Tipo**: VARCHAR(20)
- **Obrigatório**: ✅ SIM
- **Único**: ✅ SIM
- **Descrição**: CPF ou CNPJ do cliente

### Endereço Detalhado
- **Campo**: `neighborhood`
- **Tipo**: VARCHAR(100)
- **Obrigatório**: ✅ SIM
- **Descrição**: Bairro do cliente

- **Campo**: `city`
- **Tipo**: VARCHAR(100)
- **Obrigatório**: ✅ SIM
- **Descrição**: Cidade do cliente

- **Campo**: `state`
- **Tipo**: VARCHAR(2)
- **Obrigatório**: ✅ SIM
- **Descrição**: Estado do cliente (sigla - ex: SP, RJ, MG)

- **Campo**: `address_number`
- **Tipo**: VARCHAR(20)
- **Obrigatório**: ✅ SIM
- **Descrição**: Número do endereço

## 🔧 Arquivos Modificados

### Backend
- ✅ `src/migrations/20250115000001-add-customer-document-and-address-fields.js`
- ✅ `src/models/Customer.ts`
- ✅ `src/schemas/customerSchema.ts`

### Frontend
- ✅ `src/types/index.ts`

## 📝 Validações Implementadas

### CPF/CNPJ
- ✅ **Validação de CPF**: Algoritmo completo com dígitos verificadores
- ✅ **Validação de CNPJ**: Algoritmo completo com dígitos verificadores
- ✅ **Formato**: Aceita com ou sem formatação
- ✅ **Unicidade**: Campo único no banco de dados

### Endereço
- ✅ **Bairro**: Mínimo 2 caracteres
- ✅ **Cidade**: Mínimo 2 caracteres
- ✅ **Estado**: Exatamente 2 caracteres (sigla)
- ✅ **Número**: Mínimo 1 caractere

## 🚀 Como Executar

### 1. Configurar Banco de Dados
Crie um arquivo `.env` na pasta `backend/` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=commerce
DB_USER=root
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Executar Migration
```bash
cd backend
npx sequelize-cli db:migrate
```

### 3. Verificar Resultado
A tabela `customers` terá as seguintes colunas:
- `id` (PK)
- `name`
- `phone`
- `mail`
- `login`
- `password`
- `address`
- `zip_code`
- `document` ⭐ **NOVO**
- `neighborhood` ⭐ **NOVO**
- `city` ⭐ **NOVO**
- `state` ⭐ **NOVO**
- `address_number` ⭐ **NOVO**
- `is_deleted`
- `created_at`
- `updated_at`

## ⚠️ Importante

### Campos Obrigatórios
**TODOS** os novos campos são obrigatórios (NOT NULL). Isso significa que:

1. **Novos cadastros**: Devem preencher todos os campos
2. **Registros existentes**: Precisarão ser atualizados com valores padrão
3. **Validação**: Frontend e backend validam todos os campos

### Rollback
Para reverter a migration:
```bash
npx sequelize-cli db:migrate:undo
```

## 🔄 Próximos Passos

### Frontend
- [ ] Atualizar formulário de cadastro
- [ ] Adicionar validação de CPF/CNPJ
- [ ] Implementar formatação de documento
- [ ] Atualizar formulário de edição

### Backend
- [ ] Atualizar service de customer
- [ ] Atualizar controller de customer
- [ ] Testar endpoints com novos campos

## 📊 Estrutura Final

```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  mail VARCHAR(255) NOT NULL UNIQUE,
  login VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  document VARCHAR(20) NOT NULL UNIQUE,      -- NOVO
  neighborhood VARCHAR(100) NOT NULL,        -- NOVO
  city VARCHAR(100) NOT NULL,                -- NOVO
  state VARCHAR(2) NOT NULL,                 -- NOVO
  address_number VARCHAR(20) NOT NULL,       -- NOVO
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

**Data**: 15 de Janeiro de 2025
**Versão**: 1.0.0
**Status**: ✅ Pronto para execução
