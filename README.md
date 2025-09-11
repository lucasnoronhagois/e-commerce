# 🛒 E-Commerce Fullstack Application

Uma aplicação de e-commerce completa desenvolvida com **Node.js**, **React** e **TypeScript**, utilizando um sistema unificado de usuários com roles (admin/customer).

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com **Express.js**
- **TypeScript** para tipagem estática
- **Sequelize ORM** com **MySQL**
- **JWT** para autenticação
- **Yup** para validação de dados
- **bcrypt** para hash de senhas
- **CORS**, **Helmet**, **Compression** para segurança e performance

### Frontend
- **React 18** com **TypeScript**
- **Vite** como bundler
- **React Router** para navegação
- **Bootstrap 5** para UI
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações
- **Context API** para gerenciamento de estado

### Banco de Dados
- **MySQL** como banco principal
- **Sequelize CLI** para migrações

## 📁 Estrutura do Projeto

```
e-commerce/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── models/         # Modelos Sequelize
│   │   │   ├── User.ts     # Modelo unificado de usuários
│   │   │   ├── CustomerDetail.ts # Detalhes específicos de clientes
│   │   │   ├── Product.ts  # Modelo de produtos
│   │   │   └── Stock.ts    # Modelo de estoque
│   │   ├── controllers/    # Controllers da API
│   │   ├── services/       # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Middlewares (auth, validation)
│   │   ├── schemas/        # Schemas de validação Yup
│   │   ├── migrations/     # Migrações do banco
│   │   └── config/         # Configurações
│   ├── package.json
│   └── .env
└── frontend/               # Aplicação React
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── pages/         # Páginas da aplicação
    │   │   ├── Login.tsx  # Página de login
    │   │   ├── Register.tsx # Página de cadastro
    │   │   └── Products.tsx # Página de produtos
    │   ├── contexts/      # Context API
    │   │   └── AuthContext.tsx # Context de autenticação
    │   ├── services/      # Serviços de API
    │   ├── types/         # Tipos TypeScript
    │   └── utils/         # Utilitários (formatação)
    └── package.json
```

## 🔐 Sistema de Autenticação

### Arquitetura Unificada
- **Tabela única `users`** com campo `role` (admin/customer)
- **Tabela `customer_detail`** para dados específicos de clientes
- **JWT** para autenticação stateless
- **Middleware de autenticação** para rotas protegidas

### Roles
- **Admin**: Acesso completo ao sistema
- **Customer**: Acesso limitado (produtos, perfil)

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/lucasnoronhagois/e-commerce.git
cd e-commerce
```

### 2. Configuração do Backend
```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=commerce
DB_USER=root
DB_PASSWORD=sua_senha_mysql

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
```

### 3. Configuração do Banco de Dados
```bash
# Executar migrações
npx sequelize-cli db:migrate

# (Opcional) Executar seeds
npx sequelize-cli db:seed:all
```

### 4. Configuração do Frontend
```bash
cd ../frontend
npm install
```

### 5. Executar a aplicação

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de cliente

### Usuários (Protegido)
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (admin)
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### Estoque
- `GET /api/stock` - Listar estoque
- `POST /api/stock` - Adicionar ao estoque (admin)
- `PUT /api/stock/:id` - Atualizar estoque (admin)
- `PUT /api/stock/:id/quantity` - Atualizar quantidade (admin)

## 🎨 Funcionalidades

### Frontend
- ✅ **Login/Cadastro** com validação em tempo real
- ✅ **Formatação automática** de CPF, CEP e telefone
- ✅ **Design responsivo** com Bootstrap
- ✅ **Notificações** com React Hot Toast
- ✅ **Autenticação automática** (detecção de admin/customer)
- ✅ **Navegação protegida** com React Router

### Backend
- ✅ **API RESTful** com Express.js
- ✅ **Validação robusta** com Yup
- ✅ **Autenticação JWT** com middleware
- ✅ **Soft delete** para preservar dados
- ✅ **Migrações** para versionamento do banco
- ✅ **Logs estruturados** para debugging

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev          # Executar em modo desenvolvimento
npm run build        # Compilar TypeScript
npm run start        # Executar versão compilada
```

### Frontend
```bash
npm run dev          # Executar em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Lucas Noronha Gois**
- GitHub: [@lucasnoronhagois](https://github.com/lucasnoronhagois)
- Mail: lucas.noronha.gois@gmail.com

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, por favor abra uma [issue](https://github.com/lucasnoronhagois/e-commerce/issues) no repositório.

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!** ⭐
