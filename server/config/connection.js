const Sequelize = require('sequelize');

class PostgresConnection {
	constructor() {
		this.sequelize = new Sequelize('postgres://postgres:P@ssw0rd@127.0.0.1:5432/samsplorer');
    }

    getProject(name) {
        return this.sequelize;
    }
}

module.exports = PostgresConnection;