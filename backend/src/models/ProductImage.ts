import { DataTypes, Model, Sequelize } from 'sequelize';

interface ProductImageAttributes {
  id?: number;
  product_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  original_url?: string;
  crop_data?: any;
  alt_text?: string;
  is_primary: boolean;
  order: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductImageCreationAttributes extends Omit<ProductImageAttributes, 'id' | 'created_at' | 'updated_at'> {}

export default class ProductImage extends Model<ProductImageAttributes, ProductImageCreationAttributes> {
  declare id: number;
  declare product_id: number;
  declare filename: string;
  declare original_name: string;
  declare mime_type: string;
  declare size: number;
  declare url: string;
  declare thumbnail_url?: string;
  declare original_url?: string;
  declare crop_data?: any;
  declare alt_text?: string;
  declare is_primary: boolean;
  declare order: number;

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
        onDelete: 'CASCADE',
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thumbnail_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      original_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      crop_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      alt_text: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    }, {
      sequelize,
      tableName: 'product_images',
      timestamps: true,
      paranoid: false,
      underscored: true,
    });
  }

  static associate(models: any) {
    ProductImage.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}
