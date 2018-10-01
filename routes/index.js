var express = require('express');
var router = express.Router();

const Etherscan = require('etherscan');
const etherscan = new Etherscan('M9UPFJB5IN4TP42XT2CGNQB1JP5HIW9MEF');

const db = require('../models/index');

/* GET home page. */
router.get('/', async function(req, res, next) {
	console.log("Executing Index Function!");

	var params = { title: 'SamSplorer', eth_address: '' };
	if(!req.query.eth_address){
		res.render('index', params);
		return;
	}

	params.eth_address = req.query.eth_address;

	await db.EthEntity.findOrCreate({ where: { address: req.query.eth_address } }).spread(async function(anEntity, created){
		if(created){ 
			await anEntity.refreshBalanceData();
			await anEntity.refreshTransactionData();
		}

		console.log("Address is " + anEntity.address);
		console.log("Balance is " + anEntity.balance);

		params.ethentity = anEntity;
	}).catch(error => { console.log('caught', error.message); });

	//
	//	Handle the search params
	//
	var transParams = { [db.Sequelize.Op.or]: { toId: params.ethentity.id, fromId: params.ethentity.id } };
	if(req.query.eth_from_block){
		transParams.blockNumber = { [db.Sequelize.Op.gt]: parseInt(req.query.eth_from_block) }
		params.blockNumber = req.query.eth_from_block;
	}

	if(req.query.eth_tx_amount){
		var amtOp = (parseInt(req.query.eth_tx_amount) == 0 ? db.Sequelize.Op.gt : db.Sequelize.Op.lt);
		transParams.value = { [amtOp]: parseInt(req.query.eth_tx_amount) }
		params.tx_amt = req.query.eth_tx_amount;
	}
	
	var includeParams = [{ model: db.EthEntity, as: 'TxReceived' },{ model: db.EthEntity, as: 'TxSent' }];
	await db.Transaction.findAll({ include: includeParams, where: { [db.Sequelize.Op.and]: transParams } }).then(function(anEntity){
		params.transactions = anEntity;
	}).catch(error => { console.log('caught', error.message); });

	res.render('index', params);
});

module.exports = router;
