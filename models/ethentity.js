'use strict';

const Etherscan = require('etherscan');
const etherscan = new Etherscan('M9UPFJB5IN4TP42XT2CGNQB1JP5HIW9MEF');

module.exports = (sequelize, DataTypes) => {
  
  const EthEntity = sequelize.define('EthEntity', {
    type: DataTypes.INTEGER,
    balance: DataTypes.DECIMAL,
    address: DataTypes.STRING
  }, {});

  EthEntity.associate = function(models) {
    // associations can be defined here
    EthEntity.hasMany(models.Transaction, { as: 'TxReceived', foreignKey: "toId" });
    EthEntity.hasMany(models.Transaction, { as: 'TxSent', foreignKey: "fromId" });
  };

  EthEntity.prototype.refreshBalanceData = async function() {
    var self = this;
    await etherscan.getEtherBalance({
      address: self.address,
      tag: 'latest'
    }).then(async function(balanceData){
      console.log("Got Balance data!");
      console.log(balanceData);
      
      self.balance = balanceData;
      await self.save({ fields: ['balance'] })
    });
  }

  EthEntity.prototype.refreshTransactionData = async function() {
    var txData = await etherscan.getTxList({
      address: this.address,
      startblock: 0, // Optional
      endblock: 0, // Optional
      sort: 'desc' // Optional, default 'asc'
    });

    const db = require('./index');

    for(var i = 0 ; i < (txData.length > 1000 ? 1000 : txData.length) ; i++){
      var found = false;

      await db.Transaction.findAll({ where: { hash: txData[i].hash } }).then((transactions) => {
        if(transactions && transactions.length > 0){
          found = true;
        }
      }).catch(error => { console.log('caught', error.message); });

      if(!found){

        var sentBy = false;
        if(txData[i].from === this.address){
          sentBy = true;
        }

        var otherEntity = null;
        await db.EthEntity.findOrCreate({ where: { address: (sentBy ? txData[i].to : txData[i].from) } }).spread((ethentity, created) => {
          otherEntity = ethentity
        }).catch(error => { console.log('caught', error.message); });

        await db.Transaction.create({
          value: txData[i].value,
          fromId: (sentBy ? this.id : otherEntity.id),
          toId: (!sentBy ? this.id : otherEntity.id),
          blockNumber: txData[i].blockNumber,
          blockHash: txData[i].blockHash,
          gas: txData[i].gas,
          gasPrice: txData[i].gasPrice,
          gasUsed: txData[i].gasUsed,
          confirmations: txData[i].confirmations
        });
      }
    }

    await this.reload();
  }
  
  return EthEntity;
};