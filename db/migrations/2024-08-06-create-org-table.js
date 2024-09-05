const { pool, releaseClient } = require('../index');

// IIFE (immediately invoked function expression) anonymous (no function name) async function
// IIFE anon async function
(async () => {
	// Let's grab a connection from the pool
	// Important that it's outside the try so that we can access it in the 'catch' block
	const client = await pool.connect();

	try {
		// Write our SQL statement
		const sql = `

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'temperatures') THEN
                CREATE TYPE temperatures AS ENUM ('hot', 'cold', 'warm');
            END IF;
        END$$;

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statuses') THEN
                CREATE TYPE statuses AS ENUM ('conversation', 'prospect', 'outbound', 'demo', 'sale', 'dead');
            END IF;
        END$$;
        
        
        CREATE TABLE IF NOT EXISTS organizations (
            id UUID PRIMARY KEY,
            name VARCHAR(255)  NOT NULL,
            temperature TEMPERATURES DEFAULT 'cold' NOT NULL,
            status STATUS DEFAULT 'conversation' NOT NULL,
            logo VARCHAR(255),
            notes VARCHAR(255),
            object VARCHAR(12) NOT NULL DEFAULT 'organization' CHECK (object = 'organization'),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
