'use strict';

const Etherscan = require('etherscan');
const etherscan = new Etherscan('M9UPFJB5IN4TP42XT2CGNQB1JP5HIW9MEF');

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    value: DataTypes.DECIMAL,
    fromId: DataTypes.INTEGER,
    toId: DataTypes.INTEGER,
    blockNumber: DataTypes.STRING,
    hash: DataTypes.STRING,
    blockHash: DataTypes.STRING,
    gas: DataTypes.DECIMAL,
    gasPrice: DataTypes.DECIMAL,
    gasUsed: DataTypes.DECIMAL,
    confirmations: DataTypes.INTEGER
  }, {});

  Transaction.associate = function(models) {
    // associations can be defined here
    Transaction.belongsTo(models.EthEntity, { as: 'TxReceived', foreignKey: "toId" });
    Transaction.belongsTo(models.EthEntity, { as: 'TxSent', foreignKey: "fromId" });
  };

  Transaction.prototype.updateAttributesWithData = async function(txDataObj) {
    this.value          = txDataObj.value;
    this.fromId         = txDataObj.senderId;
    this.toId           = txDataObj.recipientId;
    this.blockNumber    = txDataObj.blockNumber;
    this.hash           = txDataObj.hash;
    this.blockHash      = txDataObj.blockHash;
    this.gas            = txDataObj.gas;
    this.gasPrice       = txDataObj.gasPrice;
    this.gasUsed        = txDataObj.gasUsed;
    this.confirmations  = txDataObj.confirmations;

    await this.save();
  }

  return Transaction;
};