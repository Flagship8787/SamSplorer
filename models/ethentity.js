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
    //  has many transactions, but some as sender some as receiver
    EthEntity.hasMany(models.Transaction, { as: 'TxReceived', foreignKey: "toId" });
    EthEntity.hasMany(models.Transaction, { as: 'TxSent', foreignKey: "fromId" });
  };

  //
  //  Instance method for download balance data
  //
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

  //
  //  Instance method for downloading transaction data
  //
  EthEntity.prototype.refreshTransactionData = async function() {
    //  First, download the txdata
    var txData = await etherscan.getTxList({
      address: this.address,
      startblock: 0, // Optional
      endblock: 0, // Optional
      sort: 'desc' // Optional, default 'asc'
    });

    //  grab a reference to the db
    const db = require('./index');

    //  Loop through all transaction data.  If tx doesn't exist in the db create it and sync property values
    for(var i = 0 ; i < (txData.length > 1000 ? 1000 : txData.length) ; i++){
      var found = false;

      //  Find tx in the db
      await db.Transaction.findAll({ where: { hash: txData[i].hash } }).then((transactions) => {
        if(transactions && transactions.length > 0){
          found = true;
        }
      }).catch(error => { console.log('caught', error.message); });

      //  Create txRecord not found
      if(!found){
        var sentBy = false;
        if(txData[i].from === this.address){
          sentBy = true;
        }

        var otherEntity = null;
        await db.EthEntity.findOrCreate({ where: { address: (sentBy ? txData[i].to : txData[i].from) } }).spread((ethentity, created) => {
          otherEntity = ethentity
        }).catch(error => { console.log('caught', error.message); });

        var self = this;
        var txDataObj = txData[i];
        
        txDataObj.senderId    = (sentBy ? self.id : otherEntity.id);
        txDataObj.recipientId = (!sentBy ? self.id : otherEntity.id);

        await db.Transaction.findOrCreate({ where: { hash: txData[i].hash } }).spread(async function(txObj, created) {
          //  Update tx object with data from etherscan
          txObj.updateAttributesWithData(txDataObj);
        }).catch(error => { console.log('caught', error.message); });
      }
    }

    //  Reload the model to fetch tx obj data
    await this.reload();
  }
  
  return EthEntity;
};