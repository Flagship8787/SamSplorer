'use strict';

const Etherscan = require('etherscan');
const etherscan = new Etherscan('M9UPFJB5IN4TP42XT2CGNQB1JP5HIW9MEF');

module.exports = (sequelize, DataTypes) => {
  
  const Address = sequelize.define('Address', {
    type: DataTypes.INTEGER,
    balance: DataTypes.DECIMAL,
    address: DataTypes.STRING
  }, {});

  Address.associate = function(models) {
    // associations can be defined here
    Address.hasMany(models.Transaction, { as: 'TxReceived', foreignKey: "toId" });
    Address.hasMany(models.Transaction, { as: 'TxSent', foreignKey: "fromId" });
  };

  Address.prototype.refreshBalanceData = async function() {
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

  Address.prototype.refreshTransactionData = async function() {
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
        await db.Address.findOrCreate({ where: { address: (sentBy ? txData[i].to : txData[i].from) } }).spread((Address, created) => {
          otherEntity = Address
        }).catch(error => { console.log('caught', error.message); });

        var self = this;
        var txDataObj = txData[i];
        
        txDataObj.senderId    = (sentBy ? self.id : otherEntity.id);
        txDataObj.recipientId = (!sentBy ? self.id : otherEntity.id);

        await db.Transaction.findOrCreate({ where: { hash: txData[i].hash } }).spread(async function(txObj, created) {
          txObj.updateAttributesWithData(txDataObj);
        }).catch(error => { console.log('caught', error.message); });
      }
    }

    await this.reload();
  }

  Address.prototype.refreshTransactionData = async function() {
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
        await db.Address.findOrCreate({ where: { address: (sentBy ? txData[i].to : txData[i].from) } }).spread((Address, created) => {
          otherEntity = Address
        }).catch(error => { console.log('caught', error.message); });

        var self = this;
        var txDataObj = txData[i];
        
        txDataObj.senderId    = (sentBy ? self.id : otherEntity.id);
        txDataObj.recipientId = (!sentBy ? self.id : otherEntity.id);

        await db.Transaction.findOrCreate({ where: { hash: txData[i].hash } }).spread(async function(txObj, created) {
          txObj.updateAttributesWithData(txDataObj);
        }).catch(error => { console.log('caught', error.message); });
      }
    }

    await this.reload();
  }
  
  return Address;
};