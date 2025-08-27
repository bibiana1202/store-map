'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Store.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    sido: DataTypes.STRING,
    sigungu: DataTypes.STRING,
    addr1: DataTypes.STRING,
    addr2: DataTypes.STRING,
    category: DataTypes.STRING,
    lat: DataTypes.DOUBLE,
    lng: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Store',
    tableName: 'store'
  });
  return Store;
};