import chai, { assert } from 'chai';

import truncate from 'test/truncate';
import ethEntityFactory from 'test/factories/ethentity';

describe('Refreshed EthEntity', () => {
	let ethEnt;

	beforeEach(async () => {
		await truncate();
		ethEnt = await ethEntityFactory({ address: '0xb684d5c656d38f112d38dd441c30594bf9068df1' });
	});

	it('Should refresh balance on creation', async () => {
		await ethEnt.refreshBalanceData();
		assert(ethEnt.balance > 0, "Balance is not greater than zero");
	});

	it('Should successfully refresh transactions in', async function() {
		this.timeout(5000);

		await ethEnt.refreshTransactionData();
		assert((await ethEnt.getTxSent()).length > 0, "No history of sent transactions");
		assert((await ethEnt.getTxReceived()).length > 0, "No history of received transactions");
	});

	// it('Should have txIn and TxOut history', async () => {
	// 	assert(ethEnt.getTxSent.length > 0);
	// 	done();
	// });
});