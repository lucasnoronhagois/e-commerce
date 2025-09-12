import { Model, DataTypes, Sequelize } from 'sequelize';

export interface CustomerDetailAttributes {
  id: number;
  user_id: number;
  phone?: string;
  address?: string;
  zip_code?: string;
  document?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  address_number?: string;
}

export interface CustomerDetailCreationAttributes extends Omit<CustomerDetailAttributes, 'id'> {}

export class CustomerDetail extends Model<CustomerDetailAttributes, CustomerDetailCreationAttributes> {
  declare id: number;
  declare user_id: number;
  declare phone?: string;
  declare address?: string;
  declare zip_code?: string;
  declare document?: string;
  declare neighborhood?: string;
  declare city?: string;
  declare state?: string;
  declare address_number?: string;
  declare user?: any; // Para a associação

  static load(sequelize: Sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      zip_code: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      document: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
      },
      neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      address_number: {
        type: DataTypes.STRING(10),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'CustomerDetail',
      tableName: 'customer_detail',
      underscored: true,
      paranoid: false,
      timestamps: false // Removido timestamps pois usamos os da tabela users
    });
  }

  static associate(models: any) {
    // CustomerDetail pertence a um User
    CustomerDetail.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}
