const { pool, releaseClient } = require('../index');

// IIFE (immediately invoked function expression) anonymous (no function name) async function
// IIFE anon async function
(async () => {
	// Let's grab a connection from the pool
	// Important that it's outside the try so that we can access it in the "catch" block
	const client = await pool.connect();

	try {
		// Write our SQL statement
		const sql = `CREATE TABLE IF NOT EXISTS users (
			organization_id UUID,
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(25) NOT NULL,
            last_name VARCHAR(25),
            is_lead BOOLEAN DEFAULT FALSE,
            job_title VARCHAR(35),
            avatar VARCHAR(255),
            notes VARCHAR(255),
            object VARCHAR(4) NOT NULL DEFAULT 'user' CHECK (object = 'user'),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_organization
				FOREIGN KEY (organization_id)
				REFERENCES organizations(id)
				ON DELETE CASCADE
        );`;

		// Execute the command
		await client.query(sql);

		// Close the connection
		releaseClient(client);

		console.log(`✅ Successfully ran migration!`);
	} catch (err) {
		// Release the client back to the pool...
		// ALWAYS release the client after we're done with it, even if it fails
		releaseClient(client);

		console.error(err);
		console.log(`❌ Error running migration.`);
	}
})();
