'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    value: DataTypes.DECIMAL,
    fromId: DataTypes.INTEGER,
    toId: DataTypes.INTEGER,
    blockNumber: DataTypes.STRING,
    blockHash: DataTypes.STRING,
    gas: DataTypes.DECIMAL,
    gasPrice: DataTypes.DECIMAL,
    gasUsed: DataTypes.DECIMAL,
    confirmations: DataTypes.INTEGER
  }, {});

  Transaction.associate = function(models) {
    // associations can be defined here
    Transaction.belongsTo(models.EthEntity, { as: 'TxReceived', foreignKey: "fromId" });
    Transaction.belongsTo(models.EthEntity, { as: 'TxSent', foreignKey: "toId" });
  };

  return Transaction;
};