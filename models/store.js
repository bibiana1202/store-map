'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    static associate(models) {}
  }

  Store.init({
    // ✅ CSV 고유키(연번)
    seqNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'seq_no'
    },

    name:  { type: DataTypes.STRING(200), allowNull: false },
    phone: { type: DataTypes.STRING(50),  allowNull: true  },
    sido:  { type: DataTypes.STRING(50),  allowNull: true  },
    sigungu:{ type: DataTypes.STRING(50), allowNull: true  },
    addr1: { type: DataTypes.STRING(255), allowNull: true  },
    addr2: { type: DataTypes.STRING(255), allowNull: true  },
    category:{ type: DataTypes.STRING(100), allowNull: true },

    // DOUBLE 그대로 두어도 하버사인 계산엔 충분함(정밀도 더 원하면 DECIMAL로 마이그레이션 가능)
    lat: { type: DataTypes.DOUBLE, allowNull: true },
    lng: { type: DataTypes.DOUBLE, allowNull: true },
  }, {
    sequelize,
    modelName: 'Store',
    tableName: 'store',           // ✅ 단수 유지(중요 포인트 반영)
    indexes: [
      { unique: true, fields: ['seq_no'] },
      { fields: ['name'] },
      { fields: ['sido', 'sigungu'] },
    ],
  });

  return Store;
};
