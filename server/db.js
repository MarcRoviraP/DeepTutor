require('dotenv').config();
const { Pool } = require('pg');

// --- Direct DB connection (for operations the REST API can't handle correctly) ---
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// --- REST API (for generic table access) ---
const API_URL = process.env.DB_API_URL;
const API_KEY = process.env.DB_API_KEY;

const apiRequest = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`[DB-API] Request: ${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    console.log(`[DB-API] Payload:`, JSON.stringify(data, null, 2));
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    console.log(`[DB-API] Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DB-API] Error Body:`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const json = await response.json();
      console.log(`[DB-API] Success! Data received (${Array.isArray(json) ? json.length + ' items' : 'Object'}).`);
      return json;
    } else {
      console.log(`[DB-API] Success! No JSON body to return.`);
      return null;
    }
  } catch (error) {
    console.error(`[DB-API] CRITICAL FAILURE on ${url}:`, error.message);
    throw error;
  }
};

module.exports = {
  // Generic request for other tables
  request: apiRequest,

  // Auth methods — use direct DB connection to avoid REST API bugs
  createUser: async ({ google_id, email, nombre, picture, nivel }) => {
    console.log('[DB-DIRECT] Inserting new user via pg...');
    const result = await pool.query(
      `INSERT INTO usuarios (google_id, email, nombre, picture, nivel)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [google_id, email, nombre, picture, nivel]
    );
    console.log('[DB-DIRECT] User created:', result.rows[0].id);
    return result.rows[0];
  },

  findUserByGoogleIdOrEmail: async (googleId, email) => {
    console.log('[DB-DIRECT] Looking up user via pg...');
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE google_id = $1 OR email = $2 LIMIT 1`,
      [googleId, email]
    );
    console.log(`[DB-DIRECT] Found ${result.rows.length} user(s).`);
    return result.rows;
  },
};
