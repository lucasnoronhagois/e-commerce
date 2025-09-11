import { DataTypes, Model, Sequelize } from 'sequelize';

interface StockAttributes {
  id?: number;
  product_id: number;
  quantity: number;
  is_deleted: boolean;
}

interface StockCreationAttributes extends Omit<StockAttributes, 'id' | 'is_deleted'> {
  is_deleted?: boolean;
}

export default class Stock extends Model<StockAttributes, StockCreationAttributes> {
  declare id: number;
  declare product_id: number;
  declare quantity: number;
  declare is_deleted: boolean;

  static load(sequelize: Sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      sequelize,
      tableName: 'stock',
      timestamps: true,
      paranoid: false,
      underscored: true,
    });
  }

  static associate(models: any) {
    Stock.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}