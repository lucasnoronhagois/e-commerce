import { DataTypes, Model, Sequelize } from 'sequelize';

interface UserAttributes {
  id?: number;
  name: string;
  mail: string;
  login: string;
  password: string;
  role: string;
  is_deleted: boolean;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'is_deleted'> {
  is_deleted?: boolean;
}

export default class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare name: string;
  declare mail: string;
  declare login: string;
  declare password: string;
  declare role: string;
  declare is_deleted: boolean;
  declare customerDetail?: any; // Para a associação

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
      mail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      login: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'customer'),
        allowNull: false,
        defaultValue: 'customer',
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      sequelize,
      tableName: 'users',
      timestamps: true,
      paranoid: false,
      underscored: true,
    });
  }

  static associate(models: any) {
    // Um usuário pode ter um customer_detail (se for customer)
    User.hasOne(models.CustomerDetail, {
      foreignKey: 'user_id',
      as: 'customerDetail'
    });
  }
}
