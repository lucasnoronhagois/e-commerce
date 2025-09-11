# Commerce - Sistema Fullstack de E-commerce

Sistema completo de e-commerce desenvolvido com Express.js (backend) e React (frontend).

## 🚀 Tecnologias

### Backend
- **Express.js** - Framework web para Node.js
- **TypeScript** - Superset tipado do JavaScript
- **Sequelize** - ORM para Node.js
- **MySQL** - Banco de dados relacional
- **Yup** - Validação de schemas
- **Helmet** - Segurança HTTP
- **bcrypt** - Hash de senhas
- **JWT** - Autenticação
- **Babel** - Transpilação
- **Terser** - Minificação

### Frontend
- **React** - Biblioteca para interfaces
- **Vite** - Build tool moderna
- **TypeScript** - Superset tipado do JavaScript
- **Axios** - Cliente HTTP
- **Bootstrap** - Framework CSS
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **React Hot Toast** - Notificações

## 📁 Estrutura do Projeto

```
commerce-fullstack/
├── src/                    # Backend
│   ├── config/            # Configurações
│   ├── controllers/       # Controladores MVC
│   ├── middlewares/       # Middlewares
│   ├── models/           # Modelos Sequelize
│   ├── routes/           # Rotas da API
│   ├── schemas/          # Schemas de validação Yup
│   ├── services/         # Lógica de negócio
│   └── server.ts         # Servidor principal
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # Contextos React
│   │   ├── pages/        # Páginas
│   │   ├── services/     # Serviços da API
│   │   ├── styles/       # Estilos CSS
│   │   └── types/        # Tipos TypeScript
│   └── public/           # Arquivos estáticos
└── package.json          # Dependências do backend
```

## 🗄️ Banco de Dados

### Tabelas

#### Products
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Stock
- `id` (INT, PK, AUTO_INCREMENT)
- `productId` (INT, FK -> products.id)
- `quantity` (INT, NOT NULL, DEFAULT 0)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Users
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `phone` (VARCHAR(20), NOT NULL)
- `mail` (VARCHAR(255), NOT NULL, UNIQUE)
- `login` (VARCHAR(100), NOT NULL, UNIQUE)
- `password` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(50), NOT NULL, DEFAULT 'user')
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Customers
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `phone` (VARCHAR(20), NOT NULL)
- `mail` (VARCHAR(255), NOT NULL, UNIQUE)
- `login` (VARCHAR(100), NOT NULL, UNIQUE)
- `password` (VARCHAR(255), NOT NULL)
- `address` (VARCHAR(500), NOT NULL)
- `zipCode` (VARCHAR(10), NOT NULL)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## 🎨 Design

O frontend utiliza tons pastéis amarelo-verde para criar uma interface suave e agradável:

- **Primary Yellow**: #f4e4bc
- **Primary Green**: #c8e6c9
- **Secondary Yellow**: #fff8e1
- **Secondary Green**: #e8f5e8
- **Accent Yellow**: #f9f1d2
- **Accent Green**: #dcedc8

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### Backend

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp env.example .env
# Editar .env com suas configurações
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
npm start
```

### Frontend

1. Navegar para a pasta frontend:
```bash
cd frontend
```

2. Instalar dependências:
```bash
npm install
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=commerce_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

## 📡 API Endpoints

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `GET /api/products/search?q=termo` - Buscar produtos
- `POST /api/products` - Criar produto (Admin)
- `PUT /api/products/:id` - Atualizar produto (Admin)
- `DELETE /api/products/:id` - Excluir produto (Admin)

### Estoque
- `GET /api/stock` - Listar estoque
- `GET /api/stock/:id` - Buscar estoque por ID
- `GET /api/stock/product/:productId` - Buscar estoque por produto
- `POST /api/stock` - Criar estoque (Admin)
- `PUT /api/stock/:id` - Atualizar estoque (Admin)
- `PUT /api/stock/:id/quantity` - Atualizar quantidade (Admin)
- `DELETE /api/stock/:id` - Excluir estoque (Admin)

### Usuários
- `POST /api/users/login` - Login de usuário
- `GET /api/users` - Listar usuários (Admin)
- `GET /api/users/:id` - Buscar usuário por ID (Admin)
- `POST /api/users` - Criar usuário (Admin)
- `PUT /api/users/:id` - Atualizar usuário (Admin)
- `DELETE /api/users/:id` - Excluir usuário (Admin)

### Clientes
- `POST /api/customers/register` - Cadastro de cliente
- `POST /api/customers/login` - Login de cliente
- `GET /api/customers` - Listar clientes (Admin)
- `GET /api/customers/:id` - Buscar cliente por ID (Admin)
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Excluir cliente (Admin)

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Tokens são enviados no header `Authorization: Bearer <token>`.

### Roles
- **user**: Usuário comum
- **admin**: Administrador com acesso total
- **customer**: Cliente do e-commerce

## 🛡️ Segurança

- Helmet para headers de segurança
- Rate limiting para prevenir ataques
- Validação de dados com Yup
- Hash de senhas com bcrypt
- CORS configurado
- Sanitização de inputs

## 📱 Responsividade

O frontend é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎯 Funcionalidades

### Implementadas
- ✅ Autenticação (Login/Registro)
- ✅ CRUD de Produtos
- ✅ CRUD de Estoque
- ✅ CRUD de Usuários
- ✅ CRUD de Clientes
- ✅ Interface responsiva
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Notificações

### Em Desenvolvimento
- 🔄 Páginas de Estoque
- 🔄 Páginas de Usuários
- 🔄 Páginas de Clientes
- 🔄 Painel Administrativo
- 🔄 Carrinho de Compras
- 🔄 Sistema de Pedidos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
