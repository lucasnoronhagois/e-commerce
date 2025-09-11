import dotenv from 'dotenv';
dotenv.config();
import helmet from "helmet";
import express, { Application } from 'express';
import { Sequelize } from 'sequelize';
import { loadModels } from './config/database';
import setupRoutes from './config/configrouter';
import cors from 'cors';
import compression from 'compression';
import path from 'path';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// Criar instância do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    dialect: 'mysql',
    logging: false, //loggin desativado
  }
);

// Armazenar sequelize no app
app.locals.sequelize = sequelize;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
// Configurar rotas
setupRoutes(app);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});


// Só inicia o servidor depois do sync com o banco
const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();  
    // Carregar models
    const models = loadModels(sequelize);
  
    const PORT = 3001;
    app.listen(PORT, () => {
      //por enquanto que está em desenvolvimento vou deixar o console.log
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
};

startServer();

export default app;
