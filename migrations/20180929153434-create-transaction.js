'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      value: {
        type: Sequelize.DECIMAL
      },
      fromId: {
        type: Sequelize.INTEGER
      },
      toId: {
        type: Sequelize.INTEGER
      },
      blockNumber: {
        type: Sequelize.INTEGER
      },
      hash: {
        type: Sequelize.STRING
      },
      blockHash: {
        type: Sequelize.STRING
      },
      gas: {
        type: Sequelize.DECIMAL
      },
      gasPrice: {
        type: Sequelize.DECIMAL
      },
      gasUsed: {
        type: Sequelize.DECIMAL
      },
      confirmations: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Transactions');
  }
};