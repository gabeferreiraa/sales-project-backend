const dotenv = require("dotenv");
const pg = require("pg");

const { Pool } = pg;

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function releaseClient(client) {
	if (client) {
		try {
			client.release();
		} catch (err) {
			console.warn("Safe error. Double client release.");
		}
	}
}

module.exports = {
	pool,
	releaseClient,
};
