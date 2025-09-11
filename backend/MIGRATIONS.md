# Migrations - Commerce Backend

## Configuração

O projeto está configurado para usar **Sequelize Migrations** em vez de `sync()` automático.

## Comandos Disponíveis

### Instalar Sequelize CLI
```bash
npm install
```

### Executar Migrations
```bash
# Executar todas as migrations pendentes
npm run migrate

# Ver status das migrations
npm run migrate:status

# Desfazer última migration
npm run migrate:undo

# Desfazer todas as migrations
npm run migrate:undo:all
```

### Executar Seeders
```bash
# Executar todos os seeders
npm run seed

# Desfazer todos os seeders
npm run seed:undo
```

## Criando Migrations

### Criar Migration
```bash
npx sequelize-cli migration:generate --name create-products-table
npx sequelize-cli migration:generate --name create-stock-table
npx sequelize-cli migration:generate --name create-users-table
npx sequelize-cli migration:generate --name create-customers-table
```

### Criar Seeder
```bash
npx sequelize-cli seed:generate --name demo-products
npx sequelize-cli seed:generate --name demo-users
```

## Estrutura de Pastas

```
backend/
├── src/
│   ├── migrations/     # Arquivos de migration
│   ├── seeders/        # Arquivos de seeder
│   └── models/         # Modelos Sequelize
├── .sequelizerc        # Configuração do Sequelize CLI
└── src/config/
    └── database.js     # Configuração do banco
```

## Modo de Operação

- **Desenvolvimento**: `sequelize.sync({ alter: false })` - apenas cria tabelas se não existirem
- **Produção**: Usa migrations para gerenciar schema

## Vantagens das Migrations

1. **Controle de versão** do schema do banco
2. **Rollback** de alterações
3. **Colaboração** em equipe
4. **Deploy** seguro em produção
5. **Histórico** de alterações

## Exemplo de Migration

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
```
