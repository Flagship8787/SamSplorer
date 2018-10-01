var express = require('express');
var router = express.Router();

const Etherscan = require('etherscan');
const etherscan = new Etherscan('M9UPFJB5IN4TP42XT2CGNQB1JP5HIW9MEF');

const db = require('../models/index');

var responseParamsFromRequest = async function(req){
	console.log("Request params: " + JSON.stringify(req.params));
	console.log("Request query: " + JSON.stringify(req.query));

	var params = { title: 'SamSplorer', eth_address: '' };
	if(!req.query.eth_address && !req.params.eth_address){
		return params;
	}

	params.eth_address = (req.query.eth_address ? req.query.eth_address : req.params.eth_address);

	console.log("Searching for tx history for " + params.eth_address);

	await db.EthEntity.findOrCreate({ where: { address: params.eth_address } }).spread(async function(anEntity, created){
		await anEntity.refreshBalanceData();
		await anEntity.refreshTransactionData();

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
		var amtOp = (parseInt(req.query.eth_amount_op) == 0 ? db.Sequelize.Op.lt : db.Sequelize.Op.gt);
		transParams.value = { [amtOp]: parseInt(req.query.eth_tx_amount) }

		params.tx_amt = req.query.eth_tx_amount;
		params.tx_op = req.query.eth_amount_op;
	}
	
	var includeParams = [{ model: db.EthEntity, as: 'TxReceived' },{ model: db.EthEntity, as: 'TxSent' }];
	await db.Transaction.findAll({ include: includeParams, where: { [db.Sequelize.Op.and]: transParams } }).then(function(transactionsArr){
		params.transactions = transactionsArr;
	}).catch(error => { console.log('caught', error.message); });

	return params;
}

/* GET home page. */
router.get('/addresses/:eth_address', async function(req, res, next) {
	console.log("Executing Address query Function for address " + req.params.eth_address + "!");

	var params = await responseParamsFromRequest(req);
	console.log("got tx for " + params.eth_address);
	
	var responseObj = {
		address: params.eth_address,
		wallet: params.ethentity,
		transactions: params.transactions
	}

	res.json(responseObj);
});

// router.get('/transactions/:txhash', async function(req, res, next) {
// 	console.log("Executing Transactions query Function for txhash " + req.params.txhash + "!");
	
// 	var responseObj = {};
// 	etherscan.getTxInfo({
//       txhash: req.params.txhash
//     }).then(async function(txData){
//       console.log("Got Tx data!");
//       console.log(JSON.stringify(txData));
//     });

// 	res.json(responseObj);
// });

router.get('/', async function(req, res, next) {
	console.log("Executing Index Function!");

	var params = await responseParamsFromRequest(req);
	console.log("got tx for " + params.eth_address);
	
	res.render('index', params);
});

module.exports = router;
