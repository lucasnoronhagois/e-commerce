import { DataTypes, Model, Sequelize } from 'sequelize';

interface CustomerAttributes {
  id?: number;
  name: string;
  phone: string;
  mail: string;
  login: string;
  password: string;
  address: string;
  zip_code: string;
  document: string;
  neighborhood: string;
  city: string;
  state: string;
  address_number: string;
  is_deleted: boolean;
}

interface CustomerCreationAttributes extends Omit<CustomerAttributes, 'id' | 'is_deleted'> {
  is_deleted?: boolean;
}

export default class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> {
  declare id: number;
  declare name: string;
  declare phone: string;
  declare mail: string;
  declare login: string;
  declare password: string;
  declare address: string;
  declare zip_code: string;
  declare document: string;
  declare neighborhood: string;
  declare city: string;
  declare state: string;
  declare address_number: string;
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
      phone: {
        type: DataTypes.STRING(20),
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
      address: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      zip_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      document: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      address_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {
      sequelize,
      tableName: 'customers',
      timestamps: true,
      paranoid: false,
      underscored: true,
    });
  }
}
