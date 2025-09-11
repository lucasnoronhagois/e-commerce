import { DataTypes, Model, Sequelize } from 'sequelize';

interface ProductAttributes {
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category: string;
  is_deleted: boolean;
}

interface ProductCreationAttributes extends Omit<ProductAttributes, 'id' | 'is_deleted'> {
  is_deleted?: boolean;
}

export default class Product extends Model<ProductAttributes, ProductCreationAttributes> {
  declare id: number;
  declare name: string;
  declare description?: string;
  declare price?: number;
  declare category: string;
  declare is_deleted: boolean;

  static load(sequelize: Sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM('rings', 'necklaces', 'bags_purse', 'high_heeled_shoes'),
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      sequelize,
      tableName: 'products',
      timestamps: true,
      paranoid: false,
      underscored: true,
    });
  }

  static associate(models: any) {
    Product.hasMany(models.Stock, { foreignKey: 'product_id', as: 'stocks' });
    Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' });
  }
}