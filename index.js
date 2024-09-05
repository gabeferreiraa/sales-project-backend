const { pool, releaseClient } = require('./db/index');
const express = require('express');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3002;
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan('combined'));

// CORS enabling
// Enable CORS with specific origin
const corsOptions = {
	origin: [
		'https://sales-project-frontend-production.up.railway.app',
		process.env.MODE === 'development' && 'http://localhost:3001',
	],
};

app.use(cors(corsOptions));

app.post('/organizations', async (req, res) => {
	const client = await pool.connect();

	const data = req.body;
	const name = data.name;
	const temperature = data.temperature;
	const status = data.status;
	const logo = data.logo;
	const notes = data.notes;

	try {
		// Handle API operations
		// let name = 'mike';
		// let temperature = 'warm';
		// let status = 'conversation';
		// let logo = '';
		// let notes = 'baller';

		const sql = `

		INSERT INTO organizations (id, name, temperature, status, logo, notes)
        VALUES ( gen_random_uuid(), $1, $2, $3, $4, $5)
		RETURNING *
    `;
		const values = [name, temperature, status, logo, notes];
		const results = await client.query(sql, values);
		releaseClient(client);
		const organization = results.rows[0];

		return res.status(200).json({ organization: organization });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});
app.get('/organizations/:id/users', async (req, res) => {
	const client = await pool.connect();
	const id = req.params.id;

	try {
		const sql = `

		SELECT * FROM users WHERE organization_id = $1 
    `;
		const values = [id];
		const results = await client.query(sql, values);
		releaseClient(client);
		const users = results.rows;

		return res.status(200).json({ users: users });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});
app.post('/users', async (req, res) => {
	const client = await pool.connect();

	const data = req.body;
	const organization_id = data.organization_id;
	const email = data.email;
	const first_name = data.first_name;
	const last_name = data.last_name;
	const job_title = data.job_title;
	const is_lead = data.is_lead;
	const notes = data.notes;
	const avatar = data.avatar;

	try {
		// Handle API operations
		// let name = 'mike';
		// let temperature = 'warm';
		// let status = 'conversation';
		// let logo = '';
		// let notes = 'baller';

		const sql = `

		INSERT INTO users ( id, organization_id, email, first_name, last_name, job_title, is_lead, notes, avatar)
        VALUES ( gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8 )
		RETURNING *
    `;
		const values = [
			organization_id,
			email,
			first_name,
			last_name,
			job_title,
			is_lead,
			notes,
			avatar,
		];
		const results = await client.query(sql, values);
		releaseClient(client);
		const user = results.rows[0];

		return res.status(200).json({ user: user });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});
// delete user
app.delete('/users/:id', async (req, res) => {
	const client = await pool.connect();

	try {
		const id = req.params.id;
		const sql = `
        DELETE FROM users WHERE id = $1
        RETURNING *;
        `;
		const values = [id];
		const results = await client.query(sql, values);

		releaseClient(client);
		const user = results.rows[0];

		if (user) {
			return res.status(200).json({ user });
		} else {
			return res.status(404).json({ message: 'User not found' });
		}
	} catch (err) {
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});

// get all organizations from sql database

app.get('/organizations', async (req, res) => {
	const client = await pool.connect();

	try {
		const sql = `

		SELECT * FROM organizations
    `;
		const results = await client.query(sql);
		releaseClient(client);
		const organizations = results.rows;

		return res.status(200).json({ organizations: organizations });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});

// to delete data from the sql database

app.delete('/organizations/:id', async (req, res) => {
	const client = await pool.connect();

	try {
		const id = req.params.id;
		const sql = `
		DELETE FROM organizations WHERE id = $1
		RETURNING *;
    `;
		const values = [id];
		const results = await client.query(sql, values);

		releaseClient(client);
		const organization = results.rows;

		return res.status(200).json({ organization });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});

async function getOrganization(client, id) {
	const sql = `
	SELECT * FROM organizations WHERE id = $1
    `;
	const values = [id];
	const results = await client.query(sql, values);

	const organization = results.rows[0];
	return organization;
}

// update the sql database

app.patch('/organizations/:id', async (req, res) => {
	const client = await pool.connect();

	try {
		const id = req.params.id;
		const organization = await getOrganization(client, id);
		const data = req.body;
		const name = data.name || organization.name;
		const temperature = data.temperature || organization.temperature;
		const status = data.status || organization.status;
		const logo = data.logo || organization.logo;
		const notes = data.notes || organization.notes;
		const sql = `
		UPDATE organizations SET name = $1, temperature = $2, status = $3, logo = $4, notes = $5
		RETURNING *;
    `;
		const values = [name, temperature, status, logo, notes];
		const results = await client.query(sql, values);

		releaseClient(client);
		const updatedOrganization = results.rows[0];

		return res.status(200).json({ organization: updatedOrganization });
	} catch (err) {
		// Handle API errors
		// If we're awaiting something above and it fails, it gets "bubbled up" to here
		console.log(err);
		releaseClient(client);
		res.status(500).json({ success: false });
	}
});

app.post('/data', (req, res) => {
	const receivedData = req.body;
	console.log('Received JSON data:', receivedData);
	res.json({ message: 'Data received', data: receivedData });
});

app.get('/', (req, res) => {
	res.send(`
    <html>
      <head>
        <title>My HTML Page</title>
      </head>
      <body>
        <h1>Hello</h1>
        <p>Welcome to my backend API</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
