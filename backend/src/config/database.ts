import { Sequelize } from 'sequelize';
import * as Models from '../models/index';

interface ModelsObject {
  [key: string]: any;
}

export const loadModels = (sequelize: Sequelize): ModelsObject => {
  const models: ModelsObject = {};
  
  // carregar em loop do index
  Object.entries(Models).forEach(([modelName, ModelClass]) => {
    if (ModelClass && typeof ModelClass.load === 'function') {
      models[modelName] = ModelClass.load(sequelize);
    } else {
      console.error(`Model ${modelName} não tem método load ou não é uma classe válida`);
    }
  });

  // chamar associate se existir
  Object.values(models).forEach(model => {
    if (model && typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
};